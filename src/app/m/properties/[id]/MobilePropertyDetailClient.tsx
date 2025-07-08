"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Heart, Share2, MapPin, Bed, Bath, Ruler, Calendar, Phone, MessageCircle, Star, Building2, Car, ExternalLink } from 'lucide-react'
import { HydrationSuppressor } from '@/components/HydrationSuppressor'
import { useToast } from '@/components/ui/use-toast'
import dynamic from 'next/dynamic'
import FavoriteButton from '@/components/ui/FavoriteButton'
import { shareProperty, generatePropertyShareData } from '@/lib/utils/share'

// Dynamic imports for map components
const PropertyLocationMap = dynamic(() => import('@/components/web/property/PropertyLocationMap'), { ssr: false })

interface MobilePropertyDetailClientProps {
  property: any
}

function MobilePropertyImageCarousel({ images }: { images: any[] }) {
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
      <img
        src={images[currentImage]?.image_url || '/placeholder-property.jpg'}
        alt="Property"
        className="w-full h-full object-cover rounded-t-2xl"
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

function MobilePropertyConfigurations({ property }: { property: any }) {
  const configs = property.property_configurations || []
  
  if (configs.length === 0) {
    return null
  }

  const uniqueBhks = Array.from(new Set(configs.map((c: any) => c.bhk))).sort((a: any, b: any) => b - a)
  const [activeBhk, setActiveBhk] = useState(uniqueBhks[0] || 1)
  const bhkConfigs = configs.filter((c: any) => c.bhk === activeBhk)

  return (
    <Card className="bg-white/90 backdrop-blur-md border-gray-200/50 mx-4">
      <CardHeader>
        <CardTitle className="text-base">Available Configurations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* BHK Tabs */}
        {uniqueBhks.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {uniqueBhks.map((bhk: any) => (
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
        {bhkConfigs.map((config: any, index: number) => (
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

function MobileListingBySection({ property }: { property: any }) {
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

function MobilePropertyFeatures({ property }: { property: any }) {
  const hasAmenities = property.amenities && property.amenities.length > 0
  const hasCategories = property.categories && property.categories.length > 0

  if (!hasAmenities && !hasCategories) return null

  return (
    <Card className="bg-white/90 backdrop-blur-md border-gray-200/50 mx-4">
      <CardHeader>
        <CardTitle className="text-base">Features</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Categories */}
        {hasCategories && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Categories</h4>
            <div className="flex flex-wrap gap-2">
              {property.categories.map((category: any, index: number) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Amenities */}
        {hasAmenities && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Amenities</h4>
            <div className="grid grid-cols-2 gap-3">
              {property.amenities.map((amenity: any, index: number) => (
                <div key={index} className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-700">{amenity.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function MobilePropertyDetailClient({ property }: MobilePropertyDetailClientProps) {
  const { toast } = useToast()

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const firstConfig = property.property_configurations?.[0]

  // Share handler
  const handleShare = async () => {
    const shareData = generatePropertyShareData(property);
    await shareProperty(shareData);
  };

  return (
    <HydrationSuppressor>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 px-4 py-3">
          <div className="flex items-center justify-between">
            <a href="/m/properties" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Back</span>
            </a>
            <h1 className="text-lg font-semibold text-gray-900">Property Details</h1>
            <div className="flex items-center space-x-2">
              <FavoriteButton propertyId={property.id} />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Property Images */}
          <MobilePropertyImageCarousel images={property.property_images} />

          {/* Property Info Card */}
          <Card className="bg-white/90 backdrop-blur-md border-gray-200/50 mx-4">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Title and Price */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{property.title}</h2>
                  {firstConfig?.price && (
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(firstConfig.price)}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm">{property.property_locations?.name || property.location}</span>
                </div>

                {/* Property Details */}
                {firstConfig && (
                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
                    <div className="text-center">
                      <Bed className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-sm font-semibold">{firstConfig.bhk} BHK</div>
                      <div className="text-xs text-gray-500">Bedrooms</div>
                    </div>
                    <div className="text-center">
                      <Bath className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-sm font-semibold">{firstConfig.bathrooms || 'N/A'}</div>
                      <div className="text-xs text-gray-500">Bathrooms</div>
                    </div>
                    <div className="text-center">
                      <Ruler className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-sm font-semibold">{firstConfig.area} sq ft</div>
                      <div className="text-xs text-gray-500">Area</div>
                    </div>
                  </div>
                )}

                {/* Property Type and Collection */}
                <div className="flex flex-wrap gap-2">
                  {property.property_type && (
                    <Badge variant="secondary" className="text-xs">
                      {property.property_type}
                    </Badge>
                  )}
                  {property.property_collection && (
                    <Badge variant="outline" className="text-xs">
                      {property.property_collection}
                    </Badge>
                  )}
                  {property.is_verified && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Configurations */}
          <MobilePropertyConfigurations property={property} />

          {/* Property Details */}
          <Card className="bg-white/90 backdrop-blur-md border-gray-200/50 mx-4">
            <CardHeader>
              <CardTitle className="text-base">Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Ready By Date */}
              {firstConfig?.ready_by && (
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                  <div>
                    <div className="font-medium">Ready By</div>
                    <div className="text-gray-600">
                      {new Date(firstConfig.ready_by).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long'
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Parking */}
              {property.parking && (
                <div className="flex items-center text-sm">
                  <Car className="w-4 h-4 text-gray-500 mr-3" />
                  <div>
                    <div className="font-medium">Parking</div>
                    <div className="text-gray-600">
                      {property.parking_spots || 1} spot{property.parking_spots !== 1 ? 's' : ''} available
                    </div>
                  </div>
                </div>
              )}

              {/* RERA Number */}
              {property.rera_number && (
                <div className="text-xs text-gray-500">
                  RERA No: {property.rera_number}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Listing By Section */}
          <MobileListingBySection property={property} />

          {/* Description */}
          {property.description && (
            <Card className="bg-white/90 backdrop-blur-md border-gray-200/50 mx-4">
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {property.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Amenities */}
          {property.property_amenity_relations && property.property_amenity_relations.length > 0 && (
            <Card className="bg-white/90 backdrop-blur-md border-gray-200/50 mx-4">
              <CardHeader>
                <CardTitle className="text-base">Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {property.property_amenity_relations.map((relation: any, index: number) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span className="text-gray-700">{relation.property_amenities?.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location Map */}
          {(property.latitude && property.longitude) && (
            <Card className="bg-white/90 backdrop-blur-md border-gray-200/50 mx-4">
              <CardHeader>
                <CardTitle className="text-base">Location</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-64 rounded-lg overflow-hidden">
                  <PropertyLocationMap property={property} />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Property Features */}
          <MobilePropertyFeatures property={property} />

          {/* Contact Actions */}
          <Card className="bg-white/90 backdrop-blur-md border-gray-200/50 mx-4">
            <CardContent className="p-6">
              <div className="space-y-3">
                <Button className="w-full" size="lg">
                  <Phone className="w-4 h-4 mr-2" />
                  Call Now
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </HydrationSuppressor>
  )
} 