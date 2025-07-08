"use client"

import React from 'react'

interface MenuIconProps {
  size?: number
  color?: string
}

export default function MenuIcon({ size = 24, color = '#2C3550' }: MenuIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="7" width="12" height="2" rx="1" fill={color} />
      <rect x="6" y="11" width="12" height="2" rx="1" fill={color} />
      <rect x="6" y="15" width="8" height="2" rx="1" fill={color} />
    </svg>
  )
} 