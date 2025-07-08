import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ArrowUp, ArrowDown, SortAsc, SortDesc } from 'lucide-react'

interface PropertiesSortingBarProps {
  sortBy: string
  setSortBy: (value: string) => void
  sortOrder: 'asc' | 'desc'
  setSortOrder: (value: 'asc' | 'desc') => void
}

const sortOptions = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'price', label: 'Price' },
  { value: 'title', label: 'Title' },
  { value: 'location', label: 'Location' },
  { value: 'view_count', label: 'Views' },
  { value: 'favorite_count', label: 'Favorites' },
  { value: 'average_rating', label: 'Rating' },
  { value: 'area', label: 'Area' },
  { value: 'bedrooms', label: 'Bedrooms' }
]

export default function PropertiesSortingBar({
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder
}: PropertiesSortingBarProps) {
  const handleSortChange = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // Set new field with default desc order
      setSortBy(newSortBy)
      setSortOrder('desc')
    }
  }

  const getSortIcon = (optionValue: string) => {
    if (sortBy !== optionValue) {
      return <ArrowUpDown className="h-4 w-4" />
    }
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <SortAsc className="h-4 w-4" />
          Sort Properties
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {sortOptions.map((option) => (
            <Button
              key={option.value}
              variant={sortBy === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSortChange(option.value)}
              className="flex items-center gap-2"
            >
              {getSortIcon(option.value)}
              {option.label}
              {sortBy === option.value && (
                <span className="text-xs opacity-75">
                  ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
                </span>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 