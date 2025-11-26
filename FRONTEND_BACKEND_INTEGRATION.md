# Frontend-Backend Integration Guide

## Overview

The frontend is now fully integrated with the backend recommendation API. Users can search for hotels using natural language, and the system will display real hotel data from the backend.

## Implementation Details

### 1. API Integration

**Endpoint:** `POST /api/v1/recommendations/recommend`

**Request:**
```json
{
  "user_demand": "romantic getaway in Italy under 200€"
}
```

**Response:**
```json
{
  "user_demand": "...",
  "extracted_parameters": {...},
  "matched_hotels": [
    {
      "hotel_id": "1",
      "name": "Grand Hotel",
      "address": "123 Main St",
      "city": "Italy",
      "country": "Italy",
      "latitude": 45.4642,
      "longitude": 9.1900,
      "price": 150.0,
      "currency": "EUR",
      "rating": 4.5,
      "description": "...",
      "images": ["https://..."],
      "url": "https://booking.com/..."
    }
  ],
  "total_results": 1,
  "message": "..."
}
```

### 2. Data Mapping

The frontend maps backend `HotelInfo` to frontend `Hotel` interface:

**Backend → Frontend Mapping:**
- `hotel_id` → `id`
- `name` → `name`
- `description` → `description`
- `address`, `city`, `country` → `location` object
- `latitude`, `longitude` → `location.lat`, `location.lng`
- `price` + `currency` → formatted `price` string (e.g., "€150.00/night")
- `rating` or `review_score` → `rating` (rounded to 1 decimal)
- `images[0]` → `imageUrl` (with fallback placeholder)

### 3. Features

✅ **Real-time API Calls**: Frontend calls backend API when user submits search  
✅ **Loading States**: Shows spinner while fetching data  
✅ **Error Handling**: Displays user-friendly error messages  
✅ **Data Validation**: Handles missing/null fields gracefully  
✅ **Image Fallbacks**: Uses placeholder if hotel image fails to load  
✅ **Currency Formatting**: Properly formats prices with currency symbols  
✅ **Map Integration**: Shows Google Maps embed for hotels with coordinates  

### 4. Error Handling

The frontend handles several error scenarios:

- **Network Errors**: Shows error message with "Try Again" button
- **API Errors**: Displays backend error messages
- **No Results**: Shows "No hotels found" message
- **Missing Data**: Uses fallback values for optional fields

### 5. User Flow

1. User types search query in ChatPanel
2. Frontend sends POST request to `/api/v1/recommendations/recommend`
3. Backend processes with ChatGPT (or fallback) and Booking.com API
4. Frontend receives response and maps data
5. HotelCard components display the results
6. User can see hotel details, prices, ratings, and maps

## Testing

### Manual Test

1. Start backend:
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

2. Start frontend:
```bash
cd frontend
npm run dev
```

3. Open browser: `http://localhost:3000`

4. Try these searches:
   - "romantic getaway in Italy under 200€"
   - "luxury hotel in Paris"
   - "family-friendly hotel near beach"

### Expected Behavior

- ✅ Search query is sent to backend
- ✅ Loading spinner appears
- ✅ Hotels are displayed in cards
- ✅ Each card shows: name, description, location, price, rating, map
- ✅ Error messages appear if API fails
- ✅ "Try Again" button works on errors

## File Changes

### Frontend Files Modified:

1. **`frontend/app/home/page.tsx`**:
   - Updated `handleSendMessage` to call real API
   - Added `mapBackendHotelToFrontend` function
   - Added `hotelError` state for error handling
   - Added error UI component

2. **`frontend/app/components/HotelCard.tsx`**:
   - Added conditional rendering for maps (only if coordinates exist)

## Environment Variables

Make sure `frontend/.env.local` has:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Troubleshooting

### Issue: "Failed to fetch"
- Check if backend is running on port 8000
- Verify CORS settings in backend
- Check browser console for detailed errors

### Issue: "No hotels found"
- This is normal if no hotels match the criteria
- Try a different search query
- Check backend logs for ChatGPT/API errors

### Issue: Images not loading
- Hotel images use fallback placeholder
- Check if `images` array is empty in backend response
- Verify image URLs are accessible

### Issue: Maps not showing
- Maps only show if hotel has valid latitude/longitude
- Check if `latitude` and `longitude` are not 0 in response

## Next Steps

Potential improvements:
- Add "Book Now" button linking to hotel URL
- Add filters (price range, rating, amenities)
- Add pagination for large result sets
- Cache recent searches
- Add favorites/bookmarks feature

