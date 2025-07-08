"use client";
import React, { createContext, useContext } from 'react';

/**
 * FooterVisibleContext
 * Provides the footerVisible state (for scroll-based hide/show effects) to any component.
 * 
 * @example
 * ```tsx
 * const footerVisible = useFooterVisible();
 * return <FooterNav visible={footerVisible} />;
 * ```
 */
export const FooterVisibleContext = createContext<boolean>(true);

/**
 * Hook to access the footer visibility state from the FooterVisibleContext
 * @returns boolean - Whether the footer navigation should be visible
 */
export const useFooterVisible = (): boolean => {
  const context = useContext(FooterVisibleContext);
  if (context === undefined) {
    throw new Error('useFooterVisible must be used within a FooterVisibleProvider');
  }
  return context;
};

export const FooterVisibleProvider = FooterVisibleContext.Provider; 