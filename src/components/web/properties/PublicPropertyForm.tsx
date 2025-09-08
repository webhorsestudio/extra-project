'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { createPropertyAmenityRelations, createPropertyCategoryRelations } from '@/lib/property-relationships';
import InformationCircleIcon from '@heroicons/react/24/outline/InformationCircleIcon';
import MapPinIcon from '@heroicons/react/24/outline/MapPinIcon';
import PhotoIcon from '@heroicons/react/24/outline/PhotoIcon';
import Cog6ToothIcon from '@heroicons/react/24/outline/Cog6ToothIcon';
import ClipboardDocumentCheckIcon from '@heroicons/react/24/outline/ClipboardDocumentCheckIcon';
import HomeIcon from '@heroicons/react/24/outline/HomeIcon';
import { useLocations } from '@/hooks/useLocations';
import { useAmenities } from '@/hooks/useAmenities';
import { useCategories } from '@/hooks/useCategories';
import dynamic from 'next/dynamic';

// Import Lucide icons for categories
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
  Dumbbell,
  Tag
} from 'lucide-react';

// Dynamically import the map component to avoid SSR issues
const PublicPropertyMapPicker = dynamic(() => import('./PublicPropertyMapPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-sm text-gray-500">Loading map...</p>
      </div>
    </div>
  )
});

// Safe icon mapping with actual Lucide icons
const SAFE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
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
  Dumbbell,
  Tag
};

const steps = [
  { id: 1, title: 'Basic Info', description: 'Property details' },
  { id: 2, title: 'Location', description: 'Property location' },
  { id: 3, title: 'Images', description: 'Property photos' },
  { id: 4, title: 'Details', description: 'Amenities & categories' },
  { id: 5, title: 'BHK & Pricing', description: 'Configurations & pricing' },
  { id: 6, title: 'Review', description: 'Final review' },
];

const stepIcons = [
  InformationCircleIcon, // Basic Info
  MapPinIcon,           // Location
  PhotoIcon,            // Images
  Cog6ToothIcon,        // Details
  HomeIcon,             // BHK & Pricing
  ClipboardDocumentCheckIcon, // Review
];

// Form data interface
interface FormData {
  // Basic Info
  propertyType: 'sell' | 'rent' | null;
  title: string;
  description: string;
  propertyTypeCategory: string;
  propertyCollection: string;
  
  // Location
  locationId: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  
  // Images
  images: File[];
  
  // Details
  amenities: Array<{
    name: string;
    image_url?: string;
  }>;
  categories: Array<{
    name: string;
    icon?: string;
  }>;
  bhkConfigurations: Array<{
    bhk: number;
    price: number;
    area: number;
    bedrooms: number;
    bathrooms: number;
    readyBy: string;
    floorPlan?: File;
    brochure?: File;
    floorPlanUrl?: string;
    brochureUrl?: string;
  }>;
  
  // Additional
  reraNumber: string;
  postedBy: string;
  developerId?: string; // Optional developer ID for registered sellers
}

