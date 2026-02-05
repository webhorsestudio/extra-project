"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Tag, Home, Building, Building2, Castle, Briefcase, Store, Map, Package, TreePine, Star, Heart, MapPin, Users, Calendar, DollarSign, Car, Trees, Sun, Moon, Cloud, Wifi, Battery, Camera, Phone, Mail, MessageSquare, Settings, User, Lock, Unlock, Eye, EyeOff, Plus, Minus, Check, X, ArrowRight, ArrowLeft, Search, Filter, SortAsc, SortDesc, Download, Upload, Edit, Trash2, Save, RefreshCw, Clock, AlertCircle, Info, HelpCircle, ExternalLink, Link, Share2, Bookmark, BookOpen, FileText, Image, Video, Music, Volume2, VolumeX, Play, Pause, SkipBack, SkipForward, RotateCcw, RotateCw, ZoomIn, ZoomOut, Move, Crop, Scissors, Type, Bold, Italic, Underline, List, Grid, Columns, Rows, PieChart, BarChart3, TrendingUp, TrendingDown, Activity, Zap, Target, Award, Gift, ShoppingCart, CreditCard, Wallet, PiggyBank, Coins, Navigation, Compass, Globe, Factory, Receipt, Calculator, Smartphone, Laptop, Monitor, Printer, Server, Database, Signal, Bluetooth, Satellite, Router, Coffee, Utensils, ShoppingBag, Dumbbell, Bike, Plane, Train, Leaf, Flower, Waves, Snowflake, Umbrella, Shield, AlertTriangle, LifeBuoy, Lightbulb, Plug, Wrench, UserPlus, UserMinus, UserCheck, MessageCircle, Tv, Radio, Headphones, Gamepad2, Film, Wine, Beer, Pizza, Hamburger, Bus, Ship, Rocket, Sunrise, Sunset, CloudRain, CloudLightning, Wind, Thermometer, Box, Archive, Folder, File, Paperclip, BarChart, LineChart, Trophy, Medal, Key, Cpu, HardDrive, Network, Smile, ThumbsUp, Baby, Gem, TicketPercent, Dog, Telescope, Church, IdCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Building,
  Building2,
  Castle,
  Briefcase,
  Store,
  Map,
  Package,
  TreePine,
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
};

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryBarProps {
  categories: Category[];
  activeCategoryId?: string;
  onCategorySelect?: (id: string) => void;
}

const CategoryBar: React.FC<CategoryBarProps> = ({ categories, activeCategoryId, onCategorySelect }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(activeCategoryId || null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    setSelectedCategory(activeCategoryId || null);
  }, [activeCategoryId]);

  const handleCategoryClick = (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    // Call the parent's onCategorySelect if provided
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    } else {
      // Default behavior: navigate to properties page with category filter
      router.push(`/m/properties?category=${categoryId}`);
    }
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 py-4">
        <div className="flex items-center justify-center text-sm text-gray-500">
          No categories available
        </div>
      </div>
    );
  }

  if (!isHydrated) {
    return (
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 py-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/90 backdrop-blur-md border-b border-gray-200/50">
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-4 py-3"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => {
          const IconComponent = ICON_MAP[category.icon] || Tag;
          const isActive = category.id === selectedCategory;
          
          return (
            <button
              key={category.id}
              className={`
                flex flex-col items-center min-w-[80px] max-w-[90px] px-3 py-2 
                focus:outline-none transition-all duration-200 transform hover:scale-105
                ${isActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'}
              `}
              onClick={() => handleCategoryClick(category.id)}
              style={{ background: 'none', border: 'none' }}
            >
              <div className={`
                flex items-center justify-center w-14 h-14 rounded-2xl mb-2 
                transition-all duration-200 shadow-lg
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-blue-200/50' 
                  : 'bg-white/80 backdrop-blur-md border border-gray-200/50 text-gray-700 hover:bg-blue-50 hover:border-blue-200'
                }
              `}>
                <IconComponent className={`h-7 w-7 ${isActive ? 'text-white' : 'text-gray-700'}`} />
              </div>
              <span className={`
                text-xs font-medium text-center leading-tight break-words whitespace-pre-line
                transition-colors duration-200
                ${isActive ? 'text-blue-600 font-semibold' : 'text-gray-700'}
              `}>
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryBar; 