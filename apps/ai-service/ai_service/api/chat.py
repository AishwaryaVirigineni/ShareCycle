"""
FastAPI router for privacy-first moderated chat.
"""

import time
from typing import Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel

from ..auth0_verify import verify_auth0_token
from ..config import (
    get_chat_max_len,
    get_rate_burst,
    get_rate_refill_per_sec,
    get_enable_spacy_ner
)
from ..chat.safety_filter import redact as filter_redact
from ..chat.safety_ner import redact_persons
from ..chat.rate_limit import allow_send, remaining_tokens
from ..chat.chat_repo import (
    ensure_thread,
    user_in_thread,
    append_message,
    list_messages,
    get_prompt_text
)
from ..chat.chat_models import (
    ChatFilterIn,
    ChatFilterOut,
    ChatSendIn,
    ChatSendOut,
    ChatSendQuickIn,
    ChatThreadResponse,
    QuickPromptsOut,
    QuickPromptCategory,
    QuickPromptItem
)
from ..chat.quick_prompts import get_all_prompts

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/filter", response_model=ChatFilterOut)
async def filter_message(filter_in: ChatFilterIn):
    """
    Filter a message for PII and return redacted text with flags.
    This endpoint does not require authentication.
    """
    text = filter_in.text
    
    # Apply regex-based redaction
    text_redacted, flags = filter_redact(text)
    
    # Apply optional spaCy NER if enabled
    if get_enable_spacy_ner():
        text_redacted, had_person = redact_persons(text_redacted)
        flags["hadPerson"] = had_person
    else:
        flags["hadPerson"] = False
    
    return ChatFilterOut(textRedacted=text_redacted, flags=flags)


@router.post("/send", response_model=ChatSendOut)
async def send_message(
    send_in: ChatSendIn,
    claims: Dict = Depends(verify_auth0_token)
):
    """
    Send a message in a thread.
    Requires authentication and thread membership.
    Applies safety filter, rate limiting, and stores only redacted text.
    """
    user_id = claims.get("sub", "")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user ID"
        )
    
    thread_id = send_in.threadId
    text = send_in.text
    
    # Check thread membership
    if not user_in_thread(user_id, thread_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this thread"
        )
    
    # Check rate limit
    now = time.time()
    burst = get_rate_burst()
    refill = get_rate_refill_per_sec()
    
    if not allow_send(user_id, thread_id, now, burst, refill):
        remaining = remaining_tokens(user_id, thread_id, now, burst, refill)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Rate limit exceeded",
                "message": "Too many messages. Please wait a moment.",
                "retryAfter": max(1, int((1.0 - remaining) / refill))
            }
        )
    
    # Apply safety filter
    text_redacted, flags = filter_redact(text)
    
    # Apply optional spaCy NER if enabled
    if get_enable_spacy_ner():
        text_redacted, had_person = redact_persons(text_redacted)
        flags["hadPerson"] = had_person
    else:
        flags["hadPerson"] = False
    
    # Truncate to max length after filtering
    max_len = get_chat_max_len()
    if len(text_redacted) > max_len:
        text_redacted = text_redacted[:max_len]
    
    # Store message (only redacted text)
    created_at = int(time.time())
    message_id = append_message(
        thread_id=thread_id,
        from_user_id=user_id,
        text_redacted=text_redacted,
        flags=flags,
        created_at=created_at
    )
    
    # Never log raw text - only log messageId and flags
    # (Logging would happen here in production, but we skip it for privacy)
    
    return ChatSendOut(
        messageId=message_id,
        textRedacted=text_redacted,
        flags=flags,
        createdAt=created_at
    )


@router.get("/thread/{thread_id}", response_model=ChatThreadResponse)
async def get_thread_messages(
    thread_id: str,
    limit: int = Query(20, ge=1, le=100),
    cursor: Optional[str] = Query(None),
    claims: Dict = Depends(verify_auth0_token)
):
    """
    Get paginated messages from a thread.
    Requires authentication and thread membership.
    Only returns redacted messages.
    """
    user_id = claims.get("sub", "")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user ID"
        )
    
    # Check thread membership
    if not user_in_thread(user_id, thread_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this thread"
        )
    
    # Get messages (only redacted text is stored/returned)
    messages, next_cursor = list_messages(thread_id, page_size=limit, cursor=cursor)
    
    return ChatThreadResponse(items=messages, nextCursor=next_cursor)


