import ServerLayout from '@/components/web/ServerLayout';
import WebHome from './web/page';
import { generateHomeMetadata, getSEOConfig, generateWebsiteStructuredData, generateOrganizationStructuredData, getOrganizationData } from '@/lib/seo';
import { getLatestProperties } from '@/lib/data';
import { Metadata } from 'next';

// Add caching strategy - revalidate every hour
export const revalidate = 3600

// Generate SEO metadata for root page (same as web page)
export async function generateMetadata(): Promise<Metadata> {
  try {
    // Fetch data for metadata generation
    const [seoConfig, latestPropertiesResult, organizationData] = await Promise.allSettled([
      getSEOConfig(),
      getLatestProperties(20),
      getOrganizationData()
    ])

    const config = seoConfig.status === 'fulfilled' ? seoConfig.value : null
    const latestProperties = latestPropertiesResult.status === 'fulfilled' ? latestPropertiesResult.value : []
    const orgData = organizationData.status === 'fulfilled' ? organizationData.value : null

    // Generate base metadata
    const metadata = generateHomeMetadata(latestProperties, config || undefined)

    // Add structured data
    const structuredData = []
    
    // Add website structured data
    if (config) {
      structuredData.push(generateWebsiteStructuredData(config))
    }

    // Add organization structured data
    if (orgData) {
      structuredData.push(generateOrganizationStructuredData(orgData, config || undefined))
    }

    // Add structured data to metadata
    if (structuredData.length > 0) {
      metadata.other = {
        'application/ld+json': JSON.stringify(structuredData.length === 1 ? structuredData[0] : structuredData)
      }
    }

    return metadata
  } catch (error) {
    console.error('Error generating root page metadata:', error)
    // Return fallback metadata
    return generateHomeMetadata()
  }
}

export default async function RootPage() {
  return (
    <ServerLayout showCategoryBar={true}>
      <WebHome />
    </ServerLayout>
  );
} 