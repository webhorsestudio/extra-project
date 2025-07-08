import { useState, useEffect, useCallback } from 'react'

interface LogoInfo {
  logo_url: string | null
  logo_alt_text: string
  logo_storage_path: string | null
  has_logo: boolean
}

interface UseLogoReturn {
  logoUrl: string | null
  logoAlt: string
  isLoading: boolean
  error: string | null
  hasLogo: boolean
  refetch: () => Promise<void>
}

// Global cache for logo info
let logoCache: LogoInfo | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function useLogo(): UseLogoReturn {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [logoAlt, setLogoAlt] = useState<string>('Company Logo')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasLogo, setHasLogo] = useState(false)

  const fetchLogoInfo = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Check cache first
      const now = Date.now()
      if (logoCache && (now - cacheTimestamp) < CACHE_DURATION) {
        setLogoUrl(logoCache.logo_url)
        setLogoAlt(logoCache.logo_alt_text)
        setHasLogo(logoCache.has_logo)
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/branding/logo-info')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch logo info')
      }

      // Update cache
      logoCache = data
      cacheTimestamp = now

      setLogoUrl(data.logo_url)
      setLogoAlt(data.logo_alt_text)
      setHasLogo(data.has_logo)
    } catch (err) {
      console.error('Error fetching logo info:', err)
      setError(err instanceof Error ? err.message : 'Failed to load logo')
      setHasLogo(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    // Clear cache to force fresh fetch
    logoCache = null
    cacheTimestamp = 0
    await fetchLogoInfo()
  }, [fetchLogoInfo])

  useEffect(() => {
    fetchLogoInfo()
  }, [fetchLogoInfo])

  return {
    logoUrl,
    logoAlt,
    isLoading,
    error,
    hasLogo,
    refetch
  }
} 