'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Key, 
  Copy, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle, 
  Database,
  XCircle,
  Shield
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export function ApiKeysAuthGate() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [config, setConfig] = useState({
    hasSupabaseUrl: false,
    hasAnonKey: false,
    isConfigured: false,
    canConnect: false,
    connectionError: null as string | null
  })
  const [showKeys, setShowKeys] = useState(false)

  const checkAuth = useCallback(async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/users/login')
        return
      }
      
      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !profile || profile.role !== 'admin') {
        router.push('/admin/dashboard?error=unauthorized')
        return
      }
    } catch (error) {
      console.error('Auth check error:', error)
      router.push('/users/login')
      return
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    checkAuth()
    checkConfig()
  }, [checkAuth])

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

  const copyEnvTemplate = () => {
    const template = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key`
    
    navigator.clipboard.writeText(template)
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
  }

  const getMaskedKey = (key: string) => {
    if (!key) return 'Not configured'
    if (showKeys) return key
    return key.substring(0, 8) + '...' + key.substring(key.length - 8)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your API keys and configuration settings.
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">API Keys</h1>
        <p className="text-muted-foreground">
          Manage your API keys and configuration settings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Configuration Status
          </CardTitle>
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

          {!config.isConfigured && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <p>To fix this, create a .env.local file in your project root with:</p>
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

      {config.isConfigured && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Keys
            </CardTitle>
            <CardDescription>
              Your current API keys and credentials (handle with care)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Show/Hide Keys</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowKeys(!showKeys)}
                className="gap-2"
              >
                {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showKeys ? 'Hide' : 'Show'} Keys
              </Button>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Supabase URL</span>
                  <Badge variant="secondary">Public</Badge>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <code className="text-sm flex-1">{process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyKey(process.env.NEXT_PUBLIC_SUPABASE_URL || '')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Anon Key</span>
                  <Badge variant="secondary">Public</Badge>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <code className="text-sm flex-1">{getMaskedKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Service Role Key</span>
                  <Badge variant="destructive">Private</Badge>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <code className="text-sm flex-1">{getMaskedKey(process.env.SUPABASE_SERVICE_ROLE_KEY || '')}</code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyKey(process.env.SUPABASE_SERVICE_ROLE_KEY || '')}
                    className="h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  ⚠️ Service role key should only be used server-side and never exposed to the client
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Notice */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Shield className="h-5 w-5" />
            Security Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-orange-700">
            <p>• Keep your API keys secure and never commit them to version control</p>
            <p>• Use environment variables for all sensitive configuration</p>
            <p>• Regularly rotate your keys for enhanced security</p>
            <p>• The service role key has full database access - use with extreme caution</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 