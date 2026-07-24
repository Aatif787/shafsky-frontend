import { FALLBACK_BRANDING } from "./branding.constants";
import type { BrandingSettings } from "./branding.types";
import { cache } from "@/lib/cache";
import { apiGet } from "@/lib/FastApiClient";

const BRANDING_CACHE_KEY = "server_branding_settings";

export async function getActiveBrandingServer(): Promise<BrandingSettings> {
  try {
    const cached = await cache.get<BrandingSettings>(BRANDING_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const data = await apiGet<any>("/api/branding/active");
    if (!data) {
      return FALLBACK_BRANDING;
    }

    const branding = { ...FALLBACK_BRANDING, ...(data as any) } as BrandingSettings;
    await cache.set(BRANDING_CACHE_KEY, branding, 60000);
    return branding;
  } catch (err: any) {
    console.warn("[Branding Server] Exception loading server branding, using fallback:", err);
    return FALLBACK_BRANDING;
  }
}

export function invalidateServerBrandingCache() {
  cache.del(BRANDING_CACHE_KEY).catch((err) => {
    console.warn("[Branding Server] Cache invalidation failed:", err);
  });
}
