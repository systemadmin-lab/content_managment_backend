#!/bin/bash

# Test script for content generation API
BASE_URL="http://localhost:5000"

echo "=== Testing Content Generation API ==="
echo ""

# Step 1: Register/Login a test user
echo "1. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123"
  }')

echo "Registration response: $REGISTER_RESPONSE"

# Extract token (try from registration, if fails try login)
TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

# If registration failed (user exists), try login
if [ -z "$TOKEN" ]; then
  echo ""
  echo "User exists, trying login..."
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "test@example.com",
      "password": "testpass123"
    }')
  
  echo "Login response: $LOGIN_RESPONSE"
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')
fi

if [ -z "$TOKEN" ]; then
  echo "ERROR: Could not get authentication token!"
  exit 1
fi

echo ""
echo "Token obtained: ${TOKEN:0:20}..."
echo ""

# Step 2: Queue a content generation job
echo "2. Queueing content generation job..."
GENERATE_RESPONSE=$(curl -s -X POST "$BASE_URL/generate-content" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "prompt": "How to make the perfect cup of coffee",
    "contentType": "Blog Post Outline"
  }')

echo "Generate response:"
echo "$GENERATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$GENERATE_RESPONSE"

# Extract job ID
JOB_ID=$(echo $GENERATE_RESPONSE | grep -o '"jobId":"[^"]*' | sed 's/"jobId":"//')

if [ -z "$JOB_ID" ]; then
  echo ""
  echo "ERROR: Could not get job ID from response!"
  echo "This is likely the error you're experiencing."
  exit 1
fi

echo ""
echo "Job ID: $JOB_ID"
echo ""

# Step 3: Check job status
echo "3. Checking job status immediately..."
STATUS_RESPONSE=$(curl -s -X GET "$BASE_URL/generate-content/$JOB_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Job status:"
echo "$STATUS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$STATUS_RESPONSE"

echo ""
echo "=== Test Complete ==="
echo ""
echo "The job is queued and will execute after 1 minute delay."
echo "Check the server logs for any errors during content generation."
