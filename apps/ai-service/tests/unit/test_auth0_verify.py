"""
Unit tests for Auth0 JWT verification.
Tests token validation and error handling.
"""

import pytest
from fastapi import HTTPException
from unittest.mock import Mock, patch

from ai_service.auth0_verify import verify_token, get_jwks


def test_verify_token_missing_key():
    """Test that missing signing key raises 401."""
    fake_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIn0.fake"
    
    with patch("ai_service.auth0_verify.get_jwks") as mock_jwks:
        mock_jwks.return_value = {"keys": []}
        
        with pytest.raises(HTTPException) as exc_info:
            verify_token(fake_token)
        
        assert exc_info.value.status_code == 401
        assert "signing key not found" in str(exc_info.value.detail).lower()


def test_verify_token_expired():
    """Test that expired token raises 401."""
    from jose import jwt as jose_jwt
    
    fake_token = "expired.token.here"
    
    with patch("ai_service.auth0_verify.get_jwks") as mock_jwks, \
         patch("ai_service.auth0_verify.get_signing_key") as mock_key, \
         patch("ai_service.auth0_verify.jwk.construct") as mock_construct, \
         patch("ai_service.auth0_verify.jwt.decode") as mock_decode:
        
        mock_jwks.return_value = {"keys": [{"kid": "test"}]}
        mock_key.return_value = {"kid": "test", "kty": "RSA"}
        mock_construct.return_value = Mock()  # Mock RSA key object
        mock_decode.side_effect = jose_jwt.ExpiredSignatureError("Token expired")
        
        with pytest.raises(HTTPException) as exc_info:
            verify_token(fake_token)
        
        assert exc_info.value.status_code == 401
        assert "expired" in str(exc_info.value.detail).lower()


def test_verify_token_invalid_claims():
    """Test that invalid claims raise 401."""
    from jose import jwt as jose_jwt
    
    fake_token = "invalid.token.here"
    
    with patch("ai_service.auth0_verify.get_jwks") as mock_jwks, \
         patch("ai_service.auth0_verify.get_signing_key") as mock_key, \
         patch("ai_service.auth0_verify.jwk.construct") as mock_construct, \
         patch("ai_service.auth0_verify.jwt.decode") as mock_decode:
        
        mock_jwks.return_value = {"keys": [{"kid": "test"}]}
        mock_key.return_value = {"kid": "test", "kty": "RSA"}
        mock_construct.return_value = Mock()  # Mock RSA key object
        mock_decode.side_effect = jose_jwt.JWTClaimsError("Invalid audience")
        
        with pytest.raises(HTTPException) as exc_info:
            verify_token(fake_token)
        
        assert exc_info.value.status_code == 401
        assert "claims" in str(exc_info.value.detail).lower()


@patch("httpx.get")
def test_get_jwks_fetch_error(mock_get):
    """Test that JWKS fetch errors raise 503."""
    import httpx
    mock_get.side_effect = httpx.RequestError("Network error", request=Mock())
    
    # Clear cache first
    get_jwks.cache_clear()
    
    with pytest.raises(HTTPException) as exc_info:
        get_jwks()
    
    assert exc_info.value.status_code == 503
    assert "JWKS" in str(exc_info.value.detail)


@patch("httpx.get")
def test_get_jwks_success(mock_get):
    """Test successful JWKS fetch."""
    mock_response = Mock()
    mock_response.json.return_value = {"keys": [{"kid": "test"}]}
    mock_response.raise_for_status = Mock()
    mock_get.return_value = mock_response
    
    # Clear cache
    get_jwks.cache_clear()
    
    result = get_jwks()
    
    assert "keys" in result
    assert len(result["keys"]) == 1

