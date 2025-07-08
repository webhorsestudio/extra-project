import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Indian number formatting utility
export function formatIndianNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num)
}

// Format price in Indian Rupees
export function formatIndianPrice(price: number): string {
  if (price === 0) return 'Price on request'
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
  
  return formatter.format(price)
}
