import React, { createContext, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { BrandingSettings } from "./branding.types";
import { FALLBACK_BRANDING } from "./branding.constants";
import { getActiveBranding } from "./branding.service";

interface BrandingContextType {
  branding: BrandingSettings;
  isLoading: boolean;
  refetch: () => void;
}

const BrandingContext = createContext<BrandingContextType>({
  branding: FALLBACK_BRANDING,
  isLoading: false,
  refetch: () => {},
});

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["branding-settings"],
    queryFn: () => getActiveBranding(),
    staleTime: Infinity, // Cache globally, load once
  });

  const branding: BrandingSettings = data ? { ...FALLBACK_BRANDING, ...(data as any) } : FALLBACK_BRANDING;

  useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      
      // Update Tailwind CSS variable hooks or plain CSS variables
      if (branding.primary_color) {
        root.style.setProperty("--primary-brand-color", branding.primary_color);
      }
      if (branding.secondary_color) {
        root.style.setProperty("--secondary-brand-color", branding.secondary_color);
      }
      if (branding.accent_color) {
        root.style.setProperty("--accent-brand-color", branding.accent_color);
      }
    }
  }, [branding]);

  return (
    <BrandingContext.Provider value={{ branding, isLoading, refetch }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  return useContext(BrandingContext);
}
