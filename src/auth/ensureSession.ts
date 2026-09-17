/**
 * Single-flight session restore.
 *
 * The access token lives only in memory, so on a hard reload it is gone until
 * POST /api/auth/refresh (HttpOnly cookie) returns a new one. Route loaders and
 * server-function middleware may run before AuthProvider mounts, so everyone
 * that needs a token goes through `ensureSession()` — one refresh at a time,
 * never two concurrent refreshes (refresh tokens may rotate).
 */

import { apiAuthRefresh, type AuthResponseData } from "./authClient";
import { getAccessToken, setAccessToken, clearAccessToken } from "./tokenStore";

/** Non-authoritative hint that a refresh cookie probably exists. Never trusted server-side. */
export const SESSION_HINT_COOKIE = "shafsky_session";
const LEGACY_HINT_COOKIES = ["shafsky_user_id", "shafsky_auth"];

let inflight: Promise<AuthResponseData | null> | null = null;
let lastSession: AuthResponseData | null = null;

export function hasSessionHint(): boolean {
  if (typeof document === "undefined") return false;
  const cookie = document.cookie || "";
  return (
    cookie.includes(`${SESSION_HINT_COOKIE}=`) ||
    LEGACY_HINT_COOKIES.some((name) => cookie.includes(`${name}=`))
  );
}

export function setSessionHint(present: boolean): void {
  if (typeof document === "undefined") return;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  if (present) {
    document.cookie = `${SESSION_HINT_COOKIE}=1; path=/; max-age=31536000; SameSite=Lax${secure}`;
  } else {
    document.cookie = `${SESSION_HINT_COOKIE}=; path=/; max-age=0; SameSite=Lax${secure}`;
  }
  // Always clear legacy identity cookies; they must never be relied on again.
  for (const name of LEGACY_HINT_COOKIES) {
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${secure}`;
  }
}

export function getLastSession(): AuthResponseData | null {
  return lastSession;
}

export function rememberSession(data: AuthResponseData | null): void {
  lastSession = data;
}

/**
 * Returns the current session, refreshing once if needed. Resolves to null when
 * there is no session hint or the refresh fails.
 */
export function ensureSession(): Promise<AuthResponseData | null> {
  if (getAccessToken() && lastSession) return Promise.resolve(lastSession);
  if (typeof document === "undefined") return Promise.resolve(null);
  if (!hasSessionHint()) return Promise.resolve(null);

  if (!inflight) {
    inflight = apiAuthRefresh()
      .then(({ data, error }) => {
        const token = data?.accessToken || data?.access_token;
        if (error || !token || !data?.user) {
          clearAccessToken();
          lastSession = null;
          setSessionHint(false);
          return null;
        }
        setAccessToken(token);
        lastSession = data;
        setSessionHint(true);
        return data;
      })
      .catch(() => {
        clearAccessToken();
        lastSession = null;
        return null;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

export async function ensureAccessToken(): Promise<string | null> {
  const existing = getAccessToken();
  if (existing) return existing;
  const session = await ensureSession();
  return session ? getAccessToken() : null;
}
