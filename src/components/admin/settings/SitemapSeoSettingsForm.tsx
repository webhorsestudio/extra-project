'use client'

import { useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  Network, 
  FileText, 
  Settings, 
  Globe,
  BarChart3,
  Tag,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Play
} from 'lucide-react'
import { Settings as SettingsType } from '@/lib/settings'

type Props = {
  settings: SettingsType
}

const scheduleOptions = [
  { value: 'daily', label: 'Daily', description: 'Generate once per day' },
  { value: 'weekly', label: 'Weekly', description: 'Generate once per week' },
  { value: 'monthly', label: 'Monthly', description: 'Generate once per month' },
]

export function SitemapSeoSettingsForm({ settings }: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [formData, setFormData] = useState({
    google_analytics_id: settings?.google_analytics_id || '',
    google_tag_manager_id: settings?.google_tag_manager_id || '',
    robots_txt: settings?.robots_txt || '',
    sitemap_schedule: settings?.sitemap_schedule || 'daily',
    sitemap_enabled: settings?.sitemap_enabled ?? false,
    sitemap_include_properties: settings?.sitemap_include_properties ?? true,
    sitemap_include_users: settings?.sitemap_include_users ?? false,
    sitemap_include_blog: settings?.sitemap_include_blog ?? true,
  })
  const { toast } = useToast()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateAnalyticsId = (id: string) => {
    if (!id || id.trim() === '') return true
    const gaRegex = /^UA-\d{4,10}-\d{1,4}$|^G-[A-Z0-9]{10}$/
    return gaRegex.test(id.trim())
  }

  const validateTagManagerId = (id: string) => {
    if (!id || id.trim() === '') return true
    const gtmRegex = /^GTM-[A-Z0-9]{4,8}$/
    return gtmRegex.test(id.trim())
  }

  const generateSitemap = async () => {
    try {
      setIsGenerating(true)
      
      // Call your API endpoint to generate sitemap
      const response = await fetch('/api/sitemap/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          include_properties: formData.sitemap_include_properties,
          include_users: formData.sitemap_include_users,
          include_blog: formData.sitemap_include_blog,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate sitemap')
      }

      toast({
        title: 'Success',
        description: 'Sitemap generated successfully',
      })
    } catch (error) {
      console.error('Error generating sitemap:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate sitemap',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const onSubmit = async (data: typeof formData) => {
    try {
      console.log('Starting SEO settings update...')
      setIsLoading(true)

      console.log('Attempting to update settings with:', data)

      // Use API route to update settings
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          google_tag_manager_id: data.google_tag_manager_id,
          robots_txt: data.robots_txt,
          sitemap_schedule: data.sitemap_schedule,
          sitemap_enabled: data.sitemap_enabled,
          sitemap_include_properties: data.sitemap_include_properties,
          sitemap_include_users: data.sitemap_include_users,
          sitemap_include_blog: data.sitemap_include_blog,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update settings')
      }

      console.log('Settings updated successfully')

      toast({
        title: 'Success',
        description: 'SEO settings updated successfully',
      })
    } catch (error) {
      console.error('Error updating SEO settings:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update SEO settings',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Analytics & Tracking Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Analytics & Tracking
              </CardTitle>
              <CardDescription className="text-gray-600">
                Configure Google Analytics and Tag Manager for website tracking
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="google_analytics_id" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                Google Analytics ID
              </Label>
              <Input
                id="google_analytics_id"
                name="google_analytics_id"
                value={formData.google_analytics_id}
                onChange={handleChange}
                placeholder="UA-XXXXXXXXX-X or G-XXXXXXXXXX"
                className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Your Google Analytics tracking ID
                </p>
                {formData.google_analytics_id && (
                  <Badge variant={validateAnalyticsId(formData.google_analytics_id) ? "default" : "destructive"} className="text-xs">
                    {validateAnalyticsId(formData.google_analytics_id) ? "Valid" : "Invalid"}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="google_tag_manager_id" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Tag className="h-4 w-4 text-green-500" />
                Google Tag Manager ID
              </Label>
              <Input
                id="google_tag_manager_id"
                name="google_tag_manager_id"
                value={formData.google_tag_manager_id}
                onChange={handleChange}
                placeholder="GTM-XXXXXX"
                className="border-gray-200 focus:border-green-500 focus:ring-green-500"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Your Google Tag Manager container ID
                </p>
                {formData.google_tag_manager_id && (
                  <Badge variant={validateTagManagerId(formData.google_tag_manager_id) ? "default" : "destructive"} className="text-xs">
                    {validateTagManagerId(formData.google_tag_manager_id) ? "Valid" : "Invalid"}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Engine Optimization Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Search className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Search Engine Optimization
              </CardTitle>
              <CardDescription className="text-gray-600">
                Configure robots.txt and search engine crawling settings
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="robots_txt" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-green-500" />
              Robots.txt Content
            </Label>
            <Textarea
              id="robots_txt"
              name="robots_txt"
              value={formData.robots_txt}
              onChange={handleChange}
              placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin/&#10;Sitemap: https://yoursite.com/sitemap.xml"
              rows={6}
              className="border-gray-200 focus:border-green-500 focus:ring-green-500 resize-none font-mono text-sm"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Instructions for search engine crawlers
              </p>
              <Badge variant="secondary" className="text-xs">
                {formData.robots_txt.length} characters
              </Badge>
            </div>
          </div>

          {/* Robots.txt Preview */}
          {formData.robots_txt && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-700">Robots.txt Preview</p>
                  <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono bg-white p-3 rounded border">
                    {formData.robots_txt}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sitemap Configuration Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Network className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Sitemap Configuration
              </CardTitle>
              <CardDescription className="text-gray-600">
                Manage automatic sitemap generation and content inclusion
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable Sitemap */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Globe className="h-4 w-4 text-purple-500" />
                Enable Sitemap Generation
              </Label>
              <p className="text-xs text-gray-500">
                Automatically generate and update XML sitemap
              </p>
            </div>
            <Switch
              checked={formData.sitemap_enabled}
              onCheckedChange={(checked) => handleSwitchChange('sitemap_enabled', checked)}
            />
          </div>

          {/* Generation Schedule */}
          <div className="space-y-2">
            <Label htmlFor="sitemap_schedule" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-500" />
              Generation Schedule
            </Label>
            <Select
              value={formData.sitemap_schedule}
              onValueChange={(value) => handleSelectChange('sitemap_schedule', value)}
            >
              <SelectTrigger className="border-gray-200">
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>
              <SelectContent>
                {scheduleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-gray-500">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              How often should the sitemap be automatically generated
            </p>
          </div>

          <Separator />

          {/* Content Inclusion */}
          <div className="space-y-4">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Settings className="h-4 w-4 text-purple-500" />
              Include in Sitemap
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Properties</span>
                </div>
                <Switch
                  checked={formData.sitemap_include_properties}
                  onCheckedChange={(checked) => handleSwitchChange('sitemap_include_properties', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Users</span>
                </div>
                <Switch
                  checked={formData.sitemap_include_users}
                  onCheckedChange={(checked) => handleSwitchChange('sitemap_include_users', checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Blog Posts</span>
                </div>
                <Switch
                  checked={formData.sitemap_include_blog}
                  onCheckedChange={(checked) => handleSwitchChange('sitemap_include_blog', checked)}
                />
              </div>
            </div>
          </div>

          {/* Manual Generation */}
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-gray-900">Manual Sitemap Generation</h4>
                <p className="text-xs text-gray-600">
                  Generate sitemap immediately with current settings
                </p>
              </div>
              <Button 
                onClick={generateSitemap} 
                disabled={isGenerating || !formData.sitemap_enabled}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Generate Now
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button 
          onClick={() => onSubmit(formData)} 
          disabled={isLoading}
          className="bg-black hover:bg-gray-800 text-white px-8 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            'Save SEO Settings'
          )}
        </Button>
      </div>
    </div>
  )
} 