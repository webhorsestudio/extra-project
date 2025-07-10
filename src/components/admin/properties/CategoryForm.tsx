import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { 
  DollarSign as DollarSignIcon,
  Home, Building2, Star, Heart, MapPin, Users, Calendar, Tag,
  Car, Trees, Sun, Moon, Cloud, Wifi, Battery, Camera, Phone,
  Mail, MessageSquare, Settings, User, Lock, Unlock, Eye, EyeOff,
  Plus, Minus, Check, X, ArrowRight, ArrowLeft, Search, Filter,
  SortAsc, SortDesc, Download, Upload, Edit, Trash2, Save, RefreshCw,
  Clock, AlertCircle, Info, HelpCircle, ExternalLink, Link, Share2,
  Bookmark, BookOpen, FileText, Image, Video, Music, Volume2, VolumeX,
  Play, Pause, SkipBack, SkipForward, RotateCcw, RotateCw, ZoomIn,
  ZoomOut, Move, Crop, Scissors, Type, Bold, Italic, Underline,
  List, Grid, Columns, Rows, PieChart, BarChart3, TrendingUp,
  TrendingDown, Activity, Zap, Target, Award, Gift, ShoppingCart,
  CreditCard, Wallet, PiggyBank, Coins, Building, Map, Navigation,
  Compass, Globe, Briefcase, Store, Factory, Receipt, Calculator,
  Smartphone, Laptop, Monitor, Printer, Server, Database, Signal,
  Bluetooth, Satellite, Router, Coffee, Utensils, ShoppingBag,
  Dumbbell, Bike, Plane, Train, Leaf, Flower, Waves, Snowflake,
  Umbrella, Shield, AlertTriangle, LifeBuoy, Lightbulb, Plug,
  Wrench, UserPlus, UserMinus, UserCheck, MessageCircle, Tv,
  Radio, Headphones, Gamepad2, Film, Wine, Beer, Pizza, Hamburger,
  Bus, Ship, Rocket, Sunrise, Sunset, CloudRain, CloudLightning,
  Wind, Thermometer, Package, Box, Archive, Folder, File, Paperclip,
  BarChart, LineChart, Trophy, Medal, Key, Cpu, HardDrive, Network,
  Smile, ThumbsUp,
  // New Requested Icons
  Baby, Gem, TicketPercent, Dog, WavesLadder, Telescope, Church, IdCard
} from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'

// Define a safe list of icons with their components
const ICON_MAP = {
  Home,
  Building2,
  Star,
  Heart,
  MapPin,
  Users,
  Calendar,
  Tag,
  DollarSign: DollarSignIcon,
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
  Map,
  Navigation,
  Compass,
  Globe,
  Briefcase,
  Store,
  Factory,
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
  Dumbbell,
  Bike,
  Plane,
  Train,
  Leaf,
  Flower,
  Waves,
  Snowflake,
  Umbrella,
  Shield,
  AlertTriangle,
  LifeBuoy,
  Lightbulb,
  Plug,
  Wrench,
  UserPlus,
  UserMinus,
  UserCheck,
  MessageCircle,
  Tv,
  Radio,
  Headphones,
  Gamepad2,
  Film,
  Wine,
  Beer,
  Pizza,
  Hamburger,
  Bus,
  Ship,
  Rocket,
  Sunrise,
  Sunset,
  CloudRain,
  CloudLightning,
  Wind,
  Thermometer,
  Package,
  Box,
  Archive,
  Folder,
  File,
  Paperclip,
  BarChart,
  LineChart,
  Trophy,
  Medal,
  Key,
  Cpu,
  HardDrive,
  Network,
  Smile,
  ThumbsUp,
  Baby,
  Gem,
  TicketPercent,
  Dog,
  WavesLadder,
  Telescope,
  Church,
  IdCard
} as const

const ICON_NAMES = Object.keys(ICON_MAP) as (keyof typeof ICON_MAP)[]

