import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import PublicListingForm from '@/components/admin/public-listings/PublicListingForm'

interface EditPublicListingPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPublicListingPage({ params }: EditPublicListingPageProps) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: listing, error } = await supabase
    .from('public_listings')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !listing) {
    notFound();
  }

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Edit Public Listing</h1>
      <PublicListingForm listing={listing} />
    </div>
  );
}
