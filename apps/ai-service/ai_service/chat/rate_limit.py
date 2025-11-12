"""
Token bucket rate limiting for chat messages.
Per-thread and per-user burst control.
"""

import time
from typing import Dict, Tuple


# In-memory token buckets: {(userId, threadId): (tokens, last_refill_timestamp)}
_token_buckets: Dict[Tuple[str, str], Tuple[float, float]] = {}


def allow_send(user_id: str, thread_id: str, now: float, burst: int = 5, refill_per_sec: float = 1.0) -> bool:
    """
    Check if user can send a message (token bucket algorithm).
    
    Args:
        user_id: User identifier
        thread_id: Thread identifier
        now: Current timestamp
        burst: Maximum burst size (default 5)
        refill_per_sec: Tokens refilled per second (default 1.0)
    
    Returns:
        True if message is allowed, False if rate limited
    """
    key = (user_id, thread_id)
    
    if key not in _token_buckets:
        # Initialize bucket with full tokens
        _token_buckets[key] = (float(burst), now)
        return True
    
    tokens, last_refill = _token_buckets[key]
    
    # Refill tokens based on elapsed time
    elapsed = now - last_refill
    tokens = min(burst, tokens + elapsed * refill_per_sec)
    
    # Check if we have at least 1 token
    if tokens >= 1.0:
        # Consume 1 token
        _token_buckets[key] = (tokens - 1.0, now)
        return True
    
    # Update last refill time even if we can't send
    _token_buckets[key] = (tokens, now)
    return False


def remaining_tokens(user_id: str, thread_id: str, now: float, burst: int = 5, refill_per_sec: float = 1.0) -> float:
    """
    Get remaining tokens for a user/thread.
    
    Args:
        user_id: User identifier
        thread_id: Thread identifier
        now: Current timestamp
        burst: Maximum burst size (default 5)
        refill_per_sec: Tokens refilled per second (default 1.0)
    
    Returns:
        Number of remaining tokens (can be fractional)
    """
    key = (user_id, thread_id)
    
    if key not in _token_buckets:
        return float(burst)
    
    tokens, last_refill = _token_buckets[key]
    
    # Refill tokens based on elapsed time
    elapsed = now - last_refill
    tokens = min(burst, tokens + elapsed * refill_per_sec)
    
    return tokens


def reset_bucket(user_id: str, thread_id: str):
    """
    Reset token bucket for a user/thread (useful for testing).
    
    Args:
        user_id: User identifier
        thread_id: Thread identifier
    """
    key = (user_id, thread_id)
    if key in _token_buckets:
        del _token_buckets[key]

