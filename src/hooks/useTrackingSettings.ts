'use client'

import { useState, useEffect } from 'react'

interface TrackingSettings {
  google_analytics_id?: string
  google_tag_manager_id?: string
}

export function useTrackingSettings() {
  const [settings, setSettings] = useState<TrackingSettings>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTrackingSettings() {
      try {
        setLoading(true)
        const response = await fetch('/api/settings/public')
        
        if (!response.ok) {
          throw new Error('Failed to fetch tracking settings')
        }
        
        const data = await response.json()
        setSettings({
          google_analytics_id: data.settings?.google_analytics_id,
          google_tag_manager_id: data.settings?.google_tag_manager_id,
        })
      } catch (err) {
        console.error('Error fetching tracking settings:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchTrackingSettings()
  }, [])

  return { settings, loading, error }
}
