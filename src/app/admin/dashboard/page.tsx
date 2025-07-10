import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Building2, 
  Users, 
  Home, 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  ArrowUpRight, 
  MessageSquare, 
  Settings
} from 'lucide-react'
import { getDashboardStats, DashboardStats } from '@/lib/admin-data'
import Link from 'next/link'

export default async function DashboardPage() {
  // Fetch dashboard stats without authentication check first
  let stats: DashboardStats
  try {
    stats = await getDashboardStats()
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    // Return a default stats object if there's an error
    stats = {
      totalUsers: 0,
      totalProperties: 0,
      totalInquiries: 0,
      monthlyUsers: 0,
      monthlyProperties: 0,
      monthlyInquiries: 0,
      recentUsers: [],
      recentProperties: [],
      recentInquiries: []
    }
  }

  const QuickActionCard = ({ title, description, icon: Icon, href, variant = 'default' }: {
    title: string
    description: string
    icon: React.ComponentType<{ className?: string }>
    href: string
    variant?: 'default' | 'primary'
  }) => (
    <Link href={href} className="block">
      <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Icon className={`h-5 w-5 ${variant === 'primary' ? 'text-primary' : 'text-muted-foreground'}`} />
              <h3 className="font-semibold">{title}</h3>
            </div>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
    </Link>
  )

  const StatCard = ({ title, value, description, icon: Icon, trend, color = 'default' }: {
    title: string
    value: string | number
    description: string
    icon: React.ComponentType<{ className?: string }>
    trend?: { value: number; isPositive: boolean }
    color?: 'default' | 'green' | 'blue' | 'yellow' | 'purple'
  }) => {
    const colorClasses = {
      default: 'text-gray-600',
      green: 'text-green-600',
      blue: 'text-blue-600',
      yellow: 'text-yellow-600',
      purple: 'text-purple-600'
    }

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
            {trend && (
            <div className="flex items-center gap-1 mt-1">
                {trend.isPositive ? (
                <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.value}%
                </span>
              </div>
            )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the admin dashboard. Here&apos;s what&apos;s happening with your properties.
        </p>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          title="Add Property"
          description="Create a new property listing"
          icon={Home}
          href="/admin/properties/add"
          variant="primary"
        />
        <QuickActionCard
          title="View Inquiries"
          description="Check new property inquiries"
          icon={MessageSquare}
          href="/admin/inquiries"
        />
        <QuickActionCard
          title="Manage Users"
          description="Add or edit user accounts"
          icon={Users}
          href="/admin/users"
        />
        <QuickActionCard
          title="Settings"
          description="Configure your website"
          icon={Settings}
          href="/admin/settings"
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Monthly Users"
          value={stats.monthlyUsers}
          description="New users this month"
          icon={Users}
          color="green"
        />
        <StatCard
          title="Monthly Properties"
          value={stats.monthlyProperties}
          description="New properties this month"
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Monthly Inquiries"
          value={stats.monthlyInquiries}
          description="New inquiries this month"
          icon={MessageSquare}
          color="yellow"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          description="All registered users"
          icon={Users}
          color="purple"
        />
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Properties"
          value={stats.totalProperties}
          description="Active listings"
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          description="Registered users"
          icon={Users}
          color="green"
        />
        <StatCard
          title="Total Inquiries"
          value={stats.totalInquiries}
          description="All inquiries"
          icon={MessageSquare}
          color="yellow"
        />
        <StatCard
          title="Active Listings"
          value={stats.totalProperties}
          description="Published properties"
          icon={Eye}
          color="purple"
        />
      </div>
    </div>
  )
}

