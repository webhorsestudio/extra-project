import React from 'react';
import Link from 'next/link';
import { Property } from '@/types/property';

interface PropertyBreadcrumbsProps {
  property: Property;
}

export default function PropertyBreadcrumbs({ property }: PropertyBreadcrumbsProps) {
  return (
    <nav className="text-sm font-medium flex items-center space-x-1" aria-label="Breadcrumb">
      <Link href="/" className="text-gray-500 hover:text-blue-600 transition-colors">
        Home
      </Link>
      <span className="mx-1 text-gray-400">/</span>
      <Link href="/properties" className="text-gray-500 hover:text-blue-600 transition-colors">
        Properties
      </Link>
      <span className="mx-1 text-gray-400">/</span>
      {property.location_data?.name && (
        <>
          <Link 
            href={`/properties?location=${property.location_data.id}`} 
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            {property.location_data.name}
          </Link>
          <span className="mx-1 text-gray-400">/</span>
        </>
      )}
      <span className="text-gray-900 font-semibold">{property.title}</span>
    </nav>
  );
} 