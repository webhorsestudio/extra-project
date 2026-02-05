'use client';

import React from 'react';
import { Property } from '@/types/property';
import Image from 'next/image';

interface ListingBySectionProps {
  property: Property;
}

function ListingByDetails({ property }: { property: Property }) {
  const developer = property.developer;

  if (!developer) return null;

  return (
    <div className="flex flex-col justify-center">
      <div className="font-bold text-base text-[#0A1736] mb-1">{developer.name}</div>
      {developer.website && (
        <a
          href={developer.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline mb-1"
        >
          {developer.website}
        </a>
      )}
      {developer.address && (
        <div className="text-sm text-gray-700">
          {developer.address}
        </div>
      )}
    </div>
  );
}

export default function ListingBySection({ property }: ListingBySectionProps) {
  const developer = property?.developer;

  if (!developer) {
    return (
      <section className="bg-white rounded-2xl shadow p-6 md:p-8 mb-8">
        <div className="font-semibold text-lg text-[#0A1736] mb-4">Listing By:</div>
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-[70px] h-[40px] bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500">No Logo</span>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="font-bold text-base text-[#0A1736] mb-1">
              {property?.posted_by || 'Unknown Developer'}
            </div>
            <div className="text-sm text-gray-500">
              Developer information not available
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl shadow p-6 md:p-8 mb-8">
      <div className="font-semibold text-lg text-[#0A1736] mb-4">Listing By:</div>
      <div className="flex items-center gap-6">
        <div className="flex-shrink-0">
          {developer?.logo_url ? (
            <Image
              src={developer.logo_url}
              alt={`${developer.name} Logo`}
              width={70}
              height={40}
              className="object-contain"
            />
          ) : (
            <div className="w-[70px] h-[40px] bg-gray-200 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500">No Logo</span>
            </div>
          )}
        </div>
        <ListingByDetails property={property} />
      </div>
    </section>
  );
} 