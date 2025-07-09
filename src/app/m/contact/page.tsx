import React from 'react'
import { getWebsiteInfo } from '@/lib/data'
import MobileContactClient from './MobileContactClient'

export default async function MobileContactPage() {
  // Fetch dynamic contact information
  const contactInfo = await getWebsiteInfo()

  return (
    <MobileContactClient contactInfo={contactInfo} />
  )
} 