"""
Unit tests for urgency classification rules.
"""

import pytest

from ai_service.core.rules import rule_urgency


@pytest.mark.parametrize("text,expected", [
    ("I'm bleeding", "urgent"),
    ("This is an emergency", "urgent"),
    ("Need help ASAP", "urgent"),
    ("Right now please", "urgent"),
    ("Immediately needed", "urgent"),
    ("I'm leaking", "urgent"),
    ("Soaked through", "urgent"),
    ("Not urgent", "low"),
    ("No rush", "low"),
    ("Later is fine", "low"),
    ("When you can", "low"),
    ("Regular message", "normal"),
    ("", "normal"),
])
def test_rule_urgency(text: str, expected: str):
    """Test urgency classification rules."""
    assert rule_urgency(text) == expected


def test_rule_urgency_case_insensitive():
    """Test that rules are case-insensitive."""
    assert rule_urgency("BLEEDING") == "urgent"
    assert rule_urgency("EMERGENCY") == "urgent"
    assert rule_urgency("NOT URGENT") == "low"
    assert rule_urgency("NO RUSH") == "low"

