'use client';

import { createContext, useContext } from 'react';

export type MobileViewMode = 'grid' | 'map';

const MobileViewModeContext = createContext<MobileViewMode>('grid');

export const useMobileViewMode = () => useContext(MobileViewModeContext);

export const MobileViewModeProvider = MobileViewModeContext.Provider; 