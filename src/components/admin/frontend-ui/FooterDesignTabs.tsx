'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Layout, 
  FileText, 
  Palette, 
  Link, 
  Image,
  Settings,
  Save
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'

// Import tab components
import FooterLayoutTab from './FooterLayoutTab'
import FooterContentTab from './FooterContentTab'
import FooterStylingTab from './FooterStylingTab'
import FooterLinksTab from './FooterLinksTab'
import FooterLogoTab from './FooterLogoTab'
import FooterSettingsTab from './FooterSettingsTab'

export default function FooterDesignTabs() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('layout')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // TODO: Implement save functionality
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast({
        title: 'Success',
        description: 'Footer settings saved successfully',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save footer settings',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="styling" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Styling
          </TabsTrigger>
          <TabsTrigger value="links" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Links
          </TabsTrigger>
          <TabsTrigger value="logo" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Logo
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="layout" className="space-y-6">
          <FooterLayoutTab />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <FooterContentTab />
        </TabsContent>

        <TabsContent value="styling" className="space-y-6">
          <FooterStylingTab />
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <FooterLinksTab />
        </TabsContent>

        <TabsContent value="logo" className="space-y-6">
          <FooterLogoTab />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <FooterSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
} 