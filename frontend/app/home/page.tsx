'use client';

import { useState, useEffect, useCallback } from 'react';
import ChatPanel from '../components/ChatPanel';
import HotelCard from '../components/HotelCard';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  imageUrl: string;
}

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

// API endpoint for backend
// Supports both development (full URL) and production (relative path through nginx)
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (envUrl) {
    // If it starts with /, it's a relative path (production with nginx)
    // If it starts with http, it's a full URL (development)
    return envUrl;
  }
  // Default to development URL
  return 'http://localhost:8000/api/v1';
};

const API_BASE_URL = getApiBaseUrl();

export default function HomePage() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Blog state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogLoading, setBlogLoading] = useState(true);
  const [blogError, setBlogError] = useState<string | null>(null);
  
  // Blog pagination state
  const POSTS_PER_PAGE = 6;
  const [currentBlogPage, setCurrentBlogPage] = useState(1);
  const totalBlogPages = Math.ceil(blogPosts.length / POSTS_PER_PAGE);
  const showPagination = blogPosts.length > POSTS_PER_PAGE;
  
  // Calculate paginated blog posts
  const startIndex = (currentBlogPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const paginatedBlogPosts = blogPosts.slice(startIndex, endIndex);
  
  // Fetch blog posts from backend
  const fetchBlogPosts = useCallback(async () => {
    try {
      setBlogLoading(true);
      setBlogError(null);
      const response = await fetch(`${API_BASE_URL}/blogs?limit=100`);
      if (!response.ok) {
        throw new Error('Failed to fetch blog posts');
      }
      const data = await response.json();
      // Handle both response formats: {posts: [...]} or [...]
      const posts = data.posts || data;
      // Convert image_url to imageUrl for frontend compatibility
      const formattedPosts = posts.map((post: any) => ({
        ...post,
        imageUrl: post.image_url || post.imageUrl,
      }));
      setBlogPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setBlogError(error instanceof Error ? error.message : 'Failed to load blog posts');
    } finally {
      setBlogLoading(false);
    }
  }, []);

  // Initial fetch and auto-refresh
  useEffect(() => {
    // Initial fetch
    fetchBlogPosts();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchBlogPosts();
    }, 30000); // 30 seconds
    
    // Refresh when page becomes visible (user switches back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchBlogPosts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchBlogPosts]);
  
  const handleBlogPageChange = (page: number) => {
    setCurrentBlogPage(page);
    // Scroll to blog section when page changes
    const blogSection = document.getElementById('blog-section');
    if (blogSection) {
      blogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 
              className="text-4xl md:text-5xl font-bold mb-4 transition-colors"
              style={{ color: 'var(--foreground)' }}
            >
              ⭐ TravelPlannerBro: Intelligent Accommodation Sourcing
            </h1>
            <p 
              className="text-lg mb-6 transition-colors"
              style={{ color: 'var(--card-text-secondary)' }}
            >
              Revolutionize your booking process with advanced AI
            </p>
          </div>

          {/* Introduction Section with Chat Panel */}
          <div 
            className="mb-8 p-6 md:p-8 rounded-lg"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
              borderWidth: '1px',
              borderStyle: 'solid'
            }}
          >
            <div className="max-w-3xl mx-auto space-y-6">
              <p 
                className="text-base leading-relaxed transition-colors"
                style={{ color: 'var(--card-text)' }}
              >
                Tired of exhaustive searching? TravelPlannerBro revolutionizes your booking process by using advanced AI to secure your perfect stay, effortlessly.
              </p>
              
              <p 
                className="text-base leading-relaxed transition-colors"
                style={{ color: 'var(--card-text)' }}
              >
                We believe the path to an exceptional trip shouldn't be complicated. Our platform transforms your planning phase from overwhelming research into rapid, precise decision-making.
              </p>
              
              <div className="mt-6">
                <h3 
                  className="text-xl font-semibold mb-3 transition-colors"
                  style={{ color: 'var(--foreground)' }}
                >
                  How It Works
                </h3>
                <p 
                  className="text-base leading-relaxed mb-4 transition-colors"
                  style={{ color: 'var(--card-text)' }}
                >
                  Transition from planning to booking in three simple steps:
                </p>
                <ol 
                  className="list-decimal list-inside space-y-3 ml-4 mb-4"
                  style={{ color: 'var(--card-text)' }}
                >
                  <li>
                    <strong>Define Your Needs:</strong> Submit your detailed criteria in plain language.
                  </li>
                  <li>
                    <strong>AI Analysis:</strong> Our intelligent "Bro" system instantaneously processes your request.
                  </li>
                  <li>
                    <strong>Secure Your Stay:</strong> Review the top recommendation and finalize your booking with confidence.
                  </li>
                </ol>
                <p 
                  className="text-base leading-relaxed mb-6 transition-colors"
                  style={{ color: 'var(--card-text)' }}
                >
                  Ready to experience the future of travel planning?
                </p>
              </div>

              {/* Chat Panel - Integrated */}
              <div className="mt-8 pt-6 border-t" style={{ borderColor: 'var(--card-border)' }}>
                <ChatPanel onSendMessage={handleSendMessage} isLoading={isLoading} />
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block">
                <svg className="animate-spin h-12 w-12" style={{ color: 'var(--secondary-blue)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
            <div className="mt-8">
              <h2 
                className="text-2xl font-bold mb-6 transition-colors"
                style={{ color: 'var(--foreground)' }}
              >
                Recommended Hotels
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {hotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} />
                ))}
              </div>
            </div>
          )}

          {/* No Results State */}
          {!isLoading && hasSearched && hotels.length === 0 && (
            <div className="text-center py-8">
              <p 
                className="text-lg transition-colors"
                style={{ color: 'var(--card-text-secondary)' }}
              >
                No hotels found. Try a different search query.
              </p>
            </div>
          )}

          {/* Blog Section - Always visible */}
          <div id="blog-section" className="mt-12">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-4">
                <h2 
                  className="text-3xl md:text-4xl font-bold transition-colors"
                  style={{ color: 'var(--foreground)' }}
                >
                  Hotel Travel Blog
                </h2>
                <button
                  onClick={fetchBlogPosts}
                  disabled={blogLoading}
                  className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  style={{
                    backgroundColor: blogLoading ? 'transparent' : 'var(--secondary-blue)',
                    color: blogLoading ? 'var(--card-text-secondary)' : '#ffffff',
                    border: blogLoading ? '1px solid var(--card-border)' : 'none'
                  }}
                  title="Refresh blog posts"
                >
                  {blogLoading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                </button>
              </div>
              <p 
                className="text-lg mb-8 transition-colors"
                style={{ color: 'var(--card-text-secondary)' }}
              >
                Expert tips, guides, and insights to help you find the perfect hotel for your next adventure
              </p>
            </div>

            {/* Blog Loading State */}
            {blogLoading && (
              <div className="text-center py-8">
                <div className="inline-block">
                  <svg className="animate-spin h-12 w-12" style={{ color: 'var(--secondary-blue)' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="mt-4 transition-colors" style={{ color: 'var(--card-text-secondary)' }}>
                  Loading blog posts...
                </p>
              </div>
            )}

            {/* Blog Error State */}
            {!blogLoading && blogError && (
              <div className="text-center py-8">
                <p className="text-lg text-red-500">{blogError}</p>
              </div>
            )}

            {/* Blog Posts Grid */}
            {!blogLoading && !blogError && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                {paginatedBlogPosts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl flex flex-col h-full"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                >
                  {/* Blog Image */}
                  <div className="relative h-48 w-full overflow-hidden flex-shrink-0">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        if (target.parentElement) {
                          target.parentElement.style.backgroundColor = 'var(--secondary-blue)';
                        }
                      }}
                    />
                  </div>

                  {/* Blog Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="mb-3 flex-shrink-0">
                      <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: 'var(--accent-teal)',
                          color: '#ffffff'
                        }}
                      >
                        {post.category}
                      </span>
                    </div>

                    <h3 
                      className="text-xl font-bold mb-2 transition-colors line-clamp-2 flex-shrink-0"
                      style={{ color: 'var(--card-text)' }}
                    >
                      {post.title}
                    </h3>

                    <p 
                      className="text-sm mb-4 transition-colors line-clamp-3 flex-grow"
                      style={{ color: 'var(--card-text-secondary)' }}
                    >
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs mb-4 flex-shrink-0">
                      <span style={{ color: 'var(--card-text-secondary)' }}>
                        {post.author}
                      </span>
                      <span style={{ color: 'var(--card-text-secondary)' }}>
                        {formatDate(post.date)}
                      </span>
                    </div>

                    <button
                      className="w-full py-2 rounded-lg font-medium transition-all hover:scale-105 flex-shrink-0"
                      style={{
                        backgroundColor: 'var(--secondary-blue)',
                        color: '#ffffff'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--button-hover)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--secondary-blue)';
                      }}
                    >
                      Read More
                    </button>
                  </div>
                </article>
                ))}
              </div>
            )}

            {/* No Blog Posts */}
            {!blogLoading && !blogError && blogPosts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-lg transition-colors" style={{ color: 'var(--card-text-secondary)' }}>
                  No blog posts available yet.
                </p>
              </div>
            )}

            {/* Pagination Controls */}
            {!blogLoading && !blogError && showPagination && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => handleBlogPageChange(currentBlogPage - 1)}
                  disabled={currentBlogPage === 1}
                  className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: currentBlogPage === 1 ? 'transparent' : 'var(--secondary-blue)',
                    color: currentBlogPage === 1 ? 'var(--card-text-secondary)' : '#ffffff',
                    border: currentBlogPage === 1 ? '1px solid var(--card-border)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (currentBlogPage !== 1) {
                      e.currentTarget.style.backgroundColor = 'var(--button-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentBlogPage !== 1) {
                      e.currentTarget.style.backgroundColor = 'var(--secondary-blue)';
                    }
                  }}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalBlogPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handleBlogPageChange(pageNum)}
                      className="w-10 h-10 rounded-lg font-medium transition-all"
                      style={{
                        backgroundColor: currentBlogPage === pageNum ? 'var(--secondary-blue)' : 'transparent',
                        color: currentBlogPage === pageNum ? '#ffffff' : 'var(--card-text)',
                        border: currentBlogPage === pageNum ? 'none' : '1px solid var(--card-border)'
                      }}
                      onMouseEnter={(e) => {
                        if (currentBlogPage !== pageNum) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (currentBlogPage !== pageNum) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {pageNum}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handleBlogPageChange(currentBlogPage + 1)}
                  disabled={currentBlogPage === totalBlogPages}
                  className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: currentBlogPage === totalBlogPages ? 'transparent' : 'var(--secondary-blue)',
                    color: currentBlogPage === totalBlogPages ? 'var(--card-text-secondary)' : '#ffffff',
                    border: currentBlogPage === totalBlogPages ? '1px solid var(--card-border)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (currentBlogPage !== totalBlogPages) {
                      e.currentTarget.style.backgroundColor = 'var(--button-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentBlogPage !== totalBlogPages) {
                      e.currentTarget.style.backgroundColor = 'var(--secondary-blue)';
                    }
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Traveltalk Plugin Section */}
          <div className="mt-12 mb-8">
            <div 
              className="p-4 md:p-6 rounded-lg text-center"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--card-border)',
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
            >
              <h2 
                className="text-base md:text-xl lg:text-2xl font-bold mb-3 transition-colors"
                style={{ color: 'var(--foreground)' }}
              >
                Integrate Travelplannerbro Chat on Your Site
              </h2>
              <div 
                className=" mx-auto text-base text-left md:text-lg leading-relaxed transition-colors"
                style={{ color: 'var(--card-text)' }}
              >
                <p>
                  Travel sites and travel blogs can integrate a Travelplannerbro chat as a "plugin" on their own websites.
                
                  Adding the Travelplannerbro plugin to your site or blog requires just one line of code - and it is free.
                
                  Do you own a travel site and want to try it?{' '}
                  <a
                    href="mailto:contact@traveltalk.com?subject=Traveltalk Plugin Integration Inquiry"
                    className="font-semibold underline transition-colors hover:opacity-80"
                    style={{ color: 'var(--secondary-blue)' }}
                  >
                    Send us an email via this link!
                  </a>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

