'use client';

import React, { useState } from 'react';
import { Play } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface PropertyVideoProps {
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

export default function PropertyVideo({ videoUrl }: PropertyVideoProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!videoUrl || videoUrl.trim() === '') {
    return null;
  }

  const videoId = getYouTubeVideoId(videoUrl);
  
  if (!videoId) {
    // If it's not a YouTube URL, show a simple link
    return (
      <section className="bg-white rounded-2xl p-6 md:p-8 mb-8 relative">
        <h2 className="text-xl font-semibold mb-6 text-[#0A1736]">Property Video</h2>
        <div className="flex items-center justify-center p-8 bg-gray-50 rounded-xl">
          <div className="text-center">
            <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Property Video Available</p>
          </div>
        </div>
      </section>
    );
  }

  const thumbnailUrl = getYouTubeThumbnail(videoId);
  const embedUrl = getYouTubeEmbedUrl(videoId);

  return (
    <section className="bg-white rounded-2xl p-6 md:p-8 mb-8 relative">
      <h2 className="text-xl font-semibold mb-6 text-[#0A1736]">Property Video</h2>
      <Card className="bg-transparent shadow-none p-0">
        <CardContent className="p-0">
        <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-lg">
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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="bg-red-600 rounded-full p-4 group-hover:scale-110 transition-transform">
                  <Play className="h-8 w-8 text-white ml-1" fill="currentColor" />
                </div>
              </div>
              {/* YouTube Logo */}
              <div className="absolute bottom-4 right-4">
                <div className="bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
                  YouTube
                </div>
              </div>
            </div>
          )}
        </div>
        </CardContent>
      </Card>
    </section>
  );
}
