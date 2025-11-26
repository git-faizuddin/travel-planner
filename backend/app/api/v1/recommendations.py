"""
API endpoints for hotel recommendations
"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.recommendation import (
    RecommendationRequest,
    RecommendationResponse,
    SearchParameters
)
from app.services.chatgpt_service import ChatGPTService
from app.services.booking_service import BookingService
from app.database import get_db
from app.crud import hotel as hotel_crud
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

router = APIRouter()


def get_chatgpt_service() -> ChatGPTService:
    """Dependency to get ChatGPT service instance"""
    return ChatGPTService()


def get_booking_service() -> BookingService:
    """Dependency to get Booking.com service instance"""
    return BookingService()


@router.post("/recommend", response_model=RecommendationResponse)
async def recommend_hotels(
    request: RecommendationRequest,
    db: Session = Depends(get_db),
    chatgpt_service: ChatGPTService = Depends(get_chatgpt_service),
    booking_service: BookingService = Depends(get_booking_service)
):
    """
    Get hotel recommendations based on user's natural language demand
    
    Workflow:
    1. Receive user demand sentence
    2. Send to ChatGPT to extract search parameters (location, dates, budget, etc.)
    3. Call Booking.com API with extracted parameters
    4. Send Booking.com results to ChatGPT to filter/match hotels with user demand
    5. Return filtered and ranked hotel recommendations
    """
    try:
        # Step 1: Extract search parameters using ChatGPT
        logger.info(f"=== NEW REQUEST === Extracting parameters from user demand: {request.user_demand}")
        extracted_params = chatgpt_service.extract_search_parameters(request.user_demand)
        
        # Convert to SearchParameters schema
        search_params = SearchParameters(
            location=extracted_params.location,
            check_in=extracted_params.check_in,
            check_out=extracted_params.check_out,
            budget_min=extracted_params.budget_min,
            budget_max=extracted_params.budget_max,
            adults=extracted_params.adults or 1,
            children=extracted_params.children or 0,
            rooms=extracted_params.rooms or 1,
            preferences=extracted_params.preferences or []
        )
        
        logger.info(f"Extracted parameters: {search_params.model_dump()}")
        
        # Step 2: Search hotels using Booking.com API
        logger.info("Searching hotels via Booking.com API...")
        hotels = booking_service.search_hotels(search_params)
        
        if not hotels:
            return RecommendationResponse(
                user_demand=request.user_demand,
                extracted_parameters=search_params,
                matched_hotels=[],
                total_results=0,
                message="No hotels found matching your criteria."
            )
        
        logger.info(f"Found {len(hotels)} hotels from Booking.com API")
        
        # Step 2.5: Save hotels to database (store full booking.com API response)
        logger.info("Saving hotels to database...")
        try:
            hotel_crud.bulk_create_or_update_hotels(db, hotels)
            logger.info(f"Saved {len(hotels)} hotels to database")
        except Exception as e:
            logger.warning(f"Failed to save hotels to database: {e}. Continuing with in-memory data.")
        
        # Step 3: Filter hotels using ChatGPT based on user demand (returns only IDs)
        logger.info("Filtering hotels using ChatGPT...")
        matched_hotel_ids = chatgpt_service.filter_hotels_by_demand(
            user_demand=request.user_demand,
            hotels=hotels
        )
        
        logger.info(f"ChatGPT matched {len(matched_hotel_ids)} hotel IDs: {matched_hotel_ids}")
        
        # Step 4: Map hotel IDs back to full hotel data
        # Prioritize fresh API data over database (to avoid stale cached data)
        matched_hotels = []
        from app.schemas.recommendation import HotelInfo
        
        # Create lookup from in-memory data (fresh from API - this is the source of truth)
        hotels_by_id = {str(h.get("hotel_id", "")): h for h in hotels if h.get("hotel_id")}
        
        for hotel_id in matched_hotel_ids:
            hotel_data = None
            
            # Use fresh API data first (most up-to-date)
            if hotel_id in hotels_by_id:
                hotel_data = hotels_by_id[hotel_id]
                logger.debug(f"Using fresh API data for hotel {hotel_id}")
            else:
                # Fallback to database only if not in fresh API results
                try:
                    db_hotel = hotel_crud.get_hotel(db, hotel_id)
                    if db_hotel and db_hotel.booking_data:
                        hotel_data = db_hotel.booking_data
                        logger.debug(f"Loaded hotel {hotel_id} from database (not in fresh results)")
                except Exception as e:
                    logger.debug(f"Could not load hotel {hotel_id} from database: {e}")
            
            if hotel_data:
                # Create HotelInfo with full raw_data containing complete booking.com response
                hotel_info = HotelInfo(
                    hotel_id=str(hotel_data.get("hotel_id", "")),
                    name=hotel_data.get("name"),
                    address=hotel_data.get("address"),
                    city=hotel_data.get("city"),
                    country=hotel_data.get("country"),
                    latitude=hotel_data.get("latitude"),
                    longitude=hotel_data.get("longitude"),
                    price=hotel_data.get("price"),
                    currency=hotel_data.get("currency", "EUR"),
                    rating=hotel_data.get("rating"),
                    review_score=hotel_data.get("review_score"),
                    review_count=hotel_data.get("review_count"),
                    amenities=hotel_data.get("amenities", []),
                    description=hotel_data.get("description"),
                    images=hotel_data.get("images", []),
                    url=hotel_data.get("url"),
                    raw_data=hotel_data  # Full booking.com API response as JSON
                )
                matched_hotels.append(hotel_info)
        
        logger.info(f"Filtered to {len(matched_hotels)} matching hotels")
        
        return RecommendationResponse(
            user_demand=request.user_demand,
            extracted_parameters=search_params,
            matched_hotels=matched_hotels,
            total_results=len(matched_hotels),
            message=f"Found {len(matched_hotels)} hotels matching your preferences."
        )
        
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Service configuration error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Error processing recommendation request: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing recommendation: {str(e)}"
        )


@router.get("/health")
async def health_check():
    """Health check endpoint for recommendations service"""
    return {"status": "healthy", "service": "recommendations"}

