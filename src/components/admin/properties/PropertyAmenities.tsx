import { useFormContext } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAmenities } from '@/hooks/useAmenities'
import Image from 'next/image'
import { useState, useMemo } from 'react'
import { Dumbbell, Search } from 'lucide-react'

// Type definitions
interface AmenityObject {
  name: string;
  image_url?: string;
}

export function PropertyAmenities() {
  const form = useFormContext()
  const { amenities, loading, error } = useAmenities()
  const [search, setSearch] = useState('')

  // Only show active amenities
  const activeAmenities = useMemo(() =>
    amenities.filter(a => a.is_active), [amenities]
  )

  // Filter by search
  const filteredAmenities = useMemo(() => {
    if (!search) return activeAmenities
    return activeAmenities.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))
  }, [activeAmenities, search])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="h-5 w-5" />
          Amenities & Features
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select the amenities available in your property
        </p>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground absolute ml-3" />
          <Input
            className="pl-9 w-full max-w-xs"
            placeholder="Search amenities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <FormField
          control={form.control}
          name="amenities"
          render={({ field }) => (
            <FormItem>
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-2">
                  {loading && <div className="text-sm text-muted-foreground">Loading amenities...</div>}
                  {error && <div className="text-sm text-red-600">{error}</div>}
                  {!loading && !error && filteredAmenities.length === 0 && (
                    <div className="text-sm text-muted-foreground">No amenities found.</div>
                  )}
                  {filteredAmenities.map((amenity) => (
                    <FormItem key={amenity.id} className="flex flex-row items-center gap-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value?.some((a: AmenityObject) => a.name === amenity.name)}
                          onCheckedChange={(checked) => {
                            const currentValue = field.value || []
                            if (checked) {
                              field.onChange([...currentValue, { name: amenity.name, image_url: amenity.image_url }])
                            } else {
                              field.onChange(currentValue.filter((a: AmenityObject) => a.name !== amenity.name))
                            }
                          }}
                        />
                      </FormControl>
                      {amenity.image_url ? (
                        <Image src={amenity.image_url} alt={amenity.name} width={32} height={32} className="rounded border bg-white object-cover" />
                      ) : (
                        <Dumbbell className="h-5 w-5 text-muted-foreground" />
                      )}
                      <FormLabel className="font-normal text-sm cursor-pointer mb-0 flex-1">
                        {amenity.name}
                      </FormLabel>
                    </FormItem>
                  ))}
                </div>
              </ScrollArea>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch('amenities')?.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium">Selected Amenities:</span>
              <Badge variant="secondary">{form.watch('amenities').length}</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.watch('amenities').map((amenity: AmenityObject, index: number) => (
                <Badge key={`${amenity.name}-${index}`} variant="outline" className="text-xs">
                  {amenity.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 