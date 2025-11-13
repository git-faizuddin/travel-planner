'use client';

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

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  // Generate Google Maps embed URL
  // Note: For production, you may want to use Google Maps Embed API with an API key
  const mapsQuery = encodeURIComponent(`${hotel.location.address}, ${hotel.location.city}, ${hotel.location.country}`);
  const mapsUrl = `https://maps.google.com/maps?q=${mapsQuery}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <div
      className="rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        borderWidth: '1px',
        borderStyle: 'solid'
      }}
    >
      {/* Hotel Image */}
      <div className="relative h-64 w-full overflow-hidden">
        <img
          src={hotel.imageUrl}
          alt={hotel.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to a gradient if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            if (target.parentElement) {
              target.parentElement.className += ' bg-gradient-to-br from-blue-400 to-purple-500';
            }
          }}
        />
      </div>

      {/* Hotel Information */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 
            className="text-2xl font-bold transition-colors"
            style={{ color: 'var(--card-text)' }}
          >
            {hotel.name}
          </h3>
          {hotel.rating && (
            <div className="flex items-center gap-1">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#fbbf24' }}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span style={{ color: 'var(--card-text)' }}>{hotel.rating}</span>
            </div>
          )}
        </div>

        <p 
          className="mb-4 transition-colors"
          style={{ color: 'var(--card-text-secondary)' }}
        >
          {hotel.description}
        </p>

        <div className="mb-4">
          <p 
            className="text-sm font-medium mb-1 transition-colors"
            style={{ color: 'var(--card-text)' }}
          >
            Location:
          </p>
          <p 
            className="text-sm transition-colors"
            style={{ color: 'var(--card-text-secondary)' }}
          >
            {hotel.location.address}, {hotel.location.city}, {hotel.location.country}
          </p>
        </div>

        {hotel.price && (
          <div className="mb-4">
            <p 
              className="text-lg font-semibold transition-colors"
              style={{ color: 'var(--card-text)' }}
            >
              {hotel.price}
            </p>
          </div>
        )}

        {/* Google Maps Embed */}
        <div className="mt-4 rounded-lg overflow-hidden" style={{ border: '1px solid var(--card-border)' }}>
          <iframe
            width="100%"
            height="250"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapsUrl}
            title={`Map showing ${hotel.name}`}
          ></iframe>
        </div>
      </div>
    </div>
  );
}

