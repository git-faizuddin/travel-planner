from sqlalchemy import Column, String, JSON, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Hotel(Base):
    """Hotel model to store booking.com API response data"""
    __tablename__ = "hotels"
    
    hotel_id = Column(String, primary_key=True, index=True, nullable=False)
    booking_data = Column(JSON, nullable=False)  # Full booking.com API response as JSON
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<Hotel(hotel_id={self.hotel_id}, name={self.booking_data.get('name', 'Unknown') if isinstance(self.booking_data, dict) else 'N/A'})>"

