"""
Empathy message generation based on urgency level.
Provides supportive, empathetic responses for each urgency classification.
"""

from typing import Literal


def empathy_line(urgency: Literal["urgent", "normal", "low"]) -> str:
    """
    Generate an empathetic response message based on urgency level.
    
    Args:
        urgency: The urgency classification ("urgent", "normal", or "low")
    
    Returns:
        An empathetic message string
    """
    empathy_messages = {
        "urgent": "Hang in there — someone nearby will respond soon 💛",
        "low": "Thanks for sharing — we'll match you shortly 💜",
        "normal": "You're not alone — matching you with nearby helpers 💜"
    }
    
    return empathy_messages.get(urgency, empathy_messages["normal"])

