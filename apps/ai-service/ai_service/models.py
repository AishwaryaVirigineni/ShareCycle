"""
Pydantic models for nearby network and venue APIs.
Privacy-first: models never expose precise coordinates.
"""

from typing import Dict, Literal, Optional
from pydantic import BaseModel


# Location Update Models
class LocationUpdateRequest(BaseModel):
    """Request to update user location and presence."""
    lat: float
    lng: float
    available: bool
    role: Literal["helper", "requester"]


class LocationUpdateResponse(BaseModel):
    """Response from location update."""
    geo: str  # Coarse grid identifier
    lastSeenAt: int  # Unix timestamp


# Nearby Network Models
class PresenceCard(BaseModel):
    """Anonymized presence card returned to clients."""
    userId: str
    role: Literal["helper", "requester"]
    available: bool
    geo: str  # Coarse grid only
    proximityBand: Literal["0-100", "100-250", "250-500", "500-1000", ">1000"]
    rating: Optional[float] = None  # Only for helpers
    lastSeenAt: int


# Venue Models
class VenueStock(BaseModel):
    """Venue stock state."""
    pads: Literal["R", "Y", "G"]  # Red/Yellow/Green
    tampons: Literal["R", "Y", "G"]
    liners: Literal["R", "Y", "G"]


class Venue(BaseModel):
    """Venue information."""
    id: str
    name: str
    lat: float  # Server-side only, not in responses
    lng: float  # Server-side only, not in responses
    geo: str  # Coarse grid identifier
    stock: VenueStock
    stockUpdatedAt: int


class VenueCard(BaseModel):
    """Venue card returned to clients (no precise coordinates)."""
    id: str
    name: str
    geo: str
    stock: VenueStock
    stockUpdatedAt: int
    proximityBand: Literal["0-100", "100-250", "250-500", "500-1000", ">1000"]


# Stock Report Models
class StockReportRequest(BaseModel):
    """Request to report venue stock."""
    venueId: str
    pads: Optional[Literal[-1, 0, 1, "R", "Y", "G"]] = None
    tampons: Optional[Literal[-1, 0, 1, "R", "Y", "G"]] = None
    liners: Optional[Literal[-1, 0, 1, "R", "Y", "G"]] = None


class StockReport(BaseModel):
    """Stock report event (internal)."""
    venueId: str
    userId: str
    pads: int  # -1 (low), 0 (medium), +1 (high)
    tampons: int
    liners: int
    createdAt: int  # Unix timestamp


class VenueStockResponse(BaseModel):
    """Response with venue stock."""
    stock: VenueStock
    stockUpdatedAt: int