export const PublicPropertyForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyType, setPropertyType] = useState<'sell' | 'rent' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: { full_name?: string } } | null>(null);
  const [isManualMapUpdate, setIsManualMapUpdate] = useState(false);
  const router = useRouter();
  const addressChangedByUser = useRef(false);
  const coordsChangedByUser = useRef(false);

  // Form data state
  const [formData, setFormData] = useState<FormData>({
    propertyType: null,
    title: '',
    description: '',
    propertyTypeCategory: 'Apartment',
    propertyCollection: 'Featured',
    locationId: '',
    location: '',
    latitude: null,
    longitude: null,
    images: [],
    amenities: [],
    categories: [],
    bhkConfigurations: [{
      bhk: 2,
      price: 0,
      area: 0,
      bedrooms: 2,
      bathrooms: 2,
      readyBy: ''
    }],
    reraNumber: '',
    postedBy: '',
    developerId: undefined
  });

  // Hooks for data fetching
  const { locations, loading: locationsLoading } = useLocations();
  const { amenities, loading: amenitiesLoading } = useAmenities();
  const { categories, loading: categoriesLoading } = useCategories();

  // Icon rendering function for categories
  const renderCategoryIcon = (iconName?: string) => {
    if (!iconName || typeof iconName !== 'string') {
      return <Tag className="h-4 w-4 text-gray-500" />
    }
    
    // Direct match
    if (iconName in SAFE_ICON_MAP) {
      const IconComponent = SAFE_ICON_MAP[iconName]
      return <IconComponent className="h-4 w-4 text-gray-600" />
    }
    
    // Case-insensitive match
    const foundKey = Object.keys(SAFE_ICON_MAP).find(
      key => key.toLowerCase() === iconName.toLowerCase()
    )
    if (foundKey) {
      const IconComponent = SAFE_ICON_MAP[foundKey]
      return <IconComponent className="h-4 w-4 text-gray-600" />
    }
    
    // Fallback to Tag icon
    return <Tag className="h-4 w-4 text-gray-500" />
  };

  // Check authentication and seller status on mount
  useEffect(() => {
    const checkAuthAndSellerStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        
        // Check if user is a registered seller
        try {
          const response = await fetch('/api/check-seller-status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: user.email }),
          });

          const sellerData = await response.json();
          
          if (sellerData.isSeller && sellerData.seller) {
            // User is a registered seller - use their company name
            setFormData(prev => ({
              ...prev,
              postedBy: sellerData.seller.name,
              developerId: sellerData.seller.id // Store developer ID for later use
            }));
          } else {
            // User is not a registered seller - use their personal name
            setFormData(prev => ({
              ...prev,
              postedBy: user.user_metadata?.full_name || user.email || 'Unknown User'
            }));
          }
        } catch (error) {
          console.error('Error checking seller status:', error);
          // Fallback to personal name if seller check fails
          setFormData(prev => ({
            ...prev,
            postedBy: user.user_metadata?.full_name || user.email || 'Unknown User'
          }));
        }
      } else {
        // Redirect to login if not authenticated
        router.push('/users/login');
      }
    };
    checkAuthAndSellerStatus();
  }, [router]);

  const nextStep = () => {
    if (currentStep < steps.length) setCurrentStep(currentStep + 1);
  };
  
  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Update form data
  const updateFormData = (field: keyof FormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle address input change
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addressChangedByUser.current = true;
    updateFormData('location', e.target.value);
  };

  // Handle property type selection
  const handlePropertyTypeSelect = (type: 'sell' | 'rent') => {
    setPropertyType(type);
    updateFormData('propertyType', type);
  };

  // Handle BHK configuration updates
  const updateBHKConfiguration = (index: number, field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      bhkConfigurations: prev.bhkConfigurations.map((config, i) => 
        i === index ? { ...config, [field]: value } : config
      )
    }));
  };

  // Add new BHK configuration
  const addBHKConfiguration = () => {
    setFormData(prev => ({
      ...prev,
      bhkConfigurations: [...prev.bhkConfigurations, {
        bhk: 2,
        price: 0,
        area: 0,
        bedrooms: 2,
        bathrooms: 2,
        readyBy: ''
      }]
    }));
  };

  // Remove BHK configuration
  const removeBHKConfiguration = (index: number) => {
    setFormData(prev => ({
      ...prev,
      bhkConfigurations: prev.bhkConfigurations.filter((_, i) => i !== index)
    }));
  };

  // Convert price to lakhs/crores format
  const formatPriceInLakhsCrores = (price: number): string => {
    if (price === 0) return '';
    
    if (price >= 10000000) {
      // Convert to crores
      const crores = price / 10000000;
      return `${crores.toFixed(2)} Crores`;
    } else if (price >= 100000) {
      // Convert to lakhs
      const lakhs = price / 100000;
      return `${lakhs.toFixed(2)} Lakhs`;
    } else {
      // For amounts less than 1 lakh, show in thousands
      const thousands = price / 1000;
      return `${thousands.toFixed(0)}K`;
    }
  };

  // Handle image upload
  const handleImageUpload = (files: FileList | null) => {
    if (files) {
      const newImages = Array.from(files);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Handle location selection
  const handleLocationSelect = (locationId: string) => {
    const selectedLocation = locations.find(loc => loc.id === locationId);
    if (selectedLocation) {
      console.log('📍 Location selected:', selectedLocation.name);
      updateFormData('locationId', locationId);
      updateFormData('location', selectedLocation.name);
      
      // Automatically geocode the selected location to update the map
      geocodeAddress(selectedLocation.name);
    }
  };

  // Handle map position changes
  const handleMapPositionChange = (position: [number, number]) => {
    coordsChangedByUser.current = true;
    setIsManualMapUpdate(true);
    updateFormData('latitude', position[0]);
    updateFormData('longitude', position[1]);
    
    // Reverse geocoding to update the location field
    reverseGeocode(position);
    
    // Reset the flag after a short delay
    setTimeout(() => {
      console.log('🔄 Resetting manual map update flag');
      setIsManualMapUpdate(false);
    }, 2000);
  };

  // Geocoding function to convert address to coordinates
  const geocodeAddress = useCallback(async (address: string) => {
    if (!address.trim() || address.trim().length < 3) return;

    console.log('🔍 Geocoding address:', address);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
      );
      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Geocoding API did not return JSON:', text);
        toast({
          title: 'Geocoding Error',
          description: 'Failed to fetch location from address. Please try again later.',
          variant: 'destructive',
        });
        return;
      }
      const data = await response.json();
      console.log('📍 Geocoding result:', data);

      if (data && Array.isArray(data) && data.length > 0) {
        const { lat, lon } = data[0];
        if (lat && lon) {
          console.log('✅ Updating coordinates:', lat, lon);
          updateFormData('latitude', parseFloat(lat));
          updateFormData('longitude', parseFloat(lon));
        }
      }
    } catch (error) {
      console.error('❌ Geocoding error:', error);
      toast({
        title: 'Geocoding Error',
        description: 'Failed to fetch location from address. Please try again later.',
        variant: 'destructive',
      });
    }
  }, [updateFormData]);

  // Reverse geocoding function to convert coordinates to address
  const reverseGeocode = async (position: [number, number]) => {
    console.log('🔄 Reverse geocoding position:', position);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}&zoom=18&addressdetails=1`
      );
      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Reverse geocoding API did not return JSON:', text);
        toast({
          title: 'Reverse Geocoding Error',
          description: 'Failed to fetch address from map location. Please try again later.',
          variant: 'destructive',
        });
        return;
      }
      const data = await response.json();
      console.log('📍 Reverse geocoding result:', data);

      if (data && data.display_name) {
        console.log('✅ Updating location field with:', data.display_name);
        updateFormData('location', data.display_name);
      }
    } catch (error) {
      console.error('❌ Reverse geocoding error:', error);
      toast({
        title: 'Reverse Geocoding Error',
        description: 'Failed to fetch address from map location. Please try again later.',
        variant: 'destructive',
      });
    }
  };

  // Only geocode when the user changes the address
  useEffect(() => {
    if (!formData.location || formData.location.trim().length < 3) return;
    if (isManualMapUpdate) return;
    if (!addressChangedByUser.current) return;
    const timeoutId = setTimeout(() => {
      geocodeAddress(formData.location);
      addressChangedByUser.current = false;
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [formData.location, geocodeAddress, isManualMapUpdate]);

  // Only reverse geocode when the user changes the coordinates
  useEffect(() => {
    if (
      formData.latitude == null ||
      formData.longitude == null ||
      isManualMapUpdate === false ||
      !coordsChangedByUser.current
    ) return;
    reverseGeocode([formData.latitude, formData.longitude]);
    coordsChangedByUser.current = false;
  }, [formData.latitude, formData.longitude, isManualMapUpdate, reverseGeocode]);

  // Form submission
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add a property',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.propertyType) {
      toast({
        title: 'Error',
        description: 'Please select whether you want to sell or rent the property',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare property data
      const propertyData = {
        title: formData.title,
        description: formData.description,
        property_type: formData.propertyTypeCategory,
        property_nature: formData.propertyType === 'sell' ? 'Sell' : 'Rent',
        property_collection: formData.propertyCollection,
        location_id: formData.locationId,
        location: formData.location,
        latitude: formData.latitude,
        longitude: formData.longitude,
        rera_number: formData.reraNumber || null,
        created_by: user.id,
        posted_by: formData.postedBy,
        developer_id: formData.developerId || null, // Auto-link to developer if registered seller
        status: 'pending'
      };

      console.log('🚩 Property data to insert:', JSON.stringify(propertyData, null, 2));

      // Create property
      const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert(propertyData)
        .select()
        .single();

      if (propertyError) {
        console.error('❌ Supabase property insert error:', JSON.stringify(propertyError, null, 2));
        toast({
          title: 'Error',
          description: propertyError.message || 'Failed to create property. Please check all required fields.',
          variant: 'destructive',
        });
        return;
      }

      // Upload images
      if (formData.images.length > 0) {
        const uploadPromises = formData.images.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${property.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (uploadError) {
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('property-images')
            .getPublicUrl(filePath);

          return { property_id: property.id, image_url: publicUrl };
        });

        try {
          const imageData = await Promise.all(uploadPromises);
          await supabase.from('property_images').insert(imageData);
        } catch (error) {
          console.error('Image upload error:', error);
          toast({
            title: 'Warning',
            description: 'Property created but some images failed to upload',
            variant: 'destructive',
          });
        }
      }

      // Create BHK configurations
      if (formData.bhkConfigurations.length > 0) {
        const configPromises = formData.bhkConfigurations.map(async (config) => {
          let floorPlanUrl = null;
          let brochureUrl = null;

          // Upload floor plan if exists
          if (config.floorPlan) {
            const fileExt = config.floorPlan.name.split('.').pop();
            const fileName = `floor-plan-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${property.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('property-files')
              .upload(filePath, config.floorPlan, {
                cacheControl: '3600',
                upsert: false
              });

            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from('property-files')
                .getPublicUrl(filePath);
              floorPlanUrl = publicUrl;
            }
          }

          // Upload brochure if exists
          if (config.brochure) {
            const fileExt = config.brochure.name.split('.').pop();
            const fileName = `brochure-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${property.id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('property-files')
              .upload(filePath, config.brochure, {
                cacheControl: '3600',
                upsert: false
              });

            if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage
                .from('property-files')
                .getPublicUrl(filePath);
              brochureUrl = publicUrl;
            }
          }

          return {
            property_id: property.id,
            bhk: config.bhk,
            price: config.price,
            area: config.area,
            bedrooms: config.bedrooms,
            bathrooms: config.bathrooms,
            ready_by: config.readyBy,
            floor_plan_url: floorPlanUrl,
            brochure_url: brochureUrl
          };
        });

        const configData = await Promise.all(configPromises);
        await supabase.from('property_configurations').insert(configData);
      }

      // Handle amenities relationships
      if (formData.amenities.length > 0) {
        // Extract amenity names from objects for the backend function
        const amenityNames = formData.amenities.map(amenity => amenity.name)
        const amenityResult = await createPropertyAmenityRelations(property.id, amenityNames);
        if (!amenityResult.success) {
          console.error('Error creating amenity relationships:', amenityResult.error);
        }
      }

      // Handle categories relationships
      if (formData.categories.length > 0) {
        // Extract category names from objects for the backend function
        const categoryNames = formData.categories.map(category => category.name)
        const categoryResult = await createPropertyCategoryRelations(property.id, categoryNames);
        if (!categoryResult.success) {
          console.error('Error creating category relationships:', categoryResult.error);
        }
      }

      toast({
        title: 'Success',
        description: 'Property submitted successfully! It will be reviewed by our team before being published.',
      });

      // Redirect to properties page
      router.push('/properties');
      router.refresh();

    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create property. Please check all required fields.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">What you want:</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handlePropertyTypeSelect('sell')}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              propertyType === 'sell'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 border-2 border-blue-600'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
          >
            SELL PROPERTY
          </button>
          <button
            type="button"
            onClick={() => handlePropertyTypeSelect('rent')}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 ${
              propertyType === 'rent'
                ? 'bg-green-600 text-white shadow-lg shadow-green-200 border-2 border-green-600'
                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300 hover:shadow-md'
            }`}
          >
            RENT PROPERTY
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Property Title</label>
        <input 
          type="text" 
          value={formData.title}
          onChange={(e) => updateFormData('title', e.target.value)}
          maxLength={25}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          placeholder="Enter property title (max 25 characters)" 
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {formData.title.length}/25 characters
          </span>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
        <textarea 
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          rows={4} 
          placeholder="Describe your property" 
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
          <select 
            value={formData.propertyTypeCategory}
            onChange={(e) => updateFormData('propertyTypeCategory', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="House">House</option>
            <option value="Apartment">Apartment</option>
            <option value="Commercial">Commercial</option>
            <option value="Land">Land</option>
            <option value="Villa">Villa</option>
            <option value="Penthouse">Penthouse</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Property Collection</label>
          <select 
            value={formData.propertyCollection}
            onChange={(e) => updateFormData('propertyCollection', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="Newly Launched">Newly Launched</option>
            <option value="Featured">Featured</option>
            <option value="Ready to Move">Ready to Move</option>
            <option value="Under Construction">Under Construction</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderLocation = () => (
    <div className="space-y-6">
      {/* Location Dropdown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Choose Location <span className="text-red-500">*</span></label>
        <select 
          value={formData.locationId}
          onChange={(e) => handleLocationSelect(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={locationsLoading}
        >
          <option value="">{locationsLoading ? 'Loading locations...' : 'Select a location'}</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
      </div>

      {/* Location Address Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Location Address</label>
        <div className="relative">
          <input
            type="text"
            value={formData.location}
            onChange={handleAddressChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
            placeholder="Enter property address..."
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Enter the address and the map will automatically show the location. You can also click on the map to adjust the position.
        </p>
      </div>

      {/* Map Component */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Map Location</label>
        <PublicPropertyMapPicker
          position={
            formData.latitude && formData.longitude 
              ? [formData.latitude, formData.longitude] 
              : [20.5937, 78.9629] // Default to India center
          }
          onPositionChange={handleMapPositionChange}
        />
      </div>
    </div>
  );

  const renderImages = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Property Images</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 48 48" stroke="currentColor">
            <rect x="8" y="8" width="32" height="32" rx="4" strokeWidth="2" />
            <path d="M16 32l8-8 8 8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="20" r="2" fill="currentColor" />
          </svg>
          <div className="mt-4">
            <input
              id="file-upload"
              type="file"
              className="hidden"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
            />
            <label htmlFor="file-upload" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Upload Images
            </label>
          </div>
          <p className="mt-2 text-sm text-gray-500">Up to 10 images (JPG, PNG)</p>
        </div>
      </div>

      {/* Display uploaded images */}
      {formData.images.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Images ({formData.images.length})</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderDetails = () => (
    <div className="space-y-6">
      {/* Amenities Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {amenitiesLoading ? (
            <p className="text-sm text-gray-500">Loading amenities...</p>
          ) : (
            amenities.map((amenity) => (
              <label key={amenity.id} className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.amenities.some(a => a.name === amenity.name)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateFormData('amenities', [...formData.amenities, { name: amenity.name, image_url: amenity.image_url }]);
                    } else {
                      updateFormData('amenities', formData.amenities.filter(a => a.name !== amenity.name));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                {amenity.image_url ? (
                  <img 
                    src={amenity.image_url} 
                    alt={amenity.name} 
                    className="w-6 h-6 rounded object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500">🏠</span>
                  </div>
                )}
                <span className="text-sm text-gray-700">{amenity.name}</span>
            </label>
            ))
          )}
        </div>
      </div>

      {/* Categories Section */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categoriesLoading ? (
            <p className="text-sm text-gray-500">Loading categories...</p>
          ) : (
            categories.map((category) => (
              <label key={category.id} className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.categories.some(c => c.name === category.name)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateFormData('categories', [...formData.categories, { name: category.name, icon: category.icon }]);
                    } else {
                      updateFormData('categories', formData.categories.filter(c => c.name !== category.name));
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                  {renderCategoryIcon(category.icon)}
                </div>
                <span className="text-sm text-gray-700">{category.name}</span>
            </label>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderBHKPricing = () => (
    <div className="space-y-6">
      {/* BHK Configurations Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
      <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">BHK Configurations & Pricing</h3>
            <p className="text-sm text-gray-600">Add different BHK configurations with pricing, area, room details, floor plans, and brochures</p>
          </div>
          <button
            type="button"
            onClick={addBHKConfiguration}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 text-sm font-medium flex items-center gap-2 shadow-sm"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Configuration
          </button>
        </div>

        {/* Dynamic BHK Configuration Cards */}
        <div className="space-y-6">
          {formData.bhkConfigurations.map((config, index) => (
            <div key={index} className="border-2 border-dashed border-gray-300 rounded-xl p-6 space-y-6 bg-gray-50/30">
                {/* Configuration Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      Configuration {index + 1}
                    </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {config.bhk} BHK
                      </span>
                    {config.price > 0 && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      ₹{formatPriceInLakhsCrores(config.price)}
                      </span>
                    )}
                  </div>
                {formData.bhkConfigurations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeBHKConfiguration(index)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                </div>

              {/* Basic Fields Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                   <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">BHK</label>
                     <input
                       type="number"
                       min="1"
                       value={config.bhk}
                    onChange={(e) => updateBHKConfiguration(index, 'bhk', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
                       placeholder="e.g., 2"
                     />
                   </div>
                   <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
                     <input
                       type="number"
                       min="0"
                       value={config.price}
                    onChange={(e) => updateBHKConfiguration(index, 'price', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
                       placeholder="e.g., 5000000"
                     />
                  {config.price > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatPriceInLakhsCrores(config.price)}
                    </p>
                  )}
                   </div>
                   <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area (sq.ft)</label>
                     <input
                       type="number"
                       min="0"
                       value={config.area}
                    onChange={(e) => updateBHKConfiguration(index, 'area', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
                       placeholder="e.g., 1200"
                     />
                   </div>
                   <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                     <input
                       type="number"
                       min="0"
                       value={config.bedrooms}
                    onChange={(e) => updateBHKConfiguration(index, 'bedrooms', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
                       placeholder="e.g., 2"
                     />
                   </div>
                   <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                     <input
                       type="number"
                       min="0"
                       value={config.bathrooms}
                    onChange={(e) => updateBHKConfiguration(index, 'bathrooms', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
                       placeholder="e.g., 2"
                     />
                   </div>
              </div>

              {/* Ready By Field - Separate Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ready By</label>
                     <input
                       type="text"
                    value={config.readyBy}
                    onChange={(e) => updateBHKConfiguration(index, 'readyBy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" 
                       placeholder="e.g., Dec 2024"
                     />
                   </div>
                 </div>

                 {/* File Upload Section */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Documents & Files</h4>
                   <div className="grid gap-4 md:grid-cols-2">
                     <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Floor Plan</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors bg-white">
                      <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                         </svg>
                      <div className="text-sm text-gray-600 mb-2">Upload Floor Plan</div>
                      <p className="text-xs text-gray-500 mb-3">Supports: JPG, PNG, PDF (Max 10MB)</p>
                           <input 
                             type="file" 
                             accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                             onChange={(e) => {
                          const file = e.target.files?.[0]
                               if (file) {
                            updateBHKConfiguration(index, 'floorPlan', file)
                               }
                             }}
                        className="text-xs w-full"
                           />
                         </div>
                       </div>
                     <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brochure</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors bg-white">
                      <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-14 0 7 7 0 0114 0z" />
                         </svg>
                      <div className="text-sm text-gray-600 mb-2">Upload Brochure</div>
                      <p className="text-xs text-gray-500 mb-3">Supports: JPG, PNG, PDF (Max 10MB)</p>
                           <input 
                             type="file" 
                             accept=".jpg,.jpeg,.png,.gif,.webp,.pdf"
                             onChange={(e) => {
                          const file = e.target.files?.[0]
                               if (file) {
                            updateBHKConfiguration(index, 'brochure', file)
                               }
                             }}
                        className="text-xs w-full"
                           />
                       </div>
                     </div>
                   </div>
                 </div>
              </div>
            ))}
          </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      {/* Basic Info Review */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <InformationCircleIcon className="h-5 w-5 text-blue-600" />
          Basic Information
        </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <p className="text-sm font-medium text-gray-500">Property Type</p>
            <p className="text-sm text-gray-900">{formData.propertyTypeCategory}</p>
            </div>
            <div>
            <p className="text-sm font-medium text-gray-500">Property Collection</p>
            <p className="text-sm text-gray-900">{formData.propertyCollection}</p>
            </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500">Property Title</p>
            <p className="text-sm text-gray-900">{formData.title || 'Not provided'}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm font-medium text-gray-500">Description</p>
            <p className="text-sm text-gray-900">{formData.description || 'Not provided'}</p>
          </div>
        </div>
      </div>

      {/* Location Review */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPinIcon className="h-5 w-5 text-green-600" />
          Location Details
        </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <p className="text-sm font-medium text-gray-500">City</p>
            <p className="text-sm text-gray-900">Mumbai</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Address</p>
            <p className="text-sm text-gray-900">123 Main Street, Andheri West</p>
            </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Latitude</p>
            <p className="text-sm text-gray-900">19.0760° N</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Longitude</p>
            <p className="text-sm text-gray-900">72.8777° E</p>
          </div>
        </div>
      </div>

      {/* Images Review */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <PhotoIcon className="h-5 w-5 text-purple-600" />
          Property Images
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {formData.images.length > 0 ? (
            formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <span className="text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                      Image {index + 1}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <PhotoIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <span className="text-sm text-gray-500">No images uploaded</span>
            </div>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} uploaded
        </p>
      </div>

      {/* Details Review */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Cog6ToothIcon className="h-5 w-5 text-orange-600" />
          Property Details
        </h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Selected Amenities</p>
            <div className="flex flex-wrap gap-2">
              {formData.amenities.length > 0 ? (
                formData.amenities.map((amenity) => (
                  <span key={amenity.name} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    {amenity.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">No amenities selected</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">Selected Categories</p>
            <div className="flex flex-wrap gap-2">
              {formData.categories.length > 0 ? (
                formData.categories.map((category) => (
                  <span key={category.name} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs flex items-center gap-1">
                    {renderCategoryIcon(category.icon)}
                    {category.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">No categories selected</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-2">BHK Configurations</p>
            <div className="space-y-3">
              {formData.bhkConfigurations.map((config, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {config.bhk} BHK
                    </span>
                    {config.price > 0 && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        ₹{formatPriceInLakhsCrores(config.price)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Area: {config.area} sq.ft | Bedrooms: {config.bedrooms} | Bathrooms: {config.bathrooms}
                    {config.readyBy && ` | Ready by: ${config.readyBy}`}
                  </p>
                  <div className="flex gap-2">
                    {config.floorPlan && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        📄 Floor Plan: {config.floorPlan.name}
                      </span>
                    )}
                    {config.brochure && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                        📋 Brochure: {config.brochure.name}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Responsive Stepper Components
  const StepperSidebar = ({ currentStep }: { currentStep: number }) => (
    <aside className="hidden md:flex flex-col w-64 bg-[#181C2A] rounded-l-2xl py-12 px-6 min-h-full justify-center">
      <div className="flex flex-col gap-8">
        {steps.map((step, idx) => {
          const Icon = stepIcons[idx];
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <div key={step.id} className="flex items-center gap-4 relative">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 font-bold text-lg
                ${isActive
                  ? 'bg-green-500 border-green-500 text-white shadow-lg scale-110'
                  : isCompleted
                    ? 'bg-green-100 border-green-400 text-green-700'
                    : 'border-gray-600 bg-[#23284A] text-gray-400'}
              `}>
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : isCompleted ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
              <div className="flex flex-col">
                <span className={`text-base font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>{step.title}</span>
                <span className="text-xs text-gray-400">{step.description}</span>
              </div>
              {idx < steps.length - 1 && (
                <span className="absolute left-5 top-10 w-0.5 h-8 bg-gray-700 z-0" />
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );

  const StepperTop = ({ currentStep }: { currentStep: number }) => (
    <nav className="flex md:hidden justify-between items-center bg-[#181C2A] rounded-t-2xl px-2 py-4 mb-4">
      {steps.map((step, idx) => {
        const Icon = stepIcons[idx];
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
  return (
          <div key={step.id} className="flex flex-col items-center flex-1">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 font-bold text-lg mb-1
              ${isActive
                ? 'bg-green-500 border-green-500 text-white shadow-lg scale-110'
                : isCompleted
                  ? 'bg-green-100 border-green-400 text-green-700'
                  : 'border-gray-600 bg-[#23284A] text-gray-400'}
            `}>
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : isCompleted ? 'text-green-500' : 'text-gray-400'}`} />
        </div>
            <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-gray-300'}`}>{step.title}</span>
          </div>
        );
      })}
    </nav>
  );

  // Main UI Layout
  return (
    <div className="min-h-screen flex flex-col md:flex-row items-stretch justify-center bg-gray-50 px-8 md:px-24 py-12 md:py-16">
      <div className="flex flex-col md:flex-row w-full max-w-6xl border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
      <StepperSidebar currentStep={currentStep} />
      <div className="flex-1 flex flex-col items-center justify-center py-8 px-2 md:px-0">
        <StepperTop currentStep={currentStep} />
        <div className="w-full max-w-2xl">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1 tracking-tight">{steps[currentStep - 1].title}</h2>
            <p className="text-gray-500 text-base">{steps[currentStep - 1].description}</p>
          </div>
          <div className="space-y-8">
            {currentStep === 1 && renderBasicInfo()}
            {currentStep === 2 && renderLocation()}
            {currentStep === 3 && renderImages()}
            {currentStep === 4 && renderDetails()}
            {currentStep === 5 && renderBHKPricing()}
            {currentStep === 6 && renderReview()}
          </div>
          <div className="flex flex-col md:flex-row justify-end mt-10 pt-8 border-t border-gray-200 gap-4 md:gap-2">
            {currentStep > 1 && (
          <button
            type="button"
            onClick={prevStep}
                className="px-8 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold shadow-md hover:bg-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Previous
          </button>
            )}
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3 bg-green-500 text-white rounded-lg font-semibold shadow-md hover:bg-green-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Next Step
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold shadow-md hover:bg-green-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 