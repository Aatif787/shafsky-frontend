import React, { createContext, useContext, useEffect, useState } from "react";
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
  const [allowFetch, setAllowFetch] = useState(false);

  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof win.requestIdleCallback === "function") {
      const id = win.requestIdleCallback(() => setAllowFetch(true), { timeout: 2000 });
      return () => win.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(() => setAllowFetch(true), 400);
    return () => window.clearTimeout(t);
  }, []);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["branding-settings"],
    queryFn: () => getActiveBranding(),
    enabled: allowFetch,
    placeholderData: FALLBACK_BRANDING,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: 0,
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
