"""
Pydantic models for chat API.
"""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class ChatFilterIn(BaseModel):
    """Input for chat filter endpoint."""
    text: str = Field(..., description="Text to filter")


class ChatFilterOut(BaseModel):
    """Output for chat filter endpoint."""
    textRedacted: str = Field(..., description="Redacted text")
    flags: Dict[str, bool] = Field(..., description="Flags indicating what was redacted")


class ChatSendIn(BaseModel):
    """Input for chat send endpoint."""
    threadId: str = Field(..., description="Thread identifier")
    text: str = Field(..., description="Message text")


class ChatSendQuickIn(BaseModel):
    """Input for chat send-quick endpoint."""
    threadId: str = Field(..., description="Thread identifier")
    promptId: str = Field(..., description="Quick prompt ID")


class ChatMessage(BaseModel):
    """Chat message DTO (only redacted text is stored/returned)."""
    id: str = Field(..., description="Message ID")
    threadId: str = Field(..., description="Thread identifier")
    fromUserId: str = Field(..., description="Sender user ID")
    textRedacted: str = Field(..., description="Redacted message text")
    createdAt: int = Field(..., description="Creation timestamp")
    flags: Dict[str, bool] = Field(..., description="Redaction flags")


class ChatSendOut(BaseModel):
    """Output for chat send endpoint."""
    messageId: str = Field(..., description="Created message ID")
    textRedacted: str = Field(..., description="Redacted message text")
    flags: Dict[str, bool] = Field(..., description="Redaction flags")
    createdAt: int = Field(..., description="Creation timestamp")


class QuickPromptItem(BaseModel):
    """Single quick prompt item."""
    id: str = Field(..., description="Prompt ID")
    text: str = Field(..., description="Prompt text")


class QuickPromptCategory(BaseModel):
    """Quick prompt category with items."""
    id: str = Field(..., description="Category ID")
    name: str = Field(..., description="Category name")
    items: List[QuickPromptItem] = Field(..., description="Prompts in this category")


class QuickPromptsOut(BaseModel):
    """Output for quick prompts endpoint."""
    categories: List[QuickPromptCategory] = Field(..., description="List of prompt categories")


class ChatThreadResponse(BaseModel):
    """Paginated thread messages response."""
    items: List[ChatMessage] = Field(..., description="List of messages")
    nextCursor: Optional[str] = Field(None, description="Cursor for next page")

