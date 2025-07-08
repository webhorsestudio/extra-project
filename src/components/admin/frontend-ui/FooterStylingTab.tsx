"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { Palette, Type, Droplets, Eye, Loader2, Save } from 'lucide-react'

export default function FooterStylingTab() {
  const { toast } = useToast()
  const [styling, setStyling] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const fetchStyling = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch('/api/admin/footer/styling')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch footer styling')
        setStyling(data.styling)
        setForm(data.styling)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStyling()
    // Check admin (naive: if API returns styling, assume admin for now)
    fetch('/api/admin/footer/layout').then(r => r.json()).then(d => {
      setIsAdmin(!d.error)
    })
  }, [])

  const handleChange = (field: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/footer/styling', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save footer styling')
      setStyling(data.styling)
      setForm(data.styling)
      toast({ title: 'Success', description: 'Footer styling saved.' })
    } catch (err: any) {
      setError(err.message)
      toast({ title: 'Error', description: err.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const fontSizeOptions = [
    { value: 'text-xs', label: 'Extra Small' },
    { value: 'text-sm', label: 'Small' },
    { value: 'text-base', label: 'Base' },
    { value: 'text-lg', label: 'Large' },
  ]

  const fontWeightOptions = [
    { value: 'font-normal', label: 'Normal' },
    { value: 'font-medium', label: 'Medium' },
    { value: 'font-semibold', label: 'Semibold' },
    { value: 'font-bold', label: 'Bold' },
  ]

  const paddingOptions = [
    { value: 'py-8', label: 'Compact' },
    { value: 'py-12', label: 'Normal' },
    { value: 'py-16', label: 'Spacious' },
  ]

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
  }
  if (error) {
    return <div className="text-red-500 text-center py-8">{error}</div>
  }
  if (!styling) {
    return <div className="text-center py-8 text-muted-foreground">No footer styling found.</div>
  }

  return (
    <div className="space-y-6">
      {/* Color Scheme */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Color Scheme
          </CardTitle>
          <CardDescription>
            Customize the colors used in the footer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bg-color">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="bg-color"
                  type="color"
                  value={form.background_color || '#000000'}
                  onChange={e => handleChange('background_color', e.target.value)}
                  className="w-16 h-10"
                  disabled={!isAdmin}
                />
                <Input
                  value={form.background_color || ''}
                  onChange={e => handleChange('background_color', e.target.value)}
                  placeholder="#000000"
                  disabled={!isAdmin}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="text-color">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="text-color"
                  type="color"
                  value={form.text_color || '#ffffff'}
                  onChange={e => handleChange('text_color', e.target.value)}
                  className="w-16 h-10"
                  disabled={!isAdmin}
                />
                <Input
                  value={form.text_color || ''}
                  onChange={e => handleChange('text_color', e.target.value)}
                  placeholder="#ffffff"
                  disabled={!isAdmin}
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="link-color">Link Color</Label>
              <div className="flex gap-2">
                <Input
                  id="link-color"
                  type="color"
                  value={form.link_color || '#9ca3af'}
                  onChange={e => handleChange('link_color', e.target.value)}
                  className="w-16 h-10"
                  disabled={!isAdmin}
                />
                <Input
                  value={form.link_color || ''}
                  onChange={e => handleChange('link_color', e.target.value)}
                  placeholder="#9ca3af"
                  disabled={!isAdmin}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-hover-color">Link Hover Color</Label>
              <div className="flex gap-2">
                <Input
                  id="link-hover-color"
                  type="color"
                  value={form.link_hover_color || '#ffffff'}
                  onChange={e => handleChange('link_hover_color', e.target.value)}
                  className="w-16 h-10"
                  disabled={!isAdmin}
                />
                <Input
                  value={form.link_hover_color || ''}
                  onChange={e => handleChange('link_hover_color', e.target.value)}
                  placeholder="#ffffff"
                  disabled={!isAdmin}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="border-color">Border Color</Label>
            <div className="flex gap-2">
              <Input
                id="border-color"
                type="color"
                value={form.border_color || '#374151'}
                onChange={e => handleChange('border_color', e.target.value)}
                className="w-16 h-10"
                disabled={!isAdmin}
              />
              <Input
                value={form.border_color || ''}
                onChange={e => handleChange('border_color', e.target.value)}
                placeholder="#374151"
                disabled={!isAdmin}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Typography
          </CardTitle>
          <CardDescription>
            Configure font sizes and weights for different elements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="heading-font-size">Heading Font Size</Label>
              <Select
                value={form.heading_font_size}
                onValueChange={value => handleChange('heading_font_size', value)}
                disabled={!isAdmin}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  {fontSizeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="body-font-size">Body Font Size</Label>
              <Select
                value={form.body_font_size}
                onValueChange={value => handleChange('body_font_size', value)}
                disabled={!isAdmin}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  {fontSizeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="link-font-size">Link Font Size</Label>
              <Select
                value={form.link_font_size}
                onValueChange={value => handleChange('link_font_size', value)}
                disabled={!isAdmin}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  {fontSizeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-weight">Font Weight</Label>
              <Select
                value={form.font_weight}
                onValueChange={value => handleChange('font_weight', value)}
                disabled={!isAdmin}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font weight" />
                </SelectTrigger>
                <SelectContent>
                  {fontWeightOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Spacing & Layout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplets className="h-5 w-5" />
            Spacing & Layout
          </CardTitle>
          <CardDescription>
            Adjust spacing and layout settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="padding">Footer Padding</Label>
            <Select
              value={form.padding_bottom}
              onValueChange={value => handleChange('padding_bottom', value)}
              disabled={!isAdmin}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select padding" />
              </SelectTrigger>
              <SelectContent>
                {paddingOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      {/* Visual Effects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visual Effects
          </CardTitle>
          <CardDescription>
            Configure shadows, borders, and other visual effects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-shadows">Show Shadows</Label>
              <p className="text-sm text-gray-500">Add shadow effects to footer elements</p>
            </div>
            <Switch
              id="show-shadows"
              checked={form.show_shadows}
              onCheckedChange={checked => handleChange('show_shadows', checked)}
              disabled={!isAdmin}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-borders">Show Borders</Label>
              <p className="text-sm text-gray-500">Display borders between footer sections</p>
            </div>
            <Switch
              id="show-borders"
              checked={form.show_borders}
              onCheckedChange={checked => handleChange('show_borders', checked)}
              disabled={!isAdmin}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="rounded-corners">Rounded Corners</Label>
              <p className="text-sm text-gray-500">Apply rounded corners to footer elements</p>
            </div>
            <Switch
              id="rounded-corners"
              checked={form.rounded_corners}
              onCheckedChange={checked => handleChange('rounded_corners', checked)}
              disabled={!isAdmin}
            />
          </div>
        </CardContent>
      </Card>
      {/* Save Button */}
      {isAdmin && (
        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Styling'}
          </Button>
        </div>
      )}
      {/* Style Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Style Preview</CardTitle>
          <CardDescription>
            Preview of your footer styling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="rounded-lg p-6 space-y-4"
            style={{
              backgroundColor: form.background_color,
              color: form.text_color,
              borderColor: form.border_color,
              borderWidth: form.show_borders ? '1px' : '0',
              borderRadius: form.rounded_corners ? '8px' : '0',
              boxShadow: form.show_shadows ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
            }}
          >
            <h4
              className="font-bold tracking-widest"
              style={{ fontSize: form.heading_font_size === 'text-xs' ? '12px' :
                form.heading_font_size === 'text-sm' ? '14px' :
                form.heading_font_size === 'text-base' ? '16px' : '18px' }}
            >
              SAMPLE HEADING
            </h4>
            <p
              style={{
                fontSize: form.body_font_size === 'text-xs' ? '12px' :
                  form.body_font_size === 'text-sm' ? '14px' :
                  form.body_font_size === 'text-base' ? '16px' : '18px',
                color: form.text_color
              }}
            >
              Sample footer content with your selected styling.
            </p>
            <a
              href="#"
              className="hover:underline transition-colors"
              style={{
                fontSize: form.link_font_size === 'text-xs' ? '12px' :
                  form.link_font_size === 'text-sm' ? '14px' :
                  form.link_font_size === 'text-base' ? '16px' : '18px',
                color: form.link_color
              }}
              onMouseEnter={e => e.currentTarget.style.color = form.link_hover_color}
              onMouseLeave={e => e.currentTarget.style.color = form.link_color}
            >
              Sample Link
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 