'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Edit, 
  CheckCircle, 
  XCircle, 
  Clock,
  Building2, 
  MapPin, 
  Bed, 
  Bath, 
  Square,
  Star,
  Eye,
  FileText,
  Download,
  ExternalLink
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatIndianPrice, formatIndianNumber } from '@/lib/utils'
import { createSupabaseClient } from '@/lib/supabaseClient'

interface Property {
  id: string
  title: string
  description: string
  property_type: string
  property_nature: string
  property_collection: string
  location: string
  location_id?: string
  latitude?: number
  longitude?: number
  thumbnail_url?: string | null
  bhk: number
  area: number
  bedrooms: number
  bathrooms: number
  ready_by: string
  floor_plan_url?: string | null
  brochure_url?: string | null
  created_at: string
  updated_at: string
  status: string
  rera_number?: string | null
  is_verified: boolean
  posted_by?: string
  created_by?: string
  developer_id?: string
  developer_name?: string | null
  developer_logo?: string | null
  location_name?: string | null
  creator_name?: string | null
  creator_email?: string | null
  view_count: number
  favorite_count: number
  review_count: number
  average_rating: number
  total_configurations: number
  total_images: number
  property_images?: Array<{ id: string; image_url: string }>
  property_configurations?: Array<{
    id: string
    price: number
    bhk: number
    area: number
    bedrooms: number
    bathrooms: number
    ready_by: string
    floor_plan_url?: string
    brochure_url?: string
  }>
}

interface PropertyReviewClientProps {
  property: Property
}

export default function PropertyReviewClient({ property }: PropertyReviewClientProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const supabase = createSupabaseClient()

  const getPropertyTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'House': 'bg-blue-100 text-blue-800',
      'Apartment': 'bg-green-100 text-green-800',
      'Commercial': 'bg-purple-100 text-purple-800',
      'Land': 'bg-yellow-100 text-yellow-800',
      'Villa': 'bg-red-100 text-red-800',
      'Penthouse': 'bg-indigo-100 text-indigo-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  const getNatureColor = (nature: string) => {
    return nature === 'Sell' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
  }

  const getCollectionColor = (collection: string) => {
    const colors: Record<string, string> = {
      'Newly Launched': 'bg-orange-100 text-orange-800',
      'Featured': 'bg-blue-100 text-blue-800',
      'Ready to Move': 'bg-green-100 text-green-800',
      'Under Construction': 'bg-yellow-100 text-yellow-800'
    }
    return colors[collection] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleApprove = async () => {
    setIsProcessing(true)
    try {
      const { error } = await supabase
        .from('properties')
        .update({ 
          status: 'active', 
          is_verified: true,
          verified_at: new Date().toISOString()
        })
        .eq('id', property.id)

      if (error) {
        toast.error('Failed to approve property')
        console.error('Error approving property:', error)
      } else {
        toast.success('Property approved successfully')
        router.push('/admin/properties/pending')
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to approve property')
      console.error('Error approving property:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReject = async () => {
    setIsProcessing(true)
    try {
      const { error } = await supabase
        .from('properties')
        .update({ 
          status: 'inactive',
          is_verified: false
        })
        .eq('id', property.id)

      if (error) {
        toast.error('Failed to reject property')
        console.error('Error rejecting property:', error)
      } else {
        toast.success('Property rejected successfully')
        router.push('/admin/properties/pending')
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to reject property')
      console.error('Error rejecting property:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pending
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Property Review</h1>
            <p className="text-muted-foreground">
              Review property details before approval
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            asChild
          >
            <Link href={`/admin/properties/${property.id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Property
            </Link>
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isProcessing}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button
            onClick={handleReject}
            disabled={isProcessing}
            variant="destructive"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
      </div>

      {/* Status Banner */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            <span className="font-medium text-orange-900">Pending Approval</span>
            <span className="text-orange-700">
              • Submitted by {property.creator_name || property.posted_by || 'Unknown'} on {formatDate(property.created_at)}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Property Images ({property.total_images})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {property.property_images && property.property_images.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.property_images.map((image) => (
                    <div key={image.id} className="aspect-video relative bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={image.image_url}
                        alt={`Property image`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-2" />
                  No images uploaded
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                <p className="text-muted-foreground">{property.description}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className={getPropertyTypeColor(property.property_type)}>
                  {property.property_type}
                </Badge>
                <Badge className={getNatureColor(property.property_nature)}>
                  {property.property_nature}
                </Badge>
                <Badge className={getCollectionColor(property.property_collection)}>
                  {property.property_collection}
                </Badge>
                {property.developer_name && (
                  <Badge className="bg-purple-100 text-purple-800">
                    {property.developer_name}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location_name || property.location}
                </div>
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  {property.bedrooms} Beds
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  {property.bathrooms} Baths
                </div>
                <div className="flex items-center">
                  <Square className="h-4 w-4 mr-1" />
                  {formatIndianNumber(property.area)} sq.ft
                </div>
              </div>
            </CardContent>
          </Card>

          {/* BHK Configurations */}
          {property.property_configurations && property.property_configurations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>BHK Configurations ({property.total_configurations})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {property.property_configurations.map((config) => (
                    <div key={config.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-100 text-blue-800">
                            {config.bhk} BHK
                          </Badge>
                          <span className="text-lg font-bold text-primary">
                            ₹{formatIndianPrice(config.price)}
                          </span>
                        </div>
                        {config.ready_by && (
                          <span className="text-sm text-muted-foreground">
                            Ready by: {config.ready_by}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>Area: {formatIndianNumber(config.area)} sq.ft</div>
                        <div>Bedrooms: {config.bedrooms}</div>
                        <div>Bathrooms: {config.bathrooms}</div>
                      </div>
                      {(config.floor_plan_url || config.brochure_url) && (
                        <div className="flex gap-2 mt-3">
                          {config.floor_plan_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={config.floor_plan_url} target="_blank" rel="noopener noreferrer">
                                <FileText className="h-4 w-4 mr-2" />
                                Floor Plan
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          )}
                          {config.brochure_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={config.brochure_url} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-2" />
                                Brochure
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Views</span>
                <span className="font-medium">{property.view_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Favorites</span>
                <span className="font-medium">{property.favorite_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Reviews</span>
                <span className="font-medium">{property.review_count}</span>
              </div>
              {property.average_rating > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{property.average_rating.toFixed(1)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submission Info */}
          <Card>
            <CardHeader>
              <CardTitle>Submission Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm text-muted-foreground">Submitted by</span>
                <p className="font-medium">{property.creator_name || property.posted_by || 'Unknown'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Submitted on</span>
                <p className="font-medium">{formatDate(property.created_at)}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Last updated</span>
                <p className="font-medium">{formatDate(property.updated_at)}</p>
              </div>
              {property.rera_number && (
                <div>
                  <span className="text-sm text-muted-foreground">RERA Number</span>
                  <p className="font-medium">{property.rera_number}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Info */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium mb-2">{property.location_name || property.location}</p>
              {property.latitude && property.longitude && (
                <p className="text-sm text-muted-foreground">
                  Coordinates: {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 