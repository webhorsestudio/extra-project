'use client'

import { useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Home, Shield } from 'lucide-react'
import { PropertyPostedBySelector } from './PropertyPostedBySelector'

export function PropertyBasicInfo() {
  const { control, watch, setValue } = useFormContext()
  const hasRera = watch('has_rera')
  const developerId = watch('developer_id')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5" />
          Basic Information
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Fill in the essential details of your property
        </p>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <FormField
          control={control}
          name="title"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Property Title <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g., Modern 3-Bedroom Apartment" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <FormLabel>Property Description <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your property in detail..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="property_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="House">House</SelectItem>
                  <SelectItem value="Apartment">Apartment</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Land">Land</SelectItem>
                  <SelectItem value="Villa">Villa</SelectItem>
                  <SelectItem value="Penthouse">Penthouse</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Property Nature field */}
        <FormField
          control={control}
          name="property_nature"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Nature <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property nature" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Sell">Sell</SelectItem>
                  <SelectItem value="Rent">Rent</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="property_collection"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Collection <span className="text-destructive">*</span></FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select collection type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Newly Launched">Newly Launched</SelectItem>
                  <SelectItem value="Featured">Featured</SelectItem>
                  <SelectItem value="Ready to Move">Ready to Move</SelectItem>
                  <SelectItem value="Under Construction">Under Construction</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* RERA Section */}
        <div className="md:col-span-2 space-y-4">
          <FormField
            control={control}
            name="has_rera"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    I have RERA No
                  </FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Check this if your property has a RERA registration number
                  </p>
                </div>
              </FormItem>
            )}
          />
          
          {hasRera && (
            <FormField
              control={control}
              name="rera_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RERA Number</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter RERA registration number" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        
        <FormField
          control={control}
          name="posted_by"
          render={({ field }) => (
            <FormItem className="md:col-span-2">
              <PropertyPostedBySelector
                value={field.value}
                onChange={(value) => {
                  field.onChange(value)
                }}
                developerId={developerId}
                onDeveloperIdChange={(developerId) => {
                  setValue('developer_id', developerId)
                }}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Hidden field to track developer_id */}
        <FormField
          control={control}
          name="developer_id"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input {...field} type="hidden" />
              </FormControl>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
} 