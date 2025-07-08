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

// Safe icon mapping - only include icons we know work
const SAFE_ICON_MAP: Record<string, () => JSX.Element> = {
  // Original Icons
  Home: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Building2: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Star: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Heart: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  MapPin: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Users: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Calendar: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Tag: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  DollarSign: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Car: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Trees: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Sun: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Moon: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Cloud: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Wifi: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Battery: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Camera: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Phone: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Mail: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  MessageSquare: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Settings: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  User: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Lock: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Unlock: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Eye: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  EyeOff: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Plus: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Minus: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Check: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  X: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  ArrowRight: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  ArrowLeft: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Search: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Filter: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  SortAsc: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  SortDesc: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Download: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Upload: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Edit: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Trash2: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Save: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  RefreshCw: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Clock: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  AlertCircle: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Info: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  HelpCircle: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  ExternalLink: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Link: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Share2: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Bookmark: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  BookOpen: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  FileText: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Image: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Video: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Music: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Volume2: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  VolumeX: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Play: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Pause: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  SkipBack: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  SkipForward: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  RotateCcw: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  RotateCw: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  ZoomIn: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  ZoomOut: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Move: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Crop: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Scissors: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Type: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Bold: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Italic: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Underline: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  List: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Grid: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Columns: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Rows: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  PieChart: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  BarChart3: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  TrendingUp: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  TrendingDown: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Activity: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Zap: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Target: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Award: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Gift: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  ShoppingCart: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  CreditCard: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Wallet: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  PiggyBank: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Coins: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  
  // Real Estate & Property Icons
  Building: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  HomeIcon: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Bed: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Bath: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Kitchen: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Garage: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Pool: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Garden: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Mountain: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Beach: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  City: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Map: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Navigation: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Compass: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Globe: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  
  // Business & Finance Icons
  Briefcase: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Office: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Store: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Factory: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Warehouse: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Bank: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Savings: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Payment: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Receipt: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Calculator: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Growth: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Decline: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  
  // Technology & Communication Icons
  Smartphone: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Laptop: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Monitor: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Printer: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Server: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Database: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Internet: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Signal: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Bluetooth: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Satellite: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Router: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  
  // Lifestyle & Amenities Icons
  Coffee: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Utensils: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  ShoppingBag: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Gym: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Dumbbell: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Tennis: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Golf: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Swimming: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Bike: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Vehicle: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Plane: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Train: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  
  // Nature & Environment Icons
  Leaf: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Flower: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Nature: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Waves: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Snowflake: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Umbrella: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  
  // Security & Safety Icons
  Shield: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  AlertTriangle: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Fire: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  FirstAid: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  LifeBuoy: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  
  // Utilities & Services Icons
  Lightbulb: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Plug: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Water: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  GasPump: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Tools: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Wrench: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  
  // Social & Community Icons
  Community: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  UserPlus: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  UserMinus: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  UserCheck: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  MessageCircle: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Contact: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Email: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  
  // Media & Entertainment Icons
  Tv: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Radio: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Headphones: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Gamepad2: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Film: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Photo: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  
  // Food & Dining Icons
  UtensilsCrossed: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Wine: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Beer: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Pizza: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Hamburger: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Cafe: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  
  // Transportation Icons
  Bus: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Taxi: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Ship: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Rocket: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Bicycle: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Motorcycle: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  
  // Weather & Time Icons
  Sunrise: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Sunset: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  CloudRain: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  CloudLightning: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Wind: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Thermometer: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  
  // Miscellaneous Icons
  Package: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Box: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Archive: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Folder: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  File: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Paperclip: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  
  // Additional Business Icons
  BarChart: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Analytics: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  LineChart: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Stats: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Goal: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Achievement: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Trophy: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Medal: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  
  // Additional Property Icons
  Key: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Door: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Window: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Stairs: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Elevator: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Parking: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Security: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  
  // Additional Technology Icons
  Cpu: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  HardDrive: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Memory: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Network: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Storage: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Backup: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  
  // Additional Lifestyle Icons
  Health: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Smile: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  ThumbsUp: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Favorite: () => <Tag className="h-4 w-4 text-muted-foreground" />,
  Saved: () => <Tag className="h-4 w-4 text-muted-foreground" />
}

export function PropertyCategories() {
  const form = useFormContext()
  const { categories, loading, error, refetch } = useCategories({ includeInactive: false })

  const renderIcon = (iconName: string) => {
    // Debug log
    if (typeof window !== 'undefined') {
      // eslint-disable-next-line no-console
      console.log('Category icon:', iconName)
    }
    if (typeof iconName === 'string' && iconName in SAFE_ICON_MAP) {
      const IconComponent = SAFE_ICON_MAP[iconName]
      return <IconComponent />
    }
    // Try case-insensitive match
    if (typeof iconName === 'string') {
      const foundKey = Object.keys(SAFE_ICON_MAP).find(
        key => key.toLowerCase() === iconName.toLowerCase()
      )
      if (foundKey) {
        const IconComponent = SAFE_ICON_MAP[foundKey]
        return <IconComponent />
      }
    }
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
          render={() => (
            <FormItem>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-2">
                  {categories.map((category) => (
                    <FormField
                      key={category.id}
                      control={form.control}
                      name="categories"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(category.name)}
                              onCheckedChange={(checked) => {
                                const currentValue = field.value || []
                                if (checked) {
                                  field.onChange([...currentValue, category.name])
                                } else {
                                  field.onChange(
                                    currentValue.filter((value: string) => value !== category.name)
                                  )
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal text-sm cursor-pointer mb-0 flex-1">
                            {category.name}
                          </FormLabel>
                          {renderIcon(category.icon)}
                        </FormItem>
                      )}
                    />
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
              {form.watch('categories').map((category: string) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 