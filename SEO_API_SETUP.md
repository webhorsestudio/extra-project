# SEO Testing API Setup

## Required Environment Variables

Add the following environment variable to your `.env.local` file:

```bash
# Google PageSpeed Insights API Key (Optional but recommended)
GOOGLE_PAGESPEED_API_KEY=your_google_pagespeed_api_key_here
```

## Getting Your Google PageSpeed Insights API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the PageSpeed Insights API:
   - Go to "APIs & Services" > "Library"
   - Search for "PageSpeed Insights API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
5. Add the key to your `.env.local` file

## API Endpoints

The SEO testing system includes the following API endpoints:

### Main Testing Endpoint
- `POST /api/seo/test` - Run multiple SEO tests at once

### Individual Test Endpoints
- `POST /api/seo/test/rich-results` - Google Rich Results Test
- `POST /api/seo/test/pagespeed` - Google PageSpeed Insights
- `POST /api/seo/test/mobile-friendly` - Mobile-Friendly Test
- `POST /api/seo/test/structured-data` - Structured Data Analysis
- `POST /api/seo/test/meta-tags` - Meta Tags Analysis
- `POST /api/seo/test/web-vitals` - Core Web Vitals Test

## Usage

### Request Format
```json
{
  "url": "https://example.com"
}
```

### Response Format
```json
{
  "success": true,
  "url": "https://example.com",
  "result": {
    "type": "Test Name",
    "status": "success|warning|error",
    "message": "Test result message",
    "details": "Detailed information",
    "url": "External test URL",
    "score": 85,
    "data": {
      // Additional test data
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Rate Limits

- **Without API Key**: Limited to Google's public API rate limits
- **With API Key**: Higher rate limits (up to 25,000 requests per day)

## Features

### Rich Results Test
- Tests structured data and schema markup
- Validates JSON-LD, Microdata, and RDFa
- Provides detailed feedback on rich snippets

### PageSpeed Insights
- Performance analysis
- SEO scoring
- Accessibility checks
- Best practices validation
- Core Web Vitals metrics

### Mobile-Friendly Test
- Mobile usability analysis
- Viewport optimization
- Touch target sizing
- Font size validation

### Structured Data Analysis
- Comprehensive schema markup detection
- Schema type identification
- Validation recommendations

### Meta Tags Analysis
- Essential meta tags validation
- Open Graph tags analysis
- Twitter Card validation
- Content quality assessment

### Core Web Vitals
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Additional performance metrics
- Detailed recommendations

## Error Handling

All endpoints include comprehensive error handling:
- Invalid URL validation
- Network error handling
- API rate limit handling
- Graceful fallbacks

## Security

- Input validation for all URLs
- Rate limiting protection
- Error message sanitization
- CORS protection
