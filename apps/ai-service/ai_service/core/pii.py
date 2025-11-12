"""
PII (Personally Identifiable Information) redaction.
Removes emails, phone numbers, and @handles before processing.
"""

import re
from typing import Pattern


# Email pattern: matches standard email formats
EMAIL_PATTERN: Pattern[str] = re.compile(
    r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
)

# Phone pattern: supports +country codes, spaces, dashes, parentheses
PHONE_PATTERN: Pattern[str] = re.compile(
    r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b'
)

# Handle pattern: @username (alphanumeric, underscores, dots)
HANDLE_PATTERN: Pattern[str] = re.compile(
    r'@[A-Za-z0-9_.]+'
)


def redact(text: str) -> str:
    """
    Redact PII from text: emails, phone numbers, and @handles.
    
    Args:
        text: Input text that may contain PII
    
    Returns:
        Text with PII replaced by placeholders
    """
    if not text:
        return text
    
    # Redact emails
    text = EMAIL_PATTERN.sub('[EMAIL]', text)
    
    # Redact phone numbers
    text = PHONE_PATTERN.sub('[PHONE]', text)
    
    # Redact @handles
    text = HANDLE_PATTERN.sub('[HANDLE]', text)
    
    return text

