import { getNewlyLaunchedProperties } from '@/lib/data'
import PropertyCardV2 from './PropertyCardV2'
import Section from './Section'
import PropertyCarousel from './PropertyCarousel'

export default async function NewlyLaunchedProperties() {
  const properties = await getNewlyLaunchedProperties()

  if (!properties || properties.length === 0) {
    return null
  }

  return (
    <PropertyCarousel properties={properties} title="Newly Launched" titleAlign="left" />
  )
} 