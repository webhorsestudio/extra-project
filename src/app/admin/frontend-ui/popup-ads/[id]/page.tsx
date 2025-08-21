import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import PopupAdForm from '@/components/admin/popup-ads/PopupAdForm'

interface EditPopupAdPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPopupAdPage({ params }: EditPopupAdPageProps) {
  const { id } = await params
  const supabase = await createSupabaseAdminClient()
  
  // Fetch popup ad data server-side
  const { data: popupAd, error } = await supabase
    .from('popup_ads')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !popupAd) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Popup Ad</h1>
                            <p className="text-muted-foreground">
                      Update popup advertisement &quot;{popupAd.title}&quot;
                    </p>
      </div>

      <PopupAdForm popupAdId={id} />
    </div>
  )
}
