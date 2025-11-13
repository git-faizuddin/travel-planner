'use client';

import Link from 'next/link';

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

const BLOG_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Top 10 Luxury Hotels in Paris for Your Dream Vacation',
    excerpt: 'Discover the most luxurious accommodations in the City of Light, from historic palaces to modern boutique hotels.',
    content: 'Paris, the City of Light, offers some of the world\'s most luxurious hotel experiences. From the iconic Ritz Paris to modern boutique hotels, this guide covers the top 10 luxury hotels that combine elegance, exceptional service, and prime locations. Each hotel offers unique amenities, from Michelin-starred restaurants to world-class spas, ensuring an unforgettable stay in the French capital.',
    author: 'Sarah Johnson',
    date: '2024-01-15',
    category: 'Luxury Travel',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'
  },
  {
    id: '2',
    title: 'Budget-Friendly Beach Hotels: Your Guide to Affordable Coastal Stays',
    excerpt: 'Enjoy stunning ocean views without breaking the bank. Our curated list of budget-friendly beach hotels offers comfort and location.',
    content: 'Traveling to the beach doesn\'t have to be expensive. This comprehensive guide features budget-friendly hotels near popular beaches worldwide. We\'ve selected properties that offer great value, clean accommodations, and proximity to the water. From Southeast Asia to the Mediterranean, discover affordable options that don\'t compromise on the beach experience.',
    author: 'Michael Chen',
    date: '2024-01-10',
    category: 'Budget Travel',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop'
  },
  {
    id: '3',
    title: 'Family-Friendly Hotels: What to Look For When Traveling with Kids',
    excerpt: 'Planning a family vacation? Learn what amenities and features make a hotel truly family-friendly.',
    content: 'Traveling with children requires special considerations when choosing accommodations. This article outlines essential features of family-friendly hotels, including kid-friendly pools, connecting rooms, play areas, and dining options. We also provide tips on booking strategies, safety considerations, and how to ensure both parents and children have an enjoyable stay.',
    author: 'Emily Rodriguez',
    date: '2024-01-05',
    category: 'Family Travel',
    imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop'
  },
  {
    id: '4',
    title: 'Business Hotels: Maximizing Productivity on the Road',
    excerpt: 'Essential features every business traveler should look for in a hotel, from high-speed internet to meeting facilities.',
    content: 'Business travel demands specific hotel amenities to ensure productivity and comfort. This guide covers the must-have features for business hotels, including reliable Wi-Fi, work-friendly rooms, business centers, and convenient locations. We also discuss loyalty programs, expense management, and how to maintain work-life balance while traveling for business.',
    author: 'David Kim',
    date: '2023-12-28',
    category: 'Business Travel',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop'
  },
  {
    id: '5',
    title: 'Romantic Getaways: Hotels Perfect for Couples',
    excerpt: 'Create unforgettable memories with our selection of romantic hotels featuring stunning views and intimate settings.',
    content: 'Whether celebrating an anniversary, honeymoon, or just a romantic escape, choosing the right hotel sets the tone for your special time together. This article highlights hotels known for their romantic ambiance, from overwater bungalows to mountain retreats. We cover amenities like couples\' spas, private balconies, and fine dining experiences that make these properties perfect for romance.',
    author: 'Jessica Martinez',
    date: '2023-12-20',
    category: 'Romantic Travel',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop'
  },
  {
    id: '6',
    title: 'Pet-Friendly Hotels: Traveling with Your Furry Friends',
    excerpt: 'Don\'t leave your pets behind! Discover hotels that welcome your four-legged family members with open arms.',
    content: 'More hotels than ever are becoming pet-friendly, recognizing that pets are part of the family. This guide explores what makes a hotel truly pet-friendly, from pet amenities and policies to nearby parks and services. Learn about pet fees, size restrictions, and how to prepare your pet for hotel stays. We\'ve also included tips for ensuring a comfortable experience for both you and your pet.',
    author: 'Robert Taylor',
    date: '2023-12-15',
    category: 'Pet Travel',
    imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop'
  }
];

export default function BlogPage() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
              Hotel Travel Blog
            </h1>
            <p 
              className="text-lg mb-8 transition-colors"
              style={{ color: 'var(--card-text-secondary)' }}
            >
              Expert tips, guides, and insights to help you find the perfect hotel for your next adventure
            </p>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {BLOG_POSTS.map((post) => (
              <article
                key={post.id}
                className="rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                  borderWidth: '1px',
                  borderStyle: 'solid'
                }}
              >
                {/* Blog Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={post.imageUrl}
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.className += ' bg-gradient-to-br from-blue-400 to-purple-500';
                      }
                    }}
                  />
                </div>

                {/* Blog Content */}
                <div className="p-6">
                  <div className="mb-3">
                    <span
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: 'var(--button-bg)',
                        color: 'var(--button-text)'
                      }}
                    >
                      {post.category}
                    </span>
                  </div>

                  <h2 
                    className="text-xl font-bold mb-2 transition-colors line-clamp-2"
                    style={{ color: 'var(--card-text)' }}
                  >
                    {post.title}
                  </h2>

                  <p 
                    className="text-sm mb-4 transition-colors line-clamp-3"
                    style={{ color: 'var(--card-text-secondary)' }}
                  >
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs mb-4">
                    <span style={{ color: 'var(--card-text-secondary)' }}>
                      {post.author}
                    </span>
                    <span style={{ color: 'var(--card-text-secondary)' }}>
                      {formatDate(post.date)}
                    </span>
                  </div>

                  <button
                    className="w-full py-2 rounded-lg font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: 'var(--button-bg)',
                      color: 'var(--button-text)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--button-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--button-bg)';
                    }}
                  >
                    Read More
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

