import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  TrendingUp,
  Eye,
  Heart,
  Star,
  Calendar,
  CheckCircle,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react'
import { formatIndianNumber } from '@/lib/utils'

interface Property {
  id: string
  title: string
  price: number
  property_type: string
  location: string
  thumbnail_url?: string
  bhk: number
  area: number
  bedrooms: number
  bathrooms: number
  created_at?: string
  status?: string
  rera_number?: string
  view_count?: number
  favorite_count?: number
  review_count?: number
  average_rating?: number
  is_verified?: boolean
  property_collection?: string
}

interface PropertiesAnalyticsProps {
  properties: Property[]
}

export default function PropertiesAnalytics({ properties }: PropertiesAnalyticsProps) {
  // Calculate performance metrics
  const totalViews = properties.reduce((sum, p) => sum + (p.view_count || 0), 0)
  const totalFavorites = properties.reduce((sum, p) => sum + (p.favorite_count || 0), 0)
  const averageRating = properties.reduce((sum, p) => sum + (p.average_rating || 0), 0) / Math.max(properties.filter(p => p.average_rating).length, 1)
  
  // Recent activity (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentProperties = properties.filter(p => 
    p.created_at && new Date(p.created_at) > sevenDaysAgo
  )
  
  // Top performing properties
  const topViewed = [...properties]
    .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
    .slice(0, 3)
  
  const topFavorited = [...properties]
    .sort((a, b) => (b.favorite_count || 0) - (a.favorite_count || 0))
    .slice(0, 3)
  
  const topRated = [...properties]
    .filter(p => p.average_rating && p.average_rating > 0)
    .sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0))
    .slice(0, 3)
  
  // Properties needing attention
  const unverifiedProperties = properties.filter(p => !p.is_verified)
  const lowViewedProperties = properties.filter(p => (p.view_count || 0) < 10)
  const noReviewsProperties = properties.filter(p => (p.review_count || 0) === 0)
  
  // Performance trends (simplified - in real app would use actual time series data)
  const performanceTrends = [
    {
      metric: 'Views',
      current: totalViews,
      previous: Math.floor(totalViews * 0.9), // Simulated previous period
      trend: 'up',
      percentage: 10
    },
    {
      metric: 'Favorites',
      current: totalFavorites,
      previous: Math.floor(totalFavorites * 0.95),
      trend: 'up',
      percentage: 5
    },
    {
      metric: 'Average Rating',
      current: averageRating,
      previous: averageRating * 0.98,
      trend: 'up',
      percentage: 2
    }
  ]

  const recommendations = [
    {
      title: 'Verify Properties',
      description: `${unverifiedProperties.length} properties need verification`,
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      action: 'Review Now',
      priority: 'high'
    },
    {
      title: 'Boost Visibility',
      description: `${lowViewedProperties.length} properties have low views`,
      icon: Eye,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      action: 'Optimize',
      priority: 'medium'
    },
    {
      title: 'Encourage Reviews',
      description: `${noReviewsProperties.length} properties have no reviews`,
      icon: Star,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      action: 'Promote',
      priority: 'medium'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {performanceTrends.map((trend) => (
                              <div key={trend.metric} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{trend.metric}</p>
                  <p className="text-2xl font-bold">
                    {trend.metric === 'Average Rating' ? trend.current.toFixed(1) : formatIndianNumber(trend.current)}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {trend.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${trend.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    +{trend.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Most Viewed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topViewed.map((property) => (
                <div key={property.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{property.title}</p>
                    <p className="text-xs text-muted-foreground">{property.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{property.view_count || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Most Favorited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topFavorited.map((property) => (
                <div key={property.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{property.title}</p>
                    <p className="text-xs text-muted-foreground">{property.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{property.favorite_count || 0}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Top Rated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRated.map((property) => (
                <div key={property.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{property.title}</p>
                    <p className="text-xs text-muted-foreground">{property.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{(property.average_rating || 0).toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec) => (
                              <div key={rec.title} className={`p-4 rounded-lg ${rec.bgColor} border`}>
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-background`}>
                    <rec.icon className={`h-5 w-5 ${rec.color}`} />
                  </div>
                  <Badge 
                    variant={rec.priority === 'high' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {rec.priority}
                  </Badge>
                </div>
                <h3 className="font-semibold mb-1">{rec.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                <Button size="sm" variant="outline" className="w-full">
                  {rec.action}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentProperties.length > 0 ? (
              recentProperties.slice(0, 5).map((property) => (
                <div key={property.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Plus className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{property.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Added {property.created_at ? new Date(property.created_at).toLocaleDateString() : 'recently'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {property.property_type}
                  </Badge>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 