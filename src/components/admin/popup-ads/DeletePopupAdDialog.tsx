'use client'

import { PopupAd } from '@/types/popup-ad'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Trash2, AlertTriangle } from 'lucide-react'

interface DeletePopupAdDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  popupAd: PopupAd | null
}

export function DeletePopupAdDialog({
  isOpen,
  onClose,
  onConfirm,
  popupAd
}: DeletePopupAdDialogProps) {
  if (!popupAd) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-600" />
            Delete Popup Ad
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete the popup ad &quot;{popupAd.title}&quot;? 
            This action cannot be undone and will permanently remove the popup ad 
            from both web and mobile layouts.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-1">Warning:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>This popup ad will be immediately removed from all platforms</li>
                <li>Any active campaigns using this ad will be affected</li>
                <li>Analytics and performance data will be lost</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Popup Ad
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
