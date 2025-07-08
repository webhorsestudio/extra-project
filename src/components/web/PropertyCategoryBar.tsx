'use client'
import { useState, useRef, useEffect } from 'react'
import { Tag, Home, Building, Building2, Castle, Briefcase, Store, Map, Package, TreePine, Star, Heart, MapPin, Users, Calendar, DollarSign, Car, Trees, Sun, Moon, Cloud, Wifi, Battery, Camera, Phone, Mail, MessageSquare, Settings, User, Lock, Unlock, Eye, EyeOff, Plus, Minus, Check, X, ArrowRight, ArrowLeft, Search, Filter, SortAsc, SortDesc, Download, Upload, Edit, Trash2, Save, RefreshCw, Clock, AlertCircle, Info, HelpCircle, ExternalLink, Link, Share2, Bookmark, BookOpen, FileText, Image, Video, Music, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, RotateCcw, RotateCw, ZoomIn, ZoomOut, Move, Crop, Scissors, Type, Bold, Italic, Underline, List, Grid, Columns, Rows, PieChart, BarChart3, TrendingUp, TrendingDown, Activity, Zap, Target, Award, Gift, ShoppingCart, CreditCard, Wallet, PiggyBank, Coins, Navigation, Compass, Globe, Factory, Receipt, Calculator, Smartphone, Laptop, Monitor, Printer, Server, Database, Signal, Bluetooth, Satellite, Router, Coffee, Utensils, ShoppingBag, Dumbbell, Bike, Plane, Train, Leaf, Flower, Waves, Snowflake, Umbrella, Shield, AlertTriangle, LifeBuoy, Lightbulb, Plug, Wrench, UserPlus, UserMinus, UserCheck, MessageCircle, Tv, Radio, Headphones, Gamepad2, Film, Wine, Beer, Pizza, Hamburger, Bus, Ship, Rocket, Sunrise, Sunset, CloudRain, CloudLightning, Wind, Thermometer, Box, Archive, Folder, File, Paperclip, BarChart, LineChart, Trophy, Medal, Key, Cpu, HardDrive, Network, Smile, ThumbsUp, Baby, Gem, TicketPercent, Dog, Telescope, Church, IdCard, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PropertyCategory {
  id: string
  name: string
  icon: string
}

interface PropertyCategoryBarProps {
  categories: PropertyCategory[]
}

// Create a safe icon map with fallbacks
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  // Common property icons
  Home,
  Building,
  Building2,
  Castle,
  Briefcase,
  Store,
  Map,
  Package,
  TreePine,
  
  // Additional icons that might be used
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
  Navigation,
  Compass,
  Globe,
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
  Telescope,
  Church,
  IdCard,
  ChevronLeft,
  ChevronRight
}

// Error boundary component for category bar
function CategoryBarErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <AlertCircle className="h-4 w-4 mr-2" />
            Unable to load categories
          </div>
        </div>
      </div>
    )
  }

  return (
    <div onError={() => setHasError(true)}>
      {children}
    </div>
  )
}

// Hydration-safe component wrapper
function HydrationSafeCategoryBar({ categories }: PropertyCategoryBarProps) {
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Set hydrated state after mount
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  // Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  // Check scroll position on mount and when categories change
  useEffect(() => {
    if (isHydrated) {
      checkScrollPosition()
      
      const handleResize = () => {
        setTimeout(checkScrollPosition, 100)
      }
      
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [categories, isHydrated])

  // Check scroll position when scrolling
  useEffect(() => {
    if (isHydrated) {
      const scrollContainer = scrollContainerRef.current
      if (scrollContainer) {
        const handleScroll = () => {
          checkScrollPosition()
        }
        
        scrollContainer.addEventListener('scroll', handleScroll)
        return () => scrollContainer.removeEventListener('scroll', handleScroll)
      }
    }
  }, [isHydrated])

  // Validate categories data
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Info className="h-4 w-4 mr-2" />
            No categories available
          </div>
        </div>
      </div>
    )
  }

  // Show loading state during hydration
  if (!isHydrated) {
    return (
      <div className="bg-gray-50 border-b border-gray-200 py-4">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative py-4">
      {/* Left Arrow - Desktop Only */}
      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className="hidden lg:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>
      )}

      {/* Categories Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => {
          // Safely get the icon component
          const IconComponent = ICON_MAP[category.icon] || Tag
          
          return (
            <button
              key={category.id}
              className="flex flex-col items-center gap-2 min-w-[80px] p-3 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 group"
              onClick={() => {
                // Navigate to properties page filtered by category name
                router.push(`/web/properties?category=${encodeURIComponent(category.name)}`);
              }}
            >
              <div className="p-2 bg-white rounded-lg group-hover:bg-blue-50 transition-colors">
                <IconComponent className="h-6 w-6 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </div>
              <span className="text-xs font-medium text-gray-700 text-center leading-tight">
                {category.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Right Arrow - Desktop Only */}
      {showRightArrow && (
        <button
          onClick={scrollRight}
          className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 rounded-full p-2 shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      )}
    </div>
  )
}

export function PropertyCategoryBar({ categories }: PropertyCategoryBarProps) {
  return (
    <CategoryBarErrorBoundary>
      <HydrationSafeCategoryBar categories={categories} />
    </CategoryBarErrorBoundary>
  )
} 