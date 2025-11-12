"""
Unit tests for presence management.
Tests location updates, presence storage, and TTL expiration.
"""

import time

import pytest

from ai_service.models import LocationUpdateRequest
from ai_service.repo import repo


def test_save_user_presence():
    """Test saving user presence."""
    userId = "test_user_1"
    now = int(time.time())
    
    repo.save_user_presence(
        userId=userId,
        role="helper",
        available=True,
        lat=37.7749,
        lng=-122.4194,
        geo="tile_1234_5678",
        now=now,
        rating=0.8,
    )
    
    # Verify presence was stored
    presence_list = repo.get_active_presence_in_geos(
        ["tile_1234_5678"],
        now=now,
        ttl_min=15
    )
    
    assert len(presence_list) == 1
    assert presence_list[0]["userId"] == userId
    assert presence_list[0]["role"] == "helper"
    assert presence_list[0]["available"] is True
    assert presence_list[0]["geo"] == "tile_1234_5678"
    assert presence_list[0]["rating"] == 0.8


def test_presence_expires_after_ttl():
    """Test that presence expires after TTL."""
    userId = "test_user_2"
    now = int(time.time())
    ttl_min = 15
    
    # Save presence
    repo.save_user_presence(
        userId=userId,
        role="requester",
        available=True,
        lat=37.7749,
        lng=-122.4194,
        geo="tile_1234_5678",
        now=now - (ttl_min * 60 + 10),  # 10 seconds past TTL
        rating=None,
    )
    
    # Should not appear in active presence
    presence_list = repo.get_active_presence_in_geos(
        ["tile_1234_5678"],
        now=now,
        ttl_min=ttl_min
    )
    
    assert len([p for p in presence_list if p["userId"] == userId]) == 0


def test_presence_filters_by_available():
    """Test that only available presence is returned."""
    userId1 = "test_user_3"
    userId2 = "test_user_4"
    now = int(time.time())
    
    # Save two presences, one available, one not
    repo.save_user_presence(
        userId=userId1,
        role="helper",
        available=True,
        lat=37.7749,
        lng=-122.4194,
        geo="tile_1234_5678",
        now=now,
        rating=0.8,
    )
    
    repo.save_user_presence(
        userId=userId2,
        role="helper",
        available=False,
        lat=37.7750,
        lng=-122.4194,
        geo="tile_1234_5678",
        now=now,
        rating=0.9,
    )
    
    # Only available should be returned
    presence_list = repo.get_active_presence_in_geos(
        ["tile_1234_5678"],
        now=now,
        ttl_min=15
    )
    
    user_ids = [p["userId"] for p in presence_list]
    assert userId1 in user_ids
    assert userId2 not in user_ids


def test_presence_filters_by_geo():
    """Test that presence is filtered by geo."""
    userId1 = "test_user_5"
    userId2 = "test_user_6"
    now = int(time.time())
    
    # Save presences in different geos
    repo.save_user_presence(
        userId=userId1,
        role="helper",
        available=True,
        lat=37.7749,
        lng=-122.4194,
        geo="tile_1234_5678",
        now=now,
        rating=0.8,
    )
    
    repo.save_user_presence(
        userId=userId2,
        role="helper",
        available=True,
        lat=37.7750,
        lng=-122.4194,
        geo="tile_9999_9999",  # Different geo
        now=now,
        rating=0.9,
    )
    
    # Only presence in requested geo should be returned
    presence_list = repo.get_active_presence_in_geos(
        ["tile_1234_5678"],
        now=now,
        ttl_min=15
    )
    
    user_ids = [p["userId"] for p in presence_list]
    assert userId1 in user_ids
    assert userId2 not in user_ids

