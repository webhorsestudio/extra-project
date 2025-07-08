'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Property } from '@/types/property';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight, Send, Heart, Copy, MessageCircle } from 'lucide-react';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { useToast } from '@/components/ui/use-toast';

interface PropertyHeroGalleryProps {
  property: Property;
}

const tabLabels = [
  'Key Highlights',
  'Available Configurations',
  'Features',
  'Similar Projects',
];

const tabSectionIds = [
  'key-highlights',
  'configurations',
  'features',
  'similar-projects',
];

function PropertyGalleryTabs({ activeTab, setActiveTab }: { activeTab: number, setActiveTab: (i: number) => void }) {
  const handleTabClick = (i: number) => {
    setActiveTab(i);
    const section = document.getElementById(tabSectionIds[i]);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  return (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-[-2.25rem] z-30 w-auto">
      <div className="flex h-16 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-x-auto items-center px-2">
        {tabLabels.map((label, i) => (
          <button
            key={label}
            className={cn(
              'px-7 py-3 text-lg font-medium whitespace-nowrap transition-colors flex items-center h-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400',
              i === activeTab
                ? 'text-blue-700 font-semibold bg-gray-100 shadow-sm'
                : 'text-gray-500 hover:text-blue-700 hover:bg-gray-50',
              i !== 0 && 'border-l border-gray-200'
            )}
            onClick={() => handleTabClick(i)}
            style={{ minHeight: '64px' }}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function GalleryImage({ src, alt, onClick, className }: { src: string; alt: string; onClick?: () => void; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn('object-cover w-full h-full rounded-2xl cursor-pointer transition hover:brightness-90', className)}
      onClick={onClick}
      draggable={false}
    />
  );
}

function BlankImagePlaceholder({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center w-full h-full bg-gray-100 rounded-2xl',
        className
      )}
      style={{ minHeight: 180 }}
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      aria-label={onClick ? 'No image' : undefined}
    >
      <span className="text-gray-400 text-lg font-medium select-none">No Image</span>
    </div>
  );
}

function GalleryModal({ images, open, initialIndex, onClose, property }: { images: (string | undefined)[]; open: boolean; initialIndex: number; onClose: () => void; property: Property }) {
  const [current, setCurrent] = useState(initialIndex);
  React.useEffect(() => { setCurrent(initialIndex); }, [initialIndex, open]);
  const total = images.length;
  const { toast } = useToast();

  // Share logic
  const url = typeof window !== 'undefined' ? window.location.origin + '/web/properties/' + (property.slug || property.id) : '';
  const config = property.property_configurations?.[0];
  const beds = config?.bedrooms || config?.bhk || '—';

  const handleCopy = async () => {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied!',
        description: 'The property link has been copied to your clipboard.'
      });
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`${property.title} (${beds} Beds)\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Keyboard navigation
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setCurrent(c => (c > 0 ? c - 1 : c));
      if (e.key === 'ArrowRight') setCurrent(c => (c < total - 1 ? c + 1 : c));
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, total, onClose]);

  const goPrev = () => setCurrent(c => (c > 0 ? c - 1 : c));
  const goNext = () => setCurrent(c => (c < total - 1 ? c + 1 : c));

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="!p-0 !bg-black !border-0 !rounded-none flex items-center justify-center min-h-screen w-full max-w-full">
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">Property Image Gallery</DialogTitle>
        {/* Close Button */}
        <button
          className="absolute left-8 top-8 z-50 text-white/90 hover:text-white text-3xl md:text-4xl"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-9 h-9" />
        </button>
        {/* Counter */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-white text-lg font-medium z-50 select-none">
          {current + 1} / {total}
        </div>
        {/* Action Icons */}
        <div className="absolute top-8 right-8 flex gap-3 z-50">
          <button className="bg-white/10 hover:bg-white/20 rounded-lg p-2" onClick={handleCopy} title="Copy Link"><Copy className="w-6 h-6 text-white" /></button>
          <button className="bg-white/10 hover:bg-white/20 rounded-lg p-2" onClick={handleWhatsApp} title="Share on WhatsApp"><MessageCircle className="w-6 h-6 text-white" /></button>
          <FavoriteButton propertyId={property.id} initialIsFavorited={false} className="bg-white/20 hover:bg-white/30 text-white" iconClassName="text-white" />
        </div>
        {/* Main Image */}
        <div className="flex items-center justify-center w-full h-full min-h-[60vh]">
          <div className="bg-white rounded-2xl p-2 md:p-4 shadow-xl max-w-[90vw] max-h-[80vh] flex items-center justify-center">
            {images[current] ? (
              <img
                src={images[current]}
                alt={`Gallery ${current + 1}`}
                className="object-contain max-h-[70vh] max-w-full rounded-xl"
                draggable={false}
              />
            ) : (
              <BlankImagePlaceholder className="w-[60vw] h-[40vh]" />
            )}
          </div>
        </div>
        {/* Navigation Arrows */}
        {current > 0 && (
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white/80 hover:text-white text-4xl p-2"
            onClick={goPrev}
            aria-label="Previous"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
        )}
        {current < total - 1 && (
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white/80 hover:text-white text-4xl p-2"
            onClick={goNext}
            aria-label="Next"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function PropertyHeroGallery({ property }: PropertyHeroGalleryProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const { toast } = useToast();

  // Only real images for modal
  const realImages = property.property_images && property.property_images.length > 0
    ? property.property_images.map(img => img.image_url)
    : [];

  // Gallery slots: always 4 (main + 3 thumbnails)
  const gallerySlots = Array(4).fill(undefined).map((_, i) => realImages[i]);

  // Get property collection as badge
  const badge = property.property_collection;

  const thumbnailCount = 3;
  const moreCount = realImages.length - thumbnailCount - 1;

  // Handler for gallery slot click
  const handleGalleryClick = (i: number) => {
    if (realImages.length === 0) {
      toast({ title: 'No image', description: 'There is no image.' });
    } else {
      // If index is out of bounds, open at first image
      setModalIndex(i < realImages.length ? i : 0);
      setModalOpen(true);
    }
  };

  return (
    <div className="w-full pb-16 relative">
      <div className="relative bg-white rounded-2xl shadow-lg flex flex-col lg:flex-row gap-4 lg:gap-6 mt-2">
        {/* Main Image */}
        <div className="relative w-full lg:w-2/3 aspect-[16/9] max-h-[520px] flex-shrink-0">
          {gallerySlots[0] ? (
            <GalleryImage
              src={gallerySlots[0] as string}
              alt={property.title}
              onClick={() => handleGalleryClick(0)}
            />
          ) : (
            <BlankImagePlaceholder onClick={() => handleGalleryClick(0)} className="cursor-pointer" />
          )}
          {/* Badge */}
          <span className="absolute top-4 left-4 bg-blue-900 text-white text-base font-semibold px-5 py-2 rounded-xl shadow-lg z-10">
            {badge}
          </span>
        </div>
        {/* Thumbnails */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4 justify-between">
          <div className="flex lg:flex-col gap-4 h-full">
            {gallerySlots.slice(1).map((img, i) => {
              const isLastThumbnail = i === thumbnailCount - 1;
              const showMoreBadge = isLastThumbnail && realImages.length > 4;
              const moreCount = realImages.length - 4;
              return (
                <div key={i} className="relative flex-1 aspect-[16/9] lg:aspect-[16/9] rounded-2xl overflow-hidden shadow-lg max-h-[156px] lg:max-h-[156px]">
                  {img ? (
                    <GalleryImage
                      src={img as string}
                      alt={`${property.title} ${i + 2}`}
                      onClick={() => handleGalleryClick(i + 1)}
                    />
                  ) : (
                    <BlankImagePlaceholder onClick={() => handleGalleryClick(i + 1)} className="cursor-pointer" />
                  )}
                  {/* More Images Badge */}
                  {showMoreBadge && (
                    <span className="absolute bottom-2 right-2 z-20 flex items-center bg-white rounded-full shadow-lg px-2 py-1 gap-1 border border-gray-200">
                      {/* 5th image thumbnail */}
                      {realImages[4] ? (
                        <img
                          src={realImages[4] as string}
                          alt="More images thumbnail"
                          className="w-6 h-6 rounded-full object-cover border border-gray-200"
                        />
                      ) : null}
                      {/* +N label */}
                      <span className="text-gray-900 text-xs font-semibold whitespace-nowrap">+{moreCount}</span>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {/* Floating Tabs Navigation (overlapping bottom) */}
        <PropertyGalleryTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      {/* Fullscreen Gallery Modal */}
      <GalleryModal images={realImages} open={modalOpen} initialIndex={modalIndex} onClose={() => setModalOpen(false)} property={property} />
    </div>
  );
} 