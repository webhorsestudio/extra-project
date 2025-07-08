# Mobile API Scaffold Documentation

## Overview

This document outlines the mobile API structure created for the mobile layout. The mobile API is designed to be lightweight, optimized for mobile devices, and separate from the web/admin APIs to allow for mobile-specific optimizations.

## API Structure

```
src/app/api/mobile/
├── branding/
│   └── route.ts              # Branding data (logo, company name, tagline)
├── locations/
│   └── route.ts              # Locations for filter modal
├── configurations/
│   └── route.ts              # Property types, BHK, price ranges
├── properties/
│   └── route.ts              # Properties with filtering
├── user/
│   └── route.ts              # User session and profile
└── footer/
    └── route.ts              # Footer data (if needed)
```

## Endpoint Details

### 1. `/api/mobile/branding`

**Purpose:** Provides essential branding data for mobile layout header.

**Response:**
```json
{
  "logo_url": "https://...",
  "company_name": "Extra Realty",
  "company_tagline": "Find your perfect home",
  "site_title": "Property Search"
}
```

**Usage:** Mobile layout header, filter modal branding.

---

### 2. `/api/mobile/locations`

**Purpose:** Provides locations data for the filter modal.

**Query Parameters:**
- `search` (optional): Search locations by name

**Response:**
```json
{
  "locations": [
    {
      "id": "uuid",
      "name": "Downtown",
      "description": "City center area",
      "image_url": "https://...",
      "property_count": 25
    }
  ],
  "total": 10
}
```

**Usage:** Filter modal location dropdown.

---

### 3. `/api/mobile/configurations`

**Purpose:** Provides property configuration options for filters.

**Response:**
```json
{
  "bhk_options": [
    { "value": 1, "label": "1 BHK" },
    { "value": 2, "label": "2 BHK" },
    { "value": 3, "label": "3 BHK" }
  ],
  "property_types": [
    { "value": "Apartment", "label": "Apartment" },
    { "value": "Villa", "label": "Villa" }
  ],
  "price_ranges": [
    { "value": "0-50", "label": "Under 50 Lacs", "min": 0, "max": 5000000 },
    { "value": "50-100", "label": "50 Lacs - 1 Cr", "min": 5000000, "max": 10000000 }
  ],
  "total_configurations": 150
}
```

**Usage:** Filter modal configuration and budget dropdowns.

---

### 4. `/api/mobile/properties`

**Purpose:** Provides properties data with filtering support.

**Query Parameters:**
- `search` (optional): Text search in title, description, location
- `location` (optional): Filter by location ID
- `type` (optional): Filter by property type
- `bhk` (optional): Filter by BHK count
- `min_price` (optional): Minimum price in Lacs
- `max_price` (optional): Maximum price in Lacs

**Response:**
```json
{
  "properties": [
    {
      "id": "uuid",
      "title": "Modern 2BHK Apartment",
      "description": "Beautiful apartment in prime location",
      "location": "Downtown",
      "location_data": { "id": "uuid", "name": "Downtown" },
      "price": 7500000,
      "bhk": 2,
      "area": 1200,
      "bedrooms": 2,
      "bathrooms": 2,
      "image_url": "https://...",
      "created_at": "2024-01-01T00:00:00Z",
      "property_collection": "Premium"
    }
  ],
  "count": 25,
  "filters": {
    "search": "apartment",
    "location": "uuid",
    "type": "Apartment",
    "bhk": "2",
    "minPrice": "50",
    "maxPrice": "100"
  }
}
```

**Usage:** Properties listing, search results, filtered properties.

---

### 5. `/api/mobile/user`

