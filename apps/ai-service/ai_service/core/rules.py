"""
Deterministic urgency classification rules.
Classifies text as "urgent", "normal", or "low" based on keyword matching.
"""

from typing import Literal

# Urgent keywords (case-insensitive)
URGENT_KEYWORDS = [
    "bleeding",
    "emergency",
    "asap",
    "right now",
    "immediately",
    "leaking",
    "soaked",
    "bleed"
]

# Low urgency keywords (case-insensitive)
LOW_KEYWORDS = [
    "not urgent",
    "no rush",
    "later",
    "when you can"
]


def rule_urgency(text: str) -> Literal["urgent", "normal", "low"]:
    """
    Classify urgency based on keyword matching.
    
    Rules:
    - urgent: if text contains any urgent keywords
    - low: if text contains any low urgency keywords
    - normal: otherwise
    
    Args:
        text: Input text to classify (case-insensitive)
    
    Returns:
        "urgent", "normal", or "low"
    """
    if not text:
        return "normal"
    
    text_lower = text.lower()
    
    # Check for urgent keywords
    for keyword in URGENT_KEYWORDS:
        if keyword in text_lower:
            return "urgent"
    
    # Check for low urgency keywords
    for keyword in LOW_KEYWORDS:
        if keyword in text_lower:
            return "low"
    
    # Default to normal
    return "normal"

