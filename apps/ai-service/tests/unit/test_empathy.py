"""
Unit tests for empathy message generation.
"""

import pytest

from ai_service.core.empathy import empathy_line


@pytest.mark.parametrize("urgency,expected_contains", [
    ("urgent", "Hang in there"),
    ("low", "Thanks for sharing"),
    ("normal", "You're not alone"),
])
def test_empathy_line(urgency: str, expected_contains: str):
    """Test empathy message generation."""
    result = empathy_line(urgency)  # type: ignore
    assert expected_contains in result
    assert len(result) > 0


def test_empathy_line_default():
    """Test that invalid urgency defaults to normal."""
    result = empathy_line("invalid")  # type: ignore
    assert "You're not alone" in result

