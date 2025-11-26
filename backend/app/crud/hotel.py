from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from app.models.hotel import Hotel


def get_hotel(db: Session, hotel_id: str) -> Optional[Hotel]:
    """Get a single hotel by hotel_id"""
    return db.query(Hotel).filter(Hotel.hotel_id == hotel_id).first()


def get_hotels_by_ids(db: Session, hotel_ids: List[str]) -> List[Hotel]:
    """Get multiple hotels by their IDs"""
    return db.query(Hotel).filter(Hotel.hotel_id.in_(hotel_ids)).all()


def create_or_update_hotel(
    db: Session,
    hotel_id: str,
    booking_data: Dict[str, Any]
) -> Hotel:
    """
    Create or update a hotel with booking.com API response data.
    Uses upsert pattern - updates if exists, creates if not.
    """
    db_hotel = get_hotel(db, hotel_id)
    
    if db_hotel:
        # Update existing hotel
        db_hotel.booking_data = booking_data
    else:
        # Create new hotel
        db_hotel = Hotel(
            hotel_id=hotel_id,
            booking_data=booking_data
        )
        db.add(db_hotel)
    
    db.commit()
    db.refresh(db_hotel)
    return db_hotel


def bulk_create_or_update_hotels(
    db: Session,
    hotels_data: List[Dict[str, Any]]
) -> List[Hotel]:
    """
    Bulk create or update hotels from booking.com API response.
    Each hotel dict should have 'hotel_id' key.
    """
    saved_hotels = []
    
    for hotel_data in hotels_data:
        hotel_id = str(hotel_data.get("hotel_id", ""))
        if not hotel_id:
            continue  # Skip hotels without ID
        
        saved_hotel = create_or_update_hotel(db, hotel_id, hotel_data)
        saved_hotels.append(saved_hotel)
    
    return saved_hotels

