'use client';

import React from 'react';
import { Property } from '@/types/property';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, User, Phone, Mail, Globe } from 'lucide-react';

interface MobileListingBySectionProps {
  property: Property;
}

export default function MobileListingBySection({ property }: MobileListingBySectionProps) {
  const developer = property.developer;
  if (!developer) return null;

  return (
    <div className="bg-white/90 backdrop-blur-md border-gray-200/50 rounded-2xl shadow-lg p-6 mx-1 my-4">
      <div className="text-lg font-bold text-black mb-4">Listing By:</div>
      <div className="flex items-start gap-4">
        {/* Logo */}
        {developer.logo_url && (
          <img
            src={developer.logo_url}
            alt={developer.name}
            className="w-16 h-16 object-contain rounded bg-gray-50 border border-gray-100"
          />
        )}
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-bold text-black mb-1 truncate">{developer.name}</div>
          {developer.website && (
            <a
              href={developer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 mb-1 block truncate hover:underline"
            >
              {developer.website}
            </a>
          )}
          {developer.address && (
            <div className="text-sm text-gray-700 whitespace-pre-line break-words">
              {developer.address}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 