import { getTopLocationsWithPropertyCount } from '@/lib/locations-data-server'
import ClientLocalitiesCarousel from './LocalitiesYouMayLikeCarousel'

export default async function LocalitiesYouMayLike() {
  const locations = await getTopLocationsWithPropertyCount(20)
  if (!locations || locations.length === 0) return null

  return (
    <section className="py-4 sm:py-6 lg:py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold mb-6 text-left">Localities you may like</h2>
        <ClientLocalitiesCarousel locations={locations} />
      </div>
    </section>
  )
} 