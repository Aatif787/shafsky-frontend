/**
 * Server-Side FastAPI Client for TanStack Server Functions
 *
 * This module is used by createServerFn handlers to call FastAPI endpoints
 * instead of using supabaseAdmin directly. It runs server-side only and
 * forwards the Supabase JWT from the incoming request to FastAPI.
 */

const getBackendUrl = (): string => {
  return process.env.VITE_BACKEND_API_URL || "http://127.0.0.1:8003";
};

export interface FastApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

async function serverFetch(
  path: string,
  init: RequestInit
): Promise<Response> {
  const primaryBase = getBackendUrl().replace(/\/+$/, "");
  const relPath = path.startsWith("/") ? path : `/${path}`;
  const primaryUrl = path.startsWith("http") ? path : `${primaryBase}${relPath}`;
  return fetch(primaryUrl, init);
}

/**
 * Make a GET request to the FastAPI backend.
 */
export async function apiGet<T = any>(
  path: string,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await serverFetch(path, { method: "GET", headers });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`FastAPI ${res.status}: ${body}`);
  }

  const json = (await res.json()) as FastApiResponse<T>;
  if (!json.success && json.error) {
    throw new Error(json.error);
  }
  return json.data as T;
}

/**
 * Make a POST request to the FastAPI backend.
 */
export async function apiPost<T = any>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await serverFetch(path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FastAPI ${res.status}: ${text}`);
  }

  const json = (await res.json()) as FastApiResponse<T>;
  if (!json.success && json.error) {
    throw new Error(json.error);
  }
  return json.data as T;
}

/**
 * Make a PATCH request to the FastAPI backend.
 */
export async function apiPatch<T = any>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await serverFetch(path, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FastAPI ${res.status}: ${text}`);
  }

  const json = (await res.json()) as FastApiResponse<T>;
  if (!json.success && json.error) {
    throw new Error(json.error);
  }
  return json.data as T;
}

/**
 * Make a DELETE request to the FastAPI backend.
 */
export async function apiDelete<T = any>(
  path: string,
  body?: unknown,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await serverFetch(path, {
    method: "DELETE",
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`FastAPI ${res.status}: ${text}`);
  }

  const json = (await res.json()) as FastApiResponse<T>;
  if (!json.success && json.error) {
    throw new Error(json.error);
  }
  return json.data as T;
}

/**
 * Extract the Supabase JWT from the cookie header of the current request.
 * Used by server functions to forward the token to FastAPI.
 */
export function getTokenFromRequest(): string | undefined {
  try {
    // Dynamic import to avoid issues in non-server contexts
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getRequest } = require("@tanstack/react-start/server");
    const request = getRequest();
    if (!request) return undefined;

    // Try Authorization header first (API calls from client)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.split(" ")[1];
    }

    // Try to get the Supabase access token from cookies
    const cookies = request.headers.get("cookie") || "";
    const match = cookies.match(/sb-[^-]+-auth-token=([^;]+)/);
    if (match?.[1]) {
      try {
        const decoded = decodeURIComponent(match[1]);
        const parsed = JSON.parse(decoded);
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
        if (parsed.access_token) return parsed.access_token;
      } catch {
        return match[1];
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
}
