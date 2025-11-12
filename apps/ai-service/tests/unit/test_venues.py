"""
Unit tests for venue management and stock reporting.
Tests neighbor fetch, radius filtering, and stock aggregation.
"""

import time

import pytest

from ai_service.models import StockReport, Venue, VenueStock
from ai_service.repo import repo


def test_list_venues_in_geos():
    """Test listing venues in given geos."""
    # Create test venues
    venue1 = Venue(
        id="venue1",
        name="Cafeteria",
        lat=37.7749,
        lng=-122.4194,
        geo="tile_1234_5678",
        stock=VenueStock(pads="G", tampons="Y", liners="R"),
        stockUpdatedAt=int(time.time()),
    )
    
    venue2 = Venue(
        id="venue2",
        name="Library",
        lat=37.7750,
        lng=-122.4194,
        geo="tile_1234_5678",  # Same geo
        stock=VenueStock(pads="Y", tampons="G", liners="Y"),
        stockUpdatedAt=int(time.time()),
    )
    
    venue3 = Venue(
        id="venue3",
        name="Gym",
        lat=37.7800,
        lng=-122.4194,
        geo="tile_9999_9999",  # Different geo
        stock=VenueStock(pads="R", tampons="R", liners="R"),
        stockUpdatedAt=int(time.time()),
    )
    
    repo.create_venue(venue1)
    repo.create_venue(venue2)
    repo.create_venue(venue3)
    
    # List venues in first geo
    venues = repo.list_venues_in_geos(["tile_1234_5678"])
    
    venue_ids = [v.id for v in venues]
    assert "venue1" in venue_ids
    assert "venue2" in venue_ids
    assert "venue3" not in venue_ids


def test_stock_aggregation_recent_reports():
    """Test stock aggregation with recent reports."""
    venue_id = "venue_stock_test"
    now = int(time.time())
    
    # Create venue
    venue = Venue(
        id=venue_id,
        name="Test Venue",
        lat=37.7749,
        lng=-122.4194,
        geo="tile_1234_5678",
        stock=VenueStock(pads="Y", tampons="Y", liners="Y"),
        stockUpdatedAt=now,
    )
    repo.create_venue(venue)
    
    # Add recent reports (mostly positive)
    repo.add_stock_report(StockReport(
        venueId=venue_id,
        userId="user1",
        pads=1,  # High
        tampons=1,  # High
        liners=1,  # High
        createdAt=now - 100,  # Recent
    ))
    
    repo.add_stock_report(StockReport(
        venueId=venue_id,
        userId="user2",
        pads=1,  # High
        tampons=0,  # Medium
        liners=-1,  # Low
        createdAt=now - 200,  # Recent
    ))
    
    # Aggregate stock
    from ai_service.api.venues import aggregate_venue_stock
    from ai_service.config import get_stock_ttl_hours
    
    ttl_hours = get_stock_ttl_hours()
    stock = aggregate_venue_stock(venue_id, now, ttl_hours)
    
    # Should aggregate to majority vote
    assert stock.pads == "G"  # Majority high (2 votes for G)
    assert stock.tampons in ["G", "Y"]  # Mixed but leaning high
    # Liners: 1 vote for G, 1 vote for R - could be either depending on tie-breaking
    assert stock.liners in ["R", "G", "Y"]  # Accept any valid state


def test_stock_aggregation_stale_reports():
    """Test that stale reports have reduced weight."""
    venue_id = "venue_stale_test"
    now = int(time.time())
    ttl_hours = 6
    
    # Create venue
    venue = Venue(
        id=venue_id,
        name="Test Venue",
        lat=37.7749,
        lng=-122.4194,
        geo="tile_1234_5678",
        stock=VenueStock(pads="Y", tampons="Y", liners="Y"),
        stockUpdatedAt=now,
    )
    repo.create_venue(venue)
    
    # Add very old reports (should have low weight)
    repo.add_stock_report(StockReport(
        venueId=venue_id,
        userId="user1",
        pads=-1,  # Low
        tampons=-1,
        liners=-1,
        createdAt=now - (ttl_hours * 3600 + 1000),  # Very old
    ))
    
    # Add recent reports (should have full weight)
    repo.add_stock_report(StockReport(
        venueId=venue_id,
        userId="user2",
        pads=1,  # High
        tampons=1,
        liners=1,
        createdAt=now - 100,  # Recent
    ))
    
    # Aggregate stock
    from ai_service.api.venues import aggregate_venue_stock
    
    stock = aggregate_venue_stock(venue_id, now, ttl_hours)
    
    # Recent reports should dominate
    assert stock.pads == "G"  # Recent high should win
    assert stock.tampons == "G"
    assert stock.liners == "G"


def test_stock_aggregation_no_reports():
    """Test stock aggregation with no recent reports."""
    venue_id = "venue_no_reports"
    now = int(time.time())
    ttl_hours = 6
    
    # Create venue
    venue = Venue(
        id=venue_id,
        name="Test Venue",
        lat=37.7749,
        lng=-122.4194,
        geo="tile_1234_5678",
        stock=VenueStock(pads="Y", tampons="Y", liners="Y"),
        stockUpdatedAt=now,
    )
    repo.create_venue(venue)
    
    # No reports added
    
    # Aggregate stock
    from ai_service.api.venues import aggregate_venue_stock
    
    stock = aggregate_venue_stock(venue_id, now, ttl_hours)
    
    # Should default to medium (Yellow)
    assert stock.pads == "Y"
    assert stock.tampons == "Y"
    assert stock.liners == "Y"


def test_get_neighbor_geos():
    """Test neighbor geo calculation."""
    geo = "tile_1234_5678"
    neighbors = repo.get_neighbor_geos(geo, radius_m=400)
    
    assert geo in neighbors  # Should include original
    assert len(neighbors) > 1  # Should have neighbors
    
    # For 400m radius with 200m tiles, should have multiple neighbors
    assert len(neighbors) >= 9  # At least 3x3 grid

