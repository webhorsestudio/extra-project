'use client'

import { useState } from 'react'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Trash2, UserX } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { User } from '@/types/user'

interface DeleteUserDialogProps {
  user: User
  onDelete: () => void
  trigger?: React.ReactNode
}

export function DeleteUserDialog({ user, onDelete, trigger }: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }

      // Add bypass header for development mode
      if (process.env.NODE_ENV === 'development') {
        headers['x-bypass-auth'] = 'true'
      }

      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
        headers
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Delete error:', result)
        toast({
          title: 'Error',
          description: `Failed to delete user: ${result.error || 'Unknown error'}`,
          variant: 'destructive',
        })
        return
      }

      toast({
        title: 'Success',
        description: 'User deleted successfully',
      })
      
      setIsOpen(false)
      onDelete()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const defaultTrigger = (
    <Button variant="destructive" size="sm">
      <Trash2 className="h-4 w-4" />
    </Button>
  )

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        {trigger || defaultTrigger}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-red-600" />
            Delete User
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{user.full_name || user.email}</strong>? 
            This action cannot be undone and will permanently remove the user account and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 