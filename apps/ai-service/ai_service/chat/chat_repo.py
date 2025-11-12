"""
In-memory repository for chat threads and messages.
Clear interfaces for future Firestore integration.
"""

import time
from typing import Dict, List, Optional, Tuple
from .chat_models import ChatMessage
from .quick_prompts import get_prompt_by_id


# In-memory storage
_threads: Dict[str, List[str]] = {}  # threadId -> [userId, ...]
_messages: Dict[str, List[ChatMessage]] = {}  # threadId -> [message, ...]
_message_counter: int = 0


def ensure_thread(thread_id: str, participants: List[str]) -> None:
    """
    Ensure a thread exists with given participants.
    
    Args:
        thread_id: Thread identifier
        participants: List of user IDs who are participants
    """
    if thread_id not in _threads:
        _threads[thread_id] = []
    
    # Add any new participants
    existing = set(_threads[thread_id])
    for user_id in participants:
        if user_id not in existing:
            _threads[thread_id].append(user_id)
    
    # Initialize messages list if needed
    if thread_id not in _messages:
        _messages[thread_id] = []


def user_in_thread(user_id: str, thread_id: str) -> bool:
    """
    Check if user is a participant in the thread.
    
    Args:
        user_id: User identifier
        thread_id: Thread identifier
    
    Returns:
        True if user is a participant, False otherwise
    """
    if thread_id not in _threads:
        return False
    return user_id in _threads[thread_id]


def append_message(thread_id: str, from_user_id: str, text_redacted: str, flags: Dict[str, bool], created_at: Optional[int] = None) -> str:
    """
    Append a message to a thread.
    
    Args:
        thread_id: Thread identifier
        from_user_id: Sender user ID
        text_redacted: Redacted message text (never store raw text)
        flags: Redaction flags
        created_at: Optional timestamp (defaults to current time)
    
    Returns:
        Generated message ID
    """
    global _message_counter
    
    if created_at is None:
        created_at = int(time.time())
    
    # Ensure thread exists
    if thread_id not in _threads:
        _threads[thread_id] = [from_user_id]
    if thread_id not in _messages:
        _messages[thread_id] = []
    
    # Generate message ID
    _message_counter += 1
    message_id = f"msg_{_message_counter}_{created_at}"
    
    # Create message (only redacted text is stored)
    message = ChatMessage(
        id=message_id,
        threadId=thread_id,
        fromUserId=from_user_id,
        textRedacted=text_redacted,
        createdAt=created_at,
        flags=flags
    )
    
    _messages[thread_id].append(message)
    return message_id


def list_messages(thread_id: str, page_size: int = 20, cursor: Optional[str] = None) -> Tuple[List[ChatMessage], Optional[str]]:
    """
    List messages in a thread with pagination.
    
    Args:
        thread_id: Thread identifier
        page_size: Number of messages per page (default 20)
        cursor: Optional cursor for pagination (message ID)
    
    Returns:
        Tuple of (messages_list, next_cursor)
    """
    if thread_id not in _messages:
        return [], None
    
    messages = _messages[thread_id]
    
    # Sort by creation time (newest first)
    sorted_messages = sorted(messages, key=lambda m: m.createdAt, reverse=True)
    
    # Find starting point if cursor provided
    start_idx = 0
    if cursor:
        for i, msg in enumerate(sorted_messages):
            if msg.id == cursor:
                start_idx = i + 1
                break
    
    # Get page
    page_messages = sorted_messages[start_idx:start_idx + page_size]
    
    # Determine next cursor
    next_cursor = None
    if len(sorted_messages) > start_idx + page_size:
        next_cursor = sorted_messages[start_idx + page_size - 1].id
    
    # Return in chronological order (oldest first)
    return list(reversed(page_messages)), next_cursor


def get_prompt_text(prompt_id: str) -> str:
    """
    Get prompt text by ID.
    
    Args:
        prompt_id: Prompt identifier
    
    Returns:
        Prompt text, or empty string if not found
    """
    return get_prompt_by_id(prompt_id)

