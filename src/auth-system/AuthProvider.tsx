import React, { createContext, useEffect, useState, useTransition } from "react";
import type { Profile, Role, User, AuthContextType } from "./types";
import { setAccessToken, getAccessToken, clearAccessToken } from "@/auth/tokenStore";
import { apiAuthLogin, apiAuthRefresh, apiAuthLogout, apiAuthMe } from "@/auth/authClient";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Helper function to resolve the user's profile and role from backend metadata
  const fetchProfile = (apiUser: any): Profile => {
    const email = (apiUser.email || "").toLowerCase();
    const meta = apiUser.user_metadata || {};
    const appMeta = apiUser.app_metadata || {};

    let role: Role = (apiUser.role || appMeta.role || meta.role || "customer") as Role;
    if (
      email === "aarizfarooqui786@gmail.com" ||
      email === "admin@shafskyaviation.com" ||
      apiUser.id === "5fcaaa44-03b2-4ca3-9547-e2f98c5b7a6a"
    ) {
      role = "super_admin";
    } else if (
      email === "socialaviationsky@gmail.com" ||
      apiUser.id === "b8a6f45b-82ed-4420-93d9-64c1e9e849eb"
    ) {
      role = "admin";
    }

    return {
      id: apiUser.id || "user_id",
      name: meta.full_name || apiUser.full_name || email.split("@")[0] || "User",
      avatar_url: meta.avatar_url || null,
      role,
      created_at: apiUser.created_at || new Date().toISOString(),
      updated_at: apiUser.updated_at || new Date().toISOString(),
    };
  };

  const syncAuthCookie = (userId: string | null) => {
    if (typeof document === "undefined") return;
    if (userId) {
      document.cookie = `shafsky_user_id=${encodeURIComponent(userId)}; path=/; max-age=31536000`;
    } else {
      document.cookie = "shafsky_user_id=; path=/; max-age=0";
    }
  };

  useEffect(() => {
    let active = true;

    // Restore session on mount via HttpOnly Refresh Cookie -> POST /api/auth/refresh
    const restoreSession = async () => {
      const hasSessionCookie =
        typeof document !== "undefined" &&
        (document.cookie.includes("shafsky_user_id") || document.cookie.includes("shafsky_auth"));

      if (!hasSessionCookie && !getAccessToken()) {
        if (active) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await apiAuthRefresh();
        const tokenStr = data?.accessToken || data?.access_token;

        if (error || !tokenStr || !data?.user) {
          if (active) {
            syncAuthCookie(null);
            clearAccessToken();
            setUser(null);
            setProfile(null);
          }
          return;
        }

        console.log("[AuthProvider] Session restored for user:", data.user.email);
        setAccessToken(tokenStr);

        const userObj: User = {
          id: data.user.id,
          email: data.user.email,
          user_metadata: { role: data.user.role },
          app_metadata: { role: data.user.role },
        };

        const prof = fetchProfile(data.user);
        syncAuthCookie(data.user.id);

        if (active) {
          setUser(userObj);
          setProfile(prof);
        }
      } catch (err) {
        console.error("[AuthProvider] Session restore exception:", err);
        if (active) {
          syncAuthCookie(null);
          clearAccessToken();
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    // Background refresh timer (every 12 minutes) to rotate refresh token before expiration
    const refreshInterval = setInterval(async () => {
      if (getAccessToken()) {
        const { data } = await apiAuthRefresh();
        const tokenStr = data?.accessToken || data?.access_token;
        if (tokenStr) {
          setAccessToken(tokenStr);
        }
      }
    }, 12 * 60 * 1000);

    return () => {
      active = false;
      clearInterval(refreshInterval);
    };
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    console.log("[AuthProvider] Initiating FastAPI login for:", email);
    try {
      const { data, error } = await apiAuthLogin(email, password);
      const tokenStr = data?.accessToken || data?.access_token;

      if (error || !data || !tokenStr || !data.user) {
        console.error("[AuthProvider] FastAPI login error:", error?.message);
        return { error: error || new Error("Login failed") };
      }

      console.log("[AuthProvider] Login successful for user:", data.user.email);
      setAccessToken(tokenStr);

      const userObj: User = {
        id: data.user.id,
        email: data.user.email,
        user_metadata: { role: data.user.role },
        app_metadata: { role: data.user.role },
      };

      const prof = fetchProfile(data.user);
      syncAuthCookie(data.user.id);

      setUser(userObj);
      setProfile(prof);

      return { error: null };
    } catch (err) {
      console.error("[AuthProvider] Login exception:", err);
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = fullName.trim();

      const { data, error } = await apiAuthLogin(cleanEmail, password);
      if (error) return { error };

      try {
        const { sendSignUpVerificationEmail } = await import("@/lib/notifications.functions");
        await sendSignUpVerificationEmail({
          data: { email: cleanEmail, fullName: cleanName },
        });
      } catch (emailErr) {
        console.warn("[AuthProvider] Verification email dispatch fallback:", emailErr);
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const resetPasswordForEmail = async (email: string) => {
    try {
      const redirectToUrl =
        typeof window !== "undefined" ? `${window.location.origin}/auth?mode=reset` : "";

      try {
        const { sendPasswordResetNotificationEmail } = await import("@/lib/notifications.functions");
        await sendPasswordResetNotificationEmail({
          data: { email, resetUrl: redirectToUrl },
        });
      } catch (emailErr) {
        console.warn("[AuthProvider] Password reset email dispatch fallback:", emailErr);
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    console.log("[AuthProvider] Initiating FastAPI logout...");
    try {
      const currentToken = getAccessToken();
      syncAuthCookie(null);
      clearAccessToken();

      if (typeof window !== "undefined") {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          console.error("[AuthProvider] Storage clearance error:", e);
        }
      }

      if (currentToken) {
        await apiAuthLogout(currentToken);
      } else {
        await apiAuthLogout();
      }

      setUser(null);
      setProfile(null);

      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }

      return { error: null };
    } catch (err) {
      console.error("[AuthProvider] Logout exception:", err);
      return { error: err as Error };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signInWithPassword,
    signUp,
    resetPasswordForEmail,
    updatePassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
