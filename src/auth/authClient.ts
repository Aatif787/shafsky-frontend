/**
 * FastAPI Authentication Client
 *
 * Interacts with FastAPI backend auth endpoints:
 * - POST /api/auth/login
 * - POST /api/auth/refresh
 * - POST /api/auth/logout
 * - GET  /api/auth/me
 *
 * All requests include `credentials: "include"` so HttpOnly refresh token
 * cookies are automatically sent & set by the browser.
 */

const getBackendUrl = (): string => {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_BACKEND_API_URL) {
    return import.meta.env.VITE_BACKEND_API_URL;
  }
  if (typeof process !== "undefined" && process.env && (process.env.VITE_BACKEND_API_URL || process.env.BACKEND_API_URL)) {
    return process.env.VITE_BACKEND_API_URL || process.env.BACKEND_API_URL!;
  }
  return "http://127.0.0.1:8003";
};

async function authFetch(
  path: string,
  init: RequestInit
): Promise<Response> {
  const primaryBase = getBackendUrl().replace(/\/+$/, "");
  const relPath = path.startsWith("/") ? path : `/${path}`;
  const primaryUrl = `${primaryBase}${relPath}`;
  return fetch(primaryUrl, init);
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  full_name?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponseData {
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  tokenType?: string;
  token_type?: string;
  user: AuthUser;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Login via FastAPI endpoint: POST /api/auth/login
 */
export async function apiAuthLogin(
  email: string,
  password: string,
): Promise<{ data?: AuthResponseData; error?: Error }> {
  try {
    const res = await authFetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    });

    if (!res.ok) {
      const text = await res.text();
      try {
        const errJson = JSON.parse(text);
        return {
          error: new Error(
            errJson.detail || errJson.error || `Login failed with status ${res.status}`,
          ),
        };
      } catch {
        return { error: new Error(`Login failed with status ${res.status}`) };
      }
    }

    const json = (await res.json()) as ApiResponse<AuthResponseData>;
    if (!json.success || !json.data) {
      return { error: new Error(json.error || "Login failed: Invalid server response") };
    }

    return { data: json.data };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Refresh Access Token via HttpOnly Cookie: POST /api/auth/refresh
 */
export async function apiAuthRefresh(): Promise<{ data?: AuthResponseData; error?: Error }> {
  try {
    const res = await authFetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Sends HttpOnly refreshToken cookie automatically
    });

    if (!res.ok) {
      return { error: new Error(`Session refresh failed (HTTP ${res.status})`) };
    }

    const json = (await res.json()) as ApiResponse<AuthResponseData>;
    if (!json.success || !json.data) {
      return { error: new Error(json.error || "Session refresh failed") };
    }

    return { data: json.data };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Logout & Revoke Session: POST /api/auth/logout
 */
export async function apiAuthLogout(token?: string): Promise<{ success: boolean; error?: Error }> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await authFetch("/api/auth/logout", {
      method: "POST",
      headers,
      credentials: "include",
    });

    if (!res.ok) {
      return { success: false, error: new Error(`Logout failed (HTTP ${res.status})`) };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err as Error };
  }
}

/**
 * Restore User Profile & Claims: GET /api/auth/me
 */
export async function apiAuthMe(
  token: string,
): Promise<{ user?: AuthUser; profile?: any; error?: Error }> {
  try {
    const res = await authFetch("/api/auth/me", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!res.ok) {
      return { error: new Error(`Failed to fetch profile (HTTP ${res.status})`) };
    }

    const json = (await res.json()) as ApiResponse<any>;
    if (!json.success || !json.data) {
      return { error: new Error(json.error || "Failed to fetch user profile") };
    }

    const userData = json.data.user || json.data;
    return { user: userData, profile: json.data.profile || userData };
  } catch (err) {
    return { error: err as Error };
  }
}

/**
 * Change Password Endpoint: POST /api/auth/change-password
 */
export async function apiAuthChangePassword(
  token: string,
  newPassword: string,
  currentPassword?: string,
): Promise<{ success: boolean; message?: string; error?: Error }> {
  try {
    const res = await authFetch("/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: new Error(text || `Failed with status ${res.status}`) };
    }

    const json = (await res.json()) as ApiResponse<any>;
    return { success: json.success, message: json.data?.message || "Password updated" };
  } catch (err) {
    return { success: false, error: err as Error };
  }
}
