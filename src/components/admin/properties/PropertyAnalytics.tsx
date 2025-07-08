'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, Heart, TrendingUp } from 'lucide-react'
import { Property } from '@/types/property'

interface PropertyAnalyticsProps {
  property: Property
}

export function PropertyAnalytics({ property }: PropertyAnalyticsProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Property Analytics</h2>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(property.view_count || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {property.property_views?.length || 0} unique visits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(property.favorite_count || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {property.property_favorites?.length || 0} users favorited
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {property.view_count && property.view_count > 0 
                ? `${((property.favorite_count || 0) / property.view_count * 100).toFixed(1)}%`
                : '0%'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Favorites per view
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Views */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Recent Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            {property.property_views && property.property_views.length > 0 ? (
              <div className="space-y-3">
                {property.property_views.slice(0, 5).map((view) => (
                  <div key={view.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>View from {view.viewer_ip || 'Unknown IP'}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(view.viewed_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No views recorded yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Favorites */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Recent Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            {property.property_favorites && property.property_favorites.length > 0 ? (
              <div className="space-y-3">
                {property.property_favorites.slice(0, 5).map((favorite) => (
                  <div key={favorite.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>{favorite.user?.full_name || favorite.user?.email || 'Unknown User'}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {new Date(favorite.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No favorites yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 