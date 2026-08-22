/**
 * Canonical Backend URL and API Resolution Configuration
 * 
 * Provides unified, safe, and normalized URL resolution for all client-side
 * and server-side API requests across the Shafsky Aviation frontend platform.
 */

const DEFAULT_DEV_BACKEND_URL = "http://127.0.0.1:8003";

/**
 * Normalizes an API base URL string safely:
 * - Trims whitespace
 * - Strips accidental variable assignment prefixes (e.g. "VITE_BACKEND_API_URL=")
 * - Strips wrapping quotes
 * - Removes trailing slashes
 * - Strips accidental trailing "/api" (to prevent "/api/api" duplication)
 * - Returns a fallback if empty or invalid
 */
export function normalizeBackendUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    return DEFAULT_DEV_BACKEND_URL;
  }

  let cleaned = rawUrl.trim();

  // Strip accidental "VITE_BACKEND_API_URL=" or "BACKEND_API_URL=" prefix if injected
  cleaned = cleaned.replace(/^(VITE_BACKEND_API_URL|BACKEND_API_URL|VITE_FASTAPI_URL)\s*=\s*/i, "");

  // Strip wrapping single or double quotes
  cleaned = cleaned.replace(/^["']|["']$/g, "").trim();

  // Strip trailing slashes
  cleaned = cleaned.replace(/\/+$/, "");

  // Strip trailing "/api" to prevent duplication when endpoints append "/api/..."
  cleaned = cleaned.replace(/\/api$/i, "");

  if (!cleaned || cleaned === "undefined" || cleaned === "null") {
    return DEFAULT_DEV_BACKEND_URL;
  }

  return cleaned;
}

/**
 * Retrieves the canonical backend base URL.
 * Automatically checks:
 * 1. import.meta.env.VITE_BACKEND_API_URL (Browser / Client bundle)
 * 2. process.env.VITE_BACKEND_API_URL / process.env.BACKEND_API_URL (SSR / Node server)
 * 3. Default development fallback (http://127.0.0.1:8003)
 */
export function getBackendBaseUrl(): string {
  let envUrl: string | undefined;

  if (typeof import.meta !== "undefined" && import.meta.env) {
    envUrl = import.meta.env.VITE_BACKEND_API_URL || import.meta.env.VITE_FASTAPI_URL;
  }

  if (!envUrl && typeof process !== "undefined" && process.env) {
    envUrl = process.env.VITE_BACKEND_API_URL || process.env.BACKEND_API_URL || process.env.VITE_FASTAPI_URL;
  }

  return normalizeBackendUrl(envUrl);
}

/**
 * Resolves a full backend URL for any API endpoint path.
 * 
 * Guarantees:
 * - Absolute URLs (http:// or https://) are returned unchanged.
 * - Relative paths are prefixed with the normalized backend base URL.
 * - Never produces "/VITE_BACKEND_API_URL=...", "/undefined/...", or double "/api/api/...".
 */
export function resolveApiUrl(path: string): string {
  if (!path || typeof path !== "string") {
    return getBackendBaseUrl();
  }

  const trimmed = path.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  const base = getBackendBaseUrl();
  const relPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${base}${relPath}`;
}
