'use client'

import { useLogo } from '@/hooks/useLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react'

export default function LogoTest() {
  const { logoUrl, logoAlt, isLoading, error, hasLogo, refetch } = useLogo()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Logo Test Component
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Badge variant="secondary" className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Loading...
            </Badge>
          ) : error ? (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Error
            </Badge>
          ) : hasLogo ? (
            <Badge variant="default" className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Logo Found
            </Badge>
          ) : (
            <Badge variant="outline" className="flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              No Logo
            </Badge>
          )}
        </div>

        {/* Logo URL */}
        <div>
          <p className="text-sm font-medium text-gray-700">Logo URL:</p>
          <p className="text-xs text-gray-500 break-all">
            {logoUrl || 'No URL available'}
          </p>
        </div>

        {/* Alt Text */}
        <div>
          <p className="text-sm font-medium text-gray-700">Alt Text:</p>
          <p className="text-xs text-gray-500">{logoAlt}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div>
            <p className="text-sm font-medium text-red-700">Error:</p>
            <p className="text-xs text-red-500">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={refetch} 
            size="sm" 
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 