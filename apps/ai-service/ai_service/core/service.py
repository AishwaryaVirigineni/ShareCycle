"""
Main classification service.
Orchestrates PII redaction, urgency classification, and empathy generation.
"""

from typing import Dict, Literal

from .empathy import empathy_line
from .pii import redact
from .rules import rule_urgency


def classify_message(text: str) -> Dict[str, str]:
    """
    Classify a message and return urgency and empathy response.
    
    Pipeline:
    1. Redact PII (emails, phone numbers, @handles)
    2. Classify urgency using rules
    3. Generate empathy message
    4. Return structured response
    
    On any exception, returns safe default values.
    
    Args:
        text: Raw input message text
    
    Returns:
        Dictionary with "urgency" and "empathy" keys
    """
    # Default response in case of any error
    default_response = {
        "urgency": "normal",
        "empathy": "You're not alone — matching you with nearby helpers 💜"
    }
    
    try:
        if not text or not isinstance(text, str):
            return default_response
        
        # Step 1: Redact PII before processing
        redacted_text = redact(text)
        
        # Step 2: Classify urgency
        urgency: Literal["urgent", "normal", "low"] = rule_urgency(redacted_text)
        
        # Step 3: Generate empathy message
        empathy = empathy_line(urgency)
        
        # Step 4: Validate and return
        result = {
            "urgency": urgency,
            "empathy": empathy
        }
        
        # Ensure both fields are present and valid
        if "urgency" not in result or "empathy" not in result:
            return default_response
        
        if not result["empathy"] or not isinstance(result["empathy"], str):
            return default_response
        
        return result
    
    except Exception:
        # On any exception, return safe default
        # Note: We don't log raw text for privacy
        return default_response

