/**
 * Canonical HTTP API Client Infrastructure
 * (Shafsky Aviation Architecture - Phase 1 Foundation)
 */

export interface ApiErrorPayload {
  success: false;
  error: string;
  code?: number;
  details?: unknown;
}

export interface ApiSuccessPayload<T> {
  success: true;
  data: T;
  message?: string;
}

export type ApiResponse<T> = ApiSuccessPayload<T> | ApiErrorPayload;

const getBaseUrl = (): string => {
  if (typeof import.meta !== "undefined" && (import.meta as any).env) {
    const envUrl = (import.meta as any).env.VITE_BACKEND_API_URL || (import.meta as any).env.VITE_FASTAPI_URL;
    if (envUrl) return envUrl;
  }
  if (typeof process !== "undefined" && process.env) {
    const envUrl = process.env.VITE_BACKEND_API_URL || process.env.BACKEND_API_URL || process.env.VITE_FASTAPI_URL;
    if (envUrl) return envUrl;
  }
  return process.env.VITE_BACKEND_API_URL || "http://127.0.0.1:8003";
};

export const API_BASE_URL = getBaseUrl();

/**
 * Universal Fetch Client with centralized timeout, headers, and error normalization.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { timeoutMs?: number; token?: string } = {}
): Promise<ApiResponse<T>> {
  const { timeoutMs = 15000, token, headers = {}, ...fetchOptions } = options;
  const primaryBase = getBaseUrl().replace(/\/+$/, "");
  const relPath = path.startsWith("/") ? path : `/${path}`;
  const url = path.startsWith("http") ? path : `${primaryBase}${relPath}`;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(headers as Record<string, string>),
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: defaultHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const isJson = response.headers.get("content-type")?.includes("application/json");
    const resData = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMsg =
        typeof resData === "object" && resData !== null
          ? resData.error || resData.detail || resData.message || response.statusText
          : resData || `HTTP ${response.status} Error`;

      return {
        success: false,
        error: String(errorMsg),
        code: response.status,
        details: resData,
      };
    }

    if (typeof resData === "object" && resData !== null && "success" in resData) {
      return resData as ApiResponse<T>;
    }

    return {
      success: true,
      data: resData as T,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      return {
        success: false,
        error: `Request timed out after ${timeoutMs / 1000}s. Please check your connection.`,
        code: 408,
      };
    }
    return {
      success: false,
      error: err.message || "Network request failed. Please check backend connectivity.",
      code: 500,
    };
  }
}
