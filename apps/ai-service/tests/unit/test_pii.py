"""
Unit tests for PII redaction.
"""

import pytest

from ai_service.core.pii import redact


@pytest.mark.parametrize("text,expected_contains", [
    ("Contact me at user@example.com", "[EMAIL]"),
    ("Call 555-123-4567", "[PHONE]"),
    ("Message @username", "[HANDLE]"),
])
def test_redact_pii(text: str, expected_contains: str):
    """Test that PII is redacted."""
    result = redact(text)
    assert expected_contains in result


def test_redact_multiple_pii():
    """Test redaction of multiple PII types."""
    text = "Email user@example.com or call 555-123-4567 or @handle"
    result = redact(text)
    assert "[EMAIL]" in result
    assert "[PHONE]" in result
    assert "[HANDLE]" in result
    assert "user@example.com" not in result
    assert "555-123-4567" not in result
    assert "@handle" not in result


def test_redact_empty():
    """Test redaction of empty string."""
    assert redact("") == ""
    assert redact(None) == None  # type: ignore

