import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  DollarSign,
  Eye,
  Heart,
  Star,
  CheckCircle,
  Target,
  BarChart3
} from 'lucide-react'
import { formatIndianPrice, formatIndianNumber } from '@/lib/utils'

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

interface PropertiesStatsProps {
  properties: Property[]
  filteredProperties: Property[]
}

export default function PropertiesStats({ properties, filteredProperties }: PropertiesStatsProps) {
  // Calculate statistics
  const totalProperties = properties.length
  const filteredCount = filteredProperties.length
  const totalPrice = properties.reduce((sum, p) => sum + p.price, 0)
  const averagePrice = totalProperties > 0 ? totalPrice / totalProperties : 0
  const totalViews = properties.reduce((sum, p) => sum + (p.view_count || 0), 0)
  const totalFavorites = properties.reduce((sum, p) => sum + (p.favorite_count || 0), 0)
  const totalReviews = properties.reduce((sum, p) => sum + (p.review_count || 0), 0)
  const averageRating = properties.reduce((sum, p) => sum + (p.average_rating || 0), 0) / Math.max(properties.filter(p => p.average_rating).length, 1)
  
  const verifiedProperties = properties.filter(p => p.is_verified).length
  const verificationRate = totalProperties > 0 ? (verifiedProperties / totalProperties) * 100 : 0
  
  const activeProperties = properties.filter(p => p.status === 'Active' || !p.status).length
  const pendingProperties = properties.filter(p => p.status === 'Pending').length
  
  // Property type distribution
  const typeDistribution = properties.reduce((acc, p) => {
    acc[p.property_type] = (acc[p.property_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const mostCommonType = Object.entries(typeDistribution).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
  
  // Collection distribution
  const collectionDistribution = properties.reduce((acc, p) => {
    if (p.property_collection) {
      acc[p.property_collection] = (acc[p.property_collection] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
  
  const mostCommonCollection = Object.entries(collectionDistribution).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
  
  // Recent activity (properties added in last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const recentProperties = properties.filter(p => 
    p.created_at && new Date(p.created_at) > thirtyDaysAgo
  ).length

  const stats = [
    {
      title: 'Total Properties',
      value: totalProperties,
      change: filteredCount !== totalProperties ? `${filteredCount} filtered` : undefined,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Total property listings'
    },
    {
      title: 'Average Price',
      value: formatIndianPrice(averagePrice),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Average property price'
    },
    {
      title: 'Total Views',
      value: formatIndianNumber(totalViews),
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Combined view count'
    },
    {
      title: 'Verification Rate',
      value: `${verificationRate.toFixed(1)}%`,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: `${verifiedProperties} of ${totalProperties} verified`
    },
    {
      title: 'Total Favorites',
      value: formatIndianNumber(totalFavorites),
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      description: 'Combined favorite count'
    },
    {
      title: 'Average Rating',
      value: averageRating.toFixed(1),
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      description: `${totalReviews} total reviews`
    }
  ]

  const insights = [
    {
      title: 'Most Common Type',
      value: mostCommonType,
      icon: Building2,
      color: 'text-blue-600'
    },
    {
      title: 'Most Common Collection',
      value: mostCommonCollection,
      icon: Target,
      color: 'text-purple-600'
    },
    {
      title: 'Recent Activity',
      value: `${recentProperties} new`,
      icon: BarChart3,
      color: 'text-green-600'
    },
    {
      title: 'Status Distribution',
      value: `${activeProperties} active, ${pendingProperties} pending`,
      icon: BarChart3,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.change && (
                      <Badge variant="secondary" className="text-xs">
                        {stat.change}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights Row */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            Portfolio Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className={`p-2 rounded-lg bg-background`}>
                  <insight.icon className={`h-4 w-4 ${insight.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium">{insight.title}</p>
                  <p className="text-sm text-muted-foreground">{insight.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property Type Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Property Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(typeDistribution)
                .sort(([,a], [,b]) => b - a)
                .map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{type}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(count / totalProperties) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Collections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(collectionDistribution)
                .sort(([,a], [,b]) => b - a)
                .map(([collection, count]) => (
                  <div key={collection} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{collection}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${(count / totalProperties) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 