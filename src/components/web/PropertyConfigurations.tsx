'use client';
import React, { useState } from 'react';
import { Property, BHKConfiguration } from '@/types/property';
import Image from 'next/image'

interface PropertyConfigurationsProps {
  property: Property;
}

// Tabs for BHKs
function ConfigurationsTabs({ bhks, active, onChange }: { bhks: number[]; active: number; onChange: (tab: number) => void }) {
  return (
    <div className="flex gap-3 mb-6">
      {bhks.map(bhk => (
        <button
          key={bhk}
          className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${active === bhk ? 'bg-[#0A1736] text-white' : 'bg-gray-100 text-[#0A1736]'}`}
          onClick={() => onChange(bhk)}
        >
          {bhk} Beds
        </button>
      ))}
    </div>
  );
}

// Selectors for ready_by (if available)
function ConfigurationsSelectors({ configs, activeConfigId, onChange }: { configs: BHKConfiguration[]; activeConfigId: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-3 mb-2">
      <select
        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
        value={activeConfigId}
        onChange={e => onChange(e.target.value)}
      >
        {configs.map(config => (
          <option key={config.id} value={config.id}>
            {config.bhk} BHK{config.ready_by ? `, Ready by ${config.ready_by}` : ''}
          </option>
        ))}
      </select>
    </div>
  );
}

// Info text
function ConfigurationsInfoText({ config }: { config: BHKConfiguration | undefined }) {
  if (!config) return null;
  return (
    <div className="text-xs text-gray-500 mb-4">
      {config.ready_by ? `Ready by ${config.ready_by}` : 'Configuration details'}
    </div>
  );
}

// Floor plan preview
function FloorPlanPreview({ config }: { config: BHKConfiguration | undefined }) {
  if (config?.floor_plan_url) {
    return (
      <div className="bg-gray-100 rounded-xl flex items-center justify-center h-56 md:h-64 w-full mb-6">
        <Image src={config.floor_plan_url} alt="Floor Plan" className="object-contain h-full max-h-60" fill style={{ objectFit: 'contain' }} />
      </div>
    );
  }
  return (
    <div className="bg-gray-100 rounded-xl flex items-center justify-center h-56 md:h-64 w-full mb-6">
      <span className="text-gray-400 text-sm">No Floor Plan Available</span>
    </div>
  );
}

// Brochure preview
function BrochurePreview({ config }: { config: BHKConfiguration | undefined }) {
  if (config?.brochure_url) {
    return (
      <div className="relative w-full h-56 md:h-64 mb-6 rounded-xl overflow-hidden">
        <iframe
          src={config.brochure_url}
          title="Brochure Preview"
          className="w-full h-full rounded-xl border-none"
        />
      </div>
    );
  }
  return null;
}

// Download brochure button
function DownloadBrochureButton({ config }: { config: BHKConfiguration | undefined }) {
  if (!config?.brochure_url) return null;
  return (
    <a
      href={config.brochure_url}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full block"
    >
      <button className="w-full bg-[#0A1736] text-white font-semibold rounded-xl py-3 mt-2 shadow-sm transition hover:bg-[#142a5c] text-sm">
        DOWNLOAD BROCHURE
      </button>
    </a>
  );
}

export default function PropertyConfigurations({ property }: PropertyConfigurationsProps) {
  const configs = property.property_configurations || [];
  const uniqueBhks = Array.from(new Set(configs.map(c => c.bhk))).sort((a, b) => b - a);
  const [activeBhk, setActiveBhk] = useState(uniqueBhks[0] || 1);
  const bhkConfigs = configs.filter(c => c.bhk === activeBhk);
  const [activeConfigId, setActiveConfigId] = useState(bhkConfigs[0]?.id || '');
  const activeConfig = bhkConfigs.find(c => c.id === activeConfigId) || bhkConfigs[0];

  // Update config selector if BHK changes
  React.useEffect(() => {
    if (bhkConfigs.length > 0) {
      setActiveConfigId(bhkConfigs[0].id || '');
    }
  }, [bhkConfigs]);

  if (configs.length === 0) {
    return (
      <section className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-4">Available Configurations</h2>
        <div className="text-gray-500">No configurations available for this property.</div>
      </section>
    );
  }

  return (
    <section className="bg-white p-6 rounded-2xl shadow mb-8">
      <h2 className="text-lg md:text-xl font-semibold mb-4">Available Configurations</h2>
      <ConfigurationsTabs bhks={uniqueBhks} active={activeBhk} onChange={setActiveBhk} />
      {uniqueBhks.length > 0 && (
        <div className="text-xs text-gray-700 mb-2">
          {uniqueBhks.length > 1
            ? `${uniqueBhks.length} Configurations Available (${uniqueBhks.join('-')} Beds)`
            : `${uniqueBhks[0]} Beds Configuration`}
        </div>
      )}
      <ConfigurationsSelectors configs={bhkConfigs} activeConfigId={activeConfigId} onChange={setActiveConfigId} />
      <ConfigurationsInfoText config={activeConfig} />
      <FloorPlanPreview config={activeConfig} />
      <BrochurePreview config={activeConfig} />
      <DownloadBrochureButton config={activeConfig} />
    </section>
  );
} 