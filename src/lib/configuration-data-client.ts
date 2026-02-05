export interface ConfigurationData {
  propertyTypes: string[]
  bhkOptions: number[]
}

export async function getConfigurationDataClient(): Promise<ConfigurationData> {
  try {
    const response = await fetch('/api/configuration', {
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
    return data.configuration || {
      propertyTypes: ['Any', 'Apartment', 'House', 'Villa', 'Commercial'],
      bhkOptions: [0, 1, 2, 3, 4, 5]
    }
  } catch (error) {
    console.error('Error fetching configuration data:', error)
    return {
      propertyTypes: ['Any', 'Apartment', 'House', 'Villa', 'Commercial'],
      bhkOptions: [0, 1, 2, 3, 4, 5]
    }
  }
} 