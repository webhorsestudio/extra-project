# SEO Data Collection Setup

This document explains how to set up automatic SEO data collection from external APIs.

## 🚀 Quick Start

### 1. Environment Variables

Add these environment variables to your `.env.local` file:

```bash
# Google PageSpeed Insights API
GOOGLE_PAGESPEED_API_KEY=your_google_pagespeed_api_key_here

# Optional: Cron job security
CRON_SECRET=your_secure_random_string_here
```

### 2. Get Google PageSpeed API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the PageSpeed Insights API
4. Create credentials (API Key)
5. Copy the API key to your environment variables

### 3. Configure URLs to Monitor

Edit `src/lib/seo/data-collection/config.ts` and update the URLs:

```typescript
export const SEO_COLLECTION_CONFIG = {
  urls: [
    'https://your-actual-domain.com',
    'https://your-actual-domain.com/properties',
    'https://your-actual-domain.com/about',
    // Add more URLs as needed
  ],
  // ... rest of config
}
```

## 📊 Data Collection Features

### Automatic Data Collection

The system collects:

- **Core Web Vitals**: LCP, FID, CLS, FCP, TTFB
- **Page Speed Scores**: Mobile and Desktop
- **Analytics Data**: Page views, bounce rate, session duration
- **SEO Metrics**: Organic traffic, keyword rankings
- **Performance Alerts**: Automatic alert generation

### Data Sources

1. **Google PageSpeed Insights API**: Real performance metrics
2. **Analytics Simulation**: Realistic mock data for testing
3. **Database Storage**: All data stored in `seo_monitoring_data` table

## 🔧 Manual Data Collection

### Via Admin Interface

1. Go to SEO Dashboard
2. Click "Collect SEO Data" button
3. Wait for collection to complete
4. Refresh to see new data

### Via API

```bash
# Trigger data collection
curl -X POST http://localhost:3000/api/seo/collect-data

# Check collection status
curl http://localhost:3000/api/seo/collect-data/status
```

## ⏰ Automatic Collection (Cron Jobs)

### Using Vercel Cron Jobs

Add to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/seo-data-collection",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

### Using External Cron Services

Set up a cron job to call:
```
https://your-domain.com/api/cron/seo-data-collection
```

With authorization header:
```
Authorization: Bearer your_cron_secret
```

## 📈 Monitoring & Alerts

### Performance Thresholds

The system automatically generates alerts when:

- LCP > 2.5 seconds
- FID > 100 milliseconds  
- CLS > 0.1
- Mobile Page Speed < 50
- Desktop Page Speed < 70
- Organic Traffic < 100

### Alert Types

- **High Priority**: Critical performance issues
- **Medium Priority**: Performance warnings
- **Low Priority**: Traffic and ranking issues

## 🛠️ Troubleshooting

### Common Issues

1. **No data showing**: Run manual collection first
2. **API errors**: Check Google PageSpeed API key
3. **Database errors**: Verify Supabase connection
4. **Rate limits**: Google API has daily limits

### Debug Mode

Check the browser console and server logs for detailed error messages.

## 📝 Configuration Options

### Collection Intervals

```typescript
intervals: {
  pageSpeed: 60,      // Every hour
  analytics: 30,      // Every 30 minutes
  alerts: 15          // Every 15 minutes
}
```

### Performance Thresholds

```typescript
thresholds: {
  lcp: 2.5,           // Largest Contentful Paint
  fid: 100,           // First Input Delay
  cls: 0.1,           // Cumulative Layout Shift
  pageSpeedMobile: 50, // Mobile Page Speed
  pageSpeedDesktop: 70 // Desktop Page Speed
}
```

## 🔒 Security

- API keys are stored in environment variables
- Cron jobs can be secured with authorization tokens
- Database access uses Row Level Security (RLS)

## 📊 Data Structure

All collected data is stored in the `seo_monitoring_data` table with:

- Performance metrics (Core Web Vitals)
- Page speed scores (Mobile/Desktop)
- Analytics data (Views, Traffic, etc.)
- Timestamps for tracking data age
- URL-specific data for different pages

## 🚀 Next Steps

1. Set up your Google PageSpeed API key
2. Configure your domain URLs
3. Run initial data collection
4. Set up automatic cron jobs
5. Monitor the Performance tab for real data!

The system will now automatically collect real performance data and populate your SEO Dashboard with actual metrics instead of showing 0s.
