from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class RecommendationRequest(BaseModel):
    """Request schema for hotel recommendation"""
    user_demand: str = Field(..., description="User's natural language demand for hotel search")
    

class SearchParameters(BaseModel):
    """Extracted search parameters from user demand"""
    location: Optional[str] = Field(None, description="Destination/location name")
    check_in: Optional[str] = Field(None, description="Check-in date (YYYY-MM-DD)")
    check_out: Optional[str] = Field(None, description="Check-out date (YYYY-MM-DD)")
    budget_min: Optional[float] = Field(None, description="Minimum budget per night")
    budget_max: Optional[float] = Field(None, description="Maximum budget per night")
    adults: Optional[int] = Field(1, description="Number of adults")
    children: Optional[int] = Field(0, description="Number of children")
    rooms: Optional[int] = Field(1, description="Number of rooms")
    preferences: Optional[List[str]] = Field(default_factory=list, description="Additional preferences (e.g., 'romantic', 'near beach', 'luxury')")
    

class HotelInfo(BaseModel):
    """Hotel information from Booking.com API"""
    hotel_id: Optional[str] = None
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    rating: Optional[float] = None
    review_score: Optional[float] = None
    review_count: Optional[int] = None
    amenities: Optional[List[str]] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    url: Optional[str] = None
    raw_data: Optional[Dict[str, Any]] = None  # Store raw API response


class RecommendationResponse(BaseModel):
    """Response schema for hotel recommendations"""
    user_demand: str
    extracted_parameters: SearchParameters
    matched_hotels: List[HotelInfo] = Field(default_factory=list)
    total_results: int = 0
    message: Optional[str] = None
    

class ChatGPTParameterExtractionResponse(BaseModel):
    """Response from ChatGPT for parameter extraction"""
    location: Optional[str] = None
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    budget_min: Optional[float] = None
    budget_max: Optional[float] = None
    adults: Optional[int] = 1
    children: Optional[int] = 0
    rooms: Optional[int] = 1
    preferences: Optional[List[str]] = None

