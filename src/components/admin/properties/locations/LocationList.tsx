'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  MapPin, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Shield,
  Crown,
  User
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useToast } from '@/components/ui/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import Image from 'next/image'
import { RefreshCw } from 'lucide-react'

interface Location {
  id: string
  name: string
  description: string | null
  image_url: string | null
  image_storage_path: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

interface LocationListProps {
  refreshTrigger: number
  onEditLocation?: (location: Location) => void
}

export function LocationList({ refreshTrigger, onEditLocation }: LocationListProps) {
  const [locations, setLocations] = useState<Location[]>([])
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null)
  
  const { toast } = useToast()

  const fetchLocations = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/locations')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch locations')
      }

      setLocations(result.locations || [])
    } catch (error) {
      console.error('Error fetching locations:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch locations',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [refreshTrigger, fetchLocations])

  useEffect(() => {
    let filtered = locations

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(location =>
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (location.description && location.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(location => 
        filterStatus === 'active' ? location.is_active : !location.is_active
      )
    }

    setFilteredLocations(filtered)
  }, [locations, searchTerm, filterStatus])

  const handleDelete = async (locationId: string) => {
    try {
      console.log('Starting delete for location:', locationId)
      setDeletingId(locationId)
      setDeleteDialogOpen(null) // Close the dialog
      
      // Get location data to delete image from storage
      const location = locations.find(loc => loc.id === locationId)
      
      // Delete from database via API
      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete location')
      }

      // Delete image from storage if exists
      if (location?.image_storage_path) {
        try {
          const { error: storageError } = await supabase.storage
            .from('location-images')
            .remove([location.image_storage_path])
          
          if (storageError) {
            console.error('Storage deletion error:', storageError)
            // Don't fail the entire operation if storage deletion fails
            toast({
              title: 'Warning',
              description: 'Location deleted but image cleanup failed. This is not critical.',
              variant: 'default',
            })
          }
        } catch (storageError) {
          console.error('Storage deletion exception:', storageError)
          // Don't fail the entire operation if storage deletion fails
          toast({
            title: 'Warning',
            description: 'Location deleted but image cleanup failed. This is not critical.',
            variant: 'default',
          })
        }
      }

      toast({
        title: 'Success',
        description: 'Location deleted successfully',
      })

      // Refresh the list
      fetchLocations()

    } catch (error) {
      console.error('Error deleting location:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete location',
        variant: 'destructive',
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleActive = async (locationId: string, currentStatus: boolean) => {
    try {
      setTogglingId(locationId)
      
      const response = await fetch(`/api/locations/${locationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !currentStatus
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update location status')
      }

      toast({
        title: 'Success',
        description: `Location ${!currentStatus ? 'activated' : 'deactivated'} successfully`,
      })

      // Refresh the list
      fetchLocations()

    } catch (error) {
      console.error('Error toggling location status:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update location status',
        variant: 'destructive',
      })
    } finally {
      setTogglingId(null)
    }
  }

  const handleEditLocation = (location: Location) => {
    if (onEditLocation) {
      onEditLocation(location)
    } else {
      // Default behavior - could navigate to edit page or show edit modal
      toast({
        title: 'Edit Feature',
        description: 'Edit functionality will be implemented soon',
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (locations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Property Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No locations yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by adding your first property location
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <CardTitle>Property Locations ({filteredLocations.length})</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLocations}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Active
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('inactive')}
              >
                Inactive
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLocations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No locations found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className={`group border rounded-lg overflow-hidden transition-all hover:shadow-md ${
                    !location.is_active ? 'opacity-60' : ''
                  }`}
                >
                  {/* Image */}
                  <div className="relative h-40 bg-gray-100">
                    {location.image_url ? (
                      <Image
                        src={location.image_url}
                        alt={location.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <MapPin className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge variant={location.is_active ? 'default' : 'secondary'}>
                        {location.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {/* Action Menu */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="secondary" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditLocation(location)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleActive(location.id, location.is_active)}
                            disabled={togglingId === location.id}
                          >
                            {location.is_active ? (
                              <>
                                <UserX className="h-4 w-4 mr-2" />
                                Hide
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-4 w-4 mr-2" />
                                Show
                              </>
                            )}
                          </DropdownMenuItem>
                          <AlertDialog open={deleteDialogOpen === location.id} onOpenChange={(open) => setDeleteDialogOpen(open ? location.id : null)}>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                disabled={deletingId === location.id}
                                className="text-destructive"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Location</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{location.name}&quot;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(location.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2">{location.name}</h3>
                    
                    {location.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {location.description}
                      </p>
                    )}

                    <div className="flex items-center text-xs text-muted-foreground mb-4">
                      <Calendar className="h-3 w-3 mr-1" />
                      Added {formatDate(location.created_at)}
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(location.id, location.is_active)}
                            disabled={togglingId === location.id}
                            className="flex-1"
                          >
                            {togglingId === location.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                            ) : location.is_active ? (
                              <>
                                <UserX className="h-3 w-3 mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <UserCheck className="h-3 w-3 mr-1" />
                                Show
                              </>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {location.is_active ? 'Hide location' : 'Show location'}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditLocation(location)}
                            className="flex-1"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit location</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <AlertDialog open={deleteDialogOpen === location.id} onOpenChange={(open) => setDeleteDialogOpen(open ? location.id : null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={deletingId === location.id}
                              >
                                {deletingId === location.id ? (
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Location</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{location.name}&quot;? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(location.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TooltipTrigger>
                        <TooltipContent>Delete location</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  )
} 