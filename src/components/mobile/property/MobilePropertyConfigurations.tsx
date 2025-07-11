'use client';

import React, { useEffect, useState } from "react";
import { Property, BHKConfiguration } from "@/types/property";
import { ChevronDown, Maximize2, ZoomIn, ZoomOut, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface MobilePropertyConfigurationsProps {
  property: Property;
}

export default function MobilePropertyConfigurations({ property }: MobilePropertyConfigurationsProps) {
  const [configurations, setConfigurations] = useState<BHKConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConfigIdx, setSelectedConfigIdx] = useState(0);
  const [selectedBhk, setSelectedBhk] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Floor plan modal state
  const [floorPlanModalOpen, setFloorPlanModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Fetch configurations from API
  useEffect(() => {
    async function fetchConfigurations() {
      setLoading(true);
      try {
        const res = await fetch(`/api/properties/${property.id}/configurations`);
        if (!res.ok) {
          throw new Error("Failed to fetch configurations");
        }
        const data = await res.json();
        console.log("Fetched configurations:", data.configurations);
        setConfigurations(data.configurations || []);
        // Set initial BHK selection
        if (data.configurations && data.configurations.length > 0) {
          const bhkOptions = Array.from(new Set(data.configurations.map((cfg: BHKConfiguration) => cfg.bhk)));
          setSelectedBhk(Number(bhkOptions[0]));
          setSelectedConfigIdx(0);
        }
      } catch {
        // Error handling removed as not needed
      } finally {
        setLoading(false);
      }
    }
    if (property.id) {
      fetchConfigurations();
    }
  }, [property.id]);

  // BHK selector (if multiple BHKs)
  const bhkOptions = Array.from(new Set(configurations.map(cfg => cfg.bhk)));
  const filteredConfigs = selectedBhk !== null ? configurations.filter(cfg => cfg.bhk === selectedBhk) : [];
  const selectedConfig = filteredConfigs[selectedConfigIdx] || filteredConfigs[0];

  // Get URLs with fallback for different naming conventions
  const floorPlanUrl = selectedConfig?.floor_plan_url || (selectedConfig as BHKConfiguration & { floorPlanUrl?: string })?.floorPlanUrl || '';
  const brochureUrlFinal = selectedConfig?.brochure_url || (selectedConfig as BHKConfiguration & { brochureUrl?: string })?.brochureUrl || '';

  // Private Exclusives (show only if a config has ready_by === null)
  const showPrivateExclusives = filteredConfigs.some(cfg => !cfg.ready_by);

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  // Share function
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${property.title} - Floor Plan`,
          text: `Check out the floor plan for ${property.title}`,
          url: floorPlanUrl
        });
      } catch {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(floorPlanUrl);
        alert('Floor plan URL copied to clipboard!');
      } catch {
        console.error('Failed to copy URL');
      }
    }
  };

  // Reset zoom when modal opens
  useEffect(() => {
    if (floorPlanModalOpen) {
      setZoomLevel(1);
    }
  }, [floorPlanModalOpen]);

  if (loading) {
    return (
      <div className="mx-1 my-4">
        <div className="bg-white/90 backdrop-blur-md border-gray-200/50 rounded-2xl shadow-sm p-6 flex items-center justify-center min-h-[120px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
        </div>
      </div>
    );
  }
  if (!configurations.length) {
    return (
      <div className="mx-1 my-4">
        <div className="bg-white/90 backdrop-blur-md border-gray-200/50 rounded-2xl shadow-sm p-6">
          <div className="text-gray-400 text-center text-sm">No configurations available.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-1 my-4">
      <div className="bg-white/90 backdrop-blur-md border-gray-200/50 rounded-2xl shadow-sm p-6">
        {/* Section Header */}
        <div className="text-lg font-bold text-black mb-4">Available Configurations</div>

        {/* BHK Selector */}
        <div className="flex gap-3 mb-4">
          {bhkOptions.map(bhk => (
            <button
              key={bhk}
              className={`relative px-5 py-2 rounded-full font-semibold text-sm focus:outline-none transition-all ${selectedBhk === bhk ? "bg-black text-white shadow" : "bg-white border border-black/20 text-black"}`}
              onClick={() => {
                setSelectedBhk(bhk);
                setSelectedConfigIdx(0);
              }}
            >
              {bhk} Beds
              {selectedBhk === bhk && (
                <span className="absolute left-1/2 -bottom-2 -translate-x-1/2 w-3 h-3 bg-black rotate-45 rounded-sm" style={{ zIndex: 1 }} />
              )}
            </button>
          ))}
        </div>

        {/* Configuration Dropdown */}
        <div className="mb-2">
          <button
            className="w-full flex items-center justify-between bg-white border border-black/10 rounded-xl px-4 py-3 text-left shadow-sm font-medium text-black text-sm focus:outline-none"
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <span className="truncate">
              {selectedConfig ? `${selectedConfig.bhk} BHK (${selectedConfig.area} Sq. Ft.)` : ''}
            </span>
            <span className="ml-2 text-xs text-black/60">
              {selectedConfig?.ready_by ? `Ready by ${selectedConfig.ready_by}` : ""}
            </span>
            <ChevronDown className="w-5 h-5 ml-2 text-black/40" />
          </button>
          {/* Dropdown List (if multiple configs for this BHK) */}
          {dropdownOpen && filteredConfigs.length > 1 && (
            <div className="mt-1 bg-white border border-black/10 rounded-xl shadow-lg overflow-hidden">
              {filteredConfigs.map((cfg, idx) => (
                <button
                  key={cfg.id || idx}
                  className={`w-full px-4 py-3 text-left text-sm font-medium ${selectedConfigIdx === idx ? "bg-black/5" : "hover:bg-black/5"}`}
                  onClick={() => {
                    setSelectedConfigIdx(idx);
                    setDropdownOpen(false);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span>{`${cfg.bhk} BHK (${cfg.area} Sq. Ft.)`}</span>
                    <span className="text-xs text-black/60">
                      {cfg.ready_by ? `Ready by ${cfg.ready_by}` : ""}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Configuration Details */}
        <div className="text-xs text-gray-500 mb-4">
          {selectedConfig ? `${selectedConfig.bhk} BHK, ${selectedConfig.area} Sq. Ft.` : ''}
          {selectedConfig?.ready_by && `, Ready by ${selectedConfig.ready_by}`}
        </div>

        {/* Private Exclusives Card */}
        {showPrivateExclusives && (
          <div className="bg-black rounded-2xl p-6 mb-4 flex flex-col items-center justify-center relative">
            <div className="text-3xl font-extralight text-white mb-2 tracking-widest">∣∣∣</div>
            <div className="text-xs tracking-widest text-yellow-400 mb-2">PRIVATE EXCLUSIVES</div>
            <div className="text-sm text-white text-center mb-2">
              Connect with our Private Client Concierge<br />for access to floorplans.
            </div>
            <button className="absolute bottom-3 right-3 bg-white/10 hover:bg-white/20 rounded-full p-2">
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
          </div>
        )}

        {/* Floor Plan Button */}
        {floorPlanUrl && floorPlanUrl !== '' && (
          <button
            onClick={() => setFloorPlanModalOpen(true)}
            className="w-full bg-white border border-black/20 rounded-full py-3 font-bold text-black shadow-sm hover:bg-black hover:text-white transition-all mb-2"
          >
            VIEW FLOOR PLAN
          </button>
        )}

        {/* Download Brochure Button */}
        {brochureUrlFinal && brochureUrlFinal !== '' && (
          <a
            href={brochureUrlFinal}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full mt-2"
          >
            <button className="w-full bg-white border border-black/20 rounded-full py-3 font-bold text-black shadow-sm hover:bg-black hover:text-white transition-all">
              DOWNLOAD BROCHURE
            </button>
          </a>
        )}
      </div>

      {/* Floor Plan Modal */}
      <Dialog open={floorPlanModalOpen} onOpenChange={setFloorPlanModalOpen}>
        <DialogContent className="max-w-sm w-[95vw] max-h-[90vh] rounded-2xl p-0 bg-white border border-gray-200 overflow-hidden flex flex-col">
          <DialogTitle className="sr-only">Floor Plan</DialogTitle>
          
          {/* Header */}
          <div className="flex items-center justify-center px-4 py-3 border-b border-gray-100">
            <h2 className="text-lg font-bold text-center">Floor Plan</h2>
          </div>

          {/* Content */}
          <div className="flex-1 relative overflow-hidden">
            {/* Zoom Controls */}
            <div className="absolute top-2 right-2 flex gap-1 z-10">
              <button
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                className="bg-white/90 hover:bg-white p-1.5 rounded-full shadow-sm disabled:opacity-50"
              >
                <ZoomOut className="w-3 h-3 text-black" />
              </button>
              <button
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                className="bg-white/90 hover:bg-white p-1.5 rounded-full shadow-sm disabled:opacity-50"
              >
                <ZoomIn className="w-3 h-3 text-black" />
              </button>
              <button
                onClick={handleShare}
                className="bg-white/90 hover:bg-white p-1.5 rounded-full shadow-sm"
              >
                <Share2 className="w-3 h-3 text-black" />
              </button>
            </div>

            {/* Floor Plan Image Container */}
            <div className="w-full h-full overflow-auto">
              <div 
                className="w-full h-full flex items-center justify-center p-2"
                style={{ 
                  minWidth: `${zoomLevel * 100}%`,
                  minHeight: `${zoomLevel * 100}%`
                }}
              >
                <img
                  src={floorPlanUrl}
                  alt="Floor Plan"
                  className="max-w-full max-h-full object-contain"
                  style={{ 
                    transform: `scale(${zoomLevel})`, 
                    transformOrigin: 'center',
                    cursor: zoomLevel > 1 ? 'grab' : 'default'
                  }}
                  draggable={zoomLevel > 1}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 