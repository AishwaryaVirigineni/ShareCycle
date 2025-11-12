"""
API routes for location updates and nearby network discovery.
Privacy-first: never returns precise coordinates or exact distances.
"""

import time
from typing import List, Optional

from fastapi import APIRouter, Query

from ..config import (
    get_nearby_radius_m,
    get_presence_ttl_min,
    get_proximity_weight,
    get_tile_size_m,
    get_trust_weight,
)
from ..geo import haversine_meters, lat_lng_to_tile, proximity_band, proximity_band_score
from ..models import LocationUpdateRequest, LocationUpdateResponse, PresenceCard
from ..repo import repo

router = APIRouter(prefix="/location", tags=["location"])


@router.post("/update", response_model=LocationUpdateResponse)
async def update_location(request: LocationUpdateRequest):
    """
    Update user location and presence.
    
    Privacy-first:
    - Stores precise lat/lng server-side only
    - Returns only coarse grid identifier (geo)
    - Never logs raw coordinates
    
    Args:
        request: Location update with lat, lng, available, role
    
    Returns:
        Response with geo (coarse grid) and lastSeenAt timestamp
    
    TODO: Add auth dependency to extract userId from token
    """
    # TODO: Extract userId from auth token
    # For now, using a placeholder - in production, get from auth dependency
    userId = "user_placeholder"  # TODO: Get from auth claims
    
    now = int(time.time())
    geo = lat_lng_to_tile(request.lat, request.lng, get_tile_size_m())
    
    # Store presence (precise coordinates stored server-side only)
    repo.save_user_presence(
        userId=userId,
        role=request.role,
        available=request.available,
        lat=request.lat,  # Server-side only, never returned
        lng=request.lng,  # Server-side only, never returned
        geo=geo,
        now=now,
        rating=None,  # TODO: Get from user profile if helper
    )
    
    return LocationUpdateResponse(geo=geo, lastSeenAt=now)


@router.get("/network/nearby", response_model=List[PresenceCard])
async def get_nearby_network(
    role: str = Query(..., description="Filter by role: helper or requester"),
    radiusM: int = Query(None, description="Search radius in meters"),
    lat: Optional[float] = Query(None, description="Caller's latitude"),
    lng: Optional[float] = Query(None, description="Caller's longitude"),
):
    """
    Get nearby network presence cards.
    
    Privacy-first:
    - Never returns precise lat/lng
    - Never returns exact distances
    - Only returns proximity bands (e.g., "100-250")
    - Only returns coarse grid identifiers
    
    Args:
        role: Filter by "helper" or "requester"
        radiusM: Search radius in meters (default from config
        lat: Caller's latitude (optional, for scoring)
        lng: Caller's longitude (optional, for scoring)
    
    Returns:
        List of anonymized presence cards sorted by score
    
    TODO: Add auth dependency to extract userId and location
    """
    # TODO: Get userId and location from auth token
    # For now, using placeholders
    caller_lat = lat or 37.7749  # Default to SF if not provided
    caller_lng = lng or -122.4194
    
    radius = radiusM or get_nearby_radius_m()
    ttl_min = get_presence_ttl_min()
    now = int(time.time())
    
    # Get caller's geo and neighbors
    caller_geo = lat_lng_to_tile(caller_lat, caller_lng, get_tile_size_m())
    neighbor_geos = repo.get_neighbor_geos(caller_geo, radius)
    
    # Fetch active presence in neighbor geos
    presence_list = repo.get_active_presence_in_geos(neighbor_geos, now, ttl_min)
    
    # Filter by role
    filtered = [p for p in presence_list if p["role"] == role]
    
    # Score and rank (privacy-first: compute distances server-side)
    w_proximity = get_proximity_weight()
    w_trust = get_trust_weight()
    
    scored_cards = []
    for presence in filtered:
        # Compute distance server-side (never exposed to client)
        dist_m = haversine_meters(
            caller_lat, caller_lng,
            presence["lat"], presence["lng"]
        )
        
        # Map to proximity band (privacy-first)
        band = proximity_band(dist_m)
        band_score = proximity_band_score(band)
        
        # Calculate composite score
        trust_score = presence.get("rating", 0.5) or 0.5
        score = w_proximity * band_score + w_trust * trust_score
        
        scored_cards.append({
            "presence": presence,
            "score": score,
            "band": band,
            "dist_m": dist_m,  # Server-side only
        })
    
    # Sort by score descending
    scored_cards.sort(key=lambda x: x["score"], reverse=True)
    
    # Build anonymized response cards
    cards = []
    for item in scored_cards:
        presence = item["presence"]
        card = PresenceCard(
            userId=presence["userId"],
            role=presence["role"],
            available=presence["available"],
            geo=presence["geo"],  # Coarse grid only
            proximityBand=item["band"],  # Band, not exact distance
            rating=presence.get("rating"),
            lastSeenAt=presence["lastSeenAt"],
        )
        cards.append(card)
    
    return cards