**Purpose:** Provides user session and profile data.

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "profile": {
    "id": "uuid",
    "full_name": "John Doe",
    "email": "user@example.com",
    "avatar": "https://...",
    "role": "customer",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "isAuthenticated": true
}
```

**Usage:** User authentication, profile display, personalized features.

---

### 6. `/api/mobile/footer`

**Purpose:** Provides footer data for mobile layout.

**Response:**
```json
{
  "contact": {
    "email": "contact@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City"
  },
  "social": {
    "facebook": "https://facebook.com/...",
    "twitter": "https://twitter.com/...",
    "instagram": "https://instagram.com/...",
    "linkedin": "https://linkedin.com/...",
    "youtube": "https://youtube.com/...",
    "tiktok": "https://tiktok.com/...",
    "whatsapp": "https://wa.me/..."
  },
  "website": "https://example.com"
}
```

**Usage:** Mobile footer (if implemented).

---

## Data Fetching Library

### File: `src/lib/mobile-data.ts`

Provides server-side and client-side functions for mobile data fetching:

**Server-side functions (for SSR):**
- `getMobileBrandingData()`: Fetch branding data server-side
- `getMobileLocationsData()`: Fetch locations data server-side
- `getMobileUserData()`: Fetch user data server-side

**Client-side functions (for client components):**
- `getMobileBrandingDataClient()`: Fetch branding data client-side
- `getMobileLocationsDataClient()`: Fetch locations data client-side
- `getMobileUserDataClient()`: Fetch user data client-side

**Types:**
- `MobileBrandingData`
- `MobileLocationData`
- `MobileConfigurationData`
- `MobilePropertyData`
- `MobileUserData`
- `MobileFooterData`

---

## Implementation Strategy

### 1. Server-Side Rendering (SSR)
- Use server-side functions in mobile layout components
- Fetch data in parallel using `Promise.allSettled()`
- Pass initial data to client components

### 2. Client-Side Hydration
- Use client-side functions for interactive features
- Fetch fresh data for filter modal interactions
- Handle loading states and error boundaries

### 3. Performance Optimizations
- Cache headers for static data (5 minutes)
- Mobile-optimized payloads (only required fields)
- Parallel data fetching where possible

### 4. Error Handling
- Graceful fallbacks for failed API calls
- Default data for critical components
- Error boundaries for client components

---

## Usage Examples

### Mobile Layout Component
```typescript
// Server component
import { getMobileBrandingData, getMobileLocationsData } from '@/lib/mobile-data'

export default async function MobileLayout({ children }) {
  const [brandingData, locationsData] = await Promise.allSettled([
    getMobileBrandingData(),
    getMobileLocationsData()
  ])

  return (
    <ClientMobileLayout
      initialBrandingData={brandingData.status === 'fulfilled' ? brandingData.value : null}
      initialLocationsData={locationsData.status === 'fulfilled' ? locationsData.value : []}
    >
      {children}
    </ClientMobileLayout>
  )
}
```

### Filter Modal Component
```typescript
// Client component
import { getMobileLocationsDataClient, getMobileConfigurationsDataClient } from '@/lib/mobile-data'

export default function MobileFilterModal() {
  const [locations, setLocations] = useState([])
  const [configurations, setConfigurations] = useState(null)

  useEffect(() => {
    // Fetch data when modal opens
    Promise.all([
      getMobileLocationsDataClient(),
      getMobileConfigurationsDataClient()
    ]).then(([locationsData, configData]) => {
      setLocations(locationsData)
      setConfigurations(configData)
    })
  }, [])

  // Render filter options...
}
```

---

## Next Steps

1. **Test all endpoints** to ensure they return correct data
2. **Update mobile layout components** to use the new API endpoints
3. **Implement error boundaries** for robust error handling
4. **Add loading states** for better UX
5. **Optimize performance** with caching and lazy loading
6. **Add TypeScript types** for better development experience

---

## Notes

- All endpoints use Supabase admin client for consistent data access
- Mobile API is separate from web API to allow for mobile-specific optimizations
- Endpoints are designed to be lightweight and fast for mobile devices
- Error handling includes fallbacks to ensure mobile layout always works
- Cache headers are set for better performance 