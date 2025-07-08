'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertCircle, Copy } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export function ConfigStatus() {
  const [config, setConfig] = useState({
    hasSupabaseUrl: false,
    hasAnonKey: false,
    isConfigured: false,
    canConnect: false,
    connectionError: null as string | null
  })
  const [isTesting, setIsTesting] = useState(false)

  useEffect(() => {
    const checkConfig = () => {
      const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
      const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      const isConfigured = hasUrl && hasKey

      setConfig(prev => ({
        ...prev,
        hasSupabaseUrl: hasUrl,
        hasAnonKey: hasKey,
        isConfigured
      }))
    }

    checkConfig()
  }, [])

  const testConnection = async () => {
    setIsTesting(true)
    try {
      const { data: _, error } = await supabase
        .from('blog_categories')
        .select('count')
        .limit(1)

      if (error) {
        setConfig(prev => ({
          ...prev,
          canConnect: false,
          connectionError: error.message
        }))
      } else {
        setConfig(prev => ({
          ...prev,
          canConnect: true,
          connectionError: null
        }))
      }
    } catch (error) {
      setConfig(prev => ({
        ...prev,
        canConnect: false,
        connectionError: error instanceof Error ? error.message : 'Unknown error'
      }))
    } finally {
      setIsTesting(false)
    }
  }

  const copyEnvTemplate = () => {
    const template = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Service role key for admin operations (server-side only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`
    
    navigator.clipboard.writeText(template)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Configuration Status</CardTitle>
        <CardDescription>
          Check if your Supabase environment is properly configured
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {config.hasSupabaseUrl ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span>Supabase URL: {config.hasSupabaseUrl ? 'Configured' : 'Missing'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {config.hasAnonKey ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span>Anon Key: {config.hasAnonKey ? 'Configured' : 'Missing'}</span>
          </div>
          
          <div className="flex items-center gap-2">
            {config.isConfigured ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span>Environment: {config.isConfigured ? 'Ready' : 'Incomplete'}</span>
          </div>
        </div>

        {config.isConfigured && (
          <div className="space-y-2">
            <Button 
              onClick={testConnection} 
              disabled={isTesting}
              variant="outline"
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </Button>
            
            {config.canConnect !== null && (
              <div className="flex items-center gap-2">
                {config.canConnect ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span>Database Connection: {config.canConnect ? 'Success' : 'Failed'}</span>
              </div>
            )}
            
            {config.connectionError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{config.connectionError}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {!config.isConfigured && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>To fix this, create a <code>.env.local</code> file in your project root with:</p>
                <Button 
                  onClick={copyEnvTemplate} 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Template
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
} 