"""
Unit tests for chat functionality.
"""

import time
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, Mock

from ai_service.api.routes import app
from ai_service.chat.chat_repo import (
    ensure_thread,
    append_message,
    user_in_thread,
    _threads,
    _messages
)
from ai_service.chat.rate_limit import reset_bucket, allow_send


def mock_auth_dependency(user_id: str = "user123"):
    """Create a mock auth dependency."""
    def _mock():
        return {"sub": user_id}
    return _mock


@pytest.fixture
def client():
    """Create test client."""
    # Override the auth dependency for all chat routes
    def get_mock_auth():
        return {"sub": "user123"}
    
    app.dependency_overrides = {}
    from ai_service.api.chat import verify_auth0_token
    app.dependency_overrides[verify_auth0_token] = get_mock_auth
    
    yield TestClient(app)
    
    # Clean up
    app.dependency_overrides.clear()


@pytest.fixture
def auth_token():
    """Mock Auth0 token."""
    # This would normally be a real JWT, but for testing we'll mock verify_auth0_token
    return "mock_token"


@pytest.fixture(autouse=True)
def reset_state():
    """Reset chat state before each test."""
    _threads.clear()
    _messages.clear()
    # Reset all buckets
    from ai_service.chat.rate_limit import _token_buckets
    _token_buckets.clear()
    yield
    _threads.clear()
    _messages.clear()
    _token_buckets.clear()


def mock_verify_auth0_token(user_id: str = "user123"):
    """Mock Auth0 verification."""
    def _mock():
        return {"sub": user_id}
    return _mock




def test_filter_endpoint_no_auth(client):
    """Test /chat/filter endpoint (no auth required)."""
    response = client.post(
        "/chat/filter",
        json={"text": "Contact me at john@example.com"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "textRedacted" in data
    assert "flags" in data
    assert "[hidden-email]" in data["textRedacted"]
    assert data["flags"]["hadEmail"] is True


def test_send_message_with_pii_redacted(client):
    """Test that messages with PII are redacted and stored safely."""
    user_id = "user123"
    thread_id = "thread1"
    
    # Setup thread
    ensure_thread(thread_id, [user_id])
    
    response = client.post(
        "/chat/send",
        json={
            "threadId": thread_id,
            "text": "I'm John, email me at john@example.com"
        },
        headers={"Authorization": "Bearer mock_token"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "messageId" in data
    assert "textRedacted" in data
    assert "flags" in data
    
    # Check that PII was redacted
    assert "[hidden-name]" in data["textRedacted"]
    assert "[hidden-email]" in data["textRedacted"]
    assert "John" not in data["textRedacted"]
    assert "john@example.com" not in data["textRedacted"]
    
    # Check flags
    assert data["flags"]["hadName"] is True
    assert data["flags"]["hadEmail"] is True


def test_non_participant_cannot_send(client):
    """Test that non-participants cannot send messages."""
    user_id = "user123"
    other_user = "user456"
    thread_id = "thread1"
    
    # Setup thread with only other_user
    ensure_thread(thread_id, [other_user])
    
    response = client.post(
        "/chat/send",
        json={
            "threadId": thread_id,
            "text": "Hello"
        },
        headers={"Authorization": "Bearer mock_token"}
    )
    
    assert response.status_code == 403
    assert "not a participant" in response.json()["detail"].lower()


def test_non_participant_cannot_read(client):
    """Test that non-participants cannot read messages."""
    user_id = "user123"
    other_user = "user456"
    thread_id = "thread1"
    
    # Setup thread and add a message
    ensure_thread(thread_id, [other_user])
    append_message(thread_id, other_user, "Hello", {})
    
    response = client.get(
        f"/chat/thread/{thread_id}",
        headers={"Authorization": "Bearer mock_token"}
    )
    
    assert response.status_code == 403
    assert "not a participant" in response.json()["detail"].lower()


def test_rate_limit_triggers_429(client):
    """Test that rate limit triggers 429 when burst exceeded."""
    user_id = "user123"
    thread_id = "thread1"
    
    # Setup thread
    ensure_thread(thread_id, [user_id])
    
    # Reset bucket to start fresh
    reset_bucket(user_id, thread_id)
    
    # Send messages up to burst limit + 1 to exhaust bucket
    burst = 5
    
    # Send burst messages rapidly (these should all succeed)
    for i in range(burst):
        response = client.post(
            "/chat/send",
            json={
                "threadId": thread_id,
                "text": f"Message {i}"
            },
            headers={"Authorization": "Bearer mock_token"}
        )
        assert response.status_code == 200  # Should succeed
    
    # Send one more to exhaust the bucket (should still succeed if bucket had 5)
    # Then the next one should be rate limited
    response = client.post(
        "/chat/send",
        json={
            "threadId": thread_id,
            "text": f"Message {burst}"
        },
        headers={"Authorization": "Bearer mock_token"}
    )
    # This might succeed if bucket refilled slightly, so we'll send another
    if response.status_code == 200:
        # Bucket should now be exhausted, next one should fail
        response = client.post(
        "/chat/send",
        json={
            "threadId": thread_id,
            "text": "Rate limited message"
        },
        headers={"Authorization": "Bearer mock_token"}
    )
    
    assert response.status_code == 429
    data = response.json()
    assert "detail" in data
    assert "rate limit" in str(data["detail"]).lower() or "too many" in str(data["detail"]).lower()


def test_messages_stored_only_redacted(client):
    """Test that only redacted text is stored, never raw text."""
    user_id = "user123"
    thread_id = "thread1"
    
    # Setup thread
    ensure_thread(thread_id, [user_id])
    
    raw_text = "I'm John, email me at john@example.com"
    
    response = client.post(
        "/chat/send",
        json={
            "threadId": thread_id,
            "text": raw_text
        },
        headers={"Authorization": "Bearer mock_token"}
    )
    
    assert response.status_code == 200
    
    # Check stored message
    messages, _ = __import__("ai_service.chat.chat_repo", fromlist=["list_messages"]).list_messages(thread_id)
    assert len(messages) == 1
    stored_message = messages[0]
    
    # Verify raw text is NOT stored
    assert raw_text not in stored_message.textRedacted
    assert "John" not in stored_message.textRedacted
    assert "john@example.com" not in stored_message.textRedacted
    
    # Verify redacted text IS stored
    assert "[hidden-name]" in stored_message.textRedacted
    assert "[hidden-email]" in stored_message.textRedacted


def test_thread_messages_pagination(client):
    """Test paginated message retrieval."""
    user_id = "user123"
    thread_id = "thread1"
    
    # Setup thread
    ensure_thread(thread_id, [user_id])
    
    # Add multiple messages
    for i in range(5):
        append_message(thread_id, user_id, f"Message {i}", {})
    
    response = client.get(
        f"/chat/thread/{thread_id}?limit=3",
        headers={"Authorization": "Bearer mock_token"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert len(data["items"]) == 3
    assert "nextCursor" in data

