'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { 
  Layout,
  Grid3X3,
  Grid2X2,
  Grid,
  Loader2,
  Save
} from 'lucide-react'

interface FooterLayoutSettings {
  column_layout: string
  show_logo: boolean
  show_navigation: boolean
  show_contact: boolean
  show_social: boolean
  show_cta: boolean
  show_policy_links: boolean
  show_copyright: boolean
  spacing: string
  alignment: string
}

export default function FooterLayoutTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [layoutSettings, setLayoutSettings] = useState<FooterLayoutSettings>({
    column_layout: '3',
    show_logo: true,
    show_navigation: true,
    show_contact: true,
    show_social: true,
    show_cta: true,
    show_policy_links: true,
    show_copyright: true,
    spacing: 'normal',
    alignment: 'left'
  })

  const fetchLayoutSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/footer/layout')
      const data = await response.json()
      
      if (response.ok && data.layout) {
        setLayoutSettings(data.layout)
      } else if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch layout settings')
      }
    } catch (error) {
      console.error('Error fetching layout settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load layout settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch layout settings on component mount
  useEffect(() => {
    fetchLayoutSettings()
  }, [fetchLayoutSettings])

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/footer/layout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(layoutSettings),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save layout settings')
      }

      toast({
        title: 'Success',
        description: 'Layout settings saved successfully',
      })
    } catch (error) {
      console.error('Error saving layout settings:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save layout settings',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const columnOptions = [
    { value: '1', label: 'Single Column', icon: Grid2X2 },
    { value: '2', label: 'Two Columns', icon: Grid2X2 },
    { value: '3', label: 'Three Columns', icon: Grid3X3 },
    { value: '4', label: 'Four Columns', icon: Grid },
  ]

  const spacingOptions = [
    { value: 'compact', label: 'Compact' },
    { value: 'normal', label: 'Normal' },
    { value: 'spacious', label: 'Spacious' },
  ]

  const alignmentOptions = [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          {saving ? 'Saving...' : 'Save Layout'}
        </Button>
      </div>

      {/* Column Layout */}
      <Card>
        <CardHeader>
          <CardTitle>Column Layout</CardTitle>
          <CardDescription>
            Choose how many columns to display in the footer navigation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {columnOptions.map((option) => {
              const Icon = option.icon
              return (
                <div
                  key={option.value}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    layoutSettings.column_layout === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setLayoutSettings({ ...layoutSettings, column_layout: option.value })}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Icon className="h-6 w-6 text-gray-600" />
                    <span className="text-sm font-medium text-center">{option.label}</span>
                  </div>
                  {layoutSettings.column_layout === option.value && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Section Visibility */}
      <Card>
        <CardHeader>
          <CardTitle>Section Visibility</CardTitle>
          <CardDescription>
            Control which sections are displayed in the footer
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Layout className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="show-logo">Logo Section</Label>
                  <p className="text-sm text-gray-500">Company logo and branding</p>
                </div>
              </div>
              <Switch
                id="show-logo"
                checked={layoutSettings.show_logo}
                onCheckedChange={(checked) => setLayoutSettings({ ...layoutSettings, show_logo: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Layout className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="show-navigation">Navigation</Label>
                  <p className="text-sm text-gray-500">Footer navigation links</p>
                </div>
              </div>
              <Switch
                id="show-navigation"
                checked={layoutSettings.show_navigation}
                onCheckedChange={(checked) => setLayoutSettings({ ...layoutSettings, show_navigation: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Layout className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="show-contact">Contact Info</Label>
                  <p className="text-sm text-gray-500">Address and contact details</p>
                </div>
              </div>
              <Switch
                id="show-contact"
                checked={layoutSettings.show_contact}
                onCheckedChange={(checked) => setLayoutSettings({ ...layoutSettings, show_contact: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Layout className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="show-social">Social Media</Label>
                  <p className="text-sm text-gray-500">Social media icons and links</p>
                </div>
              </div>
              <Switch
                id="show-social"
                checked={layoutSettings.show_social}
                onCheckedChange={(checked) => setLayoutSettings({ ...layoutSettings, show_social: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Layout className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="show-cta">Call-to-Action</Label>
                  <p className="text-sm text-gray-500">CTA section above footer</p>
                </div>
              </div>
              <Switch
                id="show-cta"
                checked={layoutSettings.show_cta}
                onCheckedChange={(checked) => setLayoutSettings({ ...layoutSettings, show_cta: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Layout className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="show-policy">Policy Links</Label>
                  <p className="text-sm text-gray-500">Terms, privacy, and legal links</p>
                </div>
              </div>
              <Switch
                id="show-policy"
                checked={layoutSettings.show_policy_links}
                onCheckedChange={(checked) => setLayoutSettings({ ...layoutSettings, show_policy_links: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Layout className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="show-copyright">Copyright</Label>
                  <p className="text-sm text-gray-500">Copyright notice and credits</p>
                </div>
              </div>
              <Switch
                id="show-copyright"
                checked={layoutSettings.show_copyright}
                onCheckedChange={(checked) => setLayoutSettings({ ...layoutSettings, show_copyright: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Settings</CardTitle>
          <CardDescription>
            Fine-tune the footer layout and spacing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="spacing">Spacing</Label>
              <Select
                value={layoutSettings.spacing}
                onValueChange={(value) => setLayoutSettings({ ...layoutSettings, spacing: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select spacing" />
                </SelectTrigger>
                <SelectContent>
                  {spacingOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alignment">Text Alignment</Label>
              <Select
                value={layoutSettings.alignment}
                onValueChange={(value) => setLayoutSettings({ ...layoutSettings, alignment: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select alignment" />
                </SelectTrigger>
                <SelectContent>
                  {alignmentOptions.map((option) => (
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

      {/* Layout Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Layout Preview</CardTitle>
          <CardDescription>
            Preview of how your footer layout will look
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-lg p-6 text-white">
            <div className="grid gap-4" style={{ 
              gridTemplateColumns: `repeat(${layoutSettings.column_layout}, 1fr)` 
            }}>
              {layoutSettings.show_logo && (
                <div className="bg-gray-800 p-3 rounded text-center text-sm">
                  Logo Section
                </div>
              )}
              {layoutSettings.show_navigation && (
                <div className="bg-gray-800 p-3 rounded text-center text-sm">
                  Navigation
                </div>
              )}
              {layoutSettings.show_contact && (
                <div className="bg-gray-800 p-3 rounded text-center text-sm">
                  Contact Info
                </div>
              )}
              {layoutSettings.show_social && (
                <div className="bg-gray-800 p-3 rounded text-center text-sm">
                  Social Media
                </div>
              )}
            </div>
            {layoutSettings.show_cta && (
              <div className="mt-4 bg-gray-800 p-3 rounded text-center text-sm">
                Call-to-Action
              </div>
            )}
            <div className="mt-4 flex justify-between items-center text-xs">
              {layoutSettings.show_policy_links && (
                <span className="bg-gray-800 px-2 py-1 rounded">Policy Links</span>
              )}
              {layoutSettings.show_copyright && (
                <span className="bg-gray-800 px-2 py-1 rounded">Copyright</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 