'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
// import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Save, 
  TestTube, 
  // ExternalLink, 
  CheckCircle, 
  AlertTriangle,
  Globe,
  Search,
  BarChart3,
  Target,
  // Eye,
  Zap,
  Monitor
} from 'lucide-react'
import { toast } from 'sonner'
import { Settings as SettingsType } from '@/lib/settings'

interface SEOSettingsFormProps {
  settings: SettingsType
  onSave?: (updatedSettings: Partial<SettingsType>) => void
}

interface SEOSettings {
  // Basic SEO
  siteName: string
  siteDescription: string
  siteKeywords: string
  siteUrl: string
  
  // Analytics
  googleAnalyticsId: string
  googleSearchConsoleId: string
  googleTagManagerId: string
  
  // Social Media
  facebookAppId: string
  twitterHandle: string
  linkedinUrl: string
  
  // Performance
  enableWebVitals: boolean
  enableResourceHints: boolean
  enableCriticalCSS: boolean
  
  // Monitoring
  enableSEOMonitoring: boolean
  enableAlerts: boolean
  alertEmail: string
  
  // Advanced
  enableStructuredData: boolean
  enableSitemap: boolean
  enableRobotsTxt: boolean
  customRobotsTxt: string
}

export function SEOSettingsForm({ settings }: SEOSettingsFormProps) {
  const settingsData = settings as unknown as SEOSettings
  const [formData, setFormData] = useState<SEOSettings>({
    siteName: settingsData.siteName || '',
    siteDescription: settingsData.siteDescription || '',
    siteKeywords: settingsData.siteKeywords || '',
    siteUrl: settingsData.siteUrl || '',
    googleAnalyticsId: settingsData.googleAnalyticsId || '',
    googleSearchConsoleId: settingsData.googleSearchConsoleId || '',
    googleTagManagerId: settingsData.googleTagManagerId || '',
    facebookAppId: settingsData.facebookAppId || '',
    twitterHandle: settingsData.twitterHandle || '',
    linkedinUrl: settingsData.linkedinUrl || '',
    enableWebVitals: settingsData.enableWebVitals ?? true,
    enableResourceHints: settingsData.enableResourceHints ?? true,
    enableCriticalCSS: settingsData.enableCriticalCSS ?? true,
    enableSEOMonitoring: settingsData.enableSEOMonitoring ?? true,
    enableAlerts: settingsData.enableAlerts ?? true,
    alertEmail: settingsData.alertEmail || '',
    enableStructuredData: settingsData.enableStructuredData ?? true,
    enableSitemap: settingsData.enableSitemap ?? true,
    enableRobotsTxt: settingsData.enableRobotsTxt ?? true,
    customRobotsTxt: settingsData.customRobotsTxt || ''
  })

  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<Record<string, 'success' | 'error' | 'pending'>>({})
  const [, setSeoSettings] = useState<Record<string, unknown>>({})

  // Load SEO settings from database
  useEffect(() => {
    const loadSEOSettings = async () => {
      try {
        const response = await fetch('/api/seo/settings')
        if (response.ok) {
          const result = await response.json()
          setSeoSettings(result.data)
        }
      } catch (error) {
        console.error('Error loading SEO settings:', error)
      }
    }

    loadSEOSettings()
  }, [])

  const handleInputChange = (field: keyof SEOSettings, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      
      // Save to SEO settings table
      const response = await fetch('/api/seo/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enable_seo_monitoring: formData.enableSEOMonitoring,
          enable_seo_alerts: formData.enableAlerts,
          alert_email: formData.alertEmail,
          enable_structured_data_validation: formData.enableStructuredData,
          enable_meta_tags_validation: formData.enableSitemap,
          enable_core_web_vitals_tracking: formData.enableWebVitals,
          enable_seo_analytics: formData.enableResourceHints,
        }),
      })

      if (response.ok) {
        toast.success('SEO settings saved successfully')
      } else {
        throw new Error('Failed to save SEO settings')
      }
    } catch (error) {
      console.error('Error saving SEO settings:', error)
      toast.error('Failed to save SEO settings')
    } finally {
      setIsLoading(false)
    }
  }

  // const handleSaveOld = async () => {
  //   setIsLoading(true)
  //   try {
  //     // Here you would typically save to your backend
  //     if (onSave) {
  //       onSave(formData)
  //     }
  //     toast.success('SEO settings saved successfully!')
  //   } catch (error) {
  //     toast.error('Failed to save SEO settings')
  //     console.error('Error saving SEO settings:', error)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  const testConnection = async (type: string) => {
    setTestResults(prev => ({ ...prev, [type]: 'pending' }))
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock test results
      const success = Math.random() > 0.3 // 70% success rate for demo
      setTestResults(prev => ({ ...prev, [type]: success ? 'success' : 'error' }))
      
      if (success) {
        toast.success(`${type} connection test successful!`)
      } else {
        toast.error(`${type} connection test failed!`)
      }
    } catch {
      setTestResults(prev => ({ ...prev, [type]: 'error' }))
      toast.error(`${type} connection test failed!`)
    }
  }

  const getTestResultIcon = (type: string) => {
    const result = testResults[type]
    if (result === 'pending') return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    if (result === 'success') return <CheckCircle className="w-4 h-4 text-green-500" />
    if (result === 'error') return <AlertTriangle className="w-4 h-4 text-red-500" />
    return <TestTube className="w-4 h-4 text-gray-400" />
  }

  return (
    <div className="space-y-6">
      {/* Basic SEO Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Basic SEO Settings
          </CardTitle>
          <CardDescription>
            Configure your website&apos;s basic SEO information and metadata.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={formData.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                placeholder="Your Website Name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteUrl">Site URL</Label>
              <Input
                id="siteUrl"
                value={formData.siteUrl}
                onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={formData.siteDescription}
              onChange={(e) => handleInputChange('siteDescription', e.target.value)}
              placeholder="Brief description of your website"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="siteKeywords">Keywords</Label>
            <Input
              id="siteKeywords"
              value={formData.siteKeywords}
              onChange={(e) => handleInputChange('siteKeywords', e.target.value)}
              placeholder="keyword1, keyword2, keyword3"
            />
            <p className="text-sm text-gray-500">Separate keywords with commas</p>
          </div>
        </CardContent>
      </Card>

      {/* Analytics & Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics & Tracking
          </CardTitle>
          <CardDescription>
            Configure Google Analytics, Search Console, and other tracking services.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
              <div className="flex gap-2">
                <Input
                  id="googleAnalyticsId"
                  value={formData.googleAnalyticsId}
                  onChange={(e) => handleInputChange('googleAnalyticsId', e.target.value)}
                  placeholder="G-XXXXXXXXXX"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testConnection('Google Analytics')}
                  disabled={!formData.googleAnalyticsId}
                >
                  {getTestResultIcon('Google Analytics')}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="googleSearchConsoleId">Google Search Console</Label>
              <div className="flex gap-2">
                <Input
                  id="googleSearchConsoleId"
                  value={formData.googleSearchConsoleId}
                  onChange={(e) => handleInputChange('googleSearchConsoleId', e.target.value)}
                  placeholder="Search Console Property"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => testConnection('Search Console')}
                  disabled={!formData.googleSearchConsoleId}
                >
                  {getTestResultIcon('Search Console')}
                </Button>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="googleTagManagerId">Google Tag Manager ID</Label>
            <div className="flex gap-2">
              <Input
                id="googleTagManagerId"
                value={formData.googleTagManagerId}
                onChange={(e) => handleInputChange('googleTagManagerId', e.target.value)}
                placeholder="GTM-XXXXXXX"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => testConnection('Tag Manager')}
                disabled={!formData.googleTagManagerId}
              >
                {getTestResultIcon('Tag Manager')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Social Media
          </CardTitle>
          <CardDescription>
            Configure social media profiles for better social sharing and SEO.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebookAppId">Facebook App ID</Label>
              <Input
                id="facebookAppId"
                value={formData.facebookAppId}
                onChange={(e) => handleInputChange('facebookAppId', e.target.value)}
                placeholder="123456789012345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitterHandle">Twitter Handle</Label>
              <Input
                id="twitterHandle"
                value={formData.twitterHandle}
                onChange={(e) => handleInputChange('twitterHandle', e.target.value)}
                placeholder="@yourhandle"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={(e) => handleInputChange('linkedinUrl', e.target.value)}
              placeholder="https://linkedin.com/company/yourcompany"
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Performance Settings
          </CardTitle>
          <CardDescription>
            Configure performance optimization features for better Core Web Vitals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Web Vitals Monitoring</Label>
                <p className="text-sm text-gray-500">Track Core Web Vitals performance metrics</p>
              </div>
              <Switch
                checked={formData.enableWebVitals}
                onCheckedChange={(checked) => handleInputChange('enableWebVitals', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Resource Hints</Label>
                <p className="text-sm text-gray-500">Add preload, prefetch, and preconnect hints</p>
              </div>
              <Switch
                checked={formData.enableResourceHints}
                onCheckedChange={(checked) => handleInputChange('enableResourceHints', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Critical CSS</Label>
                <p className="text-sm text-gray-500">Inline critical CSS for faster rendering</p>
              </div>
              <Switch
                checked={formData.enableCriticalCSS}
                onCheckedChange={(checked) => handleInputChange('enableCriticalCSS', checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monitoring & Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Monitoring & Alerts
          </CardTitle>
          <CardDescription>
            Configure SEO monitoring and alert notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable SEO Monitoring</Label>
                <p className="text-sm text-gray-500">Real-time SEO health monitoring</p>
              </div>
              <Switch
                checked={formData.enableSEOMonitoring}
                onCheckedChange={(checked) => handleInputChange('enableSEOMonitoring', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Alerts</Label>
                <p className="text-sm text-gray-500">Email notifications for SEO issues</p>
              </div>
              <Switch
                checked={formData.enableAlerts}
                onCheckedChange={(checked) => handleInputChange('enableAlerts', checked)}
              />
            </div>
            
            {formData.enableAlerts && (
              <div className="space-y-2">
                <Label htmlFor="alertEmail">Alert Email</Label>
                <Input
                  id="alertEmail"
                  type="email"
                  value={formData.alertEmail}
                  onChange={(e) => handleInputChange('alertEmail', e.target.value)}
                  placeholder="admin@yourwebsite.com"
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Advanced Settings
          </CardTitle>
          <CardDescription>
            Configure advanced SEO features and custom configurations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Structured Data</Label>
                <p className="text-sm text-gray-500">Generate JSON-LD structured data</p>
              </div>
              <Switch
                checked={formData.enableStructuredData}
                onCheckedChange={(checked) => handleInputChange('enableStructuredData', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Sitemap</Label>
                <p className="text-sm text-gray-500">Generate XML sitemap automatically</p>
              </div>
              <Switch
                checked={formData.enableSitemap}
                onCheckedChange={(checked) => handleInputChange('enableSitemap', checked)}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Robots.txt</Label>
                <p className="text-sm text-gray-500">Generate robots.txt automatically</p>
              </div>
              <Switch
                checked={formData.enableRobotsTxt}
                onCheckedChange={(checked) => handleInputChange('enableRobotsTxt', checked)}
              />
            </div>
            
            {formData.enableRobotsTxt && (
              <div className="space-y-2">
                <Label htmlFor="customRobotsTxt">Custom Robots.txt</Label>
                <Textarea
                  id="customRobotsTxt"
                  value={formData.customRobotsTxt}
                  onChange={(e) => handleInputChange('customRobotsTxt', e.target.value)}
                  placeholder="User-agent: *&#10;Allow: /&#10;Disallow: /admin/"
                  rows={6}
                />
                <p className="text-sm text-gray-500">Leave empty to use default robots.txt</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} className="min-w-32">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              Save Settings
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
