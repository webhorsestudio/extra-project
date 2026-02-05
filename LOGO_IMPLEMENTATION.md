# Logo Implementation Guide

## Overview

The logo system has been completely refactored to provide better performance, error handling, and user experience. The implementation includes:

- **Direct image serving** from the API
- **Proper caching** with fallback mechanisms
- **Loading states** and error handling
- **Reusable hooks** for logo management
- **Backward compatibility** with existing systems

## API Endpoints

### 1. `/api/branding/logo` - Direct Image Response
Returns the logo image directly with proper content type headers.

**Response:**
- `200`: Image file with appropriate content type
- `404`: No logo configured
- `500`: Server error

**Headers:**
- `Content-Type`: Image content type (e.g., `image/png`, `image/svg+xml`)
- `Cache-Control`: `public, max-age=3600` (1 hour cache)
- `Access-Control-Allow-Origin`: `*`

### 2. `/api/branding/logo-info` - JSON Response
Returns logo information as JSON for programmatic access.

**Response:**
```json
{
  "logo_url": "https://example.com/logo.png",
  "logo_alt_text": "Company Logo",
  "logo_storage_path": "/branding/logo.png",
  "has_logo": true
}
```

## Components

### Navbar Component
The main navbar component that displays the logo in the header.

**Features:**
- Loading skeleton while fetching logo
- Fallback gradient logo when no logo is configured
- Proper image optimization with Next.js Image component
- Blob URL management for direct image serving

### LogoTest Component
A test component for debugging logo issues.

**Usage:**
```tsx
import LogoTest from '@/components/web/LogoTest'

// Add to any page for testing
<LogoTest />
```

## Hooks

### useLogo Hook
A custom hook for logo management with caching and error handling.

**Usage:**
```tsx
import { useLogo } from '@/hooks/useLogo'

function MyComponent() {
  const { logoUrl, logoAlt, isLoading, error, hasLogo, refetch } = useLogo()
  
  // Use the logo data
}
```

**Return Values:**
- `logoUrl`: The logo URL from settings
- `logoAlt`: Alt text for accessibility
- `isLoading`: Loading state
- `error`: Error message if any
- `hasLogo`: Boolean indicating if logo exists
- `refetch`: Function to refresh logo data

## Database Schema

The logo is stored in the `settings` table:

```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  logo_url TEXT,
  logo_storage_path TEXT,
  logo_alt_text TEXT,
  -- ... other fields
);
```

## Storage

Logos are stored in the `branding` storage bucket with the following structure:
- `logo/` - Logo files
- `favicon/` - Favicon files

## Error Handling

The system handles various error scenarios:

1. **No logo configured**: Shows fallback gradient logo
2. **API errors**: Logs errors and shows fallback
3. **Image loading errors**: Falls back to gradient logo
4. **Network errors**: Graceful degradation

## Performance Optimizations

1. **Caching**: 5-minute cache for logo info
2. **Image optimization**: Next.js Image component
3. **Blob URLs**: Efficient image serving
4. **Lazy loading**: Images load with priority

## Usage Examples

### Basic Usage in Navbar
```tsx
import { useLogo } from '@/hooks/useLogo'

function Navbar() {
  const { logoUrl, logoAlt, isLoading, hasLogo } = useLogo()
  
  if (isLoading) return <Skeleton />
  if (hasLogo) return <Image src={logoUrl} alt={logoAlt} />
  return <FallbackLogo />
}
```

### Custom Logo Component
```tsx
import { useLogo } from '@/hooks/useLogo'

function CustomLogo({ className }: { className?: string }) {
  const { logoUrl, logoAlt, hasLogo } = useLogo()
  
  if (!hasLogo) return null
  
  return (
    <img 
      src={logoUrl} 
      alt={logoAlt} 
      className={className}
    />
  )
}
```

## Testing

Use the LogoTest component to verify logo functionality:

1. **Check if logo loads correctly**
2. **Verify error handling**
3. **Test refresh functionality**
4. **Monitor network requests**

## Troubleshooting

### Common Issues

1. **Logo not showing**: Check if logo is uploaded in admin settings
2. **API errors**: Verify storage bucket exists and has proper policies
3. **CORS issues**: Check Access-Control-Allow-Origin headers
4. **Cache issues**: Use refetch() function to clear cache

### Debug Steps

1. Check browser network tab for API calls
2. Verify logo URL in database
3. Test API endpoints directly
4. Check storage bucket permissions
5. Use LogoTest component for debugging

## Future Enhancements

1. **Multiple logo variants** (light/dark themes)
2. **Logo optimization** (WebP conversion)
3. **CDN integration** for better performance
4. **Logo analytics** (usage tracking)
5. **A/B testing** for different logos 