import { useFormContext, Control } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Home, DollarSign, Square, Bed, Bath, AlertCircle, Calendar } from 'lucide-react'
import { FileUpload } from './FileUpload'
import { formatIndianPrice } from '@/lib/utils'

interface BHKConfigurationsProps {
  control: Control<any>
  name: string
}

export function BHKConfigurations({ control, name }: BHKConfigurationsProps) {
  const form = useFormContext()

  const addConfiguration = () => {
    const currentConfigs = form.getValues(name) || []
    form.setValue(name, [
      ...currentConfigs,
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
    ])
  }

  const removeConfiguration = (index: number) => {
    const currentConfigs = form.getValues(name)
    form.setValue(
      name,
      currentConfigs.filter((_: any, i: number) => i !== index)
    )
  }

  const configurations = form.watch(name) || []
  
  console.log('BHKConfigurations - name:', name)
  console.log('BHKConfigurations - configurations:', configurations)
  console.log('BHKConfigurations - form values:', form.getValues())

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              BHK Configurations & Pricing
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Add different BHK configurations with pricing, area, room details, floor plans, brochures, and completion dates
            </p>
            <div className="flex items-center gap-2 mt-2 text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
              <AlertCircle className="h-3 w-3" />
              <span>Configure pricing, rooms, area, floor plans, brochures, and ready-by dates for each BHK type</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addConfiguration}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Configuration
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {configurations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Home className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium">No configurations added yet</p>
            <p className="text-sm mt-1">Click &quot;Add Configuration&quot; to set pricing and room details</p>
            <div className="mt-4 p-3 bg-muted rounded-md text-xs">
              <p className="font-medium mb-1">Each configuration includes:</p>
              <ul className="text-left space-y-1">
                <li>• BHK (Bedroom, Hall, Kitchen)</li>
                <li>• Price for this configuration</li>
                <li>• Total area in sq.ft</li>
                <li>• Number of bedrooms</li>
                <li>• Number of bathrooms</li>
                <li>• Ready by date</li>
                <li>• Floor plan (Image/PDF)</li>
                <li>• Brochure (Image/PDF)</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {configurations.map((config: any, index: number) => (
              <Card key={index} className="border-dashed">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Configuration {index + 1}
                      </Badge>
                      {config.bhk && (
                        <Badge variant="outline">
                          {config.bhk} BHK
                        </Badge>
                      )}
                      {config.price > 0 && (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {formatIndianPrice(config.price)}
                        </Badge>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeConfiguration(index)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Basic Fields Grid */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
                    <FormField
                      control={control}
                      name={`${name}.${index}.bhk`}
                      render={({ field }) => (
                        <FormControl>
                          <FormLabel>BHK</FormLabel>
                          <Input {...field} />
                        </FormControl>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`${name}.${index}.price`}
                      render={({ field }) => (
                        <FormControl>
                          <FormLabel>Price</FormLabel>
                          <Input {...field} />
                        </FormControl>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`${name}.${index}.area`}
                      render={({ field }) => (
                        <FormControl>
                          <FormLabel>Area</FormLabel>
                          <Input {...field} />
                        </FormControl>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`${name}.${index}.bedrooms`}
                      render={({ field }) => (
                        <FormControl>
                          <FormLabel>Bedrooms</FormLabel>
                          <Input {...field} />
                        </FormControl>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`${name}.${index}.bathrooms`}
                      render={({ field }) => (
                        <FormControl>
                          <FormLabel>Bathrooms</FormLabel>
                          <Input {...field} />
                        </FormControl>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`${name}.${index}.ready_by`}
                      render={({ field }) => (
                        <FormControl>
                          <FormLabel>Ready By</FormLabel>
                          <Input {...field} />
                        </FormControl>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`${name}.${index}.floor_plan_url`}
                      render={({ field }) => (
                        <FormControl>
                          <FormLabel>Floor Plan URL</FormLabel>
                          <Input {...field} />
                        </FormControl>
                      )}
                    />
                    <FormField
                      control={control}
                      name={`${name}.${index}.brochure_url`}
                      render={({ field }) => (
                        <FormControl>
                          <FormLabel>Brochure URL</FormLabel>
                          <Input {...field} />
                        </FormControl>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}