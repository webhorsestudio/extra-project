"use client"

import { useState } from 'react'
import { Edit, List } from 'lucide-react'
import { AddLocationForm } from '@/components/admin/properties/locations/AddLocationForm'
import { LocationList } from '@/components/admin/properties/locations/LocationList'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus } from 'lucide-react'

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

export default function LocationClient() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [activeTab, setActiveTab] = useState('list')

  const handleLocationAdded = () => {
    setRefreshTrigger(prev => prev + 1)
    setActiveTab('list')
    setEditingLocation(null)
  }

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location)
    setActiveTab('add')
  }

  const handleCancelEdit = () => {
    setEditingLocation(null)
    setActiveTab('list')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Location Management</h1>
          <p className="text-muted-foreground">
            Manage property locations and areas
          </p>
        </div>
        {editingLocation && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Edit className="h-4 w-4" />
            Editing: {editingLocation.name}
          </div>
        )}
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            All Locations
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            {editingLocation ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {editingLocation ? 'Edit Location' : 'Add Location'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          <LocationList 
            refreshTrigger={refreshTrigger} 
            onEditLocation={handleEditLocation}
            isAuthenticated={true}
          />
        </TabsContent>

        <TabsContent value="add" className="space-y-6">
          <AddLocationForm 
            onLocationAdded={handleLocationAdded}
            editingLocation={editingLocation}
            onCancelEdit={handleCancelEdit}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 