export default function CategoryForm({
  mode = 'add',
  initialData,
  onSuccess,
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: {
  mode?: 'add' | 'edit',
  initialData?: {
    id: string
    name: string
    icon: string
    is_active: boolean
  },
  onSuccess?: () => void,
  trigger?: React.ReactNode,
  open?: boolean,
  onOpenChange?: (open: boolean) => void,
}) {
  const [open, setOpen] = useState(false)
  const dialogOpen = controlledOpen !== undefined ? controlledOpen : open
  const handleOpenChange = controlledOnOpenChange || setOpen
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  
  // Use the categories hook to refresh the list after operations
  const { refetch } = useCategories({ includeInactive: true })

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name || '')
      if (typeof initialData.icon !== 'string') {
        console.warn('CategoryForm: initialData.icon is not a string:', initialData.icon)
        setIcon('')
      } else {
        setIcon(initialData.icon)
      }
      setIsActive(initialData.is_active !== false)
    } else if (!open) {
      setName('')
      setIcon('')
      setIsActive(true)
    }
  }, [mode, initialData, open])

  const filteredIcons = useMemo(() => {
    if (!search || typeof search !== 'string') {
      return ICON_NAMES.slice(0, 50)
    }
    
    const searchLower = search.toLowerCase()
    return ICON_NAMES
      .filter((iconName) => iconName.toLowerCase().includes(searchLower))
      .slice(0, 50)
  }, [search])

  const SelectedIcon = icon && icon in ICON_MAP ? ICON_MAP[icon as keyof typeof ICON_MAP] : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    if (!icon || !ICON_NAMES.includes(icon as keyof typeof ICON_MAP)) {
      setError('Please select a valid icon.')
      setLoading(false)
      return
    }
    
    let res, data
    try {
      if (mode === 'edit' && initialData) {
        res = await fetch(`/api/categories/${initialData.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, icon, is_active: isActive }),
        })
        data = await res.json()
      } else {
        res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, icon })
        })
        data = await res.json()
      }
    } catch (fetchError) {
      console.error('Fetch error:', fetchError)
      setError('Network error. Please try again.')
      setLoading(false)
      return
    }
    
    setLoading(false)
    if (!res.ok) {
      setError(data.error || 'Failed to save category')
      toast({
        title: data.error || 'Failed to save category',
        description: data.error || 'Failed to save category',
        variant: 'destructive',
      })
      return
    }
    setOpen(false)
    
    // Refresh the categories cache
    try {
      await refetch()
    } catch (refetchError) {
      console.error('Refetch error:', refetchError)
      // Don't fail the operation if refetch fails
    }
    
    // Call onSuccess for client-side refresh
    if (onSuccess) onSuccess()
    
    toast({
      title: mode === 'edit' ? 'Category updated' : 'Category added',
      description: mode === 'edit' ? 'Category updated' : 'Category added',
    })
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger || <Button variant="default">{mode === 'edit' ? 'Edit' : 'Add Category'}</Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogDescription>
            {mode === 'edit'
              ? 'Update the category name, icon, or status.'
              : 'Enter a category name and select a Lucide icon below.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="block mb-1 font-medium">Category Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} required disabled={loading} />
          </div>
          <div>
            <Label className="block mb-1 font-medium">Lucide Icon</Label>
            <div className="flex items-center gap-3 mb-2">
              <Input
                placeholder="Search icons..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                disabled={loading}
                className="w-1/2"
              />
              {SelectedIcon && <SelectedIcon className="h-6 w-6 text-muted-foreground" />}
              {icon && !SelectedIcon && <span className="text-xs text-red-500">Invalid icon</span>}
            </div>
            <ScrollArea className="h-40 border rounded p-2 bg-muted">
              <div className="grid grid-cols-6 gap-2">
                {filteredIcons.map((iconName) => {
                  const IconComponent = ICON_MAP[iconName]
                  
                  return (
                    <button
                      type="button"
                      key={iconName}
                      className={`flex flex-col items-center gap-1 p-2 rounded hover:bg-primary/10 transition border ${icon === iconName ? 'border-primary' : 'border-transparent'}`}
                      onClick={() => setIcon(iconName)}
                      tabIndex={0}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="text-[10px] truncate max-w-[48px]">{iconName}</span>
                    </button>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
          {mode === 'edit' && (
            <div className="flex items-center gap-2">
              <Label>Status:</Label>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <span className="text-xs">{isActive ? 'Active' : 'Inactive'}</span>
            </div>
          )}
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={loading}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? (mode === 'edit' ? 'Saving...' : 'Adding...') : (mode === 'edit' ? 'Save Changes' : 'Add Category')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 