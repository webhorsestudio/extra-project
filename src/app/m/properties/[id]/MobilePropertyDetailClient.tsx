"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Share2, MapPin, Bed, Bath, Ruler, Phone, MessageCircle, Star, Building2, Car, ExternalLink } from 'lucide-react'
import { HydrationSuppressor } from '@/components/HydrationSuppressor'
import dynamic from 'next/dynamic'
import FavoriteButton from '@/components/ui/FavoriteButton'
import { shareProperty, generatePropertyShareData } from '@/lib/utils/share'
import Image from 'next/image'
import type { Property, PropertyImage, BHKConfiguration } from '@/types/property'

// Dynamic imports for map components
const PropertyLocationMap = dynamic(() => import('@/components/web/property/PropertyLocationMap'), { ssr: false })

interface MobilePropertyDetailClientProps {
  property: Property;
}

function MobilePropertyImageCarousel({ images }: { images: PropertyImage[] }) {
  const [currentImage, setCurrentImage] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="h-64 bg-gray-200 rounded-t-2xl flex items-center justify-center">
        <Building2 className="w-12 h-12 text-gray-400" />
      </div>
    )
  }

  return (
    <div className="relative h-64">
      <Image
        src={images[currentImage]?.image_url || '/placeholder-property.jpg'}
        alt="Property"
        fill
        className="object-cover rounded-t-2xl"
      />
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentImage ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function MobilePropertyConfigurations({ property }: { property: Property }) {
  const configs = property.property_configurations || []
  const uniqueBhks = Array.from(new Set(configs.map((c: BHKConfiguration) => c.bhk))).sort((a: number, b: number) => b - a)
  const [activeBhk, setActiveBhk] = useState(uniqueBhks[0] || 1)
  if (configs.length === 0) {
    return null
  }
  const bhkConfigs = configs.filter((c: BHKConfiguration) => c.bhk === activeBhk)

  return (
    <Card className="bg-white/90 backdrop-blur-md border-gray-200/50 mx-4">
      <CardHeader>
        <CardTitle className="text-base">Available Configurations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* BHK Tabs */}
        {uniqueBhks.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {uniqueBhks.map((bhk: number) => (
              <button
                key={bhk}
                onClick={() => setActiveBhk(bhk)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  activeBhk === bhk
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {bhk} BHK
              </button>
            ))}
          </div>
        )}

        {/* Configuration Details */}
        {bhkConfigs.map((config: BHKConfiguration, index: number) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Price</span>
                <div className="font-semibold text-blue-600">
                  ₹{config.price?.toLocaleString() || 'N/A'}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Area</span>
                <div className="font-semibold">{config.area} sq ft</div>
              </div>
              <div>
                <span className="text-gray-500">Bedrooms</span>
                <div className="font-semibold">{config.bedrooms}</div>
              </div>
              <div>
                <span className="text-gray-500">Bathrooms</span>
                <div className="font-semibold">{config.bathrooms}</div>
              </div>
              {config.ready_by && (
                <div className="col-span-2">
                  <span className="text-gray-500">Ready By</span>
                  <div className="font-semibold">{config.ready_by}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

function MobileListingBySection({ property }: { property: Property }) {
  if (!property.developer) return null

  return (
    <Card className="bg-white/90 backdrop-blur-md border-gray-200/50 mx-4">
      <CardHeader>
        <CardTitle className="text-base">Listing By</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{property.developer.name}</h3>
            {property.developer.website && (
              <a
                href={property.developer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 text-sm flex items-center gap-1"
              >
                Visit Website
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MobilePropertyFeatures({ property }: { property: Property }) {
  const amenities = property.amenities || []
  const categories = property.categories || []

  if (amenities.length === 0 && categories.length === 0) {
    return null
  }

  return (
    <Card className="bg-white/90 backdrop-blur-md border-gray-200/50 mx-4">
      <CardHeader>
        <CardTitle className="text-base">Features</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index: number) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {amenities.map((amenity, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {amenity.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Helper functions for safe field access
function getStringField(obj: Record<string, unknown>, key: string, fallback: string): string {
  const value = obj[key]
  return typeof value === 'string' ? value : fallback
}

function getNumberField(obj: Record<string, unknown>, key: string, fallback: number): number {
  const value = obj[key]
  return typeof value === 'number' ? value : fallback
}

export default function MobilePropertyDetailClient({ property }: MobilePropertyDetailClientProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleBack = () => {
    window.history.back()
  }

  const handleShare = async () => {
    try {
      // Cast property to the expected type for generatePropertyShareData
      const propertyData = property as unknown as Record<string, unknown>
      const shareData = generatePropertyShareData(propertyData)
      await shareProperty(shareData)
    } catch (error) {
      console.error('Error sharing property:', error)
    }
  }

  // Safe access to property fields with proper typing
  const propertyData = property as unknown as Record<string, unknown>
  
  const title = getStringField(propertyData, 'title', 'Property')
  const description = getStringField(propertyData, 'description', '')
  const propertyType = getStringField(propertyData, 'property_type', '')
  const propertyCollection = getStringField(propertyData, 'property_collection', '')
  const location = getStringField(propertyData, 'location', '')
  const latitude = getNumberField(propertyData, 'latitude', 0)
  const longitude = getNumberField(propertyData, 'longitude', 0)
  const parking = propertyData.parking === true
  const parkingSpots = getNumberField(propertyData, 'parking_spots', 0)
  const reraNumber = getStringField(propertyData, 'rera_number', '')
  const isVerified = propertyData.is_verified === true

  // Safe access to nested arrays
  const images = Array.isArray(propertyData.property_images) 
    ? propertyData.property_images as PropertyImage[]
    : []
  
  const configurations = Array.isArray(propertyData.property_configurations)
    ? propertyData.property_configurations as BHKConfiguration[]
    : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <FavoriteButton propertyId={property.id} />
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm"
            >
              <Share2 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <MobilePropertyImageCarousel images={images} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-t-2xl" />
      </div>

      {/* Property Info Card */}
      <Card className="mx-4 -mt-6 relative z-10 bg-white/95 backdrop-blur-md border-gray-200/50">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Title and Badges */}
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-2">{title}</h1>
              <div className="flex flex-wrap gap-2">
                {propertyType && (
                  <Badge variant="secondary" className="text-xs">
                    {propertyType}
                  </Badge>
                )}
                {propertyCollection && (
                  <Badge variant="outline" className="text-xs">
                    {propertyCollection}
                  </Badge>
                )}
                {isVerified && (
                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                    <Star className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>

            {/* Location */}
            {location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{location}</span>
              </div>
            )}

            {/* Key Details */}
            <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                  <Bed className="w-4 h-4" />
                </div>
                <div className="text-sm font-medium">
                  {configurations.length > 0 ? `${configurations[0].bedrooms} Beds` : 'N/A'}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                  <Bath className="w-4 h-4" />
                </div>
                <div className="text-sm font-medium">
                  {configurations.length > 0 ? `${configurations[0].bathrooms} Baths` : 'N/A'}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
                  <Ruler className="w-4 h-4" />
                </div>
                <div className="text-sm font-medium">
                  {configurations.length > 0 ? `${configurations[0].area} sq ft` : 'N/A'}
                </div>
              </div>
            </div>

            {/* Price */}
            {configurations.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <div className="text-2xl font-bold text-blue-600">
                  {formatCurrency(configurations[0].price)}
                </div>
                <div className="text-sm text-gray-500">Starting Price</div>
              </div>
            )}

            {/* Additional Details */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
              {parking && (
                <div className="flex items-center gap-2 text-sm">
                  <Car className="w-4 h-4 text-gray-500" />
                  <span>Parking Available</span>
                  {parkingSpots > 0 && <span className="text-gray-500">({parkingSpots} spots)</span>}
                </div>
              )}
              {reraNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span>RERA: {reraNumber}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {description && (
        <Card className="mx-4 mt-4 bg-white/90 backdrop-blur-md border-gray-200/50">
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
          </CardContent>
        </Card>
      )}

      {/* Configurations */}
      <MobilePropertyConfigurations property={property} />

      {/* Listing By */}
      <MobileListingBySection property={property} />

      {/* Features */}
      <MobilePropertyFeatures property={property} />

      {/* Location Map */}
      {(latitude && longitude) && (
        <Card className="mx-4 mt-4 bg-white/90 backdrop-blur-md border-gray-200/50">
          <CardHeader>
            <CardTitle className="text-base">Location</CardTitle>
          </CardHeader>
          <CardContent>
                         <div className="h-48 rounded-lg overflow-hidden">
               <HydrationSuppressor>
                 <PropertyLocationMap
                   property={property}
                   locationName={location}
                 />
               </HydrationSuppressor>
             </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Buttons */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200 flex gap-2 px-4 py-3 shadow-lg">
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
          <Phone className="w-4 h-4 mr-2" />
          Contact Now
        </Button>
        <Button variant="outline" className="flex-1">
          <MessageCircle className="w-4 h-4 mr-2" />
          Request Tour
        </Button>
      </div>
    </div>
  )
} 