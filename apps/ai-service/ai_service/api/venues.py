"""
API routes for venue discovery and stock reporting.
Privacy-first: never returns precise coordinates.
"""

import time
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Path, Query, status

from ..config import get_nearby_radius_m, get_stock_ttl_hours, get_tile_size_m
from ..geo import haversine_meters, lat_lng_to_tile, proximity_band
from ..models import (
    StockReportRequest,
    Venue,
    VenueCard,
    VenueStock,
    VenueStockResponse,
)
from ..repo import repo

router = APIRouter(prefix="/venues", tags=["venues"])


def aggregate_venue_stock(venueId: str, now: int, ttl_hours: int) -> VenueStock:
    """
    Aggregate venue stock from recent reports.
    
    Uses simple decay: reports older than TTL have low/no weight.
    Thresholds: majority vote determines R/Y/G per product.
    
    Args:
        venueId: Venue identifier
        now: Current timestamp
        ttl_hours: TTL in hours for reports
    
    Returns:
        Aggregated stock state (R/Y/G for each product)
    """
    cutoff_time = now - (ttl_hours * 3600)
    reports = repo.get_stock_reports(venueId, cutoff_time)
    
    if not reports:
        # No recent reports, default to unknown (Yellow)
        return VenueStock(pads="Y", tampons="Y", liners="Y")
    
    # Aggregate votes with time decay
    # Recent reports (within last hour) have full weight
    # Older reports have reduced weight
    pads_votes = {"R": 0, "Y": 0, "G": 0}
    tampons_votes = {"R": 0, "Y": 0, "G": 0}
    liners_votes = {"R": 0, "Y": 0, "G": 0}
    
    for report in reports:
        # Time decay: reports within last hour = 1.0, older = 0.5
        age_hours = (now - report.createdAt) / 3600
        weight = 1.0 if age_hours < 1 else 0.5
        
        # Map numeric votes to R/Y/G
        # -1 = R (low), 0 = Y (medium), +1 = G (high)
        def vote_to_state(vote: int) -> str:
            if vote < 0:
                return "R"
            elif vote > 0:
                return "G"
            else:
                return "Y"
        
        pads_votes[vote_to_state(report.pads)] += weight
        tampons_votes[vote_to_state(report.tampons)] += weight
        liners_votes[vote_to_state(report.liners)] += weight
    
    # Determine state by majority vote
    def get_majority(votes: dict) -> str:
        max_vote = max(votes.values())
        if max_vote == 0:
            return "Y"  # Default to medium if no votes
        for state, count in votes.items():
            if count == max_vote:
                return state
        return "Y"
    
    return VenueStock(
        pads=get_majority(pads_votes),
        tampons=get_majority(tampons_votes),
        liners=get_majority(liners_votes),
    )


@router.get("/near", response_model=List[VenueCard])
async def get_nearby_venues(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    radiusM: int = Query(None, description="Search radius in meters"),
):
    """
    Get nearby venues.
    
    Privacy-first:
    - Server computes neighbor grids from provided lat/lng
    - Filters by radius using Haversine (server-side)
    - Returns only coarse grid, not precise coordinates
    - Returns proximity bands, not exact distances
    
    Args:
        lat: Search center latitude
        lng: Search center longitude
        radiusM: Search radius in meters (default from config)
    
    Returns:
        List of venue cards with proximity bands
    """
    radius = radiusM or get_nearby_radius_m()
    
    # Get search center geo and neighbors
    center_geo = lat_lng_to_tile(lat, lng, get_tile_size_m())
    neighbor_geos = repo.get_neighbor_geos(center_geo, radius)
    
    # Fetch venues in neighbor geos
    venues = repo.list_venues_in_geos(neighbor_geos)
    
    # Filter by radius using Haversine (server-side)
    filtered_venues = []
    for venue in venues:
        dist_m = haversine_meters(lat, lng, venue.lat, venue.lng)
        if dist_m <= radius:
            filtered_venues.append((venue, dist_m))
    
    # Sort by distance
    filtered_venues.sort(key=lambda x: x[1])
    
    # Build response cards (privacy-first: no precise coordinates)
    cards = []
    for venue, dist_m in filtered_venues:
        band = proximity_band(dist_m)
        card = VenueCard(
            id=venue.id,
            name=venue.name,
            geo=venue.geo,  # Coarse grid only
            stock=venue.stock,
            stockUpdatedAt=venue.stockUpdatedAt,
            proximityBand=band,  # Band, not exact distance
        )
        cards.append(card)
    
    return cards


@router.post("/report-stock", response_model=VenueStockResponse)
async def report_stock(request: StockReportRequest):
    """
    Report venue stock state.
    
    Accepts numeric votes (-1/0/+1) or direct state (R/Y/G).
    Normalizes inputs and stores as event log.
    Updates venue stock via aggregation.
    
    Args:
        request: Stock report with venueId and product states
    
    Returns:
        Updated venue stock state
    
    TODO: Add auth dependency to extract userId
    """
    # TODO: Extract userId from auth token
    userId = "user_placeholder"  # TODO: Get from auth claims
    
    # Verify venue exists
    venue = repo.get_venue(request.venueId)
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Venue {request.venueId} not found"
        )
    
    now = int(time.time())
    
    # Normalize inputs: R/Y/G -> numeric, or use numeric directly
    def normalize_state(value) -> int:
        if isinstance(value, str):
            if value == "R":
                return -1
            elif value == "G":
                return 1
            elif value == "Y":
                return 0
        return int(value) if value is not None else 0
    
    # Create stock report
    from ..models import StockReport
    
    report = StockReport(
        venueId=request.venueId,
        userId=userId,
        pads=normalize_state(request.pads) if request.pads is not None else 0,
        tampons=normalize_state(request.tampons) if request.tampons is not None else 0,
        liners=normalize_state(request.liners) if request.liners is not None else 0,
        createdAt=now,
    )
    
    repo.add_stock_report(report)
    
    # Aggregate and update venue stock
    ttl_hours = get_stock_ttl_hours()
    aggregated_stock = aggregate_venue_stock(request.venueId, now, ttl_hours)
    repo.set_venue_stock(request.venueId, aggregated_stock, now)
    
    return VenueStockResponse(
        stock=aggregated_stock,
        stockUpdatedAt=now,
    )


@router.get("/{venue_id}/stock", response_model=VenueStockResponse)
async def get_venue_stock(venue_id: str = Path(..., description="Venue ID")):
    """
    Get current stock state for a venue.
    
    Args:
        venue_id: Venue identifier
    
    Returns:
        Current stock state and last update timestamp
    """
    venue = repo.get_venue(venue_id)
    if not venue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Venue {venue_id} not found"
        )
    
    # Re-aggregate from recent reports
    now = int(time.time())
    ttl_hours = get_stock_ttl_hours()
    stock = aggregate_venue_stock(venue_id, now, ttl_hours)
    
    return VenueStockResponse(
        stock=stock,
        stockUpdatedAt=venue.stockUpdatedAt,
    )

