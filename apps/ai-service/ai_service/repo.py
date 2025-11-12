"""
In-memory repository for presence and venues.
Designed with clear interfaces for easy Firestore migration.

In production, replace with Firestore adapters using:
- Composite indexes: (geo, available, lastSeenAt)
- Geohash neighbor queries for efficient filtering
"""

from typing import Dict, List, Optional

from .models import PresenceCard, StockReport, Venue, VenueStock


# In-memory storage
_presence_store: Dict[str, Dict] = {}  # userId -> presence data
_venues_store: Dict[str, Venue] = {}  # venueId -> venue
_stock_reports: List[StockReport] = []  # Event log


class Repository:
    """Repository interface for presence and venue data."""
    
    # Presence methods
    def save_user_presence(
        self,
        userId: str,
        role: str,
        available: bool,
        lat: float,
        lng: float,
        geo: str,
        now: int,
        rating: Optional[float] = None
    ) -> None:
        """
        Save or update user presence.
        
        In production (Firestore):
        - Collection: 'users_presence'
        - Document ID: userId
        - Fields: role, available, lat (server-only), lng (server-only), geo, lastSeenAt, rating
        - Index: (geo, available, lastSeenAt) for efficient queries
        """
        _presence_store[userId] = {
            "userId": userId,
            "role": role,
            "available": available,
            "lat": lat,  # Server-side only
            "lng": lng,  # Server-side only
            "geo": geo,
            "lastSeenAt": now,
            "rating": rating,
        }
    
    def get_active_presence_in_geos(
        self,
        geos: List[str],
        now: int,
        ttl_min: int
    ) -> List[Dict]:
        """
        Get active presence records in given geos.
        
        Filters by:
        - geo in geos list
        - lastSeenAt within TTL
        - available == True
        
        In production (Firestore):
        - Query: WHERE geo IN [geos] AND available == true AND lastSeenAt > (now - ttl_min*60)
        - Order by lastSeenAt DESC
        - Limit to reasonable batch (e.g., 100)
        """
        cutoff_time = now - (ttl_min * 60)
        results = []
        
        for presence in _presence_store.values():
            if (
                presence["geo"] in geos
                and presence["available"]
                and presence["lastSeenAt"] > cutoff_time
            ):
                results.append(presence)
        
        # Sort by lastSeenAt descending
        results.sort(key=lambda x: x["lastSeenAt"], reverse=True)
        return results
    
    # Venue methods
    def list_venues_in_geos(self, geos: List[str]) -> List[Venue]:
        """
        List venues in given geos.
        
        In production (Firestore):
        - Query: WHERE geo IN [geos]
        - Index: (geo) for efficient queries
        """
        results = []
        for venue in _venues_store.values():
            if venue.geo in geos:
                results.append(venue)
        return results
    
    def get_venue(self, venueId: str) -> Optional[Venue]:
        """
        Get venue by ID.
        
        In production (Firestore):
        - Collection: 'venues'
        - Document ID: venueId
        """
        return _venues_store.get(venueId)
    
    def set_venue_stock(self, venueId: str, stock: VenueStock, updatedAt: int) -> None:
        """
        Update venue stock.
        
        In production (Firestore):
        - Update document: venues/{venueId}
        - Set: stock, stockUpdatedAt
        """
        if venueId in _venues_store:
            venue = _venues_store[venueId]
            venue.stock = stock
            venue.stockUpdatedAt = updatedAt
    
    def add_stock_report(self, report: StockReport) -> None:
        """
        Add a stock report event.
        
        In production (Firestore):
        - Collection: 'stock_reports'
        - Add document with auto-generated ID
        - Fields: venueId, userId, pads, tampons, liners, createdAt
        - Index: (venueId, createdAt) for aggregation queries
        """
        _stock_reports.append(report)
        # Keep only last 1000 reports in memory
        if len(_stock_reports) > 1000:
            _stock_reports.pop(0)
    
    def get_stock_reports(self, venueId: str, since: int) -> List[StockReport]:
        """
        Get stock reports for a venue since timestamp.
        
        In production (Firestore):
        - Query: WHERE venueId == venueId AND createdAt > since
        - Order by createdAt DESC
        """
        return [
            r for r in _stock_reports
            if r.venueId == venueId and r.createdAt > since
        ]
    
    def create_venue(self, venue: Venue) -> None:
        """
        Create a new venue.
        
        In production (Firestore):
        - Collection: 'venues'
        - Document ID: venue.id
        """
        _venues_store[venue.id] = venue
    
    def get_neighbor_geos(self, geo: str, radius_m: int) -> List[str]:
        """
        Get neighbor geos for a given geo within radius.
        
        Helper method that delegates to geo utilities.
        """
        from .geo import get_tile_neighbors
        return get_tile_neighbors(geo, radius_m)


# Global repository instance
repo = Repository()

