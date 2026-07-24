import { getRequest } from "@tanstack/react-start/server";
import { apiPost, getTokenFromRequest } from "@/lib/FastApiClient";

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

// Helper to log administrative audits in FastAPI backend
export async function logAdminActionHelper(
  _supabase: any,
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

  try {
    const token = getTokenFromRequest();
    await apiPost(
      "/api/audit-logs",
      {
        actor_id: userId,
        action,
        entity: tableName,
        entity_id: entityId,
        details: { before: beforeData, after: afterData, ip: ipAddress },
        ip: ipAddress,
      },
      token,
    );
  } catch (e) {
    console.error("Failed to write to audit log:", e);
  }
}
