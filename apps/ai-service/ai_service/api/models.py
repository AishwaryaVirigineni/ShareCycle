"""
Pydantic models for API request/response validation.
"""

from typing import Literal
from pydantic import BaseModel


class ClassifyRequest(BaseModel):
    """Input model for /classify endpoint."""
    message: str


class ClassifyResponse(BaseModel):
    """Output model for /classify endpoint."""
    urgency: Literal["urgent", "normal", "low"]
    empathy: str

