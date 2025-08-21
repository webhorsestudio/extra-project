import { createSupabaseAdminClient } from '@/lib/supabase/admin'
import PopupAdsList from '@/components/admin/popup-ads/PopupAdsList'

export default async function PopupAdsPage() {
  const supabase = await createSupabaseAdminClient()
  
  // Fetch popup ads data server-side
  const { data: popupAds, error } = await supabase
    .from('popup_ads')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching popup ads:', error)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Popup Ads</h1>
          <p className="text-muted-foreground">
            Manage popup advertisements for web and mobile layouts
          </p>
        </div>
      </div>

      <PopupAdsList initialPopupAds={popupAds || []} />
    </div>
  )
}
