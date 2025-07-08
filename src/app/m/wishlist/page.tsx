import { createSupabaseServerClientSafe } from '@/lib/supabase/server-fallback';
import MobileWishlistContent from '@/components/mobile/MobileWishlistContent';

async function getWishlistProperties() {
  const supabase = await createSupabaseServerClientSafe();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null; // Return null to indicate user is not signed in

  // Fetch all property_favorites for this user, join with properties and property_images
  const { data, error } = await supabase
    .from('property_favorites')
    .select(`
      id,
      property:properties (
        *,
        property_images (image_url),
        property_configurations (bhk, price, area, bedrooms, bathrooms, ready_by),
        property_locations:property_locations (id, name)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return [];
  // Map to property objects
  return (data || [])
    .map((fav) => fav.property)
    .filter(Boolean);
}

export default async function MobileWishlistPage() {
  const properties = await getWishlistProperties();
  return <MobileWishlistContent properties={properties} />;
} 