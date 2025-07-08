"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Heart, Send, Bed, Ruler, Calendar, ChevronLeft, ChevronRight, X, Copy, MessageCircle, Loader2, Sparkles } from 'lucide-react';
import type { Property } from '@/types/property';
import { useToast } from '@/components/ui/use-toast';

interface PropertyCardV2Props {
  property: Property;
  initialIsFavorited?: boolean;
  onUnfavorite?: (propertyId: string) => void;
  showPersonalization?: boolean;
  personalizationScore?: number;
  personalizationReason?: string;
}

// Collection Badge
const CollectionBadge = ({ collection }: { collection?: string }) => (
  collection ? (
    <span className="absolute top-3 left-3 z-10">
      <span className="bg-black text-white text-xs font-semibold px-3 py-1 rounded shadow">{collection}</span>
    </span>
  ) : null
);

// Personalization Badge
const PersonalizationBadge = ({ score, reason }: { score?: number; reason?: string }) => {
  if (!score || score < 0.7) return null;

  return (
    <span className="absolute top-3 right-3 z-10">
      <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold px-3 py-1 rounded shadow flex items-center gap-1">
        <Sparkles className="h-3 w-3" />
        Personalized
      </span>
    </span>
  );
};

// Share Dialog Components
const ShareDialog = ({ open, onClose, property }: { open: boolean; onClose: () => void; property: Property }) => {
  const { toast } = useToast();
  if (!open) return null;
  const config = property.property_configurations?.[0];
  const beds = config?.bedrooms || config?.bhk || '—';
  const url = typeof window !== 'undefined' ? window.location.origin + '/properties/' + property.id : '';

  // Copy to clipboard
  const handleCopy = async () => {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied!',
        description: 'The property link has been copied to your clipboard.'
      });
    }
  };

  // WhatsApp share
  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${property.title} (${beds} Beds)\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Share this place</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="h-6 w-6" />
          </button>
        </div>
        {/* Property Info */}
        <div className="flex items-center gap-3 mb-6">
          <img
            src={property.property_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'}
            alt={property.title}
            className="w-14 h-14 rounded-lg object-cover border"
          />
          <div>
            <div className="font-semibold text-base line-clamp-1">{property.title}</div>
            <div className="text-gray-600 text-sm">{beds} Beds</div>
          </div>
        </div>
        {/* Actions */}
        <div className="flex gap-4 mt-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 border rounded-xl py-3 hover:bg-gray-50 transition"
          >
            <Copy className="h-5 w-5" />
            Copy Link
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 border rounded-xl py-3 hover:bg-green-50 transition"
          >
            <span className="bg-green-500 rounded p-1"><MessageCircle className="h-5 w-5 text-white" /></span>
            WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

// Favorite Button
const FavoriteButton = ({ propertyId, initialIsFavorited, onToast, onUnfavorite, isWishlist }: {
  propertyId: string;
  initialIsFavorited: boolean;
  onToast: (opts: { title: string; description: string }) => void;
  onUnfavorite?: (propertyId: string) => void;
  isWishlist?: boolean;
}) => {
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setLoading(true);
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const res = await fetch(`/api/properties/${propertyId}/favorites`, { method });
      if (res.ok) {
        setIsFavorited(!isFavorited);
        onToast({
          title: isFavorited ? 'Removed from wishlist' : 'Added to wishlist',
          description: isFavorited ? 'Property removed from your wishlist.' : 'Property added to your wishlist.'
        });
        if (isWishlist && isFavorited && onUnfavorite) {
          onUnfavorite(propertyId);
        }
      } else {
        const data = await res.json();
        onToast({ title: 'Error', description: data.error || 'Failed to update wishlist.' });
      }
    } catch (e) {
      onToast({ title: 'Error', description: 'Failed to update wishlist.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`bg-white/80 hover:bg-white rounded-full p-2 shadow border border-gray-200 ${isFavorited ? 'text-red-500' : 'text-gray-700'}`}
      onClick={handleToggle}
      aria-label={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500' : ''}`} />}
    </button>
  );
};

// Image Slide
const PropertyImageSlide = ({ src, alt }: { src: string; alt: string }) => (
  <img
    src={src}
    alt={alt}
    className="object-cover w-full h-full transition-all duration-300"
    draggable={false}
  />
);

// Dots
const PropertyImageDots = ({ count, current, onDotClick }: { count: number; current: number; onDotClick: (idx: number) => void }) => (
  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
    {Array.from({ length: count }).map((_, i) => (
      <button
        key={i}
        className={`h-2 w-2 rounded-full border border-gray-300 ${i === current ? 'bg-white' : 'bg-white/50'} transition-colors`}
        aria-label={`Go to image ${i + 1}`}
        onClick={(e) => {
          e.stopPropagation(); // Prevent card click
          onDotClick(i);
        }}
      />
    ))}
  </div>
);

// Navigation Arrows
const PropertyImageNav = ({ onPrev, onNext, disabledPrev, disabledNext }: { onPrev: () => void; onNext: () => void; disabledPrev: boolean; disabledNext: boolean }) => (
  <>
    <button
      className={`absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-1 shadow border border-gray-200 z-10 transition-all duration-200 ${
        disabledPrev 
          ? 'bg-gray-300/50 cursor-not-allowed opacity-50' 
          : 'bg-white/80 hover:bg-white hover:scale-105'
      }`}
      onClick={(e) => {
        e.stopPropagation(); // Prevent card click
        onPrev();
      }}
      disabled={disabledPrev}
      aria-label="Previous image"
      tabIndex={0}
    >
      <ChevronLeft className={`h-5 w-5 ${disabledPrev ? 'text-gray-500' : 'text-gray-700'}`} />
    </button>
    <button
      className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 shadow border border-gray-200 z-10 transition-all duration-200 ${
        disabledNext 
          ? 'bg-gray-300/50 cursor-not-allowed opacity-50' 
          : 'bg-white/80 hover:bg-white hover:scale-105'
      }`}
      onClick={(e) => {
        e.stopPropagation(); // Prevent card click
        onNext();
      }}
      disabled={disabledNext}
      aria-label="Next image"
      tabIndex={0}
    >
      <ChevronRight className={`h-5 w-5 ${disabledNext ? 'text-gray-500' : 'text-gray-700'}`} />
    </button>
  </>
);

// Image Carousel (interactive)
const PropertyImageCarousel = ({ images }: { images?: { image_url: string }[] }) => {
  const fallback = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
  const imageList = images && images.length > 0 ? images.map(img => img.image_url) : [fallback];
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const total = imageList.length;

  const goTo = (idx: number) => setCurrent(idx);
  const goPrev = () => setCurrent(c => (c > 0 ? c - 1 : c));
  const goNext = () => setCurrent(c => (c < total - 1 ? c + 1 : c));

  return (
    <div 
      className="relative h-56 w-full overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <PropertyImageSlide src={imageList[current]} alt={`Property image ${current + 1}`} />
      {total > 1 && (
        <>
          <div className={`transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <PropertyImageNav
              onPrev={goPrev}
              onNext={goNext}
              disabledPrev={current === 0}
              disabledNext={current === total - 1}
            />
          </div>
          <PropertyImageDots count={total} current={current} onDotClick={goTo} />
        </>
      )}
    </div>
  );
};

