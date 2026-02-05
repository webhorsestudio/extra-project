'use client';

import { useSearchParams } from 'next/navigation';
import { MobileViewModeProvider } from './MobileViewModeContext';

interface MobileViewModeDetectorProps {
  children: React.ReactNode;
}

export default function MobileViewModeDetector({ children }: MobileViewModeDetectorProps) {
  const searchParams = useSearchParams();
  const viewMode = searchParams.get('view') === 'map' ? 'map' : 'grid';
  
  return (
    <MobileViewModeProvider value={viewMode}>
      {children}
    </MobileViewModeProvider>
  );
} 