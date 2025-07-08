import { createSupabaseServerClientSafe } from '@/lib/supabase/server-fallback';
import PropertyCardV2 from '@/components/web/PropertyCardV2';
import ServerLayout from '@/components/web/ServerLayout';
import WishlistContent from '@/components/web/WishlistContent';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

async function getWishlistProperties() {
  const supabase = await createSupabaseServerClientSafe();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

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

export default async function WishlistPage() {
  const properties = await getWishlistProperties();
  return (
    <ServerLayout showCategoryBar={false}>
      <WishlistContent properties={properties} />
    </ServerLayout>
  );
} 