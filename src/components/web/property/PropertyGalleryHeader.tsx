import React from 'react';

export default function PropertyGalleryHeader() {
  // Hardcoded data for now
  const mainImage = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
  const gallery = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left: Main Image */}
      <div className="relative w-full lg:w-2/3 aspect-[16/9] rounded-xl overflow-hidden shadow">
        <img src={mainImage} alt="Main" className="object-cover w-full h-full" />
      </div>
      {/* Right: Gallery Thumbnails */}
      <div className="w-full lg:w-1/3 flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3 h-full">
          {gallery.slice(1, 4).map((img, i) => (
            <div key={i} className="aspect-[16/9] rounded-xl overflow-hidden shadow">
              <img src={img} alt={`Gallery ${i + 1}`} className="object-cover w-full h-full" />
            </div>
          ))}
        </div>
        {/* Gallery count overlay */}
        <div className="flex justify-end mt-2">
          <span className="bg-white/90 text-gray-700 text-xs px-3 py-1 rounded-full shadow">+{gallery.length - 1} more</span>
        </div>
      </div>
    </div>
  );
} 