'use client'

import { useState, useEffect } from 'react'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { BasicSEOSettings } from './BasicSEOSettings'
import { AnalyticsSettings } from './AnalyticsSettings'
import { SocialMediaSettings } from './SocialMediaSettings'
import { PerformanceSettings } from './PerformanceSettings'
import { MonitoringSettings } from './MonitoringSettings'
import { AdvancedSettings } from './AdvancedSettings'

interface SEOSettingsContainerProps {
  settings: Record<string, unknown>
  onSave?: (updatedSettings: Record<string, unknown>) => void
}

export function SEOSettingsContainer({ settings, onSave }: SEOSettingsContainerProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [isLoading, setIsLoading] = useState(false)
  // const [seoSettings, setSeoSettings] = useState<Record<string, any>>({})

  const mapDatabaseToForm = (dbSettings: Record<string, unknown>) => {
    // Helper function to get setting value
    const getSettingValue = (key: string, defaultValue: unknown = '') => {
      const setting = Object.values(dbSettings).flat().find((s: unknown) => (s as Record<string, unknown>).setting_key === key) as Record<string, unknown> | undefined
      if (!setting) return defaultValue
      
      // Convert based on setting type
      switch (setting.setting_type as string) {
        case 'boolean':
          return (setting.setting_value as string) === 'true'
        case 'number':
          return parseInt(setting.setting_value as string) || defaultValue
        default:
          return (setting.setting_value as string) || defaultValue
      }
    }

    return {
      // Basic SEO
      siteName: getSettingValue('site_name', settings.siteName || ''),
      siteDescription: getSettingValue('site_description', settings.siteDescription || ''),
      siteKeywords: getSettingValue('site_keywords', settings.siteKeywords || ''),
      siteUrl: getSettingValue('site_url', settings.siteUrl || ''),
      
      // Analytics
      googleAnalyticsId: getSettingValue('google_analytics_id', settings.googleAnalyticsId || ''),
      googleSearchConsoleId: getSettingValue('google_search_console_id', settings.googleSearchConsoleId || ''),
      googleTagManagerId: getSettingValue('google_tag_manager_id', settings.googleTagManagerId || ''),
      
      // Social Media
      facebookAppId: getSettingValue('facebook_app_id', settings.facebookAppId || ''),
      twitterHandle: getSettingValue('twitter_handle', settings.twitterHandle || ''),
      linkedinUrl: getSettingValue('linkedin_url', settings.linkedinUrl || ''),
      
      // Performance
      enableWebVitals: getSettingValue('enable_core_web_vitals_tracking', true),
      enableResourceHints: getSettingValue('enable_resource_hints', true),
      enableCriticalCSS: getSettingValue('enable_critical_css', true),
      
      // Monitoring
      enableSEOMonitoring: getSettingValue('enable_seo_monitoring', true),
      enableAlerts: getSettingValue('enable_seo_alerts', true),
      alertEmail: getSettingValue('alert_email', ''),
      
      // Advanced
      enableStructuredData: getSettingValue('enable_structured_data_validation', true),
      enableSitemap: getSettingValue('enable_sitemap', true),
      enableRobotsTxt: getSettingValue('enable_robots_txt', true),
      customRobotsTxt: getSettingValue('custom_robots_txt', '')
    }
  }

  // Load SEO settings from database
  useEffect(() => {
    const loadSEOSettings = async () => {
      try {
        const response = await fetch('/api/seo/settings')
        if (response.ok) {
          const result = await response.json()
          // setSeoSettings(result.data)
          
          // Map database settings to form data
          const mappedData = mapDatabaseToForm(result.data)
          setFormData(mappedData)
        }
      } catch (error) {
        console.error('Error loading SEO settings:', error)
        toast.error('Failed to load SEO settings')
      }
    }

    loadSEOSettings()
  }, [mapDatabaseToForm])

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev: Record<string, unknown>) => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      
      // Map form data to database structure
      const dbUpdates = {
        // Basic SEO
        site_name: formData.siteName,
        site_description: formData.siteDescription,
        site_keywords: formData.siteKeywords,
        site_url: formData.siteUrl,
        
        // Analytics
        google_analytics_id: formData.googleAnalyticsId,
        google_search_console_id: formData.googleSearchConsoleId,
        google_tag_manager_id: formData.googleTagManagerId,
        
        // Social Media
        facebook_app_id: formData.facebookAppId,
        twitter_handle: formData.twitterHandle,
        linkedin_url: formData.linkedinUrl,
        
        // Performance
        enable_core_web_vitals_tracking: formData.enableWebVitals,
        enable_resource_hints: formData.enableResourceHints,
        enable_critical_css: formData.enableCriticalCSS,
        
        // Monitoring
        enable_seo_monitoring: formData.enableSEOMonitoring,
        enable_seo_alerts: formData.enableAlerts,
        alert_email: formData.alertEmail,
        
        // Advanced
        enable_structured_data_validation: formData.enableStructuredData,
        enable_sitemap: formData.enableSitemap,
        enable_robots_txt: formData.enableRobotsTxt,
        custom_robots_txt: formData.customRobotsTxt,
      }

      const response = await fetch('/api/seo/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dbUpdates),
      })

      if (response.ok) {
        toast.success('SEO settings saved successfully!')
        if (onSave) {
          onSave(formData)
        }
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

  return (
    <div className="space-y-6">
      {/* Basic SEO Settings */}
      <BasicSEOSettings 
        data={formData}
        onChange={handleInputChange}
      />

      {/* Analytics Settings */}
      <AnalyticsSettings 
        data={formData}
        onChange={handleInputChange}
      />

      {/* Social Media Settings */}
      <SocialMediaSettings 
        data={formData}
        onChange={handleInputChange}
      />

      {/* Performance Settings */}
      <PerformanceSettings 
        data={formData}
        onChange={handleInputChange}
      />

      {/* Monitoring Settings */}
      <MonitoringSettings 
        data={formData}
        onChange={handleInputChange}
      />

      {/* Advanced Settings */}
      <AdvancedSettings 
        data={formData}
        onChange={handleInputChange}
      />

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isLoading} className="min-w-32">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
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