@router.get("/quick-prompts", response_model=QuickPromptsOut)
async def get_quick_prompts(
    role: Optional[str] = Query(None, description="Filter by role: 'requester' or 'helper'")
):
    """
    Get quick prompts organized by category, filtered by role.
    No authentication required.
    
    - requester: Arrival, Coordination, Gratitude
    - helper: En Route, Coordination, Ready
    - None: All categories (backward compatibility)
    """
    all_categories_data = get_all_prompts()
    
    # Filter by role
    if role == "requester":
        # Requester sees: Arrival, Coordination, Gratitude
        allowed_categories = ["arrival", "coordination", "gratitude"]
    elif role == "helper":
        # Helper sees: En Route, Coordination, Ready (if exists, else all except gratitude)
        allowed_categories = ["en_route", "coordination"]
        # Add "ready" if it exists in the data
        for cat in all_categories_data:
            if cat["id"] == "ready":
                allowed_categories.append("ready")
    else:
        # No filter - return all (backward compatibility)
        allowed_categories = None
    
    categories = []
    for cat_data in all_categories_data:
        # Skip gratitude for helpers if no role filter
        if role == "helper" and cat_data["id"] == "gratitude":
            continue
        if allowed_categories is None or cat_data["id"] in allowed_categories:
            items = [
                QuickPromptItem(id=item["id"], text=item["text"])
                for item in cat_data["items"]
            ]
            categories.append(
                QuickPromptCategory(
                    id=cat_data["id"],
                    name=cat_data["name"],
                    items=items
                )
            )
    
    return QuickPromptsOut(categories=categories)


@router.post("/send-quick", response_model=ChatSendOut)
async def send_quick_prompt(
    send_quick_in: ChatSendQuickIn,
    claims: Dict = Depends(verify_auth0_token)
):
    """
    Send a quick prompt as a message.
    Requires authentication and thread membership.
    Prompt text is filtered before sending (in case future edits add PII).
    """
    user_id = claims.get("sub", "")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user ID"
        )
    
    thread_id = send_quick_in.threadId
    prompt_id = send_quick_in.promptId
    
    # Get prompt text
    prompt_text = get_prompt_text(prompt_id)
    if not prompt_text:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quick prompt '{prompt_id}' not found"
        )
    
    # Check thread membership
    if not user_in_thread(user_id, thread_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this thread"
        )
    
    # Check rate limit
    now = time.time()
    burst = get_rate_burst()
    refill = get_rate_refill_per_sec()
    
    if not allow_send(user_id, thread_id, now, burst, refill):
        remaining = remaining_tokens(user_id, thread_id, now, burst, refill)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "Rate limit exceeded",
                "message": "Too many messages. Please wait a moment.",
                "retryAfter": max(1, int((1.0 - remaining) / refill))
            }
        )
    
    # Apply safety filter to prompt (in case future edits add PII)
    text_redacted, flags = filter_redact(prompt_text)
    
    # Apply optional spaCy NER if enabled
    if get_enable_spacy_ner():
        text_redacted, had_person = redact_persons(text_redacted)
        flags["hadPerson"] = had_person
    else:
        flags["hadPerson"] = False
    
    # Truncate to max length after filtering
    max_len = get_chat_max_len()
    if len(text_redacted) > max_len:
        text_redacted = text_redacted[:max_len]
    
    # Store message (only redacted text)
    created_at = int(time.time())
    message_id = append_message(
        thread_id=thread_id,
        from_user_id=user_id,
        text_redacted=text_redacted,
        flags=flags,
        created_at=created_at
    )
    
    return ChatSendOut(
        messageId=message_id,
        textRedacted=text_redacted,
        flags=flags,
        createdAt=created_at
    )

