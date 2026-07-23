import { FALLBACK_BRANDING } from "./branding.constants";
import type { BrandingSettings } from "./branding.types";
import { cache } from "@/lib/cache";

const BRANDING_CACHE_KEY = "server_branding_settings";

export async function getActiveBrandingServer(): Promise<BrandingSettings> {
  try {
    const cached = await cache.get<BrandingSettings>(BRANDING_CACHE_KEY);
    if (cached) {
      return cached;
    }

    const clientServer = await import("@/integrations/supabase/client.server");
    const sbAdmin = clientServer.supabaseAdmin as any;
    if (!sbAdmin || typeof sbAdmin.from !== "function") {
      return FALLBACK_BRANDING;
    }
    
    const queryBuilder = sbAdmin.from("branding_settings");
    if (!queryBuilder || typeof queryBuilder.select !== "function") {
      return FALLBACK_BRANDING;
    }

    const { data, error } = await queryBuilder
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      return FALLBACK_BRANDING;
    }

    const branding = { ...FALLBACK_BRANDING, ...(data as any) } as BrandingSettings;
    await cache.set(BRANDING_CACHE_KEY, branding, 60000);
    return branding;
  } catch (err: any) {
    if (err?.message?.includes("Missing Supabase environment variable")) {
      return FALLBACK_BRANDING;
    }
    console.warn("[Branding Server] Exception loading server branding, using fallback:", err);
    return FALLBACK_BRANDING;
  }
}

export function invalidateServerBrandingCache() {
  cache.del(BRANDING_CACHE_KEY).catch((err) => {
    console.warn("[Branding Server] Cache invalidation failed:", err);
  });
}
