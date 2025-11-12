"""
Configuration management for the AI service.
"""

import os
from typing import List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


def get_port() -> int:
    """Get the server port from environment or default to 8000."""
    return int(os.getenv("PORT", "8000"))


def get_cors_origins() -> List[str]:
    """Get CORS allowed origins from environment or default to all."""
    origins = os.getenv("CORS_ORIGINS", "*")
    if origins == "*":
        return ["*"]
    return [origin.strip() for origin in origins.split(",")]


# Auth0 Configuration
def get_auth0_domain() -> str:
    """Get Auth0 domain from environment."""
    domain = os.getenv("AUTH0_DOMAIN", "")
    if not domain:
        raise ValueError("AUTH0_DOMAIN environment variable is required")
    return domain


def get_auth0_audience() -> str:
    """Get Auth0 audience (API identifier) from environment."""
    audience = os.getenv("AUTH0_AUDIENCE", "")
    if not audience:
        raise ValueError("AUTH0_AUDIENCE environment variable is required")
    return audience


def get_auth0_issuer() -> str:
    """Get Auth0 issuer URL from environment."""
    issuer = os.getenv("AUTH0_ISSUER", "")
    if not issuer:
        # Derive from domain if not explicitly set
        domain = get_auth0_domain()
        return f"https://{domain}/"
    return issuer


# Matching Configuration
def get_match_weight_urgency() -> float:
    """Get urgency weight for matching (default 0.5)."""
    return float(os.getenv("MATCH_WEIGHTS_URGENCY", "0.5"))


def get_match_weight_proximity() -> float:
    """Get proximity weight for matching (default 0.3)."""
    return float(os.getenv("MATCH_WEIGHTS_PROXIMITY", "0.3"))


def get_match_weight_trust() -> float:
    """Get trust/rating weight for matching (default 0.2)."""
    return float(os.getenv("MATCH_WEIGHTS_TRUST", "0.2"))


def get_top_k() -> int:
    """Get top K results for matching (default 5)."""
    return int(os.getenv("TOP_K", "5"))


def get_match_weights() -> dict:
    """Get all matching weights as a dictionary."""
    return {
        "urgency": get_match_weight_urgency(),
        "proximity": get_match_weight_proximity(),
        "trust": get_match_weight_trust(),
    }


# Nearby Network Configuration
def get_tile_size_m() -> int:
    """Get tile size in meters for coarse grid (default 200m)."""
    return int(os.getenv("TILE_SIZE_M", "200"))


def get_proximity_weight() -> float:
    """Get proximity weight for nearby network scoring (default 0.7)."""
    return float(os.getenv("W_PROXIMITY", "0.7"))


def get_trust_weight() -> float:
    """Get trust/rating weight for nearby network scoring (default 0.3)."""
    return float(os.getenv("W_TRUST", "0.3"))


def get_stock_ttl_hours() -> int:
    """Get stock report TTL in hours (default 6)."""
    return int(os.getenv("STOCK_TTL_HOURS", "6"))


def get_nearby_radius_m() -> int:
    """Get default nearby search radius in meters (default 400)."""
    return int(os.getenv("NEARBY_RADIUS_M", "400"))


def get_presence_ttl_min() -> int:
    """Get presence TTL in minutes (default 15)."""
    return int(os.getenv("PRESENCE_TTL_MIN", "15"))


# Chat Configuration
def get_chat_max_len() -> int:
    """Get maximum chat message length after filtering (default 500)."""
    return int(os.getenv("CHAT_MAX_LEN", "500"))


def get_rate_burst() -> int:
    """Get rate limit burst size (default 5 messages)."""
    return int(os.getenv("RATE_BURST", "5"))


def get_rate_refill_per_sec() -> float:
    """Get rate limit refill rate per second (default 1.0)."""
    return float(os.getenv("RATE_REFILL_PER_SEC", "1.0"))


def get_enable_spacy_ner() -> bool:
    """Get whether spaCy NER is enabled (default False)."""
    return os.getenv("ENABLE_SPACY_NER", "false").lower() == "true"

