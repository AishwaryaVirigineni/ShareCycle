"""
Geolocation utilities for distance calculation, grid/tile mapping, and proximity bands.
Uses Haversine formula for accurate distance calculations.
Privacy-first: maps precise coordinates to coarse grids for client exposure.
"""

import math
from typing import Literal, Tuple


def haversine_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate distance between two points using Haversine formula.
    
    Args:
        lat1: Latitude of first point (degrees)
        lng1: Longitude of first point (degrees)
        lat2: Latitude of second point (degrees)
        lng2: Longitude of second point (degrees)
    
    Returns:
        Distance in meters
    """
    # Earth radius in meters
    R = 6371000
    
    # Convert degrees to radians
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lng2 - lng1)
    
    # Haversine formula
    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    distance = R * c
    return distance


def geohash_neighbors(geohash: str, precision: int = 7) -> list[str]:
    """
    Get neighboring geohash cells for a given geohash.
    
    This is a stub implementation. In production, you would:
    1. Use a geohash library (e.g., python-geohash) to encode lat/lng
    2. Generate the 8 neighboring cells (N, NE, E, SE, S, SW, W, NW)
    3. Use these as prefixes in Firestore queries to pre-filter candidates
    4. Example: WHERE geohash IN ['abc1234', 'abc1235', 'abc1236', ...]
    
    This allows efficient geo queries without full table scans.
    
    Args:
        geohash: Geohash string
        precision: Geohash precision (default 7, ~153m accuracy)
    
    Returns:
        List of neighboring geohash strings (stub returns empty list)
    
    Note:
        In production, implement using:
        - geohash.encode(lat, lng, precision=precision)
        - geohash.neighbors(geohash)
        - Use these in Firestore WHERE clauses for coarse filtering
    """
    # Stub implementation
    # TODO: Implement using python-geohash or similar library
    # Example production code:
    # import geohash
    # neighbors = geohash.neighbors(geohash)
    # return [geohash] + neighbors  # Include self and 8 neighbors
    return []


def get_geohash_for_point(lat: float, lng: float, precision: int = 7) -> str:
    """
    Generate geohash for a lat/lng point.
    
    Stub implementation. In production:
    - Use geohash.encode(lat, lng, precision=precision)
    - Store geohash on request/helper documents
    - Use in Firestore queries: WHERE geohash IN [neighbors]
    - This enables efficient geo queries with composite indexes
    
    Args:
        lat: Latitude (degrees)
        lng: Longitude (degrees)
        precision: Geohash precision (default 7)
    
    Returns:
        Geohash string (stub returns empty string)
    
    Note:
        Firestore index strategy:
        1. Create composite index: (geohash, available, updatedAt)
        2. Query: WHERE geohash IN [neighbors] AND available == true
        3. Order by updatedAt DESC
        4. Limit to reasonable batch size (e.g., 100)
        5. Then compute exact distances server-side and rank
    """
    # Stub implementation
    # TODO: Implement using python-geohash
    # return geohash.encode(lat, lng, precision=precision)
    return ""


def lat_lng_to_tile(lat: float, lng: float, tile_size_m: int = 200) -> str:
    """
    Convert lat/lng to a coarse grid tile identifier.
    
    Uses a simple grid system based on tile size in meters.
    Each tile is identified by its grid coordinates.
    
    Args:
        lat: Latitude (degrees)
        lng: Longitude (degrees)
        tile_size_m: Tile size in meters (default 200m)
    
    Returns:
        Tile identifier string (e.g., "tile_1234_5678")
    
    Note:
        In production, consider using geohash for better neighbor queries.
        This simple tile system works for hackathon/demo purposes.
    """
    # Approximate meters per degree (at equator)
    # More accurate would account for latitude, but this is sufficient for coarse grids
    meters_per_degree_lat = 111320.0
    meters_per_degree_lng = 111320.0 * math.cos(math.radians(lat))
    
    # Calculate tile coordinates
    tile_lat = int(lat * meters_per_degree_lat / tile_size_m)
    tile_lng = int(lng * meters_per_degree_lng / tile_size_m)
    
    return f"tile_{tile_lat}_{tile_lng}"


def get_tile_neighbors(tile: str, radius_m: int = 400) -> list[str]:
    """
    Get neighboring tiles for a given tile within radius.
    
    Args:
        tile: Tile identifier (e.g., "tile_1234_5678")
        radius_m: Search radius in meters
    
    Returns:
        List of tile identifiers including the original tile
    """
    if not tile.startswith("tile_"):
        return [tile]
    
    # Parse tile coordinates
    parts = tile.replace("tile_", "").split("_")
    if len(parts) != 2:
        return [tile]
    
    try:
        tile_lat = int(parts[0])
        tile_lng = int(parts[1])
    except ValueError:
        return [tile]
    
    # Calculate how many tiles to include in each direction
    # Assuming ~200m tiles, radius_m/200 gives tile count
    tile_radius = max(1, int(radius_m / 200))
    
    neighbors = []
    for dlat in range(-tile_radius, tile_radius + 1):
        for dlng in range(-tile_radius, tile_radius + 1):
            neighbors.append(f"tile_{tile_lat + dlat}_{tile_lng + dlng}")
    
    return neighbors


def proximity_band(distance_m: float) -> Literal["0-100", "100-250", "250-500", "500-1000", ">1000"]:
    """
    Map distance in meters to a proximity band.
    
    Privacy-first: clients never see exact distances, only bands.
    
    Args:
        distance_m: Distance in meters
    
    Returns:
        Proximity band string
    """
    if distance_m <= 100:
        return "0-100"
    elif distance_m <= 250:
        return "100-250"
    elif distance_m <= 500:
        return "250-500"
    elif distance_m <= 1000:
        return "500-1000"
    else:
        return ">1000"


def proximity_band_score(band: str) -> float:
    """
    Get numeric score for a proximity band.
    
    Used in ranking algorithms.
    
    Args:
        band: Proximity band string
    
    Returns:
        Score (1.0 for closest, 0.2 for farthest)
    """
    scores = {
        "0-100": 1.0,
        "100-250": 0.8,
        "250-500": 0.6,
        "500-1000": 0.4,
        ">1000": 0.2,
    }
    return scores.get(band, 0.2)

