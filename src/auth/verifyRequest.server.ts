/**
 * Server-side caller verification.
 *
 * Identity is derived ONLY from the `Authorization: Bearer <jwt>` header on the
 * incoming request, verified by asking FastAPI (`GET /api/auth/me`). Cookies are
 * never consulted for identity — the browser can write them.
 *
 * Results are cached per token for a short TTL so a page that fires several
 * server functions does not hit the backend once per call.
 */

import { resolveApiUrl } from "@/lib/api/config";

export type VerifiedUser = {
  id: string;
  email: string;
  role: string;
  token: string;
};

const CACHE_TTL_MS = 30_000;
const CACHE_MAX = 500;
const cache = new Map<string, { user: VerifiedUser | null; expires: number }>();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getBearerFromRequest(request: Request | null | undefined): string | null {
  const header = request?.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

async function verifyWithBackend(token: string): Promise<VerifiedUser | null> {
  try {
    const res = await fetch(resolveApiUrl("/api/auth/me"), {
      method: "GET",
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const json = (await res.json().catch(() => null)) as
      | { success?: boolean; data?: any }
      | null;
    if (!json || json.success === false) return null;
    const raw = json.data?.user || json.data;
    const id = typeof raw?.id === "string" ? raw.id : null;
    if (!id) return null;
    return {
      id,
      email: typeof raw.email === "string" ? raw.email.toLowerCase() : "",
      role: typeof raw.role === "string" ? raw.role.toLowerCase() : "customer",
      token,
    };
  } catch {
    return null;
  }
}

/** Verify a bearer token, with a short in-memory cache. */
export async function verifyAccessToken(token: string | null): Promise<VerifiedUser | null> {
  if (!token) return null;
  const now = Date.now();
  const hit = cache.get(token);
  if (hit && hit.expires > now) return hit.user;

  const user = await verifyWithBackend(token);
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  // Cache negatives briefly too, so a bad token cannot hammer the backend.
  cache.set(token, { user, expires: now + (user ? CACHE_TTL_MS : 5_000) });
  return user;
}

/** Resolve the verified caller of the current server-function request, or null. */
export async function getVerifiedUser(): Promise<VerifiedUser | null> {
  const { getRequest } = await import("@tanstack/react-start/server");
  let request: Request | null = null;
  try {
    request = getRequest();
  } catch {
    request = null;
  }
  return verifyAccessToken(getBearerFromRequest(request));
}

export function isUuid(value: string): boolean {
  return UUID_REGEX.test(value);
}
