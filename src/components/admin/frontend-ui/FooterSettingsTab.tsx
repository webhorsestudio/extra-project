'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { 
  Settings, 
  Monitor, 
  Smartphone,
  Tablet,
  MonitorSmartphone,
  Zap,
  Search,
  Eye,
  Code,
  Shield,
  Save,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FooterSettings {
  footer_enabled: boolean
  footer_position: string
  footer_behavior: string
  footer_width: string
  max_width: string
  show_on_mobile: boolean
  show_on_tablet: boolean
  show_on_desktop: boolean
  mobile_collapsible: boolean
  tablet_collapsible: boolean
  lazy_load: boolean
  preload_critical: boolean
  cache_duration: number
  enable_analytics: boolean
  structured_data: boolean
  schema_type: string
  enable_aria_labels: boolean
  skip_to_content: boolean
  focus_indicators: boolean
  google_analytics_id?: string
  facebook_pixel_id?: string
  hotjar_id?: string
  custom_tracking_code?: string
  custom_css?: string
  custom_js?: string
  enable_debug_mode: boolean
  enable_console_logs: boolean
  enable_performance_monitoring: boolean
  backup_settings: boolean
  auto_backup_frequency: string
  settings_version: string
  backup_retention_days: number
}

export default function FooterSettingsTab() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<FooterSettings>({
    footer_enabled: true,
    footer_position: 'bottom',
    footer_behavior: 'normal',
    footer_width: 'full',
    max_width: 'max-w-7xl',
    show_on_mobile: true,
    show_on_tablet: true,
    show_on_desktop: true,
    mobile_collapsible: false,
    tablet_collapsible: false,
    lazy_load: false,
    preload_critical: true,
    cache_duration: 3600,
    enable_analytics: true,
    structured_data: true,
    schema_type: 'Organization',
    enable_aria_labels: true,
    skip_to_content: true,
    focus_indicators: true,
    enable_debug_mode: false,
    enable_console_logs: false,
    enable_performance_monitoring: false,
    backup_settings: true,
    auto_backup_frequency: 'weekly',
    settings_version: '1.0.0',
    backup_retention_days: 30
  })

  // Fetch settings on component mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/footer/settings')
      const data = await response.json()
      
      if (response.ok && data.settings) {
        setSettings(data.settings)
      } else if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch settings')
      }
    } catch (error) {
      console.error('Error fetching footer settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load footer settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/admin/footer/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save settings')
      }

      toast({
        title: 'Success',
        description: 'Footer settings saved successfully',
      })
    } catch (error) {
      console.error('Error saving footer settings:', error)
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save footer settings',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const positionOptions = [
    { value: 'bottom', label: 'Bottom' },
    { value: 'sticky', label: 'Sticky' },
    { value: 'fixed', label: 'Fixed' },
  ]

  const behaviorOptions = [
    { value: 'normal', label: 'Normal' },
    { value: 'auto-hide', label: 'Auto Hide' },
    { value: 'always-visible', label: 'Always Visible' },
  ]

  const widthOptions = [
    { value: 'full', label: 'Full Width' },
    { value: 'contained', label: 'Contained' },
    { value: 'custom', label: 'Custom' },
  ]

  const maxWidthOptions = [
    { value: 'max-w-4xl', label: 'Small (4xl)' },
    { value: 'max-w-5xl', label: 'Medium (5xl)' },
    { value: 'max-w-6xl', label: 'Large (6xl)' },
    { value: 'max-w-7xl', label: 'Extra Large (7xl)' },
    { value: 'max-w-full', label: 'Full Width' },
  ]

  const schemaOptions = [
    { value: 'Organization', label: 'Organization' },
    { value: 'LocalBusiness', label: 'Local Business' },
    { value: 'RealEstateAgent', label: 'Real Estate Agent' },
    { value: 'WebSite', label: 'Website' },
  ]

  const backupFrequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
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
      {/* General Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Configuration
          </CardTitle>
          <CardDescription>
            Basic footer settings and behavior configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Settings className="h-5 w-5 text-gray-600" />
              <div>
                <Label htmlFor="footer-enabled">Enable Footer</Label>
                <p className="text-sm text-gray-500">Show or hide the footer completely</p>
              </div>
            </div>
            <Switch
              id="footer-enabled"
              checked={settings.footer_enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, footer_enabled: checked })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="footer-position">Footer Position</Label>
              <Select
                value={settings.footer_position}
                onValueChange={(value) => setSettings({ ...settings, footer_position: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer-behavior">Footer Behavior</Label>
              <Select
                value={settings.footer_behavior}
                onValueChange={(value) => setSettings({ ...settings, footer_behavior: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select behavior" />
                </SelectTrigger>
                <SelectContent>
                  {behaviorOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="footer-width">Footer Width</Label>
              <Select
                value={settings.footer_width}
                onValueChange={(value) => setSettings({ ...settings, footer_width: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select width" />
                </SelectTrigger>
                <SelectContent>
                  {widthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-width">Maximum Width</Label>
              <Select
                value={settings.max_width}
                onValueChange={(value) => setSettings({ ...settings, max_width: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select max width" />
                </SelectTrigger>
                <SelectContent>
                  {maxWidthOptions.map((option) => (
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

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Display Settings
          </CardTitle>
          <CardDescription>
            Control footer visibility across different devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="show-mobile">Mobile</Label>
                  <p className="text-sm text-gray-500">Show on mobile devices</p>
                </div>
              </div>
              <Switch
                id="show-mobile"
                checked={settings.show_on_mobile}
                onCheckedChange={(checked) => setSettings({ ...settings, show_on_mobile: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Tablet className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="show-tablet">Tablet</Label>
                  <p className="text-sm text-gray-500">Show on tablet devices</p>
                </div>
              </div>
              <Switch
                id="show-tablet"
                checked={settings.show_on_tablet}
                onCheckedChange={(checked) => setSettings({ ...settings, show_on_tablet: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <MonitorSmartphone className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="show-desktop">Desktop</Label>
                  <p className="text-sm text-gray-500">Show on desktop devices</p>
                </div>
              </div>
              <Switch
                id="show-desktop"
                checked={settings.show_on_desktop}
                onCheckedChange={(checked) => setSettings({ ...settings, show_on_desktop: checked })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="mobile-collapsible">Mobile Collapsible</Label>
                  <p className="text-sm text-gray-500">Allow footer to collapse on mobile</p>
                </div>
              </div>
              <Switch
                id="mobile-collapsible"
                checked={settings.mobile_collapsible}
                onCheckedChange={(checked) => setSettings({ ...settings, mobile_collapsible: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Tablet className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="tablet-collapsible">Tablet Collapsible</Label>
                  <p className="text-sm text-gray-500">Allow footer to collapse on tablet</p>
                </div>
              </div>
              <Switch
                id="tablet-collapsible"
                checked={settings.tablet_collapsible}
                onCheckedChange={(checked) => setSettings({ ...settings, tablet_collapsible: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance & Loading */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance & Loading
          </CardTitle>
          <CardDescription>
            Optimize footer loading and performance settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="lazy-load">Lazy Load</Label>
                  <p className="text-sm text-gray-500">Load footer only when needed</p>
                </div>
              </div>
              <Switch
                id="lazy-load"
                checked={settings.lazy_load}
                onCheckedChange={(checked) => setSettings({ ...settings, lazy_load: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Zap className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="preload-critical">Preload Critical</Label>
                  <p className="text-sm text-gray-500">Preload critical footer content</p>
                </div>
              </div>
              <Switch
                id="preload-critical"
                checked={settings.preload_critical}
                onCheckedChange={(checked) => setSettings({ ...settings, preload_critical: checked })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cache-duration">Cache Duration (seconds)</Label>
            <Input
              id="cache-duration"
              type="number"
              value={settings.cache_duration}
              onChange={(e) => setSettings({ ...settings, cache_duration: parseInt(e.target.value) || 3600 })}
              placeholder="3600"
            />
            <p className="text-sm text-gray-500">How long to cache footer content</p>
          </div>
        </CardContent>
      </Card>

      {/* SEO & Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            SEO & Accessibility
          </CardTitle>
          <CardDescription>
            Configure SEO and accessibility features
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Search className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="structured-data">Structured Data</Label>
                  <p className="text-sm text-gray-500">Enable JSON-LD structured data</p>
                </div>
              </div>
              <Switch
                id="structured-data"
                checked={settings.structured_data}
                onCheckedChange={(checked) => setSettings({ ...settings, structured_data: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Eye className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="aria-labels">ARIA Labels</Label>
                  <p className="text-sm text-gray-500">Enable ARIA accessibility labels</p>
                </div>
              </div>
              <Switch
                id="aria-labels"
                checked={settings.enable_aria_labels}
                onCheckedChange={(checked) => setSettings({ ...settings, enable_aria_labels: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Eye className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="skip-content">Skip to Content</Label>
                  <p className="text-sm text-gray-500">Enable skip to content link</p>
                </div>
              </div>
              <Switch
                id="skip-content"
                checked={settings.skip_to_content}
                onCheckedChange={(checked) => setSettings({ ...settings, skip_to_content: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Eye className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="focus-indicators">Focus Indicators</Label>
                  <p className="text-sm text-gray-500">Show focus indicators for keyboard navigation</p>
                </div>
              </div>
              <Switch
                id="focus-indicators"
                checked={settings.focus_indicators}
                onCheckedChange={(checked) => setSettings({ ...settings, focus_indicators: checked })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="schema-type">Schema Type</Label>
            <Select
              value={settings.schema_type}
              onValueChange={(value) => setSettings({ ...settings, schema_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select schema type" />
              </SelectTrigger>
              <SelectContent>
                {schemaOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Integration Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Integration Settings
          </CardTitle>
          <CardDescription>
            Configure third-party integrations and tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center space-x-3">
              <Code className="h-5 w-5 text-gray-600" />
              <div>
                <Label htmlFor="enable-analytics">Enable Analytics</Label>
                <p className="text-sm text-gray-500">Enable footer analytics tracking</p>
              </div>
            </div>
            <Switch
              id="enable-analytics"
              checked={settings.enable_analytics}
              onCheckedChange={(checked) => setSettings({ ...settings, enable_analytics: checked })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="google-analytics">Google Analytics ID</Label>
              <Input
                id="google-analytics"
                value={settings.google_analytics_id || ''}
                onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook-pixel">Facebook Pixel ID</Label>
              <Input
                id="facebook-pixel"
                value={settings.facebook_pixel_id || ''}
                onChange={(e) => setSettings({ ...settings, facebook_pixel_id: e.target.value })}
                placeholder="XXXXXXXXXX"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hotjar-id">Hotjar ID</Label>
              <Input
                id="hotjar-id"
                value={settings.hotjar_id || ''}
                onChange={(e) => setSettings({ ...settings, hotjar_id: e.target.value })}
                placeholder="XXXXXXXXXX"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-tracking">Custom Tracking Code</Label>
            <Textarea
              id="custom-tracking"
              value={settings.custom_tracking_code || ''}
              onChange={(e) => setSettings({ ...settings, custom_tracking_code: e.target.value })}
              placeholder="<!-- Custom tracking code here -->"
              rows={4}
            />
            <p className="text-sm text-gray-500">Add custom JavaScript tracking code</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="custom-css">Custom CSS</Label>
              <Textarea
                id="custom-css"
                value={settings.custom_css || ''}
                onChange={(e) => setSettings({ ...settings, custom_css: e.target.value })}
                placeholder="/* Custom CSS styles */"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-js">Custom JavaScript</Label>
              <Textarea
                id="custom-js"
                value={settings.custom_js || ''}
                onChange={(e) => setSettings({ ...settings, custom_js: e.target.value })}
                placeholder="// Custom JavaScript code"
                rows={4}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Advanced Options
          </CardTitle>
          <CardDescription>
            Advanced configuration and debugging options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              These settings are for advanced users. Changes may affect footer functionality.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="debug-mode">Debug Mode</Label>
                  <p className="text-sm text-gray-500">Enable debug information</p>
                </div>
              </div>
              <Switch
                id="debug-mode"
                checked={settings.enable_debug_mode}
                onCheckedChange={(checked) => setSettings({ ...settings, enable_debug_mode: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="console-logs">Console Logs</Label>
                  <p className="text-sm text-gray-500">Enable console logging</p>
                </div>
              </div>
              <Switch
                id="console-logs"
                checked={settings.enable_console_logs}
                onCheckedChange={(checked) => setSettings({ ...settings, enable_console_logs: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="performance-monitoring">Performance Monitoring</Label>
                  <p className="text-sm text-gray-500">Monitor footer performance</p>
                </div>
              </div>
              <Switch
                id="performance-monitoring"
                checked={settings.enable_performance_monitoring}
                onCheckedChange={(checked) => setSettings({ ...settings, enable_performance_monitoring: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-600" />
                <div>
                  <Label htmlFor="backup-settings">Backup Settings</Label>
                  <p className="text-sm text-gray-500">Automatically backup settings</p>
                </div>
              </div>
              <Switch
                id="backup-settings"
                checked={settings.backup_settings}
                onCheckedChange={(checked) => setSettings({ ...settings, backup_settings: checked })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <Select
                value={settings.auto_backup_frequency}
                onValueChange={(value) => setSettings({ ...settings, auto_backup_frequency: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {backupFrequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retention-days">Backup Retention (days)</Label>
              <Input
                id="retention-days"
                type="number"
                value={settings.backup_retention_days}
                onChange={(e) => setSettings({ ...settings, backup_retention_days: parseInt(e.target.value) || 30 })}
                placeholder="30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settings-version">Settings Version</Label>
            <Input
              id="settings-version"
              value={settings.settings_version}
              onChange={(e) => setSettings({ ...settings, settings_version: e.target.value })}
              placeholder="1.0.0"
            />
            <p className="text-sm text-gray-500">Current version of footer settings</p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="min-w-[120px]">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  )
} 