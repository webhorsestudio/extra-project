"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { SupportForm } from '@/components/web/SupportForm'

function SupportTabs({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  return (
    <div className="flex border-b mb-6">
      <Button
        variant="ghost"
        className={`px-4 py-2 font-medium border-b-2 transition-colors rounded-none ${activeTab === 'technical' ? 'border-black text-black' : 'border-transparent text-gray-500'}`}
        onClick={() => setActiveTab('technical')}
      >
        Technical support
      </Button>
      <Button
        variant="ghost"
        className={`px-4 py-2 font-medium border-b-2 transition-colors rounded-none ${activeTab === 'legal' ? 'border-black text-black' : 'border-transparent text-gray-500'}`}
        onClick={() => setActiveTab('legal')}
      >
        Legal issues
      </Button>
    </div>
  )
}

function LegalIssuesList() {
  return (
    <div className="bg-white rounded-2xl shadow p-8 max-w-2xl mx-auto text-gray-900">
      <div className="mb-4"><b>Old Law:</b> Any property used for residential purposes. Examples include single-family homes, condos, cooperatives, duplexes, townhouses, and multifamily residences.</div>
      <div className="mb-4"><b>Real estate Law:</b> Any property used exclusively for business purposes, such as apartment complexes, gas stations, grocery stores, hospitals, hotels, offices, parking facilities, restaurants, shopping centers, stores, and theaters.</div>
      <div className="mb-4"><b>International Law:</b> Any property used for manufacturing, production, distribution, storage, and research and development.</div>
      <div className="mb-4"><b>Tax Law:</b> Includes undeveloped property, vacant land, and agricultural lands such as farms, orchards, ranches, and timberland.</div>
      <div className="mb-4"><b>Residential real estate:</b> Any property used for residential purposes. Examples include single-family homes, condos, cooperatives, duplexes, townhouses, and multifamily residences.</div>
      <div className="mb-4"><b>Commercial real estate:</b> Any property used exclusively for business purposes, such as apartment complexes, gas stations, grocery stores, hospitals, hotels, offices, parking facilities, restaurants, shopping centers, stores, and theaters.</div>
      <div className="mb-4"><b>Industrial real estate:</b> Any property used for manufacturing, production, distribution, storage, and research and development.</div>
      <div className="mb-4"><b>Land:</b> Includes undeveloped property, vacant land, and agricultural lands such as farms, orchards, ranches, and timberland.</div>
      <div><b>Special purpose:</b> Property used by the public, such as cemeteries, government buildings, libraries, parks, places of worship, and schools. The Economics of Real Estate</div>
    </div>
  )
}

export default function SupportContent() {
  const [activeTab, setActiveTab] = useState('technical')
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SupportTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === 'technical' ? <SupportForm /> : <LegalIssuesList />}
      </div>
    </div>
  )
} 