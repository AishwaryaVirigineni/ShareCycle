#!/usr/bin/env python3
"""
Main entry point for the AI service.
Run with: python main.py or uvicorn ai_service.api.routes:app
"""

import uvicorn

from ai_service.config import get_port

if __name__ == "__main__":
    port = get_port()
    uvicorn.run(
        "ai_service.api.routes:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )

