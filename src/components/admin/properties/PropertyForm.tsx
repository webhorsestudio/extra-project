'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form } from '@/components/ui/form'
import { useHydration } from '@/hooks/use-hydration'
import { HydrationSuppressor } from '@/components/HydrationSuppressor'
import { PropertyBasicInfo } from '@/components/admin/properties/PropertyBasicInfo'
import PropertyLocation from '@/components/admin/properties/PropertyLocation'
import { PropertyImages } from '@/components/admin/properties/PropertyImages'
import { PropertyAmenities } from '@/components/admin/properties/PropertyAmenities'
import { PropertyCategories } from '@/components/admin/properties/PropertyCategories'
import { BHKConfigurations } from '@/components/admin/properties/BHKConfigurations'
import { 
  Home, 
  MapPin,
  X,
  Save,
  ImageIcon,
  Dumbbell,
  Tag,
  Settings
} from 'lucide-react'

import { Property } from '@/types/property'
import { ValidationModal } from '@/components/admin/properties/ValidationModal'
import { mapFormErrorsToTabErrors } from '@/lib/form-validation'

export const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  property_type: z.enum(['House', 'Apartment', 'Commercial', 'Land', 'Villa', 'Penthouse'], {
    required_error: 'Property type is required',
  }),
  property_nature: z.enum(['Sell', 'Rent'], {
    required_error: 'Property nature is required',
  }),
  property_collection: z.enum(['Newly Launched', 'Featured', 'Ready to Move', 'Under Construction'], {
    required_error: 'Property collection is required',
  }),
  location_id: z.string().min(1, 'Location selection is required'),
  location: z.string().optional(),
  amenities: z.array(z.object({
    name: z.string(),
    image_url: z.string().optional(),
  })).optional(),
  categories: z.array(z.object({
    name: z.string(),
    icon: z.string().optional(),
  })).optional(),
  has_rera: z.boolean(),
  rera_number: z.string().optional(),
  bhk_configurations: z.array(z.object({
    id: z.string().optional(),
    bhk: z.number().min(1, 'BHK is required'),
    price: z.number().optional(),
    area: z.number().min(0, 'Area must be 0 or greater'),
    bedrooms: z.number().min(0, 'Bedrooms must be 0 or greater'),
    bathrooms: z.number().min(0, 'Bathrooms must be 0 or greater'),
    floor_plan_url: z.string().optional(),
    brochure_url: z.string().optional(),
    ready_by: z.string().optional(),
  })).min(1, 'At least one BHK configuration is required'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  posted_by: z.string().min(1, 'Posted by is required'),
  developer_id: z.string().optional(),
  video_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

interface PropertyFormProps {
  property?: Property;
  onSubmit: (data: z.infer<typeof formSchema> & { tempImages?: File[] }) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function PropertyForm({
  property,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: PropertyFormProps) {
  const [tempImages, setTempImages] = useState<File[]>([]);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      property_type: 'House',
      property_nature: 'Sell',
      property_collection: 'Featured',
      location_id: '',
      location: '',
      amenities: [],
      categories: [],
      has_rera: false,
      rera_number: '',
      bhk_configurations: [
        {
          bhk: 1,
          price: 0,
          area: 0,
          bedrooms: 1,
          bathrooms: 1,
          floor_plan_url: '',
          brochure_url: '',
          ready_by: '',
        },
      ],
      latitude: 0,
      longitude: 0,
      posted_by: '',
      developer_id: '',
      video_url: '',
    },
  });

  useEffect(() => {
    if (property) {
      const formData = {
        title: property.title || '',
        description: property.description || '',
        property_type: property.property_type || 'House',
        property_nature: property.property_nature || 'Sell',
        property_collection: property.property_collection || 'Featured',
        location_id: property.location_id || '',
        location: property.location || '',
        amenities: property.amenities || [], // Keep as objects instead of transforming to strings
        categories: property.categories || [], // Keep as objects instead of transforming to strings
        has_rera: !!property.rera_number,
        rera_number: property.rera_number || '',
        bhk_configurations: property.bhk_configurations?.length
          ? property.bhk_configurations.map(config => ({
              id: config.id,
              bhk: config.bhk,
              price: config.price,
              area: config.area,
              bedrooms: config.bedrooms,
              bathrooms: config.bathrooms,
              floor_plan_url: config.floor_plan_url || '',
              brochure_url: config.brochure_url || '',
              ready_by: config.ready_by || '',
            }))
          : [
              {
                bhk: 1,
                price: 0,
                area: 0,
                bedrooms: 1,
                bathrooms: 1,
                floor_plan_url: '',
                brochure_url: '',
                ready_by: '',
              },
            ],
        latitude: property.latitude || 0,
        longitude: property.longitude || 0,
        posted_by: property.posted_by || '',
        developer_id: property.developer_id || '',
        video_url: property.video_url || '',
      };
      
      form.reset(formData);
    }
  }, [property, form]);

  const isHydrated = useHydration();

  const handlePositionChange = (position: [number, number]) => {
    form.setValue('latitude', position[0]);
    form.setValue('longitude', position[1]);
  };

  const handleTempImagesChange = (files: File[]) => {
    setTempImages(files);
  };

  // Main form submission handler
  const handleFormSubmit = async (data: z.infer<typeof formSchema>) => {
    // Trigger validation to ensure we have the latest state
    const isValid = await form.trigger();
    
    // Check if there are any validation errors
    if (!isValid || Object.keys(form.formState.errors).length > 0) {
      setShowValidationModal(true);
      return;
    }
    
    // Call the original onSubmit function
    try {
      await onSubmit({ ...data, tempImages });
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  const handleCloseValidationModal = () => {
    setShowValidationModal(false);
  };

  if (!isHydrated) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {property ? 'Edit Property' : 'Add New Property'}
            </h1>
            <p className="text-muted-foreground">
              {property ? 'Update your property details' : 'Create a new property listing'}
            </p>
          </div>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <HydrationSuppressor>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {property ? 'Edit Property' : 'Add New Property'}
            </h1>
            <p className="text-muted-foreground">
              {property ? 'Update your property details' : 'Create a new property listing'}
            </p>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6" suppressHydrationWarning>
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              <p className="flex items-center gap-1">
                <span className="text-destructive">*</span>
                <span>Fields marked with an asterisk (*) are required</span>
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="flex items-center gap-2"
                suppressHydrationWarning
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
                suppressHydrationWarning
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Save Property'}
              </Button>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-6">
                <TabsTrigger value="basic" className="flex items-center gap-2 text-xs sm:text-sm">
                  <Home className="h-4 w-4" />
                  <span className="hidden sm:inline">Basic Info</span>
                </TabsTrigger>
                <TabsTrigger value="location" className="flex items-center gap-2 text-xs sm:text-sm">
                  <MapPin className="h-4 w-4" />
                  <span className="hidden sm:inline">Location</span>
                </TabsTrigger>
                <TabsTrigger value="images" className="flex items-center gap-2 text-xs sm:text-sm">
                  <ImageIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Images & Video</span>
                </TabsTrigger>
                <TabsTrigger value="amenities" className="flex items-center gap-2 text-xs sm:text-sm">
                  <Dumbbell className="h-4 w-4" />
                  <span className="hidden sm:inline">Amenities</span>
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2 text-xs sm:text-sm">
                  <Tag className="h-4 w-4" />
                  <span className="hidden sm:inline">Categories</span>
                </TabsTrigger>
                <TabsTrigger value="configurations" className="flex items-center gap-2 text-xs sm:text-sm">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Pricing & Rooms</span>
                </TabsTrigger>
              </TabsList>
              <div>
                <TabsContent value="basic" className="space-y-6 mt-0">
                  <PropertyBasicInfo />
                </TabsContent>
                <TabsContent value="location" className="space-y-6 mt-0">
                  <PropertyLocation
                    initialPosition={
                      property && typeof property.latitude === 'number' && typeof property.longitude === 'number'
                        ? [property.latitude, property.longitude]
                        : undefined
                    }
                    onPositionChange={handlePositionChange}
                  />
                </TabsContent>
                <TabsContent value="images" className="space-y-6 mt-0">
                  <PropertyImages
                    propertyId={property?.id}
                    images={property?.images || []}
                    onImagesChange={() => {}}
                    onTempImagesChange={handleTempImagesChange}
                    tempImages={tempImages}
                  />
                </TabsContent>
                <TabsContent value="amenities" className="space-y-6 mt-0">
                  <PropertyAmenities />
                </TabsContent>
                <TabsContent value="categories" className="space-y-6 mt-0">
                  <PropertyCategories />
                </TabsContent>
                <TabsContent value="configurations" className="space-y-6 mt-0">
                  <BHKConfigurations name="bhk_configurations" />
                </TabsContent>
              </div>
            </Tabs>
          </form>
        </Form>

        {/* Validation Modal */}
        <ValidationModal
          isOpen={showValidationModal}
          onClose={handleCloseValidationModal}
          onNavigateToTab={handleNavigateToTab}
          errors={mapFormErrorsToTabErrors(form.formState.errors)}
        />
      </div>
    </HydrationSuppressor>
  );
}
