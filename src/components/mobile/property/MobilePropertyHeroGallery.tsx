'use client';

import React, { useState } from 'react';
import Image from 'next/image'
import { Property } from '@/types/property';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight, Copy, MessageCircle, ArrowLeft, Share2 } from 'lucide-react';
import FavoriteButton from '@/components/ui/FavoriteButton';
import { shareProperty, shareToWhatsApp, copyToClipboard, generatePropertyShareData } from '@/lib/utils/share';

interface MobilePropertyHeroGalleryProps {
  property: Property;
  onBack: () => void;
}

function MobileGalleryModal({ images, open, initialIndex, onClose, property }: { 
  images: (string | undefined)[]; 
  open: boolean; 
  initialIndex: number; 
  onClose: () => void; 
  property: Property 
}) {
  const [current, setCurrent] = useState(initialIndex);
  React.useEffect(() => { setCurrent(initialIndex); }, [initialIndex, open]);
  const total = images.length;

  const handleCopy = async () => {
    const shareData = generatePropertyShareData(property as unknown as Record<string, unknown>, window.location.origin + '/m/properties/' + property.id);
    await copyToClipboard(shareData.url, "Property link copied!");
  };

  const handleWhatsApp = () => {
    const shareData = generatePropertyShareData(property as unknown as Record<string, unknown>, window.location.origin + '/m/properties/' + property.id);
    shareToWhatsApp(shareData);
  };

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
        <DialogTitle className="sr-only">Property Image Gallery</DialogTitle>
        
        {/* Close Button */}
        <button
          className="absolute left-4 top-4 z-50 text-white/90 hover:text-white text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-8 h-8" />
        </button>
        
        {/* Counter */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white text-base font-medium z-50 select-none">
          {current + 1} / {total}
        </div>
        
        {/* Action Icons */}
        <div className="absolute top-4 right-4 flex gap-2 z-50">
          <button className="bg-white/10 hover:bg-white/20 rounded-lg p-2" onClick={handleCopy} title="Copy Link">
            <Copy className="w-5 h-5 text-white" />
          </button>
          <button className="bg-white/10 hover:bg-white/20 rounded-lg p-2" onClick={handleWhatsApp} title="Share on WhatsApp">
            <MessageCircle className="w-5 h-5 text-white" />
          </button>
          <FavoriteButton propertyId={property.id} initialIsFavorited={false} className="bg-white/20 hover:bg-white/30 text-white" iconClassName="text-white" />
        </div>
        
        {/* Main Image */}
        <div className="flex items-center justify-center w-full h-full min-h-[50vh]">
          <div className="bg-white rounded-xl p-2 shadow-xl max-w-[95vw] max-h-[70vh] flex items-center justify-center">
            {images[current] ? (
              <Image
                src={images[current]}
                alt={`Gallery ${current + 1}`}
                className="object-contain max-h-[60vh] max-w-full rounded-lg"
                fill
                style={{ objectFit: 'contain' }}
                draggable={false}
              />
            ) : (
              <div className="w-[80vw] h-[40vh] flex items-center justify-center bg-gray-100 rounded-lg">
                <span className="text-gray-400 text-lg font-medium">No Image</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Navigation Arrows */}
        {current > 0 && (
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 z-50 text-white/80 hover:text-white text-3xl p-2"
            onClick={goPrev}
            aria-label="Previous"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}
        {current < total - 1 && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 z-50 text-white/80 hover:text-white text-3xl p-2"
            onClick={goNext}
            aria-label="Next"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function MobilePropertyHeroGallery({ property, onBack }: MobilePropertyHeroGalleryProps) {
  const images = property.property_images?.map(img => img.image_url) || [];
  const [current, setCurrent] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);
  const hasImages = images.length > 0;

  // Carousel navigation
  const goPrev = () => setCurrent((c) => (c > 0 ? c - 1 : c));
  const goNext = () => setCurrent((c) => (c < images.length - 1 ? c + 1 : c));

  // Gallery modal handlers
  const handleImageClick = () => {
    if (hasImages) {
      setModalIndex(current);
      setModalOpen(true);
    }
  };

  // Share handler
  const handleShare = async () => {
    const shareData = generatePropertyShareData(property as unknown as Record<string, unknown>);
    await shareProperty(shareData);
  };

  return (
    <div className="relative w-full">
      {/* Main Image */}
      <div className="relative w-screen h-80 md:h-96 overflow-hidden" style={{ marginLeft: '50%', transform: 'translateX(-50%)' }}>
        {hasImages ? (
          <Image
            src={images[current]}
            alt={property.title}
            className="w-full h-full object-cover cursor-pointer"
            draggable={false}
            style={{ borderBottomLeftRadius: '1.5rem', borderBottomRightRadius: '1.5rem' }}
            onClick={handleImageClick}
          />
        ) : (
          <div 
            className="w-full h-full bg-black/20 flex items-center justify-center cursor-pointer" 
            style={{ borderBottomLeftRadius: '1.5rem', borderBottomRightRadius: '1.5rem' }}
            onClick={handleImageClick}
          >
            <span className="text-gray-200 text-lg font-medium">No Images Available</span>
          </div>
        )}

        {/* Overlayed Top Buttons */}
        <div className="absolute top-4 left-4 flex gap-2 z-20">
          <button
            onClick={onBack}
            className="bg-black/40 backdrop-blur-md rounded-full p-2 shadow hover:bg-black/60 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <button 
            className="bg-black/40 backdrop-blur-md rounded-full p-2 shadow hover:bg-black/60 transition" 
            aria-label="Share"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
          <FavoriteButton propertyId={property.id} initialIsFavorited={false} className="bg-black/40 backdrop-blur-md rounded-full p-2 shadow hover:bg-black/60 transition" iconClassName="text-white" />
        </div>

        {/* Carousel Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1 z-20">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  i === current ? "bg-white/90 scale-125" : "bg-black/40 hover:bg-black/60"
                } border border-white/40 mx-0.5`}
                style={{ boxShadow: i === current ? "0 0 0 2px #000" : undefined }}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Carousel Navigation Arrows */}
        {current > 0 && (
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 backdrop-blur-md rounded-full p-2 hover:bg-black/50 transition-all duration-200"
            onClick={goPrev}
            aria-label="Previous"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        {current < images.length - 1 && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/30 backdrop-blur-md rounded-full p-2 hover:bg-black/50 transition-all duration-200"
            onClick={goNext}
            aria-label="Next"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {/* Gallery Modal */}
      <MobileGalleryModal 
        images={images} 
        open={modalOpen} 
        initialIndex={modalIndex} 
        onClose={() => setModalOpen(false)} 
        property={property} 
      />

      {/* Leave space for Info Card overlap */}
      <div className="h-8" />
    </div>
  );
} 