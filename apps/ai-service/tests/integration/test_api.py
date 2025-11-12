"""
Integration tests for the FastAPI application.
"""

import pytest
from fastapi.testclient import TestClient

from ai_service.api.routes import app

client = TestClient(app)


def test_health_endpoint():
    """Test the health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_classify_urgent():
    """Test classification of urgent message."""
    response = client.post(
        "/classify",
        json={"message": "I'm bleeding, please help"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["urgency"] == "urgent"
    assert "empathy" in data
    assert len(data["empathy"]) > 0


def test_classify_low():
    """Test classification of low urgency message."""
    response = client.post(
        "/classify",
        json={"message": "Not urgent, need one later"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["urgency"] == "low"
    assert "empathy" in data


def test_classify_normal():
    """Test classification of normal urgency message."""
    response = client.post(
        "/classify",
        json={"message": "Please help near the cafeteria"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["urgency"] == "normal"
    assert "empathy" in data


def test_classify_with_pii():
    """Test that PII in message doesn't break classification."""
    response = client.post(
        "/classify",
        json={"message": "I'm bleeding, contact user@example.com or 555-1234"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["urgency"] == "urgent"


def test_classify_invalid_request():
    """Test handling of invalid request."""
    response = client.post("/classify", json={})
    assert response.status_code == 422  # Validation error

