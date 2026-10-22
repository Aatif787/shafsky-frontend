import { useContext } from "react";
import { useQuery, QueryClient, QueryClientContext } from "@tanstack/react-query";
import {
  getPublicContactSettings,
  PublicContactSettingsData,
  PublicContactSlot,
  ServiceKey,
} from "@/lib/contact-settings";
import { CONTACT } from "@/lib/constants";

export const PUBLIC_CONTACTS_QUERY_KEY = ["public-website-contacts"];

const fallbackClient = new QueryClient({
  defaultOptions: {
    queries: {
      enabled: false,
      staleTime: Infinity,
    },
  },
});

// Default fallbacks to prevent flash of empty content during initial page render
const DEFAULT_FALLBACKS: Record<ServiceKey, PublicContactSlot[]> = {
  meet_greet_lounge: [
    { country_code: "+91", phone_number: "9599087959", full_phone_number: "+919599087959" },
  ],
  transport: [
    { country_code: "+91", phone_number: "9599087959", full_phone_number: "+919599087959" },
  ],
  hotel: [
    { country_code: "+91", phone_number: "9217522660", full_phone_number: "+919217522660" },
  ],
  private_charter: [
    { country_code: "+91", phone_number: "9599087959", full_phone_number: "+919599087959" },
  ],
  ticketing: [
    { country_code: "+91", phone_number: "9599087957", full_phone_number: "+919599087957" },
  ],
  contact: [
    { country_code: "+91", phone_number: "9599087959", full_phone_number: "+919599087959" },
    { country_code: "+91", phone_number: "9599615459", full_phone_number: "+919599615459" },
  ],
};

export interface NormalizedContactSlot extends PublicContactSlot {
  formatted: string;
  tel_link: string;
}

function normalizeSlot(slot: PublicContactSlot): NormalizedContactSlot {
  const code = (slot.country_code || "+91").trim();
  const digits = (slot.phone_number || "").replace(/\D/g, "");
  const full = slot.full_phone_number || `${code}${digits}`;
  const formatted = slot.formatted || `${code} ${slot.phone_number || ""}`.trim();
  const tel_link = slot.tel_link || `tel:${full}`;
  return {
    country_code: code,
    phone_number: slot.phone_number || "",
    full_phone_number: full,
    formatted,
    tel_link,
  };
}

export function useWebsiteContacts() {
  const activeClient = useContext(QueryClientContext);
  const client = activeClient || fallbackClient;

  const { data, isLoading, isError, refetch } = useQuery<PublicContactSettingsData>(
    {
      queryKey: PUBLIC_CONTACTS_QUERY_KEY,
      queryFn: getPublicContactSettings,
      staleTime: 30 * 1000, // 30 seconds fresh
      refetchInterval: 45 * 1000, // Background poll every 45 seconds for open visitor tabs
      refetchOnWindowFocus: true,
      enabled: Boolean(activeClient),
    },
    client
  );

  /**
   * Returns active contacts for a given service.
   * If settings loaded and empty, returns [] so buttons hide cleanly.
   * If still initial loading/error, returns safe default so layout doesn't jump.
   */
  const getContacts = (serviceKey: ServiceKey): NormalizedContactSlot[] => {
    let rawList: PublicContactSlot[] = [];
    if (data && data[serviceKey]) {
      rawList = data[serviceKey].contacts || [];
    } else if (isLoading || isError || !data) {
      // Only return default fallback if data has not arrived yet
      rawList = DEFAULT_FALLBACKS[serviceKey] || [];
    }

    return rawList.map(normalizeSlot);
  };

  const getPrimaryContact = (serviceKey: ServiceKey): NormalizedContactSlot | null => {
    const list = getContacts(serviceKey);
    return list.length > 0 ? list[0] : null;
  };

  const getSecondaryContact = (serviceKey: ServiceKey): NormalizedContactSlot | null => {
    const list = getContacts(serviceKey);
    return list.length > 1 ? list[1] : null;
  };

  const hasContacts = (serviceKey: ServiceKey): boolean => {
    return getContacts(serviceKey).length > 0;
  };

  return {
    data,
    isLoading,
    isError,
    refetch,
    getContacts,
    getPrimaryContact,
    getSecondaryContact,
    hasContacts,
  };
}
