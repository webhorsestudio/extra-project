'use client'

import { PublicListing } from '@/types/public-listing'
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

interface DeletePublicListingDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  listing: PublicListing | null
}

export function DeletePublicListingDialog({
  isOpen,
  onClose,
  onConfirm,
  listing,
}: DeletePublicListingDialogProps) {
  if (!listing) return null

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <AlertDialogTitle>Delete Public Listing</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{listing.title}&quot;? This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <div className="py-4">
          <div className="bg-gray-50 rounded-lg p-3 space-y-2">
            <div className="text-sm">
              <span className="font-medium">Type:</span> {listing.type}
            </div>
            <div className="text-sm">
              <span className="font-medium">Status:</span> {listing.status}
            </div>
            <div className="text-sm">
              <span className="font-medium">Slug:</span> /{listing.slug}
            </div>
            {listing.publish_date && (
              <div className="text-sm">
                <span className="font-medium">Publish Date:</span> {new Date(listing.publish_date).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Listing
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
