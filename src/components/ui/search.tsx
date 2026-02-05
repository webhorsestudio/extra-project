'use client'

import * as React from 'react'
import { Search } from 'lucide-react'

const SearchInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ ...props }, ref) => {
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          ref={ref}
          className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          {...props}
        />
      </div>
    )
  }
)
SearchInput.displayName = 'SearchInput'

export { SearchInput } 