import { useFormContext } from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'

const AMENITIES_OPTIONS = [
  { id: 'gym', label: 'Gym' },
  { id: 'pool', label: 'Swimming Pool' },
  { id: 'lift', label: 'Lift' },
  { id: 'security', label: 'Security' },
  { id: 'garden', label: 'Garden' },
  { id: 'playground', label: 'Playground' },
  { id: 'clubhouse', label: 'Clubhouse' },
  { id: 'parking', label: 'Parking' },
  { id: 'power_backup', label: 'Power Backup' },
  { id: 'water_supply', label: '24/7 Water Supply' },
]

export function PropertyDetails() {
  const form = useFormContext()

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Property Details</h2>

      <FormField
        control={form.control}
        name="amenities"
        render={({ field }) => (
          <FormItem>
            <div className="mb-4">
              <FormLabel className="text-base">Amenities</FormLabel>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {AMENITIES_OPTIONS.map((item) => (
                <FormItem
                  key={item.id}
                  className="flex flex-row items-start space-x-3 space-y-0"
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(item.label)}
                      onCheckedChange={(checked: boolean) => {
                        const currentValue = field.value || []
                        return checked
                          ? field.onChange([...currentValue, item.label])
                          : field.onChange(
                              currentValue.filter((value: string) => value !== item.label)
                            )
                      }}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">
                    {item.label}
                  </FormLabel>
                </FormItem>
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
} 