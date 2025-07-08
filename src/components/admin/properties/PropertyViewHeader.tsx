"use client"

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit, Copy, Archive, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface PropertyViewHeaderProps {
  propertyId: string
  title: string
  status?: string
  is_verified?: boolean
}

export default function PropertyViewHeader({ propertyId, title, status = 'Active', is_verified = false }: PropertyViewHeaderProps) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Placeholder handlers for actions
  const handleDuplicate = () => {
    // TODO: Implement duplicate logic
    alert('Duplicate property (not implemented)')
  }
  const handleArchive = () => {
    // TODO: Implement archive logic
    alert('Archive property (not implemented)')
  }
  const handleDelete = () => {
    // TODO: Implement delete logic
    alert('Delete property (not implemented)')
    setDeleteOpen(false)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b mb-6">
      <div className="flex items-center gap-4 min-w-0">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{title}</h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={status === 'Active' ? 'default' : 'secondary'} className="text-xs px-2 py-0.5">
              {status}
            </Badge>
            {is_verified ? (
              <Badge className="bg-green-100 text-green-800 border-green-200 text-xs px-2 py-0.5">Verified</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">Not Verified</Badge>
            )}
          </div>
        </div>
      </div>
      <TooltipProvider>
        <div className="flex items-center gap-2 flex-wrap">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/admin/properties/${propertyId}`)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit Property</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDuplicate}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
            </TooltipTrigger>
            <TooltipContent>Duplicate Property</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleArchive}
                className="flex items-center gap-2"
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive Property</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Property</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this property? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </TooltipTrigger>
            <TooltipContent>Delete Property</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    </div>
  )
} 