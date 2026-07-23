import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { invalidateServerBrandingCache } from "./branding.server";

export const getActiveBranding = createServerFn({ method: "GET" })
  .handler(async () => {
    try {
      const clientServer = await import("@/integrations/supabase/client.server");
      const sbAdmin = clientServer.supabaseAdmin as any;
      const { data, error } = await sbAdmin
        .from("branding_settings")
        .select("*")
        .eq("is_active", true)
        .maybeSingle();

      if (error) {
        console.warn("[Branding Service] Error fetching active branding:", error.message);
        return null;
      }
      return data;
    } catch (err) {
      console.warn("[Branding Service] Exception fetching branding:", err);
      return null;
    }
  });

export const updateBrandingSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: any) => d as Record<string, any>)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    
    // 1. Authorize: Only super_admin role can write branding
    const { getUserRoles } = await import("@/lib/permissions");
    const roles = await getUserRoles(supabase as any, userId);
    if (!roles.includes("super_admin")) {
      throw new Error("Unauthorized: Only super_admin can update branding settings.");
    }

    const clientServer = await import("@/integrations/supabase/client.server");
    const sbAdmin = clientServer.supabaseAdmin as any;
    
    const payload = {
      company_name: data.company_name,
      company_tagline: data.company_tagline,
      website: data.website,
      booking_email: data.booking_email,
      support_email: data.support_email,
      reply_email: data.reply_email,
      support_phone: data.support_phone,
      whatsapp_number: data.whatsapp_number,
      business_address: data.business_address,
      city: data.city,
      state: data.state,
      country: data.country,
      postal_code: data.postal_code,
      logo_url: data.logo_url,
      logo_dark_url: data.logo_dark_url,
      logo_light_url: data.logo_light_url,
      favicon_url: data.favicon_url,
      primary_color: data.primary_color,
      secondary_color: data.secondary_color,
      accent_color: data.accent_color,
      linkedin_url: data.linkedin_url,
      facebook_url: data.facebook_url,
      instagram_url: data.instagram_url,
      youtube_url: data.youtube_url,
      twitter_url: data.twitter_url,
      copyright_text: data.copyright_text,
      is_active: true,
      updated_at: new Date().toISOString()
    };

    // 2. Fetch existing active branding row
    const { data: existing } = await sbAdmin
      .from("branding_settings")
      .select("id")
      .eq("is_active", true)
      .maybeSingle();

    let result;
    if (existing) {
      // Update
      const { data: upData, error: upErr } = await sbAdmin
        .from("branding_settings")
        .update(payload)
        .eq("id", (existing as any).id)
        .select("*")
        .single();
      if (upErr) throw new Error(upErr.message);
      result = upData;
    } else {
      // Insert
      const { data: insData, error: insErr } = await sbAdmin
        .from("branding_settings")
        .insert(payload)
        .select("*")
        .single();
      if (insErr) throw new Error(insErr.message);
      result = insData;
    }

    // 3. Invalidate server-side cache
    invalidateServerBrandingCache();

    // 4. Audit Log
    await sbAdmin.from("audit_log").insert({
      actor_id: userId,
      action: "branding.update",
      entity: "system",
      entity_id: (result as any).id,
      metadata: { company_name: (result as any).company_name }
    } as any);

    return result;
  });
