'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MapPin, Home, Ruler } from 'lucide-react';
import { Property } from '@/types/property';

interface PropertyDetailsSectionProps {
  property: Property;
}

export default function PropertyDetailsSection({ property }: PropertyDetailsSectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sold':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rented':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVerificationColor = (verified: boolean) => {
    return verified 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const getPropertyTypeColor = (type: string) => {
    switch (type) {
      case 'House': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Apartment': return 'bg-green-100 text-green-800 border-green-200';
      case 'Commercial': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Land': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Villa': return 'bg-red-100 text-red-800 border-red-200';
      case 'Penthouse': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCollectionColor = (collection: string) => {
    switch (collection) {
      case 'Newly Launched': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Featured': return 'bg-red-100 text-red-800 border-red-200';
      case 'Ready to Move': return 'bg-green-100 text-green-800 border-green-200';
      case 'Under Construction': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Property ID</label>
              <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded mt-1">{property.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Title</label>
              <p className="text-sm mt-1">{property.title}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1">
                <Badge className={getStatusColor(property.status || 'Active')}>
                  {property.status || 'Active'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Price</label>
              <p className="text-lg font-semibold text-green-600 mt-1">
                {property.price ? formatCurrency(property.price) : 'Price not set'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Property Type</label>
              <div className="mt-1">
                <Badge className={getPropertyTypeColor(property.property_type)}>
                  {property.property_type}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Collection</label>
              <div className="mt-1">
                <Badge className={getCollectionColor(property.property_collection)}>
                  {property.property_collection}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Verification</label>
              <div className="mt-1">
                <Badge className={getVerificationColor(property.is_verified || false)}>
                  {property.is_verified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">RERA Number</label>
              <p className="text-sm mt-1">{property.rera_number || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Parking</label>
              <div className="mt-1">
                <Badge className={property.parking ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                  {property.parking ? 'Available' : 'Not Available'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specifications Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ruler className="h-5 w-5" />
            Specifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{property.bedrooms || 'N/A'}</div>
              <div className="text-sm text-gray-600">Bedrooms</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{property.bathrooms || 'N/A'}</div>
              <div className="text-sm text-gray-600">Bathrooms</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{property.area ? `${property.area.toLocaleString()}` : 'N/A'}</div>
              <div className="text-sm text-gray-600">Area (sq ft)</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{property.parking_spots || 'N/A'}</div>
              <div className="text-sm text-gray-600">Parking Spots</div>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Year Built</label>
              <p className="text-sm mt-1">{property.year_built || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Lot Size</label>
              <p className="text-sm mt-1">{property.lot_size || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Floor Level</label>
              <p className="text-sm mt-1">{property.floor_level || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Total Floors</label>
              <p className="text-sm mt-1">{property.total_floors || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <p className="text-sm mt-1">{property.location || 'Location not specified'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Location ID</label>
              <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded mt-1">
                {property.location_id || 'Not set'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Coordinates</label>
              <p className="text-sm font-mono bg-gray-50 px-2 py-1 rounded mt-1">
                {property.latitude && property.longitude 
                  ? `${property.latitude}, ${property.longitude}`
                  : 'Not set'
                }
              </p>
            </div>
            <div>
                              <label className="text-sm font-medium text-gray-500">Seller</label>
              <p className="text-sm mt-1">
                {property.developer?.name || 'Not specified'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="h-5 w-5" />
            Description & Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Description</label>
            <div className="mt-2 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm whitespace-pre-wrap">
                {property.description || 'No description available'}
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Features</label>
              <div className="mt-2 space-y-1">
                {property.features && property.features.length > 0 ? (
                  property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No features listed</p>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Additional Info</label>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created:</span>
                  <span className="text-sm">{formatDate(property.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Updated:</span>
                  <span className="text-sm">{formatDate(property.updated_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Posted by:</span>
                  <span className="text-sm">{property.posted_by}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created by:</span>
                  <span className="text-sm">{property.created_by}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 