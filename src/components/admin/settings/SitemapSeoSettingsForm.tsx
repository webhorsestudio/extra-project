'use client'

import { useState, useEffect } from 'react'
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
  Play,
  RefreshCw,
  ExternalLink,
  Copy
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
  const [sitemapContent, setSitemapContent] = useState<string>('')
  const [sitemapUrl, setSitemapUrl] = useState<string>('')
  const [isLoadingSitemap, setIsLoadingSitemap] = useState(false)
  const [formData, setFormData] = useState({
    google_analytics_id: settings?.google_analytics_id || '',
    google_tag_manager_id: settings?.google_tag_manager_id || '',
    meta_pixel_id: settings?.meta_pixel_id || '',
    site_url: settings?.site_url || '',
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

  const validateMetaPixelId = (id: string) => {
    if (!id || id.trim() === '') return true
    const pixelRegex = /^\d{15,16}$/
    return pixelRegex.test(id.trim())
  }

  const validateUrl = (url: string) => {
    if (!url || url.trim() === '') return true
    try {
      new URL(url.trim())
      return true
    } catch {
      return false
    }
  }

  const fetchSitemapContent = async () => {
    try {
      setIsLoadingSitemap(true)
      
      // Get the sitemap from storage
      const response = await fetch('/api/sitemap/view', {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch sitemap')
      }

      const data = await response.json()
      setSitemapContent(data.content || 'No sitemap found')
      setSitemapUrl(data.url || '')
    } catch (error) {
      console.error('Error fetching sitemap:', error)
      setSitemapContent('Error loading sitemap content')
      setSitemapUrl('')
    } finally {
      setIsLoadingSitemap(false)
    }
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

      const result = await response.json()
      
      // Update the sitemap URL and content
      if (result.sitemapUrl) {
        setSitemapUrl(result.sitemapUrl)
      }
      
      // Fetch the generated sitemap content
      await fetchSitemapContent()

      toast({
        title: 'Success',
        description: `Sitemap generated successfully with ${result.urlCount || 0} URLs`,
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
          google_analytics_id: data.google_analytics_id,
          google_tag_manager_id: data.google_tag_manager_id,
          site_url: data.site_url,
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

  useEffect(() => {
    fetchSitemapContent()
  }, [])

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div className="space-y-2">
              <Label htmlFor="meta_pixel_id" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                Meta Pixel ID
              </Label>
              <Input
                id="meta_pixel_id"
                name="meta_pixel_id"
                value={formData.meta_pixel_id}
                onChange={handleChange}
                placeholder="123456789012345"
                className="border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Your Facebook Meta Pixel ID
                </p>
                {formData.meta_pixel_id && (
                  <Badge variant={validateMetaPixelId(formData.meta_pixel_id) ? "default" : "destructive"} className="text-xs">
                    {validateMetaPixelId(formData.meta_pixel_id) ? "Valid" : "Invalid"}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Site URL Field */}
          <div className="space-y-2">
            <Label htmlFor="site_url" className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              Site URL
            </Label>
            <Input
              id="site_url"
              name="site_url"
              value={formData.site_url}
              onChange={handleChange}
              placeholder="https://yoursite.com"
              className="border-gray-200 focus:border-blue-500 focus:ring-blue-500"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Main website URL for sitemap generation
              </p>
              {formData.site_url && (
                <Badge variant={validateUrl(formData.site_url) ? "default" : "destructive"} className="text-xs">
                  {validateUrl(formData.site_url) ? "Valid URL" : "Invalid URL"}
                </Badge>
              )}
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

      {/* Sitemap Viewer Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Sitemap Viewer
              </CardTitle>
              <CardDescription className="text-gray-600">
                View the current sitemap XML content and access the public URL
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sitemap Actions */}
          <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-900">Current Sitemap</h4>
              <p className="text-xs text-gray-600">
                View and refresh the current sitemap content
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={fetchSitemapContent} 
                disabled={isLoadingSitemap}
                variant="outline"
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-100"
              >
                {isLoadingSitemap ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
              {sitemapUrl && (
                <Button 
                  onClick={() => window.open(sitemapUrl, '_blank')}
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-100"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Live
                </Button>
              )}
            </div>
          </div>

          {/* No Sitemap Message */}
          {sitemapContent && sitemapContent.includes('No sitemap found') && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div className="space-y-1">
                  <h4 className="text-sm font-medium text-yellow-900">No Sitemap Generated Yet</h4>
                  <p className="text-xs text-yellow-700">
                    You need to generate your first sitemap. Make sure you have:
                  </p>
                  <ul className="text-xs text-yellow-700 list-disc list-inside space-y-1 ml-2">
                    <li>Set your Site URL in the Analytics &amp; Tracking section above</li>
                    <li>Enabled sitemap generation</li>
                    <li>Selected which content to include</li>
                  </ul>
                  <p className="text-xs text-yellow-700 mt-2">
                    Then use the &quot;Generate Now&quot; button above to create your first sitemap.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sitemap URL Display */}
          {sitemapUrl && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Sitemap URL</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={sitemapUrl}
                  readOnly
                  className="bg-white border-green-200 text-green-800 font-mono text-sm"
                />
                <Button
                  onClick={() => navigator.clipboard.writeText(sitemapUrl)}
                  variant="outline"
                  size="sm"
                  className="border-green-200 text-green-700 hover:bg-green-100"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-green-600 mt-1">
                This URL is accessible to search engines and can be submitted to Google Search Console
              </p>
            </div>
          )}

          {/* Sitemap Content Display */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-500" />
              Sitemap XML Content
            </Label>
            <div className="relative">
              <Textarea
                value={sitemapContent}
                readOnly
                rows={12}
                className="font-mono text-xs bg-gray-50 border-gray-200 resize-none"
                placeholder="Sitemap content will appear here after generation..."
              />
              {sitemapContent && !sitemapContent.includes('No sitemap found') && !sitemapContent.includes('Error') && (
                <div className="absolute top-2 right-2">
                  <Button
                    onClick={() => navigator.clipboard.writeText(sitemapContent)}
                    variant="outline"
                    size="sm"
                    className="bg-white/90 hover:bg-white"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">
                {sitemapContent.includes('No sitemap found') 
                  ? 'Generate a sitemap first to see the content here'
                  : sitemapContent.includes('Error') 
                    ? 'There was an error loading the sitemap'
                    : 'Raw XML content of the generated sitemap'
                }
              </p>
              {sitemapContent && !sitemapContent.includes('No sitemap found') && !sitemapContent.includes('Error') && (
                <Badge variant="secondary" className="text-xs">
                  {sitemapContent.split('<url>').length - 1} URLs
                </Badge>
              )}
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