import { X } from 'lucide-react'
import React from 'react'

interface FilterChipProps {
  label: string
  onRemove: () => void
  className?: string
}

const FilterChip: React.FC<FilterChipProps> = ({ label, onRemove, className }) => {
  return (
    <span
      className={`inline-flex items-center bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm font-medium mr-2 mb-2 border border-blue-200 shadow-sm ${className || ''}`}
    >
      <span className="truncate max-w-[120px]">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        className="ml-2 rounded-full hover:bg-blue-100 p-0.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
        aria-label={`Remove filter: ${label}`}
      >
        <X className="h-4 w-4" />
      </button>
    </span>
  )
}

export default FilterChip 