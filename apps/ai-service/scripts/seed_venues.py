#!/usr/bin/env python3
"""
Seed test venues for the nearby network service.
Creates sample venues with stock states.
"""

import sys
import os
import time

# Add parent directory to path to import ai_service
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ai_service.models import Venue, VenueStock
from ai_service.repo import repo
from ai_service.geo import lat_lng_to_tile
from ai_service.config import get_tile_size_m

# Sample venues in San Francisco area
test_venues = [
    {
        "id": "venue_cafeteria",
        "name": "Main Cafeteria",
        "lat": 37.7749,
        "lng": -122.4194,
        "stock": VenueStock(pads="G", tampons="Y", liners="R"),
    },
    {
        "id": "venue_library",
        "name": "Central Library",
        "lat": 37.7750,
        "lng": -122.4194,
        "stock": VenueStock(pads="Y", tampons="G", liners="Y"),
    },
    {
        "id": "venue_gym",
        "name": "Campus Gym",
        "lat": 37.7800,
        "lng": -122.4194,
        "stock": VenueStock(pads="R", tampons="R", liners="G"),
    },
    {
        "id": "venue_student_center",
        "name": "Student Center",
        "lat": 37.7700,
        "lng": -122.4194,
        "stock": VenueStock(pads="G", tampons="G", liners="G"),
    },
]

if __name__ == "__main__":
    print("🌱 Seeding test venues...")
    
    now = int(time.time())
    tile_size = get_tile_size_m()
    
    for venue_data in test_venues:
        geo = lat_lng_to_tile(venue_data["lat"], venue_data["lng"], tile_size)
        
        venue = Venue(
            id=venue_data["id"],
            name=venue_data["name"],
            lat=venue_data["lat"],
            lng=venue_data["lng"],
            geo=geo,
            stock=venue_data["stock"],
            stockUpdatedAt=now,
        )
        
        repo.create_venue(venue)
        print(f"✅ Created venue: {venue.name} (geo: {geo})")
    
    print(f"\n✅ Created {len(test_venues)} test venues!")
    print("\n📝 You can now test venue endpoints:")
    print("  GET /venues/near?lat=37.7749&lng=-122.4194&radiusM=400")

