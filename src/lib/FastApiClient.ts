/**
 * FastAPI Client for TanStack Server Functions & Client Requests
 *
 * Used by createServerFn handlers and client components to call FastAPI endpoints.
 * Automatically forwards the in-memory Access Token and includes credentials
 * for HttpOnly refresh cookie handling.
 */

import { getAccessToken } from "@/auth/tokenStore";

const getBackendUrl = (): string => {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_BACKEND_API_URL) {
    return import.meta.env.VITE_BACKEND_API_URL;
  }
  if (typeof process !== "undefined" && process.env && (process.env.VITE_BACKEND_API_URL || process.env.BACKEND_API_URL)) {
    return process.env.VITE_BACKEND_API_URL || process.env.BACKEND_API_URL!;
  }
  return "http://127.0.0.1:8003";
};

export interface FastApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

async function fetchBackend(
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
export async function apiGet<T = any>(path: string, token?: string): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const bearer = token || getAccessToken();
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  const res = await fetchBackend(path, { method: "GET", headers, credentials: "include" });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`FastAPI ${res.status}: ${body}`);
  }

  const json = (await res.json()) as FastApiResponse<T>;
  if (!json.success && json.error) {
    throw new Error(json.error);
  }
  return (json.data ?? json) as T;
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
  const bearer = token || getAccessToken();
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  const res = await fetchBackend(path, {
    method: "POST",
    headers,
    credentials: "include",
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
  return (json.data ?? json) as T;
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
  const bearer = token || getAccessToken();
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  const res = await fetchBackend(path, {
    method: "PATCH",
    headers,
    credentials: "include",
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
  return (json.data ?? json) as T;
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
  const bearer = token || getAccessToken();
  if (bearer) headers.Authorization = `Bearer ${bearer}`;

  const res = await fetchBackend(path, {
    method: "DELETE",
    headers,
    credentials: "include",
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
  return (json.data ?? json) as T;
}

/**
 * Extract the Bearer JWT from the request header context.
 */
export function getTokenFromRequest(): string | undefined {
  try {
    // Dynamic import to avoid issues in non-server contexts
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getRequest } = require("@tanstack/react-start/server");
    const request = getRequest();
    if (!request) return getAccessToken() || undefined;

    // Try Authorization header first (API calls from client)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      return authHeader.split(" ")[1];
    }

    // Fallback to in-memory access token
    return getAccessToken() || undefined;
  } catch {
    return getAccessToken() || undefined;
  }
}
