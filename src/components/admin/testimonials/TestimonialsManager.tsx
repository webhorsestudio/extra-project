'use client'

import { useMemo, useRef, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Plus, Pencil, Trash, ImagePlus, Loader2, X } from 'lucide-react'
import Image from 'next/image'
import type { Testimonial } from '@/types/testimonial'
import { uploadFile } from '@/lib/uploadFile'

interface TestimonialsManagerProps {
  initialTestimonials: Testimonial[]
}

const emptyFormState = {
  quote: '',
  name: '',
  title: '',
  avatar_url: '',
  order_index: 0,
  is_active: true,
}

export function TestimonialsManager({ initialTestimonials }: TestimonialsManagerProps) {
  const { toast } = useToast()
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null)
  const [formState, setFormState] = useState({ ...emptyFormState })
  const [testimonialToDelete, setTestimonialToDelete] = useState<Testimonial | null>(null)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const sortedTestimonials = useMemo(() => {
    return [...testimonials].sort((a, b) => {
      if (a.order_index === b.order_index) {
        return a.created_at.localeCompare(b.created_at)
      }
      return a.order_index - b.order_index
    })
  }, [testimonials])

  const filteredTestimonials = useMemo(() => {
    if (!search) return sortedTestimonials
    return sortedTestimonials.filter((testimonial) => {
      const value = `${testimonial.name} ${testimonial.title} ${testimonial.quote}`.toLowerCase()
      return value.includes(search.toLowerCase())
    })
  }, [sortedTestimonials, search])

  const openCreateDialog = () => {
    setEditingTestimonial(null)
    setFormState({ ...emptyFormState, order_index: testimonials.length })
    setDialogOpen(true)
  }

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial)
    setFormState({
      quote: testimonial.quote,
      name: testimonial.name,
      title: testimonial.title,
      avatar_url: testimonial.avatar_url ?? '',
      order_index: testimonial.order_index,
      is_active: testimonial.is_active,
    })
    setDialogOpen(true)
  }

  const closeDialog = () => {
    setDialogOpen(false)
    setEditingTestimonial(null)
    setFormState({ ...emptyFormState })
  }

  const handleInputChange = (field: keyof typeof formState) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = field === 'order_index' ? Number(event.target.value) : event.target.value
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive',
      })
      event.target.value = ''
      return
    }

    setIsUploadingAvatar(true)
    try {
      const { publicUrl } = await uploadFile(file, 'property-images', 'testimonials')
      setFormState((prev) => ({ ...prev, avatar_url: publicUrl }))
      toast({
        title: 'Avatar uploaded',
        description: 'The testimonial avatar image has been uploaded successfully.',
      })
    } catch (error) {
      console.error('Error uploading testimonial avatar:', error)
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload avatar image.',
        variant: 'destructive',
      })
    } finally {
      setIsUploadingAvatar(false)
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  const handleRemoveAvatar = () => {
    setFormState((prev) => ({ ...prev, avatar_url: '' }))
    toast({
      title: 'Avatar removed',
      description: 'The testimonial avatar has been cleared.',
    })
  }

  const handleToggleActive = async (testimonial: Testimonial, value: boolean) => {
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonial.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: value }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to update testimonial')
      }

      const { testimonial: updated } = await response.json()
      setTestimonials((prev) =>
        prev.map((item) => (item.id === testimonial.id ? { ...item, ...updated } : item)),
      )
      toast({
        title: 'Updated',
        description: `${testimonial.name}'s testimonial is now ${value ? 'active' : 'inactive'}.`,
      })
    } catch (error) {
      console.error('Error toggling testimonial:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update testimonial',
        variant: 'destructive',
      })
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formState.quote.trim() || !formState.name.trim() || !formState.title.trim()) {
      toast({
        title: 'Missing details',
        description: 'Quote, name, and title are required.',
        variant: 'destructive',
      })
      return
    }

    setIsSaving(true)

    try {
      const payload = {
        quote: formState.quote.trim(),
        name: formState.name.trim(),
        title: formState.title.trim(),
        avatar_url: formState.avatar_url ? formState.avatar_url : null,
        order_index: Number.isFinite(formState.order_index) ? formState.order_index : 0,
        is_active: formState.is_active,
      }

      let response: Response
      if (editingTestimonial) {
        response = await fetch(`/api/admin/testimonials/${editingTestimonial.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      } else {
        response = await fetch('/api/admin/testimonials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save testimonial')
      }

      const data = await response.json()
      const savedTestimonial: Testimonial = editingTestimonial ? data.testimonial : data.testimonial

      setTestimonials((prev) => {
        const next = editingTestimonial
          ? prev.map((item) => (item.id === savedTestimonial.id ? savedTestimonial : item))
          : [...prev, savedTestimonial]
        return next
      })

      toast({
        title: editingTestimonial ? 'Testimonial updated' : 'Testimonial created',
        description: `${payload.name}'s testimonial has been saved.`,
      })
      closeDialog()
    } catch (error) {
      console.error('Error saving testimonial:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save testimonial',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  const refreshTestimonials = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/admin/testimonials?includeInactive=true')
      if (!response.ok) {
        throw new Error('Failed to refresh testimonials')
      }
      const { testimonials: fresh } = await response.json()
      setTestimonials(fresh || [])
      toast({
        title: 'Refreshed',
        description: 'Testimonials list has been updated.',
      })
    } catch (error) {
      console.error('Error refreshing testimonials:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to refresh testimonials',
        variant: 'destructive',
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const openDeleteDialog = (testimonial: Testimonial) => {
    setTestimonialToDelete(testimonial)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!testimonialToDelete) return
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonialToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete testimonial')
      }

      setTestimonials((prev) => prev.filter((item) => item.id !== testimonialToDelete.id))
      toast({
        title: 'Deleted',
        description: `${testimonialToDelete.name}'s testimonial has been removed.`,
      })
    } catch (error) {
      console.error('Error deleting testimonial:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete testimonial',
        variant: 'destructive',
      })
    } finally {
      setDeleteDialogOpen(false)
      setTestimonialToDelete(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Homepage Testimonials</h1>
          <p className="text-muted-foreground">
            Curate the client stories that appear on the public homepage testimonial carousel.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={refreshTestimonials}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={openCreateDialog} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Testimonial
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <span>Testimonials</span>
            <Input
              placeholder="Search by name, title, or quote..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="max-w-xs"
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead className="hidden lg:table-cell">Quote Preview</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[140px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTestimonials.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      No testimonials found. Try adjusting your search or add a new testimonial.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTestimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                      <TableCell>
                        <span className="font-medium">{testimonial.order_index}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold">{testimonial.name}</span>
                          {testimonial.avatar_url ? (
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {testimonial.avatar_url}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">No avatar</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{testimonial.title}</TableCell>
                      <TableCell className="hidden lg:table-cell max-w-md truncate">
                        {testimonial.quote}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={testimonial.is_active}
                            onCheckedChange={(value) => handleToggleActive(testimonial, value)}
                          />
                          <Badge variant={testimonial.is_active ? 'default' : 'outline'}>
                            {testimonial.is_active ? 'Active' : 'Hidden'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(testimonial)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit testimonial</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openDeleteDialog(testimonial)}
                        >
                          <Trash className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Delete testimonial</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground">
            Testimonials are displayed on the homepage in ascending order. Active testimonials appear
            in the public carousel.
          </p>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            </DialogTitle>
            <DialogDescription>
              Provide the quote, attribution, and optional avatar URL shown in the homepage carousel.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quote">Quote</Label>
              <Textarea
                id="quote"
                placeholder="Share the client story or experience..."
                value={formState.quote}
                onChange={handleInputChange('quote')}
                rows={4}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Client name"
                  value={formState.name}
                  onChange={handleInputChange('name')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title / Context</Label>
                <Input
                  id="title"
                  placeholder="e.g. Homeowner • Mumbai"
                  value={formState.title}
                  onChange={handleInputChange('title')}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Label>Avatar Image (optional)</Label>
                <div className="rounded-lg border border-dashed border-slate-300 p-4 dark:border-slate-700">
                  {formState.avatar_url ? (
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 overflow-hidden rounded-full border border-slate-200 dark:border-slate-700">
                        <Image
                          src={formState.avatar_url}
                          alt={formState.name || 'Uploaded avatar'}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 items-center justify-between gap-3">
                        <div className="text-sm text-slate-600 dark:text-slate-300">
                          <p className="font-medium">Avatar uploaded</p>
                          <p className="text-xs text-slate-500">Remove to upload a different image.</p>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleRemoveAvatar}
                          className="gap-1"
                        >
                          <X className="h-4 w-4" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="rounded-full bg-blue-500/10 p-3 text-blue-600 dark:bg-blue-500/20 dark:text-blue-200">
                        {isUploadingAvatar ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                          <ImagePlus className="h-6 w-6" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Upload avatar image
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Recommended 200x200px, PNG or JPG up to 5MB.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => avatarInputRef.current?.click()}
                          disabled={isUploadingAvatar}
                          className="gap-1"
                        >
                          <ImagePlus className="h-4 w-4" />
                          Upload
                        </Button>
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="order_index">Display order</Label>
                <Input
                  id="order_index"
                  type="number"
                  min={0}
                  value={formState.order_index}
                  onChange={handleInputChange('order_index')}
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first in the carousel.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-1">
                <Label htmlFor="is_active">Visible on homepage</Label>
                <p className="text-xs text-muted-foreground">
                  Toggle to hide this testimonial without deleting it.
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formState.is_active}
                onCheckedChange={(value) =>
                  setFormState((prev) => ({ ...prev, is_active: value }))
                }
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeDialog} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : editingTestimonial ? 'Update Testimonial' : 'Create Testimonial'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete testimonial</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove{' '}
              <span className="font-semibold">
                {testimonialToDelete?.name ?? 'this testimonial'}
              </span>
              . You can create it again later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


