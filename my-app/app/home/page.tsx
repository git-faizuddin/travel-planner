'use client';

import { useState } from 'react';
import ChatPanel from '../components/ChatPanel';
import HotelCard from '../components/HotelCard';

interface Hotel {
  id: string;
  name: string;
  description: string;
  location: {
    address: string;
    city: string;
    country: string;
    lat: number;
    lng: number;
  };
  imageUrl: string;
  price?: string;
  rating?: number;
}

// Mock hotel data generator - In a real app, this would call an API
const generateMockHotels = (query: string): Hotel[] => {
  // This is a simplified mock - in production, you'd call an AI service or API
  const mockHotels: Hotel[] = [
    {
      id: '1',
      name: 'Grand Plaza Hotel',
      description: 'A luxurious hotel located in the heart of the city, offering world-class amenities, elegant rooms, and exceptional service. Perfect for both business and leisure travelers.',
      location: {
        address: '123 Main Street',
        city: 'Paris',
        country: 'France',
        lat: 48.8566,
        lng: 2.3522
      },
      imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      price: '$250/night',
      rating: 4.8
    },
    {
      id: '2',
      name: 'Oceanview Resort',
      description: 'Beautiful beachfront resort with stunning ocean views, infinity pool, spa facilities, and direct beach access. Ideal for a relaxing vacation.',
      location: {
        address: '456 Beach Boulevard',
        city: 'Miami',
        country: 'USA',
        lat: 25.7617,
        lng: -80.1918
      },
      imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
      price: '$320/night',
      rating: 4.9
    },
    {
      id: '3',
      name: 'City Center Business Hotel',
      description: 'Modern business hotel in downtown area with conference facilities, high-speed internet, and convenient access to business districts and transportation.',
      location: {
        address: '789 Business Avenue',
        city: 'Tokyo',
        country: 'Japan',
        lat: 35.6762,
        lng: 139.6503
      },
      imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
      price: '$180/night',
      rating: 4.6
    },
    {
      id: '4',
      name: 'Mountain View Lodge',
      description: 'Cozy mountain lodge surrounded by nature, offering hiking trails, hot springs, and breathtaking mountain views. Perfect for nature enthusiasts.',
      location: {
        address: '321 Mountain Road',
        city: 'Switzerland',
        country: 'Switzerland',
        lat: 46.5197,
        lng: 6.6323
      },
      imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
      price: '$200/night',
      rating: 4.7
    }
  ];

  // Filter or return hotels based on query (simplified logic)
  // In a real app, this would be handled by an AI service
  return mockHotels.slice(0, 3); // Return 3 hotels for demo
};

export default function HomePage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSendMessage = async (message: string) => {
    setIsLoading(true);
    setHasSearched(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate mock hotel recommendations
    const recommendedHotels = generateMockHotels(message);
    setHotels(recommendedHotels);
    
    setIsLoading(false);
  };

  return (
    <div 
      className="min-h-screen transition-colors"
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 
              className="text-4xl md:text-5xl font-bold mb-4 transition-colors"
              style={{ color: 'var(--foreground)' }}
            >
              Hotel Recommendation AI
            </h1>
            <p 
              className="text-lg mb-8 transition-colors"
              style={{ color: 'var(--card-text-secondary)' }}
            >
              Describe your ideal hotel and let our AI find the perfect match for you
            </p>
          </div>

          {/* Chat Panel */}
          <div className="mb-12">
            <ChatPanel onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="inline-block">
                <svg className="animate-spin h-12 w-12" style={{ color: 'var(--foreground)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p 
                className="mt-4 transition-colors"
                style={{ color: 'var(--card-text-secondary)' }}
              >
                Finding the perfect hotels for you...
              </p>
            </div>
          )}

          {/* Hotel Results */}
          {!isLoading && hasSearched && hotels.length > 0 && (
            <div>
              <h2 
                className="text-2xl font-bold mb-6 transition-colors"
                style={{ color: 'var(--foreground)' }}
              >
                Recommended Hotels
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            </div>
          )}

          {/* No Results State */}
          {!isLoading && hasSearched && hotels.length === 0 && (
            <div className="text-center py-12">
              <p 
                className="text-lg transition-colors"
                style={{ color: 'var(--card-text-secondary)' }}
              >
                No hotels found. Try a different search query.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

