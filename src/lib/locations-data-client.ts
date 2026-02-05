export interface LocationData {
  id: string
  name: string
  description?: string
  image_url?: string
  image_storage_path?: string
  created_at: string
  updated_at: string
}

export async function getLocationsDataClient(): Promise<LocationData[]> {
  try {
    const response = await fetch('/api/locations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.locations || []
  } catch (error) {
    console.error('Error fetching locations:', error)
    return []
  }
} 