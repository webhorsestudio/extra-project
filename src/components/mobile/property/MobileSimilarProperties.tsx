'use client';

import React, { useState } from 'react';
import { Property } from '@/types/property';
import { Bed, Ruler, Calendar, Heart, Send, Copy, MessageCircle, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import PropertyCard from '@/components/mobile/PropertyCard';

interface MobileSimilarPropertiesProps {
  properties: Property[];
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function ImageCarousel({ images, title }: { images: { image_url: string }[]; title: string }) {
  const [current, setCurrent] = useState(0);
  if (!images || images.length === 0) return (
    <div className="w-full h-56 bg-gray-200 flex items-center justify-center rounded-xl">
      <span className="text-gray-400 text-xs">No Image</span>
    </div>
  );
  return (
    <div className="relative w-full h-56 rounded-xl overflow-hidden">
      <img
        src={images[current].image_url}
        alt={title}
        className="w-full h-full object-cover rounded-xl"
        draggable={false}
      />
      {images.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              className={`h-2 w-2 rounded-full border border-gray-300 ${i === current ? 'bg-white' : 'bg-white/50'} transition-colors`}
              aria-label={`Go to image ${i + 1}`}
              onClick={e => { e.stopPropagation(); setCurrent(i); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ShareDialog({ open, onClose, property }: { open: boolean; onClose: () => void; property: Property }) {
  const { toast } = useToast();
  if (!open) return null;
  const config = property.property_configurations?.[0];
  const beds = config?.bedrooms || config?.bhk || '—';
  const url = typeof window !== 'undefined' ? window.location.origin + '/m/properties/' + property.id : '';

  const handleCopy = async () => {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(url);
      toast({ title: 'Link copied!', description: 'The property link has been copied to your clipboard.' });
    }
  };
  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${property.title} (${beds} Beds)\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6 relative animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Share this place</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <span className="sr-only">Close</span>✕
          </button>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <img
            src={property.property_images?.[0]?.image_url || ''}
            alt={property.title}
            className="w-12 h-12 rounded-lg object-cover border"
          />
          <div>
            <div className="font-semibold text-base line-clamp-1">{property.title}</div>
            <div className="text-gray-600 text-sm">{beds} Beds</div>
          </div>
        </div>
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
}

function FavoriteButton({ propertyId, initialIsFavorited }: { propertyId: string; initialIsFavorited?: boolean }) {
  const [isFavorited, setIsFavorited] = useState(!!initialIsFavorited);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(res => setTimeout(res, 400));
      setIsFavorited(fav => !fav);
      toast({
        title: isFavorited ? 'Removed from wishlist' : 'Added to wishlist',
        description: isFavorited ? 'Property removed from your wishlist.' : 'Property added to your wishlist.'
      });
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
      tabIndex={0}
    >
      {loading ? <span className="animate-spin">⏳</span> : <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500' : ''}`} />}
    </button>
  );
}

function normalizeProperty(property: Property): Property {
  const config = property.property_configurations?.[0];
  return {
    ...property,
    price: property.price ?? config?.price,
    bedrooms: property.bedrooms ?? config?.bedrooms ?? config?.bhk,
    bhk: property.bhk ?? config?.bhk ?? config?.bedrooms,
    area: property.area ?? config?.area,
    ready_by: property.ready_by ?? config?.ready_by,
    property_images: property.property_images ?? property.images ?? [],
    location: property.location ?? property.location_data?.name,
  };
}

function MobilePropertyCard({ property }: { property: Property }) {
  const [shareOpen, setShareOpen] = useState(false);
  const images = property.property_images || [];
  const config = property.property_configurations?.[0];
  const price = config?.price;
  const beds = config?.bedrooms || config?.bhk;
  const area = config?.area;
  const status = property.property_collection || property.status || 'Ready';
  const location = property.location_data?.name || property.location;

  return (
    <Link href={`/m/properties/${property.id}`} className="block min-w-[320px] max-w-[92vw] mr-5 last:mr-0">
      <div className="bg-white rounded-2xl shadow-md p-4 relative flex flex-col" style={{ width: 320 }}>
        {/* Image carousel */}
        <div className="relative">
          <ImageCarousel images={images} title={property.title} />
          {/* Action icons */}
          <div className="absolute top-2 right-2 flex gap-2 z-10">
            <button
              className="bg-white/80 hover:bg-white rounded-full p-2 shadow border border-gray-200"
              onClick={e => { e.preventDefault(); setShareOpen(true); }}
              aria-label="Share property"
              tabIndex={0}
            >
              <Send className="h-6 w-6 text-blue-600" />
            </button>
            <FavoriteButton propertyId={property.id} />
          </div>
        </div>
        {/* Title */}
        <div className="font-bold text-lg text-[#1a2236] mt-4 line-clamp-2 min-h-[2.7em]">{property.title}</div>
        {/* Price & Location */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-xl font-bold text-[#0A1736]">{price ? formatCurrency(price) : 'Contact'}</span>
          <span className="text-sm text-gray-500 font-medium truncate ml-2">{location}</span>
        </div>
        {/* Stats row */}
        <div className="flex items-center justify-between text-sm text-gray-700 mt-3">
          <div className="flex items-center gap-1">
            <Bed className="w-5 h-5 mr-1" />
            {beds ? `${beds} Beds` : '--'}
          </div>
          <div className="flex items-center gap-1">
            <Ruler className="w-5 h-5 mr-1" />
            {area ? `${area} Sq. Ft.` : '--'}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-5 h-5 mr-1" />
            {status}
          </div>
        </div>
        {/* Share dialog */}
        <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} property={property} />
      </div>
    </Link>
  );
}

export default function MobileSimilarProperties({ properties }: MobileSimilarPropertiesProps) {
  if (!properties || properties.length === 0) return null;
  return (
    <div className="w-full">
      <div className="text-lg font-bold text-[#0A1736] mb-4 px-4">Similar projects</div>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2 snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch' }}>
        {properties.map(property => {
          const normalized = normalizeProperty(property);
          return (
            <div key={property.id} className="flex-shrink-0 w-96 snap-center first:ml-4 last:mr-4">
              <PropertyCard property={normalized} />
            </div>
          );
        })}
      </div>
    </div>
  );
} 