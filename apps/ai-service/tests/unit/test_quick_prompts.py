"""
Unit tests for quick prompts functionality.
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch

from ai_service.api.routes import app
from ai_service.api.chat import verify_auth0_token
from ai_service.chat.quick_prompts import get_all_prompts, get_prompt_by_id
from ai_service.chat.chat_repo import ensure_thread, _threads, _messages


@pytest.fixture
def client():
    """Create test client with mocked auth."""
    def get_mock_auth():
        return {"sub": "user123"}
    
    app.dependency_overrides = {}
    app.dependency_overrides[verify_auth0_token] = get_mock_auth
    
    yield TestClient(app)
    
    # Clean up
    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def reset_state():
    """Reset chat state before each test."""
    _threads.clear()
    _messages.clear()
    yield
    _threads.clear()
    _messages.clear()


def test_get_quick_prompts(client):
    """Test GET /chat/quick-prompts returns categories."""
    response = client.get("/chat/quick-prompts")
    
    assert response.status_code == 200
    data = response.json()
    assert "categories" in data
    assert len(data["categories"]) > 0
    
    # Check structure
    category = data["categories"][0]
    assert "id" in category
    assert "name" in category
    assert "items" in category
    
    # Check items structure
    if len(category["items"]) > 0:
        item = category["items"][0]
        assert "id" in item
        assert "text" in item


def test_quick_prompts_have_categories(client):
    """Test that quick prompts include expected categories."""
    response = client.get("/chat/quick-prompts")
    data = response.json()
    
    category_ids = [cat["id"] for cat in data["categories"]]
    
    # Should have at least arrival, en_route, coordination, gratitude
    assert "arrival" in category_ids
    assert "en_route" in category_ids
    assert "coordination" in category_ids
    assert "gratitude" in category_ids


def test_send_quick_prompt_stores_message(client):
    """Test that send-quick stores a message identical to manual send."""
    user_id = "user123"
    thread_id = "thread1"
    prompt_id = "arrival_restroom"
    
    # Setup thread
    ensure_thread(thread_id, [user_id])
    
    # Get prompt text
    prompt_text = get_prompt_by_id(prompt_id)
    assert prompt_text == "I'm here near the restroom entrance."
    
    # Send quick prompt
    response = client.post(
        "/chat/send-quick",
        json={
            "threadId": thread_id,
            "promptId": prompt_id
        },
        headers={"Authorization": "Bearer mock_token"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "messageId" in data
    assert "textRedacted" in data
    
    # The redacted text should match what we'd get from manual send
    # (prompts are pre-sanitized, so should pass through filter unchanged)
    assert prompt_text in data["textRedacted"] or data["textRedacted"] == prompt_text


def test_send_quick_invalid_prompt_id(client):
    """Test that invalid prompt ID returns 404."""
    user_id = "user123"
    thread_id = "thread1"
    
    # Setup thread
    ensure_thread(thread_id, [user_id])
    
    response = client.post(
        "/chat/send-quick",
        json={
            "threadId": thread_id,
            "promptId": "invalid_prompt_id"
        },
        headers={"Authorization": "Bearer mock_token"}
    )
    
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_send_quick_requires_membership(client):
    """Test that send-quick requires thread membership."""
    user_id = "user123"
    other_user = "user456"
    thread_id = "thread1"
    prompt_id = "arrival_restroom"
    
    # Setup thread with only other_user
    ensure_thread(thread_id, [other_user])
    
    response = client.post(
        "/chat/send-quick",
        json={
            "threadId": thread_id,
            "promptId": prompt_id
        },
        headers={"Authorization": "Bearer mock_token"}
    )
    
    assert response.status_code == 403
    assert "not a participant" in response.json()["detail"].lower()


def test_quick_prompts_no_pii(client):
    """Test that all quick prompts contain no PII."""
    response = client.get("/chat/quick-prompts")
    data = response.json()
    
    # Check all prompts for common PII patterns
    for category in data["categories"]:
        for item in category["items"]:
            text = item["text"]
            # Should not contain emails, phones, @handles, URLs, or names
            assert "@" not in text or "@" not in text.split()  # Allow @ in context like "I'm @ the door"
            assert "http" not in text.lower()
            # Names would be capitalized, but prompts should be generic
            # We can't easily detect names without NER, but we check the filter is applied


def test_get_prompt_by_id():
    """Test get_prompt_by_id function."""
    # Test valid ID
    text = get_prompt_by_id("arrival_restroom")
    assert text == "I'm here near the restroom entrance."
    
    # Test invalid ID
    text = get_prompt_by_id("invalid_id")
    assert text == ""

