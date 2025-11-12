"""
Auth0 JWT verification using JWKS.
Validates Authorization: Bearer tokens against Auth0 configuration.
"""

import json
from functools import lru_cache
from typing import Dict, Optional

import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, jwk

from .config import get_auth0_audience, get_auth0_domain, get_auth0_issuer

# Security scheme for Bearer token
security = HTTPBearer()


@lru_cache(maxsize=1)
def get_jwks() -> Dict:
    """
    Fetch and cache JWKS from Auth0.
    Cached to avoid repeated HTTP calls.
    """
    domain = get_auth0_domain()
    jwks_url = f"https://{domain}/.well-known/jwks.json"
    
    try:
        response = httpx.get(jwks_url, timeout=5.0)
        response.raise_for_status()
        jwks_data = response.json()
        # Debug: log number of keys (only in debug mode)
        return jwks_data
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to fetch JWKS: {str(e)}"
        )


def get_signing_key(token: str, jwks: Dict) -> Optional[Dict]:
    """
    Get the signing key from JWKS that matches the token's kid.
    
    Args:
        token: JWT token string
        jwks: JWKS dictionary from Auth0
    
    Returns:
        Signing key dictionary or None if not found
    """
    try:
        # Decode header without verification to get kid
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        
        if not kid:
            return None
        
        # Find matching key in JWKS
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                return key
        
        return None
    except Exception:
        return None


def verify_token(token: str) -> Dict:
    """
    Verify Auth0 JWT token and return claims.
    
    Args:
        token: JWT token string
    
    Returns:
        Token claims dictionary
    
    Raises:
        HTTPException: If token is invalid
    """
    jwks = get_jwks()
    signing_key = get_signing_key(token, jwks)
    
    if not signing_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: signing key not found"
        )
    
    try:
        # Convert JWK to RSA key
        # jose.jwk.construct returns a key object that can be used with jwt.decode
        rsa_key = jwk.construct(signing_key)
        
        # Verify and decode token
        audience = get_auth0_audience()
        issuer = get_auth0_issuer()
        
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=audience,
            issuer=issuer,
        )
        
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.JWTClaimsError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token claims: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token verification failed: {str(e)}"
        )


async def verify_auth0_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> Dict:
    """
    FastAPI dependency to verify Auth0 Bearer token.
    
    Usage:
        @app.post("/protected")
        async def protected_route(claims: dict = Depends(verify_auth0_token)):
            # Use claims["sub"] for user ID, etc.
            pass
    
    Args:
        credentials: HTTPAuthorizationCredentials from Bearer token
    
    Returns:
        Token claims dictionary
    
    Raises:
        HTTPException: 401 if token is missing or invalid
    """
    token = credentials.credentials
    return verify_token(token)

