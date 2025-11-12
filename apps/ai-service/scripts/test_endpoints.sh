#!/bin/bash
# Quick endpoint testing script
# Make sure server is running: python main.py

BASE_URL="http://localhost:8000"

echo "🧪 Testing AI Service Endpoints"
echo "=================================="
echo ""

# 1. Health Check
echo "1️⃣  Health Check"
echo "----------------"
curl -s "$BASE_URL/health" | jq '.' || echo "❌ Server not running!"
echo ""
echo ""

# 2. Classify Message
echo "2️⃣  Classify Message (Urgent)"
echo "-----------------------------"
curl -s -X POST "$BASE_URL/classify" \
  -H "Content-Type: application/json" \
  -d '{"message":"I started bleeding, please help urgently"}' | jq '.'
echo ""
echo ""

echo "2️⃣  Classify Message (Normal)"
echo "-----------------------------"
curl -s -X POST "$BASE_URL/classify" \
  -H "Content-Type: application/json" \
  -d '{"message":"Please help near the cafeteria"}' | jq '.'
echo ""
echo ""

# 3. Update Location
echo "3️⃣  Update Location (Helper)"
echo "----------------------------"
curl -s -X POST "$BASE_URL/location/update" \
  -H "Content-Type: application/json" \
  -d '{
    "lat": 37.7749,
    "lng": -122.4194,
    "available": true,
    "role": "helper"
  }' | jq '.'
echo ""
echo ""

# 4. Nearby Network
echo "4️⃣  Nearby Network (Helpers)"
echo "----------------------------"
curl -s "$BASE_URL/network/nearby?role=helper&radiusM=400&lat=37.7749&lng=-122.4194" | jq '.'
echo ""
echo ""

# 5. Nearby Venues
echo "5️⃣  Nearby Venues"
echo "-----------------"
curl -s "$BASE_URL/venues/near?lat=37.7749&lng=-122.4194&radiusM=400" | jq '.'
echo ""
echo ""

# 6. Report Stock
echo "6️⃣  Report Venue Stock"
echo "----------------------"
curl -s -X POST "$BASE_URL/venues/report-stock" \
  -H "Content-Type: application/json" \
  -d '{
    "venueId": "venue_cafeteria",
    "pads": "G",
    "tampons": "Y",
    "liners": "R"
  }' | jq '.'
echo ""
echo ""

# 7. Get Venue Stock
echo "7️⃣  Get Venue Stock"
echo "-------------------"
curl -s "$BASE_URL/venues/venue_cafeteria/stock" | jq '.'
echo ""
echo ""

echo "✅ Endpoint testing complete!"
echo ""
echo "💡 To test /match endpoint (requires Auth0 token):"
echo "   curl -X POST http://localhost:8000/match \\"
echo "     -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"requestId\": \"test123\"}'"
echo ""
echo "   (Make sure to seed test data first: python scripts/seed_test_data.py)"

