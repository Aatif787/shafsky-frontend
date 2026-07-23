import { getRequest } from "@tanstack/react-start/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";

/**
 * Extracts the client IP address from request headers on the server.
 */
export function getClientIp(): string {
  const req = getRequest();
  if (!req) return "127.0.0.1";
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

// Helper to log administrative audits in both legacy and new schema formats
export async function logAdminActionHelper(
  supabase: SupabaseClient<Database>,
  userId: string,
  action: string,
  tableName: string,
  entityId: string,
  beforeData: unknown,
  afterData: unknown,
) {
  let ipAddress = "127.0.0.1";
  try {
    ipAddress = getClientIp();
  } catch (e) {
    console.warn("Could not extract request headers for audit logging:", e);
  }

  // Insert into audit_log table
  try {
    await supabase.from("audit_log").insert({
      actor_id: userId,
      action,
      entity: tableName,
      entity_id: entityId,
      metadata: { before: beforeData, after: afterData, ip: ipAddress } as unknown as Json,
    });
  } catch (e) {
    console.error("Failed to write to audit_log:", e);
  }
}
