"""
Booking.com API service for fetching hotel data
"""
import logging
import hashlib
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import httpx
from app.config import settings
from app.schemas.recommendation import SearchParameters

logger = logging.getLogger(__name__)


class BookingService:
    """Service for interacting with Booking.com API"""
    
    def __init__(self):
        self.api_key = settings.booking_api_key
        self.base_url = settings.booking_api_url
        self.timeout = 30.0
    
    def search_hotels(self, parameters: SearchParameters) -> List[Dict[str, Any]]:
        """
        Search hotels using Booking.com API
        
        Args:
            parameters: SearchParameters object with search criteria
            
        Returns:
            List of hotel dictionaries from Booking.com API
        """
        if not self.api_key:
            logger.warning("Booking.com API key not configured. Returning mock data.")
            return self._get_mock_hotels(parameters)
        
        try:
            # Prepare API request parameters
            params = self._prepare_search_params(parameters)
            
            # Make API request
            # Note: This is a placeholder - actual Booking.com API endpoints may vary
            # You'll need to adjust based on Booking.com's actual API documentation
            with httpx.Client(timeout=self.timeout) as client:
                headers = {
                    "Accept": "application/json",
                    "Authorization": f"Bearer {self.api_key}"  # Adjust based on actual auth method
                }
                
                # Example endpoint - adjust based on actual Booking.com API
                response = client.get(
                    f"{self.base_url}/hotels",
                    headers=headers,
                    params=params
                )
                response.raise_for_status()
                
                data = response.json()
                hotels = data.get("result", [])
                logger.info(f"Found {len(hotels)} hotels from Booking.com API")
                return hotels
                
        except httpx.HTTPError as e:
            logger.error(f"Error calling Booking.com API: {e}")
            # Fallback to mock data on error
            return self._get_mock_hotels(parameters)
        except Exception as e:
            logger.error(f"Unexpected error in Booking.com API call: {e}")
            return self._get_mock_hotels(parameters)
    
    def _prepare_search_params(self, parameters: SearchParameters) -> Dict[str, Any]:
        """Prepare search parameters for Booking.com API"""
        params = {}
        
        if parameters.location:
            params["location"] = parameters.location
        
        if parameters.check_in:
            params["checkin_date"] = parameters.check_in
        
        if parameters.check_out:
            params["checkout_date"] = parameters.check_out
        
        if parameters.adults:
            params["adults"] = parameters.adults
        
        if parameters.children:
            params["children"] = parameters.children
        
        if parameters.rooms:
            params["rooms"] = parameters.rooms
        
        if parameters.budget_min:
            params["price_min"] = parameters.budget_min
        
        if parameters.budget_max:
            params["price_max"] = parameters.budget_max
        
        return params
    
    def _get_mock_hotels(self, parameters: SearchParameters) -> List[Dict[str, Any]]:
        """
        Return comprehensive mock hotel data that simulates booking.com API response
        Hotels vary based on location, budget, and preferences
        """
        location = parameters.location or "Paris"
        location_lower = location.lower()
        
        # Determine location coordinates based on city
        location_coords = self._get_location_coordinates(location_lower)
        
        # Generate unique hotel IDs based on query to avoid caching issues
        query_hash = hashlib.md5(
            f"{location}_{parameters.budget_min}_{parameters.budget_max}_{parameters.preferences}".encode()
        ).hexdigest()[:8]
        
        # Get all available mock hotels for this location
        all_hotels = self._generate_mock_hotel_database(location, location_coords, query_hash)
        
        # Filter hotels based on search parameters
        filtered_hotels = self._filter_mock_hotels(all_hotels, parameters)
        
        logger.info(f"Returning {len(filtered_hotels)} mock hotels for location: {location}")
        return filtered_hotels
    
    def _get_location_coordinates(self, location: str) -> Dict[str, float]:
        """Get coordinates for common locations"""
        location_map = {
            "paris": {"lat": 48.8566, "lng": 2.3522},
            "rome": {"lat": 41.9028, "lng": 12.4964},
            "london": {"lat": 51.5074, "lng": -0.1278},
            "barcelona": {"lat": 41.3851, "lng": 2.1734},
            "amsterdam": {"lat": 52.3676, "lng": 4.9041},
            "berlin": {"lat": 52.5200, "lng": 13.4050},
            "vienna": {"lat": 48.2082, "lng": 16.3738},
            "prague": {"lat": 50.0755, "lng": 14.4378},
            "madrid": {"lat": 40.4168, "lng": -3.7038},
            "milan": {"lat": 45.4642, "lng": 9.1900},
            "venice": {"lat": 45.4408, "lng": 12.3155},
            "florence": {"lat": 43.7696, "lng": 11.2558},
            "italy": {"lat": 41.8719, "lng": 12.5674},
            "france": {"lat": 46.2276, "lng": 2.2137},
            "spain": {"lat": 40.4637, "lng": -3.7492},
        }
        
        # Try to find matching location
        for key, coords in location_map.items():
            if key in location:
                return coords
        
        # Default to Paris coordinates
        return {"lat": 48.8566, "lng": 2.3522}
    
    def _generate_mock_hotel_database(
        self, 
        location: str, 
        coords: Dict[str, float],
        query_hash: str
    ) -> List[Dict[str, Any]]:
        """Generate a comprehensive database of mock hotels"""
        base_lat = coords["lat"]
        base_lng = coords["lng"]
        
        # Add small deterministic variations to coordinates for different hotels
        # Use hash of location to create consistent but varied offsets
        location_hash = hash(location) % 10000
        
        def get_coord_offset(index: int, coord_type: str) -> float:
            """Get deterministic coordinate offset for hotel"""
            multiplier = 100 if coord_type == "lat" else 200
            return ((location_hash + index * multiplier) % 200 - 100) / 10000.0
        
        hotels = [
            {
                "hotel_id": f"{query_hash}_luxury_1",
                "name": f"Grand Palace Hotel {location}",
                "address": f"1 Champs-Élysées, {location}",
                "city": location,
                "country": self._get_country_from_location(location),
                "latitude": base_lat + get_coord_offset(0, "lat"),
                "longitude": base_lng + get_coord_offset(0, "lng"),
                "price": 350.0,
                "currency": "EUR",
                "rating": 4.9,
                "review_score": 9.5,
                "review_count": 2340,
                "amenities": ["WiFi", "Pool", "Spa", "Fitness Center", "Restaurant", "Bar", "Room Service", "Concierge", "Valet Parking", "Business Center"],
                "description": f"Luxurious 5-star hotel in the heart of {location}. Features elegant rooms, world-class spa, fine dining, and exceptional service. Perfect for business travelers and romantic getaways.",
                "images": [
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop"
                ],
                "url": f"https://booking.com/hotel/{query_hash}_luxury_1"
            },
            {
                "hotel_id": f"{query_hash}_resort_1",
                "name": f"Seaside Luxury Resort {location}",
                "address": f"Beach Boulevard, {location}",
                "city": location,
                "country": self._get_country_from_location(location),
                "latitude": base_lat + get_coord_offset(1, "lat"),
                "longitude": base_lng + get_coord_offset(1, "lng"),
                "price": 280.0,
                "currency": "EUR",
                "rating": 4.7,
                "review_score": 9.1,
                "review_count": 1890,
                "amenities": ["WiFi", "Pool", "Spa", "Beach Access", "Restaurant", "Bar", "Water Sports", "Kids Club", "Beach Bar", "Tennis Court"],
                "description": f"Stunning beachfront resort in {location} with direct beach access. Features infinity pool, spa, multiple restaurants, and water sports. Ideal for families and couples seeking relaxation.",
                "images": [
                    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop"
                ],
                "url": f"https://booking.com/hotel/{query_hash}_resort_1"
            },
            {
                "hotel_id": f"{query_hash}_boutique_1",
                "name": f"Romantic Boutique Hotel {location}",
                "address": f"Rue de la Romance, {location}",
                "city": location,
                "country": self._get_country_from_location(location),
                "latitude": base_lat + get_coord_offset(2, "lat"),
                "longitude": base_lng + get_coord_offset(2, "lng"),
                "price": 180.0,
                "currency": "EUR",
                "rating": 4.6,
                "review_score": 8.9,
                "review_count": 1450,
                "amenities": ["WiFi", "Spa", "Restaurant", "Bar", "Romantic Packages", "Couples Massage", "Rooftop Terrace", "Wine Bar"],
                "description": f"Charming boutique hotel in {location} perfect for romantic getaways. Intimate atmosphere, beautifully designed rooms, spa services, and fine dining. Highly rated by couples.",
                "images": [
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop"
                ],
                "url": f"https://booking.com/hotel/{query_hash}_boutique_1"
            },
            {
                "hotel_id": f"{query_hash}_business_1",
                "name": f"Business Center Hotel {location}",
                "address": f"Financial District, {location}",
                "city": location,
                "country": self._get_country_from_location(location),
                "latitude": base_lat + get_coord_offset(3, "lat"),
                "longitude": base_lng + get_coord_offset(3, "lng"),
                "price": 220.0,
                "currency": "EUR",
                "rating": 4.4,
                "review_score": 8.6,
                "review_count": 2100,
                "amenities": ["WiFi", "Business Center", "Meeting Rooms", "Fitness Center", "Restaurant", "Bar", "Airport Shuttle", "Concierge", "Laundry Service"],
                "description": f"Modern business hotel in {location}'s financial district. Well-equipped meeting facilities, high-speed WiFi, fitness center, and convenient location for corporate travelers.",
                "images": [
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop"
                ],
                "url": f"https://booking.com/hotel/{query_hash}_business_1"
            },
            {
                "hotel_id": f"{query_hash}_family_1",
                "name": f"Family Resort {location}",
                "address": f"Family Street, {location}",
                "city": location,
                "country": self._get_country_from_location(location),
                "latitude": base_lat + get_coord_offset(4, "lat"),
                "longitude": base_lng + get_coord_offset(4, "lng"),
                "price": 160.0,
                "currency": "EUR",
                "rating": 4.5,
                "review_score": 8.7,
                "review_count": 3200,
                "amenities": ["WiFi", "Pool", "Kids Club", "Playground", "Family Rooms", "Restaurant", "Bar", "Entertainment", "Game Room", "Babysitting"],
                "description": f"Family-friendly resort in {location} with extensive facilities for children. Large pool, kids club, playground, family rooms, and entertainment. Perfect for families with children.",
                "images": [
                    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop"
                ],
                "url": f"https://booking.com/hotel/{query_hash}_family_1"
            },
            {
                "hotel_id": f"{query_hash}_mid_1",
                "name": f"Comfort Inn {location}",
                "address": f"Main Avenue, {location}",
                "city": location,
                "country": self._get_country_from_location(location),
                "latitude": base_lat + get_coord_offset(3, "lat"),
                "longitude": base_lng + get_coord_offset(3, "lng"),
                "price": 120.0,
                "currency": "EUR",
                "rating": 4.2,
                "review_score": 8.3,
                "review_count": 1850,
                "amenities": ["WiFi", "Pool", "Restaurant", "Bar", "Parking", "Fitness Center"],
                "description": f"Comfortable mid-range hotel in {location} with good value. Clean rooms, pool, restaurant, and convenient location. Great for travelers seeking comfort without luxury prices.",
                "images": [
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop"
                ],
                "url": f"https://booking.com/hotel/{query_hash}_mid_1"
            },
            {
                "hotel_id": f"{query_hash}_spa_1",
                "name": f"Wellness Spa Hotel {location}",
                "address": f"Relaxation Road, {location}",
                "city": location,
                "country": self._get_country_from_location(location),
                "latitude": base_lat + get_coord_offset(2, "lat"),
                "longitude": base_lng + get_coord_offset(2, "lng"),
                "price": 200.0,
                "currency": "EUR",
                "rating": 4.6,
                "review_score": 8.8,
                "review_count": 1650,
                "amenities": ["WiFi", "Spa", "Wellness Center", "Massage", "Sauna", "Steam Room", "Yoga Classes", "Restaurant", "Bar", "Pool"],
                "description": f"Dedicated wellness and spa hotel in {location}. Extensive spa facilities, massage services, sauna, steam room, yoga classes, and healthy dining options. Perfect for relaxation and rejuvenation.",
                "images": [
                    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop"
                ],
                "url": f"https://booking.com/hotel/{query_hash}_spa_1"
            },
            {
                "hotel_id": f"{query_hash}_budget_1",
                "name": f"Budget Inn {location}",
                "address": f"Economy Street, {location}",
                "city": location,
                "country": self._get_country_from_location(location),
                "latitude": base_lat + get_coord_offset(7, "lat"),
                "longitude": base_lng + get_coord_offset(7, "lng"),
                "price": 65.0,
                "currency": "EUR",
                "rating": 3.8,
                "review_score": 7.6,
                "review_count": 2800,
                "amenities": ["WiFi", "Parking", "24-Hour Reception"],
                "description": f"Affordable budget accommodation in {location}. Basic but clean rooms, free WiFi, parking available. Great value for money-conscious travelers.",
                "images": [
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop"
                ],
                "url": f"https://booking.com/hotel/{query_hash}_budget_1"
            },
            {
                "hotel_id": f"{query_hash}_historic_1",
                "name": f"Historic Grand Hotel {location}",
                "address": f"Historic Square, {location}",
                "city": location,
                "country": self._get_country_from_location(location),
                "latitude": base_lat + get_coord_offset(3, "lat"),
                "longitude": base_lng + get_coord_offset(3, "lng"),
                "price": 240.0,
                "currency": "EUR",
                "rating": 4.7,
                "review_score": 9.0,
                "review_count": 1950,
                "amenities": ["WiFi", "Historic Building", "Restaurant", "Bar", "Concierge", "Room Service", "Fitness Center"],
                "description": f"Beautifully restored historic hotel in the center of {location}. Combines classic architecture with modern amenities. Elegant rooms, fine dining, and rich history.",
                "images": [
                    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop"
                ],
                "url": f"https://booking.com/hotel/{query_hash}_historic_1"
            },
            {
                "hotel_id": f"{query_hash}_eco_1",
                "name": f"Eco-Friendly Hotel {location}",
                "address": f"Green Boulevard, {location}",
                "city": location,
                "country": self._get_country_from_location(location),
                "latitude": base_lat + get_coord_offset(2, "lat"),
                "longitude": base_lng + get_coord_offset(2, "lng"),
                "price": 140.0,
                "currency": "EUR",
                "rating": 4.4,
                "review_score": 8.5,
                "review_count": 1200,
                "amenities": ["WiFi", "Eco-Friendly", "Organic Restaurant", "Bike Rental", "Solar Power", "Recycling", "Garden"],
                "description": f"Environmentally conscious hotel in {location}. Sustainable practices, organic restaurant, bike rental, solar power. Perfect for eco-conscious travelers.",
                "images": [
                    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop",
                    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop"
                ],
                "url": f"https://booking.com/hotel/{query_hash}_eco_1"
            }
        ]
        
        return hotels
    
    def _get_country_from_location(self, location: str) -> str:
        """Determine country from location name"""
        location_lower = location.lower()
        if any(c in location_lower for c in ["paris", "lyon", "nice", "marseille", "france"]):
            return "France"
        elif any(c in location_lower for c in ["rome", "milan", "venice", "florence", "italy", "naples"]):
            return "Italy"
        elif any(c in location_lower for c in ["london", "manchester", "edinburgh", "uk", "england"]):
            return "United Kingdom"
        elif any(c in location_lower for c in ["barcelona", "madrid", "seville", "spain"]):
            return "Spain"
        elif any(c in location_lower for c in ["berlin", "munich", "frankfurt", "germany"]):
            return "Germany"
        elif any(c in location_lower for c in ["amsterdam", "netherlands", "holland"]):
            return "Netherlands"
        elif any(c in location_lower for c in ["vienna", "austria"]):
            return "Austria"
        elif any(c in location_lower for c in ["prague", "czech"]):
            return "Czech Republic"
        else:
            return "France"  # Default
    
    def _filter_mock_hotels(
        self, 
        hotels: List[Dict[str, Any]], 
        parameters: SearchParameters
    ) -> List[Dict[str, Any]]:
        """Filter hotels based on search parameters"""
        filtered = hotels.copy()
        
        # Filter by budget
        if parameters.budget_max:
            filtered = [h for h in filtered if h.get("price", 0) <= parameters.budget_max]
        if parameters.budget_min:
            filtered = [h for h in filtered if h.get("price", 0) >= parameters.budget_min]
        
        # If preferences are specified, prioritize matching hotels
        if parameters.preferences:
            pref_lower = [p.lower() for p in parameters.preferences]
            
            # Score hotels based on preference matches
            scored_hotels = []
            for hotel in filtered:
                score = 0
                amenities_str = " ".join([a.lower() for a in hotel.get("amenities", [])])
                name_desc = f"{hotel.get('name', '')} {hotel.get('description', '')}".lower()
                
                if any("luxury" in p or "premium" in p for p in pref_lower):
                    if hotel.get("rating", 0) >= 4.5 or "luxury" in name_desc:
                        score += 10
                
                if any("budget" in p or "cheap" in p or "affordable" in p for p in pref_lower):
                    if hotel.get("price", 0) <= 100:
                        score += 10
                
                if any("romantic" in p or "couple" in p for p in pref_lower):
                    if "romantic" in name_desc or "boutique" in name_desc or "spa" in amenities_str:
                        score += 10
                
                if any("family" in p or "kids" in p for p in pref_lower):
                    if "family" in name_desc or "kids" in amenities_str:
                        score += 10
                
                if any("business" in p or "corporate" in p for p in pref_lower):
                    if "business" in name_desc or "business" in amenities_str:
                        score += 10
                
                if any("beach" in p or "seaside" in p for p in pref_lower):
                    if "beach" in name_desc or "beach" in amenities_str:
                        score += 10
                
                if any("pool" in p for p in pref_lower):
                    if "pool" in amenities_str:
                        score += 10
                
                if any("spa" in p or "wellness" in p for p in pref_lower):
                    if "spa" in amenities_str or "wellness" in amenities_str:
                        score += 10
                
                scored_hotels.append((score, hotel))
            
            # Sort by score and return top matches
            scored_hotels.sort(key=lambda x: x[0], reverse=True)
            filtered = [h for _, h in scored_hotels if _ > 0] or [h for _, h in scored_hotels]
        
        # Return 8-12 hotels (simulate realistic API response)
        return filtered[:12] if len(filtered) > 12 else filtered

