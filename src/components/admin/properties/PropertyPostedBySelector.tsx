'use client'

import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'
import { PropertyDeveloper } from '@/types/property'
import { Plus, AlertCircle } from 'lucide-react'

interface PropertyPostedBySelectorProps {
  value?: string
  onChange: (value: string) => void
  developerId?: string
  onDeveloperIdChange: (developerId: string | undefined) => void
}

export function PropertyPostedBySelector({
  value,
  onChange,
  developerId,
  onDeveloperIdChange,
}: PropertyPostedBySelectorProps) {
  const [developers, setDevelopers] = useState<PropertyDeveloper[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showManualInput, setShowManualInput] = useState(false)
  const [manualInput, setManualInput] = useState('')

  // Fetch developers on component mount
  useEffect(() => {
    fetchDevelopers()
  }, [])

  const fetchDevelopers = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('PropertyPostedBySelector: Fetching developers...')
      const response = await fetch('/api/admin/properties/developer-selection', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for SSR authentication
      })
      
      console.log('PropertyPostedBySelector: Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('PropertyPostedBySelector: API error:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('PropertyPostedBySelector: Received data:', data)
      
      if (data.developers) {
        setDevelopers(data.developers)
        console.log('PropertyPostedBySelector: Set developers:', data.developers.length)
      } else {
        console.warn('PropertyPostedBySelector: No developers in response')
        setDevelopers([])
      }
    } catch (error) {
      console.error('PropertyPostedBySelector: Error fetching developers:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch developers')
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to fetch developers',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeveloperSelect = async (selectedDeveloperId: string) => {
    const selectedDeveloper = developers.find(d => d.id === selectedDeveloperId)
    if (selectedDeveloper) {
      // Update both the developer_id and posted_by fields
      onDeveloperIdChange(selectedDeveloperId)
      onChange(selectedDeveloper.name)
      setShowManualInput(false)
      
      toast({
        title: 'Success',
        description: `Selected developer: ${selectedDeveloper.name}`,
      })
    }
  }

  const handleManualInput = () => {
    if (manualInput.trim()) {
      onDeveloperIdChange(undefined) // Clear developer_id
      onChange(manualInput.trim())
      toast({
        title: 'Success',
        description: `Set posted by: ${manualInput.trim()}`,
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="developer-select">Property Posted By <span className="text-destructive">*</span></Label>
        
        {developers.length > 0 ? (
          <Select
            value={developerId || ''}
            onValueChange={handleDeveloperSelect}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading developers..." : "Select developer"} />
            </SelectTrigger>
            <SelectContent>
              {developers.map((developer) => (
                <SelectItem key={developer.id} value={developer.id}>
                  {developer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-800">
                No developers available. You can enter the name manually.
              </span>
            </div>
            
            {!showManualInput ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowManualInput(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Enter Name Manually
              </Button>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Enter developer/broker name"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={handleManualInput}
                    disabled={!manualInput.trim()}
                    size="sm"
                  >
                    Set Name
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowManualInput(false)
                      setManualInput('')
                    }}
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Error display */}
        {error && (
          <div className="text-sm text-destructive mt-1">
            Error: {error}
          </div>
        )}
        
        {/* Debug info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-muted-foreground mt-1">
            Developers loaded: {developers.length} | Loading: {isLoading.toString()} | Error: {error || 'none'}
          </div>
        )}
      </div>

      {/* Display selected developer info */}
      {developerId && value && (
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm font-medium">Selected Developer:</p>
          <p className="text-sm text-muted-foreground">{value}</p>
        </div>
      )}
      
      {/* Display manual input info */}
      {!developerId && value && (
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm font-medium">Posted By:</p>
          <p className="text-sm text-muted-foreground">{value}</p>
        </div>
      )}
    </div>
  )
} 