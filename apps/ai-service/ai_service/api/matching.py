"""
API routes for matching requests with helpers.
Protected by Auth0 authentication.
"""

from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from ..auth0_verify import verify_auth0_token
from ..config import get_match_weights, get_top_k
from ..matching import rank_helpers
from ..storage import get_helpers_near, get_request, record_match_attempt

router = APIRouter(prefix="/match", tags=["matching"])


class MatchRequest(BaseModel):
    """Request body for /match endpoint."""
    requestId: str


class CandidateResponse(BaseModel):
    """Candidate helper in match response."""
    helperId: str
    score: float
    distM: float
    rating: float


class MatchConfig(BaseModel):
    """Matching configuration."""
    weights: Dict[str, float]
    topK: int


class MatchResponse(BaseModel):
    """Response from /match endpoint."""
    candidates: List[CandidateResponse]
    config: MatchConfig


@router.post("", response_model=MatchResponse)
async def match_helpers(
    match_req: MatchRequest,
    claims: Dict = Depends(verify_auth0_token)
):
    """
    Match a request with nearby helpers and return top K ranked candidates.
    
    Protected by Auth0 - requires valid Bearer token.
    
    Process:
    1. Load request by ID
    2. Load candidate helpers near request location (coarse filtering)
    3. Rank helpers by composite score (urgency + proximity + trust)
    4. Return top K candidates with scores and metadata
    
    Args:
        match_req: Request body with requestId
        claims: Auth0 token claims (from dependency)
    
    Returns:
        MatchResponse with ranked candidates and config
    
    Raises:
        HTTPException: 404 if request not found, 400 if invalid input
    """
    # Load request
    request = get_request(match_req.requestId)
    if not request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Request {match_req.requestId} not found"
        )
    
    # Load candidate helpers (coarse geo filtering)
    # In production, this uses Firestore geohash queries
    helpers = get_helpers_near(request["lat"], request["lng"])
    
    if not helpers:
        # Return empty result gracefully
        return MatchResponse(
            candidates=[],
            config=MatchConfig(
                weights=get_match_weights(),
                topK=get_top_k(),
            )
        )
    
    # Get matching configuration
    weights = get_match_weights()
    top_k = get_top_k()
    
    # Rank helpers
    ranked = rank_helpers(request, helpers, weights, top_k)
    
    # Format response
    candidates = [
        CandidateResponse(
            helperId=c["id"],
            score=c["score"],
            distM=c["distM"],
            rating=c["rating"],
        )
        for c in ranked
    ]
    
    # Record match attempt (for analytics/demo)
    record_match_attempt(
        match_req.requestId,
        [c.dict() for c in candidates],
        {"weights": weights, "topK": top_k}
    )
    
    return MatchResponse(
        candidates=candidates,
        config=MatchConfig(
            weights=weights,
            topK=top_k,
        )
    )

