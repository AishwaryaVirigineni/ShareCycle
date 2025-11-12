"""
Matching algorithm for ranking helpers based on urgency, proximity, and trust.
Uses configurable weights for explainable scoring.
"""

from typing import Dict, List, Literal, TypedDict

from .geo import haversine_meters

Urgency = Literal["urgent", "normal", "low"]


class Request(TypedDict):
    """Request data structure."""
    id: str
    lat: float
    lng: float
    urgency: Urgency
    productNeed: str  # Optional in practice, but required here for type safety
    createdAt: str


class Helper(TypedDict):
    """Helper data structure."""
    id: str
    lat: float
    lng: float
    rating: float  # 0.0 to 1.0
    available: bool
    updatedAt: str


class RankedCandidate(TypedDict):
    """Ranked candidate helper with score and metadata."""
    id: str
    score: float
    distM: float
    rating: float


def urgency_level(urgency: Urgency) -> float:
    """
    Convert urgency level to numeric score.
    
    Args:
        urgency: Urgency level ("urgent", "normal", or "low")
    
    Returns:
        Numeric score: urgent=3.0, normal=2.0, low=1.0
    """
    mapping = {
        "urgent": 3.0,
        "normal": 2.0,
        "low": 1.0,
    }
    return mapping.get(urgency, 2.0)


def proximity_score(meters: float) -> float:
    """
    Calculate proximity score based on distance bands.
    
    Scoring bands:
    - 0-100m: 1.0 (very close)
    - 101-250m: 0.8
    - 251-500m: 0.6
    - 501-1000m: 0.4
    - >1000m: 0.2
    
    Args:
        meters: Distance in meters
    
    Returns:
        Proximity score (0.0 to 1.0)
    """
    if meters <= 100:
        return 1.0
    elif meters <= 250:
        return 0.8
    elif meters <= 500:
        return 0.6
    elif meters <= 1000:
        return 0.4
    else:
        return 0.2


def score_helper(
    req: Request,
    helper: Helper,
    weights: Dict[str, float]
) -> float:
    """
    Calculate composite score for a helper given a request.
    
    Formula: score = w_urgency·urgency_level + w_proximity·proximity_score + w_trust·rating
    
    Args:
        req: Request data
        helper: Helper data
        weights: Dictionary with "urgency", "proximity", "trust" keys
    
    Returns:
        Composite score (higher is better)
    """
    # Calculate distance
    dist_m = haversine_meters(req["lat"], req["lng"], helper["lat"], helper["lng"])
    
    # Get component scores
    u_score = urgency_level(req["urgency"])
    p_score = proximity_score(dist_m)
    t_score = helper["rating"]
    
    # Weighted sum
    score = (
        weights["urgency"] * u_score
        + weights["proximity"] * p_score
        + weights["trust"] * t_score
    )
    
    return score


def rank_helpers(
    req: Request,
    helpers: List[Helper],
    weights: Dict[str, float],
    top_k: int
) -> List[RankedCandidate]:
    """
    Rank helpers by composite score and return top K.
    
    Args:
        req: Request data
        helpers: List of candidate helpers
        weights: Matching weights dictionary
        top_k: Number of top results to return
    
    Returns:
        List of ranked candidates with score, distance, and rating
    """
    # Filter to available helpers only
    available_helpers = [h for h in helpers if h.get("available", False)]
    
    # Calculate scores and distances for each helper
    candidates = []
    for helper in available_helpers:
        dist_m = haversine_meters(
            req["lat"], req["lng"], helper["lat"], helper["lng"]
        )
        score = score_helper(req, helper, weights)
        
        candidates.append({
            "id": helper["id"],
            "score": round(score, 4),
            "distM": round(dist_m, 2),
            "rating": helper["rating"],
        })
    
    # Sort by score descending
    candidates.sort(key=lambda x: x["score"], reverse=True)
    
    # Return top K
    return candidates[:top_k]

