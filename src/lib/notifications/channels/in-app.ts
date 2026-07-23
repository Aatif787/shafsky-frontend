/**
 * In-App Notification Database Connector
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export interface InAppParams {
  userId: string;
  kind: string;
  title: string;
  body: string;
  link?: string;
  entity?: string;
  entityId?: string;
}

export async function sendInApp(
  supabase: SupabaseClient,
  params: InAppParams,
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  try {
    console.log(`[In-App Channel] Inserting notification for user ${params.userId}...`);

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: params.userId,
        kind: params.kind,
        title: params.title,
        body: params.body,
        link: params.link || null,
        entity: params.entity || null,
        entity_id: params.entityId || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[In-App Channel] Database insert error:", error);
      return { success: false, error: error.message };
    }

    console.log("[In-App Channel] Notification inserted. ID:", data.id);
    return { success: true, notificationId: data.id };
  } catch (err: any) {
    console.error("[In-App Channel] Exception occurred:", err);
    return { success: false, error: err.message || String(err) };
  }
}
