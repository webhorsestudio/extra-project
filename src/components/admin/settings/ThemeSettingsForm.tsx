'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { 
  Palette, 
  Type, 
  Eye, 
  Moon, 
  Sun, 
  Save,
  Sparkles,
  Monitor,
  Smartphone
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

type Props = {
  settings: {
    accent_color?: string
    font_size_base?: string
    border_radius?: string
    enable_dark_mode?: boolean
    enable_animations?: boolean
    enable_shadows?: boolean
    [key: string]: any // Allow additional properties
  }
}

const colorPresets = [
  { name: 'Ocean Blue', primary: '#0ea5e9', secondary: '#f8fafc', accent: '#06b6d4' },
  { name: 'Forest Green', primary: '#16a34a', secondary: '#f0fdf4', accent: '#22c55e' },
  { name: 'Sunset Orange', primary: '#ea580c', secondary: '#fff7ed', accent: '#f97316' },
  { name: 'Royal Purple', primary: '#7c3aed', secondary: '#faf5ff', accent: '#a855f7' },
  { name: 'Rose Pink', primary: '#e11d48', secondary: '#fff1f2', accent: '#f43f5e' },
  { name: 'Slate Gray', primary: '#475569', secondary: '#f8fafc', accent: '#64748b' },
]

const fontOptions = [
  { value: 'Inter', label: 'Inter', preview: 'Inter' },
  { value: 'Roboto', label: 'Roboto', preview: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans', preview: 'Open Sans' },
  { value: 'Montserrat', label: 'Montserrat', preview: 'Montserrat' },
  { value: 'Poppins', label: 'Poppins', preview: 'Poppins' },
  { value: 'Nunito', label: 'Nunito', preview: 'Nunito' },
  { value: 'Lato', label: 'Lato', preview: 'Lato' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro', preview: 'Source Sans Pro' },
]

const fontSizeOptions = [
  { value: '14px', label: 'Small (14px)' },
  { value: '16px', label: 'Medium (16px)' },
  { value: '18px', label: 'Large (18px)' },
  { value: '20px', label: 'Extra Large (20px)' },
]

const borderRadiusOptions = [
  { value: '0px', label: 'None' },
  { value: '4px', label: 'Small' },
  { value: '8px', label: 'Medium' },
  { value: '12px', label: 'Large' },
  { value: '16px', label: 'Extra Large' },
  { value: '24px', label: 'Rounded' },
]

export function ThemeSettingsForm({ settings }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target
    // Handle change logic
  }

  const handleSelectChange = (name: string, value: string) => {
    // Handle select change logic
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    // Handle switch change logic
  }

  const applyColorPreset = (preset: typeof colorPresets[0]) => {
    // Handle color preset application logic
  }

  const onSubmit = async (data: any) => {
    try {
      console.log('Starting theme settings update...')
      setIsLoading(true)

      console.log('Attempting to update settings with:', data)

      // Use API route to update settings
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accent_color: data.accent_color,
          font_size_base: data.font_size_base,
          border_radius: data.border_radius,
          enable_dark_mode: data.enable_dark_mode,
          enable_animations: data.enable_animations,
          enable_shadows: data.enable_shadows,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update settings')
      }

      console.log('Settings updated successfully')

      toast({
        title: 'Success',
        description: 'Theme settings updated successfully',
      })
    } catch (error) {
      console.error('Error updating theme settings:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update theme settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Color Scheme Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
              <Palette className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Color Scheme
              </CardTitle>
              <CardDescription className="text-gray-600">
                Customize your website's color palette and visual identity
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Color Presets */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Quick Color Presets</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {colorPresets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyColorPreset(preset)}
                  className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-1">
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-200" 
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-200" 
                        style={{ backgroundColor: preset.secondary }}
                      />
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-200" 
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{preset.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Custom Colors */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700">Custom Colors</Label>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color" className="text-sm font-medium text-gray-700">
                  Primary Color
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    name="primary_color"
                    type="color"
                    value={settings.primary_color || '#0ea5e9'}
                    onChange={handleChange}
                    className="w-12 h-10 p-1 rounded-lg border-gray-200"
                  />
                  <Input
                    type="text"
                    value={settings.primary_color || '#0ea5e9'}
                    onChange={handleChange}
                    name="primary_color"
                    className="flex-1"
                    placeholder="#000000"
                  />
                </div>
                <p className="text-xs text-gray-500">Main brand color for buttons and links</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary_color" className="text-sm font-medium text-gray-700">
                  Secondary Color
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    name="secondary_color"
                    type="color"
                    value={settings.secondary_color || '#f8fafc'}
                    onChange={handleChange}
                    className="w-12 h-10 p-1 rounded-lg border-gray-200"
                  />
                  <Input
                    type="text"
                    value={settings.secondary_color || '#f8fafc'}
                    onChange={handleChange}
                    name="secondary_color"
                    className="flex-1"
                    placeholder="#ffffff"
                  />
                </div>
                <p className="text-xs text-gray-500">Background and surface colors</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent_color" className="text-sm font-medium text-gray-700">
                  Accent Color
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="accent_color"
                    name="accent_color"
                    type="color"
                    value={settings.accent_color || '#06b6d4'}
                    onChange={handleChange}
                    className="w-12 h-10 p-1 rounded-lg border-gray-200"
                  />
                  <Input
                    type="text"
                    value={settings.accent_color || '#06b6d4'}
                    onChange={handleChange}
                    name="accent_color"
                    className="flex-1"
                    placeholder="#000000"
                  />
                </div>
                <p className="text-xs text-gray-500">Highlight and focus colors</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg">
              <Type className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Typography
              </CardTitle>
              <CardDescription className="text-gray-600">
                Choose fonts and text styling for your website
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="font_family" className="text-sm font-medium text-gray-700">
                Font Family
              </Label>
              <Select
                value={settings.font_family || 'Inter'}
                onValueChange={(value) => handleSelectChange('font_family', value)}
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Primary font for all text content</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="font_size_base" className="text-sm font-medium text-gray-700">
                Base Font Size
              </Label>
              <Select
                value={settings.font_size_base || '16px'}
                onValueChange={(value) => handleSelectChange('font_size_base', value)}
              >
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Select font size" />
                </SelectTrigger>
                <SelectContent>
                  {fontSizeOptions.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Base font size for body text</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="border_radius" className="text-sm font-medium text-gray-700">
              Border Radius
            </Label>
            <Select
              value={settings.border_radius || '8px'}
              onValueChange={(value) => handleSelectChange('border_radius', value)}
            >
              <SelectTrigger className="border-gray-200">
                <SelectValue placeholder="Select border radius" />
              </SelectTrigger>
              <SelectContent>
                {borderRadiusOptions.map((radius) => (
                  <SelectItem key={radius.value} value={radius.value}>
                    {radius.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">Corner radius for buttons, cards, and inputs</p>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
              <Sparkles className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Advanced Options
              </CardTitle>
              <CardDescription className="text-gray-600">
                Enable additional features and visual enhancements
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Dark Mode</Label>
              <p className="text-xs text-gray-500">Enable automatic dark/light theme switching</p>
            </div>
            <Switch
              checked={settings.enable_dark_mode || false}
              onCheckedChange={(checked) => handleSwitchChange('enable_dark_mode', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Animations</Label>
              <p className="text-xs text-gray-500">Enable smooth transitions and hover effects</p>
            </div>
            <Switch
              checked={settings.enable_animations || true}
              onCheckedChange={(checked) => handleSwitchChange('enable_animations', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700">Shadows</Label>
              <p className="text-xs text-gray-500">Add depth with box shadows on cards and buttons</p>
            </div>
            <Switch
              checked={settings.enable_shadows || true}
              onCheckedChange={(checked) => handleSwitchChange('enable_shadows', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Live Preview Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg">
              <Eye className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Live Preview
              </CardTitle>
              <CardDescription className="text-gray-600">
                See how your theme will look on different devices
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Desktop Preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Desktop</span>
              </div>
              <div 
                className="border-2 border-gray-200 rounded-lg p-4 h-32 relative overflow-hidden"
                style={{ 
                  backgroundColor: settings.secondary_color || '#f8fafc',
                  borderRadius: settings.border_radius || '8px',
                  fontFamily: settings.font_family || 'Inter',
                  fontSize: settings.font_size_base || '16px',
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-8 h-8 rounded-lg"
                    style={{ backgroundColor: settings.primary_color || '#0ea5e9' }}
                  />
                  <div 
                    className="w-24 h-4 rounded"
                    style={{ backgroundColor: settings.primary_color || '#0ea5e9' }}
                  />
                </div>
                <div className="space-y-2">
                  <div 
                    className="w-full h-3 rounded"
                    style={{ backgroundColor: settings.accent_color || '#06b6d4' }}
                  />
                  <div 
                    className="w-3/4 h-3 rounded"
                    style={{ backgroundColor: settings.accent_color || '#06b6d4' }}
                  />
                </div>
                <div 
                  className="absolute bottom-3 right-3 w-16 h-8 rounded-lg"
                  style={{ backgroundColor: settings.primary_color || '#0ea5e9' }}
                />
              </div>
            </div>

            {/* Mobile Preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Mobile</span>
              </div>
              <div 
                className="border-2 border-gray-200 rounded-lg p-3 h-32 relative overflow-hidden mx-auto w-24"
                style={{ 
                  backgroundColor: settings.secondary_color || '#f8fafc',
                  borderRadius: settings.border_radius || '8px',
                  fontFamily: settings.font_family || 'Inter',
                  fontSize: settings.font_size_base || '16px',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: settings.primary_color || '#0ea5e9' }}
                  />
                  <div 
                    className="w-8 h-3 rounded"
                    style={{ backgroundColor: settings.primary_color || '#0ea5e9' }}
                  />
                </div>
                <div className="space-y-1">
                  <div 
                    className="w-full h-2 rounded"
                    style={{ backgroundColor: settings.accent_color || '#06b6d4' }}
                  />
                  <div 
                    className="w-2/3 h-2 rounded"
                    style={{ backgroundColor: settings.accent_color || '#06b6d4' }}
                  />
                </div>
                <div 
                  className="absolute bottom-2 right-2 w-8 h-6 rounded"
                  style={{ backgroundColor: settings.primary_color || '#0ea5e9' }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={onSubmit} 
          disabled={isLoading}
          className="bg-black hover:bg-gray-800 text-white px-8 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            'Save Theme'
          )}
        </Button>
      </div>
    </div>
  )
} 