// Title Row (now free for larger title)
const TitleRow = ({ title }: { title: string }) => (
  <div className="mt-0.5">
    <h2 className="text-xl font-semibold leading-tight line-clamp-2">{title}</h2>
  </div>
);

// Price and Location Row
const PriceLocationRow = ({ price, location, locationData }: { price?: number; location?: string; locationData?: { name: string } | null }) => {
  const formatPrice = (price: number) => {
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(1)} Cr`;
    } else if (price >= 100000) {
      return `₹${(price / 100000).toFixed(1)} L`;
    } else {
      return `₹${price.toLocaleString()}`;
    }
  };
  
  if (!price) {
    return (
      <div className="flex items-center justify-between mt-1">
        <span className="text-black text-xs md:text-sm font-bold">Price available on request</span>
        <span className="text-gray-600 text-sm line-clamp-1">{locationData?.name || ''}</span>
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-between mt-1">
      <div className="flex items-center gap-1">
        <span className="text-gray-400 text-base">Starts At</span>
        <span className="text-black text-lg font-bold">{formatPrice(price)}</span>
      </div>
      <span className="text-gray-600 text-sm line-clamp-1">{locationData?.name || ''}</span>
    </div>
  );
};

// Amenities Row
const AmenitiesRow = ({ config }: { config?: any }) => {
  const formatReadyByDate = (readyBy?: string) => {
    if (!readyBy) return '—';
    
    try {
      // Parse YYYY-MM format and convert to readable format
      const [year, month] = readyBy.split('-');
      if (year && month) {
        const date = new Date(parseInt(year), parseInt(month) - 1);
        return date.toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        });
      }
      return readyBy; // Fallback to original format if parsing fails
    } catch (error) {
      return readyBy; // Fallback to original format if parsing fails
    }
  };

  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-700">
      <div className="flex items-center gap-1">
        <Bed className="h-5 w-5 mr-1 text-blue-700" />
        {config?.bedrooms || config?.bhk || '—'} Beds
      </div>
      <div className="flex items-center gap-1">
        <Ruler className="h-5 w-5 mr-1 text-blue-700" />
        {config?.area ? config.area.toLocaleString() : '—'} Sq. Ft.
      </div>
      <div className="flex items-center gap-1">
        <Calendar className="h-5 w-5 mr-1 text-blue-700" />
        {formatReadyByDate(config?.ready_by)}
      </div>
    </div>
  );
};

// Content Section
interface PropertyCardContentProps {
  property: Property;
  contentMargin?: string;
}
const PropertyCardContent = ({ property, contentMargin = "mt-8" }: PropertyCardContentProps) => {
  const config = property.property_configurations?.[0];
  return (
    <div className={`p-4 pb-5 flex-grow flex flex-col ${contentMargin}`}>
      <TitleRow title={property.title} />
      <PriceLocationRow price={config?.price} location={property.location} locationData={property.location_data} />
      <AmenitiesRow config={config} />
    </div>
  );
};

// Action Icons (Share, Favorite)
const ActionIcons = ({ onShare, favoriteButton }: { onShare: () => void; favoriteButton: React.ReactNode }) => (
  <div className="absolute top-3 right-3 z-10 flex gap-2">
    <button 
      className="bg-white/80 hover:bg-white rounded-full p-2 shadow border border-gray-200" 
      onClick={(e) => {
        e.stopPropagation(); // Prevent card click
        onShare();
      }} 
      aria-label="Share"
    >
      <Send className="h-4 w-4 text-gray-700" />
    </button>
    {favoriteButton}
  </div>
);

// Image Section
const PropertyCardImageSection = ({ 
  property, 
  onShare, 
  favoriteButton,
  showPersonalization,
  personalizationScore,
  personalizationReason 
}: { 
  property: Property; 
  onShare: () => void; 
  favoriteButton: React.ReactNode;
  showPersonalization?: boolean;
  personalizationScore?: number;
  personalizationReason?: string;
}) => (
  <div className="relative">
    <CollectionBadge collection={property.property_collection} />
    {showPersonalization && (
      <PersonalizationBadge score={personalizationScore} reason={personalizationReason} />
    )}
    <ActionIcons onShare={onShare} favoriteButton={favoriteButton} />
    <PropertyImageCarousel images={property.property_images} />
  </div>
);

// Main Property Card V2
const PropertyCardV2: React.FC<PropertyCardV2Props> = ({ 
  property, 
  initialIsFavorited, 
  onUnfavorite,
  showPersonalization = false,
  personalizationScore,
  personalizationReason
}) => {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(initialIsFavorited ?? false);
  const [favoriteChecked, setFavoriteChecked] = useState(initialIsFavorited !== undefined);

  // Handle card click navigation
  const handleCardClick = () => {
    // Use property slug if available, otherwise use ID
    const propertySlug = property.slug || property.id;
    router.push(`/properties/${propertySlug}`);
  };

  // Only fetch favorite state if initialIsFavorited is not provided
  useEffect(() => {
    if (initialIsFavorited !== undefined) {
      setIsFavorited(initialIsFavorited);
      setFavoriteChecked(true);
      return;
    }
    let mounted = true;
    async function fetchFavorite() {
      try {
        const res = await fetch(`/api/properties/${property.id}/favorites`, { method: 'GET' });
        if (!mounted) return;
        if (res.ok) {
          const data = await res.json();
          setIsFavorited(!!data.isFavorited);
        }
      } catch {}
      if (mounted) setFavoriteChecked(true);
    }
    fetchFavorite();
    return () => { mounted = false; };
  }, [property.id, initialIsFavorited]);

  return (
    <Card 
      className="w-full min-h-[380px] rounded-lg overflow-hidden shadow-lg border border-gray-200 p-0 cursor-pointer hover:shadow-xl transition-shadow duration-300 flex flex-col"
      onClick={handleCardClick}
    >
      <div className="h-40">
        <PropertyCardImageSection
          property={property}
          onShare={() => setShareOpen(true)}
          favoriteButton={
            favoriteChecked ? (
              <FavoriteButton
                propertyId={property.id}
                initialIsFavorited={isFavorited}
                onToast={toast}
                onUnfavorite={onUnfavorite}
                isWishlist={!!initialIsFavorited}
              />
            ) : (
              <button className="bg-white/80 rounded-full p-2 shadow border border-gray-200" disabled>
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </button>
            )
          }
          showPersonalization={showPersonalization}
          personalizationScore={personalizationScore}
          personalizationReason={personalizationReason}
        />
      </div>
      <PropertyCardContent property={property} contentMargin="mt-12" />
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} property={property} />
    </Card>
  );
};

export default PropertyCardV2; 