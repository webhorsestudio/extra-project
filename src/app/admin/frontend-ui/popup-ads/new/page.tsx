import PopupAdForm from '@/components/admin/popup-ads/PopupAdForm'

export default function NewPopupAdPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Popup Ad</h1>
        <p className="text-muted-foreground">
          Create a new popup advertisement for web and mobile layouts
        </p>
      </div>

      <PopupAdForm popupAdId={undefined} />
    </div>
  )
}
