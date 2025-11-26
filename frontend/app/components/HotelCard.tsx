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
  bookingUrl?: string;
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
      className="rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl flex flex-col h-full"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        borderWidth: '1px',
        borderStyle: 'solid'
      }}
    >
      {/* Hotel Image */}
      <div className="relative h-48 w-full overflow-hidden flex-shrink-0">
        <img
          src={hotel.imageUrl}
          alt={hotel.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to a gradient if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            if (target.parentElement) {
              target.parentElement.style.backgroundColor = 'var(--secondary-blue)';
            }
          }}
        />
      </div>

      {/* Hotel Information */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-3 flex-shrink-0">
          {hotel.bookingUrl ? (
            <a
              href={hotel.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-bold transition-all line-clamp-2 flex-1 hover:underline cursor-pointer"
              style={{ 
                color: 'var(--card-text)',
                textDecoration: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.textDecoration = 'underline';
                e.currentTarget.style.color = 'var(--secondary-blue)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none';
                e.currentTarget.style.color = 'var(--card-text)';
              }}
            >
              {hotel.name}
            </a>
          ) : (
            <h3 
              className="text-xl font-bold transition-colors line-clamp-2 flex-1"
              style={{ color: 'var(--card-text)' }}
            >
              {hotel.name}
            </h3>
          )}
          {hotel.rating && (
            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#fbbf24' }}>
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span style={{ color: 'var(--card-text)' }}>{hotel.rating}</span>
            </div>
          )}
        </div>

        <p 
          className="mb-4 transition-colors line-clamp-3 text-sm flex-grow"
          style={{ color: 'var(--card-text-secondary)' }}
        >
          {hotel.description}
        </p>

        {/* Location and Price - Fixed position before maps */}
        <div className="space-y-4 flex-shrink-0 mb-4">
          <div>
            <p 
              className="text-sm font-medium mb-1 transition-colors"
              style={{ color: 'var(--card-text)' }}
            >
              Location:
            </p>
            <p 
              className="text-sm transition-colors line-clamp-2"
              style={{ color: 'var(--card-text-secondary)' }}
            >
              {hotel.location.address}, {hotel.location.city}, {hotel.location.country}
            </p>
          </div>

          <div className="min-h-[2.5rem] flex items-start">
            {hotel.price ? (
              <p 
                className="text-2xl font-bold transition-colors"
                style={{ color: 'var(--accent-orange)' }}
              >
                {hotel.price}
              </p>
            ) : (
              <p 
                className="text-2xl font-bold transition-colors opacity-0"
                style={{ color: 'var(--accent-orange)' }}
              >
                $0
              </p>
            )}
          </div>
        </div>

        {/* Google Maps Embed - Fixed at bottom */}
        {hotel.location.lat !== 0 && hotel.location.lng !== 0 && (
          <div className="mt-auto rounded-lg overflow-hidden flex-shrink-0" style={{ border: '1px solid var(--card-border)' }}>
            <iframe
              width="100%"
              height="200"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={mapsUrl}
              title={`Map showing ${hotel.name}`}
            ></iframe>
          </div>
        )}
      </div>
    </div>
  );
}

