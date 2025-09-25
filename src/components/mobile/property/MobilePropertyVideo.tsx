'use client';

import React, { useState } from 'react';
import { Play } from 'lucide-react';
import Image from 'next/image';

interface MobilePropertyVideoProps {
  videoUrl?: string | null;
}

// Helper function to extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

// Helper function to get YouTube thumbnail
function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

// Helper function to get YouTube embed URL
function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export default function MobilePropertyVideo({ videoUrl }: MobilePropertyVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoUrl || videoUrl.trim() === '') {
    return null;
  }

  const videoId = getYouTubeVideoId(videoUrl);
  
  if (!videoId) {
    // If it's not a YouTube URL, show a simple link
    return (
      <div className="w-full mx-1 my-4">
        <div className="bg-white/90 backdrop-blur-md border-gray-200/50 rounded-2xl shadow-sm px-6 pt-6 pb-6">
          {/* Section Header */}
          <div className="text-lg font-bold text-black mb-3">Property Video</div>
          <div className="flex items-center justify-center p-6 bg-gray-50 rounded-xl">
            <div className="text-center">
              <Play className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 text-sm">Property Video Available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const thumbnailUrl = getYouTubeThumbnail(videoId);
  const embedUrl = getYouTubeEmbedUrl(videoId);

  return (
    <div className="w-full mx-1 my-4">
      <div className="bg-white/90 backdrop-blur-md border-gray-200/50 rounded-2xl shadow-sm px-6 pt-6 pb-6">
        {/* Section Header */}
        <div className="text-lg font-bold text-black mb-3">Property Video</div>
        
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm">
          {isPlaying ? (
            <iframe
              src={`${embedUrl}?autoplay=1&rel=0`}
              title="Property Video"
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="relative w-full h-full group cursor-pointer" onClick={() => setIsPlaying(true)}>
              <Image
                src={thumbnailUrl}
                alt="Property Video Thumbnail"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="bg-red-600 rounded-full p-3 group-hover:scale-110 transition-transform">
                  <Play className="h-6 w-6 text-white ml-0.5" fill="currentColor" />
                </div>
              </div>
              {/* YouTube Logo */}
              <div className="absolute bottom-2 right-2">
                <div className="bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                  YouTube
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
