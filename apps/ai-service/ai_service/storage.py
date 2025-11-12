"""
Mock storage layer for requests and helpers.
In production, this would be replaced with Firestore queries.
"""

import json
import os
from datetime import datetime
from typing import Dict, List, Optional

from .matching import Helper, Request

# In-memory storage for demo
_requests_store: Dict[str, Request] = {}
_helpers_store: Dict[str, Helper] = {}
_match_attempts: List[Dict] = []

# Optional: File-based persistence for demo
STORAGE_FILE = os.getenv("STORAGE_FILE", "storage.json")


def _load_from_file():
    """Load data from JSON file if it exists."""
    if os.path.exists(STORAGE_FILE):
        try:
            with open(STORAGE_FILE, "r") as f:
                data = json.load(f)
                _requests_store.update(data.get("requests", {}))
                _helpers_store.update(data.get("helpers", {}))
        except Exception:
            # If file is corrupted, start fresh
            pass


def _save_to_file():
    """Save data to JSON file."""
    try:
        data = {
            "requests": _requests_store,
            "helpers": _helpers_store,
        }
        with open(STORAGE_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception:
        # If file write fails, continue with in-memory only
        pass


# Load on module import
_load_from_file()


def get_request(request_id: str) -> Optional[Request]:
    """
    Get a request by ID.
    
    In production, this would query Firestore:
    - Collection: 'requests'
    - Document ID: request_id
    - Returns: Request document or None
    
    Args:
        request_id: Request identifier
    
    Returns:
        Request data or None if not found
    """
    return _requests_store.get(request_id)


def create_request(request_data: Request) -> Request:
    """
    Create a new request (for demo/testing).
    
    In production, this would write to Firestore:
    - Collection: 'requests'
    - Document ID: request_data['id']
    - Fields: lat, lng, urgency, productNeed, createdAt, geohash
    - Index: Composite index on (geohash, createdAt)
    
    Args:
        request_data: Request data
    
    Returns:
        Created request
    """
    _requests_store[request_data["id"]] = request_data
    _save_to_file()
    return request_data


def get_helpers_near(lat: float, lng: float, limit: int = 50) -> List[Helper]:
    """
    Get helpers near a location (coarse filtering).
    
    In production, this would use Firestore geo queries:
    1. Calculate geohash for (lat, lng) with precision 7
    2. Get geohash neighbors (8 cells)
    3. Query: WHERE geohash IN [neighbors] AND available == true
    4. Order by updatedAt DESC
    5. Limit to limit (e.g., 50-100 for server-side ranking)
    6. Return list of Helper documents
    
    Firestore index strategy:
    - Composite index: (geohash, available, updatedAt)
    - This enables efficient geo queries without full table scans
    
    For demo, returns a sample list of helpers.
    
    Args:
        lat: Latitude (degrees)
        lng: Longitude (degrees)
        limit: Maximum number of candidates to return
    
    Returns:
        List of helper candidates
    """
    # In production: Firestore query with geohash filtering
    # For demo: return all available helpers (simulating coarse filtering)
    helpers = [h for h in _helpers_store.values() if h.get("available", False)]
    
    # Simulate coarse filtering by returning a sample
    # In production, geohash neighbors would pre-filter this
    return helpers[:limit]


def create_helper(helper_data: Helper) -> Helper:
    """
    Create a new helper (for demo/testing).
    
    In production, this would write to Firestore:
    - Collection: 'helpers'
    - Document ID: helper_data['id']
    - Fields: lat, lng, rating, available, updatedAt, geohash
    - Index: Composite index on (geohash, available, updatedAt)
    
    Args:
        helper_data: Helper data
    
    Returns:
        Created helper
    """
    _helpers_store[helper_data["id"]] = helper_data
    _save_to_file()
    return helper_data


def record_match_attempt(request_id: str, candidates: List[Dict], config: Dict):
    """
    Record a match attempt for analytics/demo.
    
    In production, this would write to Firestore:
    - Collection: 'match_attempts'
    - Fields: requestId, candidates, config, timestamp
    - Used for analytics and debugging
    
    Args:
        request_id: Request ID
        candidates: Ranked candidates
        config: Matching configuration used
    """
    attempt = {
        "requestId": request_id,
        "candidates": candidates,
        "config": config,
        "timestamp": datetime.utcnow().isoformat(),
    }
    _match_attempts.append(attempt)
    
    # Keep only last 100 attempts in memory
    if len(_match_attempts) > 100:
        _match_attempts.pop(0)

