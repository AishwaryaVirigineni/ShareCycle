#!/usr/bin/env python3
"""
Seed test data for the matching service.
Creates sample requests and helpers for testing.
"""

import sys
import os

# Add parent directory to path to import ai_service
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_service.storage import create_request, create_helper
from datetime import datetime

# Sample request data
test_request = {
    "id": "test123",
    "lat": 37.7749,  # San Francisco coordinates
    "lng": -122.4194,
    "urgency": "urgent",
    "productNeed": "tampon",
    "createdAt": datetime.utcnow().isoformat() + "Z",
}

# Sample helper data
test_helpers = [
    {
        "id": "helper1",
        "lat": 37.7750,  # ~111m away (close)
        "lng": -122.4194,
        "rating": 0.8,
        "available": True,
        "updatedAt": datetime.utcnow().isoformat() + "Z",
    },
    {
        "id": "helper2",
        "lat": 37.7800,  # ~600m away (medium)
        "lng": -122.4194,
        "rating": 0.9,
        "available": True,
        "updatedAt": datetime.utcnow().isoformat() + "Z",
    },
    {
        "id": "helper3",
        "lat": 37.7850,  # ~1100m away (far)
        "lng": -122.4194,
        "rating": 0.7,
        "available": True,
        "updatedAt": datetime.utcnow().isoformat() + "Z",
    },
    {
        "id": "helper4",
        "lat": 37.7750,
        "lng": -122.4194,
        "rating": 0.95,
        "available": False,  # Unavailable helper
        "updatedAt": datetime.utcnow().isoformat() + "Z",
    },
]

if __name__ == "__main__":
    print("🌱 Seeding test data...")
    
    # Create test request
    request = create_request(test_request)
    print(f"✅ Created request: {request['id']}")
    
    # Create test helpers
    for helper_data in test_helpers:
        helper = create_helper(helper_data)
        status = "✅" if helper["available"] else "⏸️ "
        print(f"{status} Created helper: {helper['id']} (available: {helper['available']})")
    
    print("\n✅ Test data seeded successfully!")
    print(f"\n📝 You can now test with requestId: {test_request['id']}")
    print("\nExample curl command:")
    print(f'curl -X POST http://localhost:8000/match \\')
    print(f'  -H "Content-Type: application/json" \\')
    print(f'  -H "Authorization: Bearer YOUR_TOKEN" \\')
    print(f'  -d \'{{"requestId": "{test_request["id"]}"}}\'')

