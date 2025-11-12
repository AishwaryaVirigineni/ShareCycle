"""
Unit tests for matching algorithm.
Tests urgency mapping, proximity scoring, and ranking logic.
"""

import pytest

from ai_service.matching import (
    Helper,
    Request,
    proximity_score,
    rank_helpers,
    score_helper,
    urgency_level,
)


def test_urgency_level():
    """Test urgency level mapping."""
    assert urgency_level("urgent") == 3.0
    assert urgency_level("normal") == 2.0
    assert urgency_level("low") == 1.0


@pytest.mark.parametrize("meters,expected", [
    (50, 1.0),      # 0-100m band
    (100, 1.0),     # 0-100m band
    (200, 0.8),     # 101-250m band
    (250, 0.8),     # 101-250m band
    (400, 0.6),     # 251-500m band
    (500, 0.6),     # 251-500m band
    (700, 0.4),     # 501-1000m band
    (1000, 0.4),    # 501-1000m band
    (1500, 0.2),    # >1000m band
])
def test_proximity_score_bands(meters: float, expected: float):
    """Test proximity score bands for various distances."""
    assert proximity_score(meters) == expected


def test_score_helper():
    """Test composite scoring function."""
    req: Request = {
        "id": "req1",
        "lat": 37.7749,
        "lng": -122.4194,
        "urgency": "urgent",
        "productNeed": "tampon",
        "createdAt": "2024-01-01T00:00:00Z",
    }
    
    helper: Helper = {
        "id": "helper1",
        "lat": 37.7750,  # ~111m away
        "lng": -122.4194,
        "rating": 0.8,
        "available": True,
        "updatedAt": "2024-01-01T00:00:00Z",
    }
    
    weights = {"urgency": 0.5, "proximity": 0.3, "trust": 0.2}
    score = score_helper(req, helper, weights)
    
    # Urgency: 3.0 * 0.5 = 1.5
    # Proximity: ~1.0 * 0.3 = 0.3 (close)
    # Trust: 0.8 * 0.2 = 0.16
    # Expected: ~1.96
    assert score > 1.5
    assert score < 2.5


def test_rank_helpers_urgency_proximity_priority():
    """
    Test that closer helper ranks higher when urgency is high.
    
    Given:
    - Request with urgency=urgent
    - Helper A: 80m away, rating 0.5
    - Helper B: 600m away, rating 0.9
    
    Helper A should rank higher due to proximity + urgency weights.
    """
    req: Request = {
        "id": "req1",
        "lat": 37.7749,
        "lng": -122.4194,
        "urgency": "urgent",
        "productNeed": "tampon",
        "createdAt": "2024-01-01T00:00:00Z",
    }
    
    # Helper A: close but lower rating
    helper_a: Helper = {
        "id": "helper_a",
        "lat": 37.7750,  # ~111m away (close)
        "lng": -122.4194,
        "rating": 0.5,
        "available": True,
        "updatedAt": "2024-01-01T00:00:00Z",
    }
    
    # Helper B: far but higher rating
    helper_b: Helper = {
        "id": "helper_b",
        "lat": 37.7800,  # ~600m away
        "lng": -122.4194,
        "rating": 0.9,
        "available": True,
        "updatedAt": "2024-01-01T00:00:00Z",
    }
    
    weights = {"urgency": 0.5, "proximity": 0.3, "trust": 0.2}
    ranked = rank_helpers(req, [helper_a, helper_b], weights, top_k=2)
    
    # Helper A should rank higher due to proximity
    assert len(ranked) == 2
    assert ranked[0]["id"] == "helper_a"
    assert ranked[0]["score"] > ranked[1]["score"]


def test_rank_helpers_top_k():
    """Test that top_k limits results correctly."""
    req: Request = {
        "id": "req1",
        "lat": 37.7749,
        "lng": -122.4194,
        "urgency": "normal",
        "productNeed": "tampon",
        "createdAt": "2024-01-01T00:00:00Z",
    }
    
    # Create 10 helpers
    helpers = []
    for i in range(10):
        helpers.append({
            "id": f"helper_{i}",
            "lat": 37.7749 + (i * 0.001),  # Spread them out
            "lng": -122.4194,
            "rating": 0.5 + (i * 0.05),
            "available": True,
            "updatedAt": "2024-01-01T00:00:00Z",
        })
    
    weights = {"urgency": 0.5, "proximity": 0.3, "trust": 0.2}
    ranked = rank_helpers(req, helpers, weights, top_k=5)
    
    assert len(ranked) == 5
    # Verify sorted by score descending
    scores = [c["score"] for c in ranked]
    assert scores == sorted(scores, reverse=True)


def test_rank_helpers_filters_unavailable():
    """Test that unavailable helpers are filtered out."""
    req: Request = {
        "id": "req1",
        "lat": 37.7749,
        "lng": -122.4194,
        "urgency": "normal",
        "productNeed": "tampon",
        "createdAt": "2024-01-01T00:00:00Z",
    }
    
    helpers = [
        {
            "id": "available",
            "lat": 37.7750,
            "lng": -122.4194,
            "rating": 0.8,
            "available": True,
            "updatedAt": "2024-01-01T00:00:00Z",
        },
        {
            "id": "unavailable",
            "lat": 37.7750,
            "lng": -122.4194,
            "rating": 0.9,
            "available": False,
            "updatedAt": "2024-01-01T00:00:00Z",
        },
    ]
    
    weights = {"urgency": 0.5, "proximity": 0.3, "trust": 0.2}
    ranked = rank_helpers(req, helpers, weights, top_k=10)
    
    assert len(ranked) == 1
    assert ranked[0]["id"] == "available"


def test_rank_helpers_empty_result():
    """Test handling of empty helper list."""
    req: Request = {
        "id": "req1",
        "lat": 37.7749,
        "lng": -122.4194,
        "urgency": "normal",
        "productNeed": "tampon",
        "createdAt": "2024-01-01T00:00:00Z",
    }
    
    weights = {"urgency": 0.5, "proximity": 0.3, "trust": 0.2}
    ranked = rank_helpers(req, [], weights, top_k=5)
    
    assert len(ranked) == 0

