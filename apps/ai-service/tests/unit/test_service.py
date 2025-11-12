"""
Unit tests for the classification service.
Tests urgency classification, empathy generation, and PII redaction.
"""

import pytest

from ai_service.core.service import classify_message


@pytest.mark.parametrize("message,expected_urgency", [
    ("I'm bleeding through my jeans, please help", "urgent"),
    ("Not urgent, need one later if possible", "low"),
    ("Please help near the cafeteria", "normal"),
    # Additional test cases
    ("This is an EMERGENCY situation", "urgent"),
    ("Need help ASAP right now", "urgent"),
    ("I'm leaking and soaked", "urgent"),
    ("No rush, when you can", "low"),
    ("Can you help later?", "low"),
    ("Regular request for assistance", "normal"),
])
def test_classify_urgency(message: str, expected_urgency: str):
    """Test that urgency classification works correctly."""
    result = classify_message(message)
    
    assert "urgency" in result
    assert "empathy" in result
    assert result["urgency"] == expected_urgency
    assert isinstance(result["empathy"], str)
    assert len(result["empathy"]) > 0


def test_classify_response_structure():
    """Test that response always has required fields with valid values."""
    test_messages = [
        "I need help",
        "",
        "Emergency!",
        "Not urgent",
    ]
    
    valid_urgency_levels = {"urgent", "normal", "low"}
    
    for message in test_messages:
        result = classify_message(message)
        
        # Check structure
        assert "urgency" in result
        assert "empathy" in result
        
        # Check urgency is valid
        assert result["urgency"] in valid_urgency_levels
        
        # Check empathy is non-empty string
        assert isinstance(result["empathy"], str)
        assert len(result["empathy"]) > 0


def test_classify_handles_empty_input():
    """Test that empty or None input returns default normal response."""
    result1 = classify_message("")
    result2 = classify_message(None)  # type: ignore
    
    assert result1["urgency"] == "normal"
    assert result2["urgency"] == "normal"
    assert "empathy" in result1
    assert "empathy" in result2


def test_classify_handles_pii_redaction():
    """Test that PII redaction doesn't break classification."""
    # Message with PII that should still classify correctly
    message_with_email = "I'm bleeding, contact me at user@example.com"
    result = classify_message(message_with_email)
    
    assert result["urgency"] == "urgent"
    assert "empathy" in result


def test_classify_case_insensitive():
    """Test that urgency keywords are matched case-insensitively."""
    test_cases = [
        ("BLEEDING", "urgent"),
        ("Emergency", "urgent"),
        ("NOT URGENT", "low"),
        ("No Rush", "low"),
    ]
    
    for message, expected_urgency in test_cases:
        result = classify_message(message)
        assert result["urgency"] == expected_urgency

