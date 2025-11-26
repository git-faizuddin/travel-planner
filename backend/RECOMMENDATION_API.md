# Hotel Recommendation AI Engine

## Overview

The AI recommendation engine uses ChatGPT to understand user demands and filter hotel results from Booking.com API. The workflow follows these steps:

1. **User Input**: Frontend sends natural language demand to backend
2. **Parameter Extraction**: ChatGPT analyzes the demand and extracts search parameters (location, dates, budget, preferences)
3. **Hotel Search**: Backend calls Booking.com API with extracted parameters
4. **Result Filtering**: ChatGPT filters and ranks hotels based on user demand
5. **Response**: Backend returns matched hotels sorted by relevance

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

This will install the OpenAI SDK along with other dependencies.

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini  # Options: gpt-4o-mini, gpt-4, gpt-3.5-turbo

# Booking.com API Configuration
BOOKING_API_KEY=your_booking_api_key_here
BOOKING_API_URL=https://distribution-xml.booking.com/json

# Other existing settings...
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Note**: 
- Get your OpenAI API key from: https://platform.openai.com/api-keys
- Get your Booking.com API credentials from: Booking.com Affiliate Partner Portal
- If `BOOKING_API_KEY` is not set, the service will return mock data for testing
- If `OPENAI_API_KEY` is not set, the API will return an error when called

## API Endpoint

### POST `/api/v1/recommendations/recommend`

Get hotel recommendations based on natural language demand.

**Request Body:**
```json
{
  "user_demand": "romantic getaway near lakes in Italy under 200€"
}
```

**Response:**
```json
{
  "user_demand": "romantic getaway near lakes in Italy under 200€",
  "extracted_parameters": {
    "location": "Italy",
    "check_in": null,
    "check_out": null,
    "budget_min": null,
    "budget_max": 200.0,
    "adults": 1,
    "children": 0,
    "rooms": 1,
    "preferences": ["romantic", "near lakes"]
  },
  "matched_hotels": [
    {
      "hotel_id": "1",
      "name": "Grand Hotel Lake Como",
      "address": "123 Main Street, Lake Como",
      "city": "Lake Como",
      "country": "Italy",
      "price": 150.0,
      "currency": "EUR",
      "rating": 4.5,
      "review_score": 8.5,
      "amenities": ["WiFi", "Pool", "Spa"],
      "description": "Beautiful hotel...",
      "url": "https://booking.com/hotel/1"
    }
  ],
  "total_results": 1,
  "message": "Found 1 hotels matching your preferences."
}
```

## Example Usage

### Using curl

```bash
curl -X POST "http://localhost:8000/api/v1/recommendations/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "user_demand": "luxury hotel in Paris for 2 nights next week, budget 300€"
  }'
```

### Using Python

```python
import requests

response = requests.post(
    "http://localhost:8000/api/v1/recommendations/recommend",
    json={
        "user_demand": "family-friendly hotel near beach in Spain, under 150€ per night"
    }
)

data = response.json()
print(f"Found {data['total_results']} hotels")
for hotel in data['matched_hotels']:
    print(f"- {hotel['name']}: {hotel['price']} {hotel['currency']}")
```

### Using JavaScript/Fetch

```javascript
const response = await fetch('http://localhost:8000/api/v1/recommendations/recommend', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user_demand: 'romantic getaway near lakes in Italy under 200€'
  })
});

const data = await response.json();
console.log(`Found ${data.total_results} hotels`);
data.matched_hotels.forEach(hotel => {
  console.log(`- ${hotel.name}: ${hotel.price} ${hotel.currency}`);
});
```

## How It Works

### Step 1: Parameter Extraction

ChatGPT receives a prompt like:
```
Please extract the exact search parameters from: "romantic getaway near lakes in Italy under 200€"
```

ChatGPT returns structured JSON with:
- Location: "Italy"
- Budget: max 200€
- Preferences: ["romantic", "near lakes"]

### Step 2: Hotel Search

The backend calls Booking.com API with the extracted parameters:
- Location: Italy
- Price max: 200
- Other filters as applicable

### Step 3: Result Filtering

ChatGPT receives:
- Original user demand
- List of hotels from Booking.com

ChatGPT analyzes and returns indices of hotels that match, ordered by relevance.

## Architecture

```
Frontend (Chat Panel)
    ↓
Backend API Endpoint (/api/v1/recommendations/recommend)
    ↓
ChatGPT Service (extract_search_parameters)
    ↓
Booking Service (search_hotels)
    ↓
ChatGPT Service (filter_hotels_by_demand)
    ↓
Response to Frontend
```

## Files Created

- `app/schemas/recommendation.py` - Pydantic schemas for request/response
- `app/services/chatgpt_service.py` - ChatGPT integration service
- `app/services/booking_service.py` - Booking.com API integration
- `app/api/v1/recommendations.py` - API endpoint

## Testing

1. Start the backend server:
```bash
uvicorn app.main:app --reload --port 8000
```

2. Visit the API docs: http://localhost:8000/docs

3. Test the endpoint using the Swagger UI or curl

## Notes

- The Booking.com API integration is a placeholder structure. You'll need to adjust it based on Booking.com's actual API documentation and authentication method.
- The service includes mock data fallback when Booking.com API key is not configured.
- ChatGPT responses are parsed with error handling and fallbacks.
- All dates should be in YYYY-MM-DD format.
- Budget values are in the currency mentioned (defaults to EUR if not specified).

