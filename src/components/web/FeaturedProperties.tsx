import { getFeaturedProperties } from '@/lib/data'
import PropertyCardV2 from './PropertyCardV2'
import Section from './Section'
import PropertyCarousel from './PropertyCarousel'

export default async function FeaturedProperties() {
  const properties = await getFeaturedProperties()

  if (!properties || properties.length === 0) {
    return null
  }

  return (
    <PropertyCarousel properties={properties} title="Featured Properties" titleAlign="left" />
  )
} 