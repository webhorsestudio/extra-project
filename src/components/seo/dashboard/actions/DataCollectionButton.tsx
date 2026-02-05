'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Database, Loader2, CheckCircle, AlertTriangle, Clock } from 'lucide-react'
import { toast } from 'sonner'

interface DataCollectionButtonProps {
  className?: string
}

interface CollectionStatus {
  hasData: boolean
  lastCollection: string | null
  totalRecords: number
  activeAlerts: number
  dataAge: number | null
}

export function DataCollectionButton({ className = '' }: DataCollectionButtonProps) {
  const [isCollecting, setIsCollecting] = useState(false)
  const [status, setStatus] = useState<CollectionStatus | null>(null)
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)

  // Load status on component mount
  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      setIsLoadingStatus(true)
      const response = await fetch('/api/seo/collect-data/status')
      if (response.ok) {
        const result = await response.json()
        setStatus(result.status)
      }
    } catch (error) {
      console.error('Error loading status:', error)
    } finally {
      setIsLoadingStatus(false)
    }
  }

  const handleCollectData = async () => {
    try {
      setIsCollecting(true)
      
      // Show loading toast
      toast.loading('Collecting SEO data from external APIs...', {
        id: 'data-collection'
      })

      // Trigger data collection
      const response = await fetch('/api/seo/collect-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        await response.json()
        
        // Show success toast
        toast.success('SEO data collected successfully!', {
          id: 'data-collection'
        })
        
        // Reload status
        await loadStatus()
        
        // Refresh the page to show new data
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to collect data')
      }
    } catch (error) {
      console.error('Error collecting data:', error)
      
      // Show error toast
      toast.error(`Failed to collect data: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        id: 'data-collection'
      })
    } finally {
      setIsCollecting(false)
    }
  }

  const getStatusIcon = () => {
    if (isLoadingStatus) return <Loader2 className="h-4 w-4 animate-spin" />
    if (!status?.hasData) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    if (status.dataAge && status.dataAge > 60) return <Clock className="h-4 w-4 text-orange-500" />
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const getStatusText = () => {
    if (isLoadingStatus) return 'Loading...'
    if (!status?.hasData) return 'No Data'
    if (status.dataAge && status.dataAge > 60) return `Data: ${Math.round(status.dataAge)}m ago`
    return `Data: ${status.totalRecords} records`
  }

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm text-gray-600 flex items-center gap-1">
        {getStatusIcon()}
        <span>{getStatusText()}</span>
      </div>
      <Button
        onClick={handleCollectData}
        disabled={isCollecting}
        className={className}
        variant="outline"
        size="sm"
      >
        {isCollecting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Database className="h-4 w-4 mr-2" />
        )}
        {isCollecting ? 'Collecting...' : 'Collect Data'}
      </Button>
    </div>
  )
}
