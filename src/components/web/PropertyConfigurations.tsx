'use client';
import React, { useState } from 'react';
import { Property, BHKConfiguration } from '@/types/property';
import Image from 'next/image'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

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
  const hasImage = !!config?.floor_plan_url;
  const [modalOpen, setModalOpen] = React.useState(false);
  return (
    <>
      <div className="relative w-full bg-white border border-gray-200 rounded-xl flex items-center justify-center aspect-video shadow mb-6 overflow-hidden">
        {hasImage ? (
          <button
            type="button"
            className="w-full h-full cursor-zoom-in focus:outline-none"
            onClick={() => setModalOpen(true)}
            style={{ padding: 0, margin: 0 }}
          >
            <Image
              src={config.floor_plan_url!}
              alt="Floor Plan"
              className="object-cover w-full h-full"
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </button>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-gray-400">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mb-2">
              <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="2" />
              <path d="M3 15l4-4a3 3 0 014 0l4 4" strokeWidth="2" />
              <circle cx="9" cy="10" r="1" strokeWidth="2" />
            </svg>
            <span className="text-base">No Floor Plan Available</span>
          </div>
        )}
      </div>
      {/* Modal for zoomed-in floor plan */}
      {hasImage && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-4xl w-full h-[80vh] flex items-center justify-center bg-black/90 p-0 border-none shadow-none">
            <DialogTitle className="sr-only">Floor Plan Zoomed View</DialogTitle>
            {/* Close button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 z-50 bg-white/80 hover:bg-white text-gray-900 rounded-full p-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Close"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative w-full h-full flex items-center justify-center overflow-auto p-4">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-3xl w-full h-auto flex items-center justify-center p-4 mx-auto">
                <img
                  src={config.floor_plan_url!}
                  alt="Floor Plan Zoomed"
                  className="max-w-full max-h-[70vh] object-contain mx-auto drop-shadow-lg rounded-xl border border-gray-100"
                  style={{ display: 'block' }}
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// Brochure preview
function BrochurePreview({ config }: { config: BHKConfiguration | undefined }) {
  if (config?.brochure_url) {
    return (
      <div className="relative w-full aspect-video mb-6 rounded-xl overflow-hidden border border-gray-200 shadow">
        <iframe
          src={config.brochure_url}
          title="Brochure Preview"
          className="w-full h-full min-h-[300px] rounded-xl border-none"
          allow="autoplay"
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
      className="block text-center mt-2"
    >
      <button className="bg-blue-700 text-white font-semibold rounded-xl py-3 px-6 shadow-sm hover:bg-blue-800 transition text-sm">
        DOWNLOAD BROCHURE
      </button>
    </a>
  );
}

// Private Exclusives Card
function PrivateExclusivesCard() {
  return (
    <div className="bg-black rounded-2xl p-6 mb-6 flex flex-col items-center justify-center relative">
      <div className="text-3xl font-extralight text-white mb-2 tracking-widest">∣∣∣</div>
      <div className="text-xs tracking-widest text-yellow-400 mb-2">PRIVATE EXCLUSIVES</div>
      <div className="text-sm text-white text-center mb-2">
        Connect with our Private Client Concierge<br />for access to floorplans.
      </div>
      <button className="absolute bottom-3 right-3 bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors">
        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
        </svg>
      </button>
    </div>
  );
}

export default function PropertyConfigurations({ property }: PropertyConfigurationsProps) {
  const configs = property.property_configurations || [];
  const uniqueBhks = Array.from(new Set(configs.map(c => c.bhk))).sort((a, b) => b - a);
  const [activeBhk, setActiveBhk] = useState(uniqueBhks[0] || 1);
  const bhkConfigs = configs.filter(c => c.bhk === activeBhk);
  const [activeConfigId, setActiveConfigId] = useState(bhkConfigs[0]?.id || '');
  const activeConfig = bhkConfigs.find(c => c.id === activeConfigId) || bhkConfigs[0];

  // Private Exclusives (show only if a config has ready_by === null or no floor plan)
  const showPrivateExclusives = bhkConfigs.some(cfg => !cfg.ready_by) || !activeConfig?.floor_plan_url;

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
      
      {/* Private Exclusives Card */}
      {showPrivateExclusives && <PrivateExclusivesCard />}
      
      <FloorPlanPreview config={activeConfig} />
      <BrochurePreview config={activeConfig} />
      <DownloadBrochureButton config={activeConfig} />
    </section>
  );
} 