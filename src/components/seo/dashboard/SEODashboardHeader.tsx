'use client'

import { DataCollectionButton } from './actions/DataCollectionButton'

export function SEODashboardHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">SEO Dashboard</h1>
        <p className="text-gray-600 mt-1">Monitor your website&apos;s search engine performance</p>
      </div>
      <div className="flex gap-2">
        <DataCollectionButton />
      </div>
    </div>
  )
}
