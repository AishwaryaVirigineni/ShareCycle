"""
FastAPI routes and application setup.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from ..config import get_cors_origins
from ..core.service import classify_message
from .models import ClassifyRequest, ClassifyResponse
from .matching import router as matching_router
from .geo import router as geo_router
from .venues import router as venues_router
from .chat import router as chat_router

# Initialize FastAPI app
app = FastAPI(
    title="AI Service",
    description="Message classification service with urgency detection and empathy responses",
    version="1.0.0"
)

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(matching_router)
app.include_router(geo_router)
app.include_router(venues_router)
app.include_router(chat_router)


@app.post("/classify", response_model=ClassifyResponse)
async def classify(request: ClassifyRequest) -> ClassifyResponse:
    """
    Classify a message and return urgency level with empathetic response.
    
    Args:
        request: Request body with "message" field
    
    Returns:
        Response with "urgency" and "empathy" fields
    """
    result = classify_message(request.message)
    return ClassifyResponse(**result)


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}

