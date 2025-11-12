"""
Unit tests for chat safety filter.
"""

import pytest
from ai_service.chat.safety_filter import redact


def test_redact_email():
    """Test email redaction."""
    text = "Contact me at john@example.com for details"
    redacted, flags = redact(text)
    
    assert "[hidden-email]" in redacted
    assert "john@example.com" not in redacted
    assert flags["hadEmail"] is True
    assert flags["hadPhone"] is False


def test_redact_phone():
    """Test phone number redaction."""
    text = "Call me at 555-123-4567"
    redacted, flags = redact(text)
    
    assert "[hidden-phone]" in redacted
    assert "555-123-4567" not in redacted
    assert flags["hadPhone"] is True
    assert flags["hadEmail"] is False


def test_redact_handle():
    """Test @handle redaction."""
    text = "Follow me @username on social media"
    redacted, flags = redact(text)
    
    assert "[hidden-handle]" in redacted
    assert "@username" not in redacted
    assert flags["hadHandle"] is True


def test_redact_url():
    """Test URL redaction."""
    text = "Check out https://example.com for more info"
    redacted, flags = redact(text)
    
    assert "[hidden-link]" in redacted
    assert "https://example.com" not in redacted
    assert flags["hadLink"] is True


def test_redact_self_id_im():
    """Test self-identification pattern 'I'm <Name>'."""
    text = "I'm John and I need help"
    redacted, flags = redact(text)
    
    assert "[hidden-name]" in redacted
    assert "John" not in redacted
    assert flags["hadName"] is True


def test_redact_self_id_i_am():
    """Test self-identification pattern 'I am <Name>'."""
    text = "I am Sarah, can you help?"
    redacted, flags = redact(text)
    
    assert "[hidden-name]" in redacted
    assert "Sarah" not in redacted
    assert flags["hadName"] is True


def test_redact_self_id_my_name():
    """Test self-identification pattern 'my name is <Name>'."""
    text = "my name is Michael, nice to meet you"
    redacted, flags = redact(text)
    
    assert "[hidden-name]" in redacted
    assert "Michael" not in redacted
    assert flags["hadName"] is True


def test_redact_self_id_this_is():
    """Test self-identification pattern 'this is <Name>'."""
    text = "this is Emma, I'm here to help"
    redacted, flags = redact(text)
    
    assert "[hidden-name]" in redacted
    assert "Emma" not in redacted
    assert flags["hadName"] is True


def test_redact_multiple_pii():
    """Test redaction of multiple PII types."""
    text = "I'm John, email me at john@example.com or call 555-123-4567"
    redacted, flags = redact(text)
    
    assert "[hidden-name]" in redacted
    assert "[hidden-email]" in redacted
    assert "[hidden-phone]" in redacted
    assert "John" not in redacted
    assert "john@example.com" not in redacted
    assert "555-123-4567" not in redacted
    assert flags["hadName"] is True
    assert flags["hadEmail"] is True
    assert flags["hadPhone"] is True


def test_preserve_neutral_content():
    """Test that neutral content is preserved."""
    text = "I'm here near the restroom. Can you help?"
    redacted, flags = redact(text)
    
    # Should preserve the message content
    # "here" is a common word, so it shouldn't be redacted as a name
    assert "restroom" in redacted
    assert "help" in redacted
    # No PII flags should be set (since "here" is in common_words)
    assert not any([
        flags["hadEmail"],
        flags["hadPhone"],
        flags["hadHandle"],
        flags["hadLink"],
        flags["hadName"]
    ])


def test_empty_text():
    """Test empty text handling."""
    text = ""
    redacted, flags = redact(text)
    
    assert redacted == ""
    assert all(not v for v in flags.values())


def test_no_pii():
    """Test text with no PII."""
    text = "Hello, can we meet at the information desk?"
    redacted, flags = redact(text)
    
    assert redacted == text
    assert all(not v for v in flags.values())

