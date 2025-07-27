import React, { useState, useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tag, Loader2 } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'

// Import actual Lucide icons
import {
  Home,
  Building2,
  Star,
  Heart,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  Car,
  Trees,
  Sun,
  Moon,
  Cloud,
  Wifi,
  Battery,
  Camera,
  Phone,
  Mail,
  MessageSquare,
  Settings,
  User,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Download,
  Upload,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Clock,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Link,
  Share2,
  Bookmark,
  BookOpen,
  FileText,
  Image,
  Video,
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Crop,
  Scissors,
  Type,
  Bold,
  Italic,
  Underline,
  List,
  Grid,
  Columns,
  Rows,
  PieChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Target,
  Award,
  Gift,
  ShoppingCart,
  CreditCard,
  Wallet,
  PiggyBank,
  Coins,
  Building,
  Bed,
  Bath,
  Mountain,
  Map,
  Navigation,
  Compass,
  Globe,
  Briefcase,
  Store,
  Factory,
  Warehouse,
  Receipt,
  Calculator,
  Smartphone,
  Laptop,
  Monitor,
  Printer,
  Server,
  Database,
  Signal,
  Bluetooth,
  Satellite,
  Router,
  Coffee,
  Utensils,
  ShoppingBag,
  Dumbbell
} from 'lucide-react'

// Type definitions
interface CategoryObject {
  name: string;
  icon?: string;
}

interface IconComponentProps {
  className?: string;
}

// Safe icon mapping with actual Lucide icons
const SAFE_ICON_MAP: Record<string, React.ComponentType<IconComponentProps>> = {
  // Original Icons
  Home,
  Building2,
  Star,
  Heart,
  MapPin,
  Users,
  Calendar,
  DollarSign,
  Car,
  Trees,
  Sun,
  Moon,
  Cloud,
  Wifi,
  Battery,
  Camera,
  Phone,
  Mail,
  MessageSquare,
  Settings,
  User,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Check,
  X,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Download,
  Upload,
  Edit,
  Trash2,
  Save,
  RefreshCw,
  Clock,
  AlertCircle,
  Info,
  HelpCircle,
  ExternalLink,
  Link,
  Share2,
  Bookmark,
  BookOpen,
  FileText,
  Image,
  Video,
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Crop,
  Scissors,
  Type,
  Bold,
  Italic,
  Underline,
  List,
  Grid,
  Columns,
  Rows,
  PieChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Target,
  Award,
  Gift,
  ShoppingCart,
  CreditCard,
  Wallet,
  PiggyBank,
  Coins,
  Building,
  Bed,
  Bath,
  Mountain,
  Map,
  Navigation,
  Compass,
  Globe,
  Briefcase,
  Store,
  Factory,
  Warehouse,
  Receipt,
  Calculator,
  Smartphone,
  Laptop,
  Monitor,
  Printer,
  Server,
  Database,
  Signal,
  Bluetooth,
  Satellite,
  Router,
  Coffee,
  Utensils,
  ShoppingBag,
  Dumbbell
}

export function PropertyCategories() {
  const form = useFormContext()
  const { categories, loading, error, refetch } = useCategories({ includeInactive: false })
  const [isClient, setIsClient] = useState(false)

  // Ensure we're on the client side to avoid hydration issues
  useEffect(() => {
    setIsClient(true)
  }, [])

  const renderIcon = (iconName?: string) => {
    if (!iconName || typeof iconName !== 'string') {
      return <Tag className="h-4 w-4 text-muted-foreground" />
    }
    
    // Direct match
    if (iconName in SAFE_ICON_MAP) {
      const IconComponent = SAFE_ICON_MAP[iconName]
      return <IconComponent className="h-4 w-4 text-muted-foreground" />
    }
    
    // Case-insensitive match
    const foundKey = Object.keys(SAFE_ICON_MAP).find(
      key => key.toLowerCase() === iconName.toLowerCase()
    )
    if (foundKey) {
      const IconComponent = SAFE_ICON_MAP[foundKey]
      return <IconComponent className="h-4 w-4 text-muted-foreground" />
    }
    
    // Fallback to Tag icon
    return <Tag className="h-4 w-4 text-muted-foreground" />
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Property Categories
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select relevant categories to help buyers find your property
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading categories...</span>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Property Categories
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select relevant categories to help buyers find your property
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button 
              onClick={refetch}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Try again
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Property Categories
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select relevant categories to help buyers find your property
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground mb-4">No categories available</p>
            <p className="text-xs text-muted-foreground">
              Categories need to be created in the admin panel first
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Don't render form content during SSR to avoid hydration issues
  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Property Categories
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Select relevant categories to help buyers find your property
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-5 w-5" />
          Property Categories
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select relevant categories to help buyers find your property
        </p>
      </CardHeader>
      <CardContent>
        <FormField
          control={form.control}
          name="categories"
          render={({ field }) => (
            <FormItem>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-2">
                  {categories.map((category) => (
                    <div key={category.id} className="flex flex-row items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.some((cat: CategoryObject) => cat.name === category.name)}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || []
                            if (checked) {
                              field.onChange([...currentValue, { name: category.name, icon: category.icon }])
                            } else {
                              field.onChange(
                                currentValue.filter((cat: CategoryObject) => cat.name !== category.name)
                              )
                            }
                          }}
                        />
                      </FormControl>
                      {renderIcon(category.icon)}
                      <FormLabel className="font-normal text-sm cursor-pointer mb-0 flex-1">
                        {category.name}
                      </FormLabel>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.watch('categories')?.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium">Selected Categories:</span>
              <Badge variant="secondary">{form.watch('categories').length}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.watch('categories').map((category: CategoryObject, index: number) => (
                <Badge key={`${category.name}-${index}`} variant="outline" className="text-xs flex items-center gap-1">
                  {renderIcon(category.icon)}
                  {category.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}