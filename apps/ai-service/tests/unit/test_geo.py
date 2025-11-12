"""
Unit tests for geolocation utilities.
Tests Haversine distance calculation and proximity band mapping.
"""

import pytest

from ai_service.geo import (
    haversine_meters,
    proximity_band,
    proximity_band_score,
    lat_lng_to_tile,
    get_tile_neighbors,
)


def test_haversine_meters_same_point():
    """Test Haversine with same point returns 0."""
    lat, lng = 37.7749, -122.4194
    distance = haversine_meters(lat, lng, lat, lng)
    assert distance == pytest.approx(0.0, abs=1.0)  # Allow 1m tolerance


def test_haversine_meters_known_distance():
    """Test Haversine with known distance (SF to Oakland ~10km)."""
    # San Francisco coordinates
    sf_lat, sf_lng = 37.7749, -122.4194
    # Oakland coordinates (approximately 10km away)
    oak_lat, oak_lng = 37.8044, -122.2711
    
    distance = haversine_meters(sf_lat, sf_lng, oak_lat, oak_lng)
    # Should be approximately 10-15km
    assert 10000 < distance < 15000


def test_haversine_meters_close_points():
    """Test Haversine with close points (~100m apart)."""
    lat1, lng1 = 37.7749, -122.4194
    # ~0.001 degree ≈ 111m at this latitude
    lat2 = lat1 + 0.001
    lng2 = lng1
    
    distance = haversine_meters(lat1, lng1, lat2, lng2)
    # Should be approximately 111m
    assert 100 < distance < 120


@pytest.mark.parametrize("distance_m,expected_band", [
    (50, "0-100"),
    (100, "0-100"),
    (200, "100-250"),
    (250, "100-250"),
    (400, "250-500"),
    (500, "250-500"),
    (700, "500-1000"),
    (1000, "500-1000"),
    (1500, ">1000"),
])
def test_proximity_band_mapping(distance_m: float, expected_band: str):
    """Test proximity band mapping for various distances."""
    assert proximity_band(distance_m) == expected_band


def test_proximity_band_score():
    """Test proximity band score mapping."""
    assert proximity_band_score("0-100") == 1.0
    assert proximity_band_score("100-250") == 0.8
    assert proximity_band_score("250-500") == 0.6
    assert proximity_band_score("500-1000") == 0.4
    assert proximity_band_score(">1000") == 0.2
    assert proximity_band_score("unknown") == 0.2  # Default


def test_lat_lng_to_tile():
    """Test lat/lng to tile conversion."""
    lat, lng = 37.7749, -122.4194
    tile = lat_lng_to_tile(lat, lng, tile_size_m=200)
    
    assert tile.startswith("tile_")
    assert "_" in tile
    # Should have numeric coordinates
    parts = tile.replace("tile_", "").split("_")
    assert len(parts) == 2
    assert all(part.lstrip("-").isdigit() for part in parts)


def test_lat_lng_to_tile_consistency():
    """Test that nearby points map to same or adjacent tiles."""
    lat, lng = 37.7749, -122.4194
    tile1 = lat_lng_to_tile(lat, lng, tile_size_m=200)
    
    # Point ~50m away should be in same tile
    lat2 = lat + 0.0005  # ~55m
    tile2 = lat_lng_to_tile(lat2, lng, tile_size_m=200)
    
    # Should be same or adjacent tile
    assert tile1 == tile2 or tile1.split("_")[1] == tile2.split("_")[1]


def test_get_tile_neighbors():
    """Test tile neighbor generation."""
    tile = "tile_1234_5678"
    neighbors = get_tile_neighbors(tile, radius_m=400)
    
    assert tile in neighbors  # Should include original tile
    assert len(neighbors) > 1  # Should have neighbors
    
    # For 400m radius with 200m tiles, should have ~9 tiles (3x3 grid)
    assert len(neighbors) >= 9


def test_get_tile_neighbors_invalid():
    """Test tile neighbor with invalid tile format."""
    neighbors = get_tile_neighbors("invalid", radius_m=400)
    assert neighbors == ["invalid"]  # Should return as-is

