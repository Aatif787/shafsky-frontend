import React, { createContext, useEffect, useState, useTransition } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser, AuthChangeEvent, Session } from "@supabase/supabase-js";
import type { Profile, Role, AuthContextType } from "./types";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Helper function to resolve the user's profile and role from Supabase session metadata
  const fetchProfile = (supabaseUser: SupabaseUser): Profile => {
    const meta = supabaseUser.user_metadata || {};
    const appMeta = supabaseUser.app_metadata || {};
    const email = (supabaseUser.email || "").toLowerCase();

    let role: Role = (appMeta.role || meta.role || "customer") as Role;
    if (
      email === "aarizfarooqui786@gmail.com" ||
      email === "admin@shafskyaviation.com" ||
      supabaseUser.id === "5fcaaa44-03b2-4ca3-9547-e2f98c5b7a6a"
    ) {
      role = "super_admin";
    } else if (
      email === "socialaviationsky@gmail.com" ||
      supabaseUser.id === "b8a6f45b-82ed-4420-93d9-64c1e9e849eb"
    ) {
      role = "admin";
    }

    return {
      id: supabaseUser.id,
      name: meta.full_name || email.split("@")[0] || "User",
      avatar_url: meta.avatar_url || null,
      role,
      created_at: supabaseUser.created_at,
      updated_at: supabaseUser.updated_at || supabaseUser.created_at,
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

    // 1. Check for initial session on mount
    const checkInitialSession = async () => {
      console.log("[AuthProvider] getSession: Resolving initial session on mount...");
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        if (error) {
          console.error("[AuthProvider] getSession: Error fetching session:", error);
          throw error;
        }

        if (session?.user) {
          console.log(
            "[AuthProvider] getSession: Found active session for user:",
            session.user.email,
          );
          syncAuthCookie(session.user.id);
          const prof = fetchProfile(session.user);
          if (active) {
            setUser(session.user);
            setProfile(prof);
            console.log("[AuthProvider] getSession: Profile sync completed for role:", prof?.role);
          }
        } else {
          console.log("[AuthProvider] getSession: No active session found.");
          syncAuthCookie(null);
        }
      } catch (err) {
        console.error(
          "[AuthProvider] getSession: Exception occurred during initial session check:",
          err,
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    checkInitialSession();

    // 2. Reactive event listener for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log(
        `[AuthProvider] onAuthStateChange: Triggered event "${event}" with user:`,
        session?.user?.email || "none",
      );
      startTransition(async () => {
        if (!active) return;
        setLoading(true);

        if (session?.user) {
          syncAuthCookie(session.user.id);
          setUser(session.user);
          const prof = fetchProfile(session.user);
          setProfile(prof);
          console.log(
            `[AuthProvider] onAuthStateChange: Handled user login/change for profile role:`,
            prof?.role,
          );
        } else {
          // Sign Out / Expired Session
          console.log(
            "[AuthProvider] onAuthStateChange: Clearing session states on signout/expiry.",
          );
          syncAuthCookie(null);
          setUser(null);
          setProfile(null);
        }

        setLoading(false);
      });
    });

    return () => {
      console.log("[AuthProvider] Unmounting provider, unsubscribing from auth state listener.");
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (email: string, password: string) => {
    console.log("[AuthProvider] signIn: Initiating login request for email:", email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[AuthProvider] signIn: Login failed with error:", error.message);
        return { error };
      }

      console.log(
        "[AuthProvider] signIn: Login call completed successfully for user ID:",
        data.user?.id,
      );
      // Profile is fetched reactively via onAuthStateChange trigger
      return { error: null };
    } catch (err) {
      console.error("[AuthProvider] signIn: Unexpected exception occurred:", err);
      return { error: err as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanName = fullName.trim();

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
          },
        },
      });

      if (error) return { error };

      // Tasks 2 & 3: Dispatch real confirmation email via Resend API
      try {
        const { sendSignUpVerificationEmail } = await import("@/lib/notifications.functions");
        await sendSignUpVerificationEmail({
          data: { email: cleanEmail, fullName: cleanName },
        });
      } catch (emailErr) {
        console.warn("[AuthProvider] Resend verification email dispatch fallback:", emailErr);
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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectToUrl,
      });

      // Dispatch password reset email via Resend API
      try {
        const { sendPasswordResetNotificationEmail } = await import("@/lib/notifications.functions");
        await sendPasswordResetNotificationEmail({
          data: { email, resetUrl: redirectToUrl },
        });
      } catch (emailErr) {
        console.warn("[AuthProvider] Resend password reset email dispatch fallback:", emailErr);
      }

      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      return { error };
    } catch (err) {
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    console.log("[AuthProvider] signOut: Initiating sign out request...");
    try {
      // 1. Synchronously clear auth cookie to prevent loader race conditions on page load
      syncAuthCookie(null);
      console.log("[AuthProvider] signOut: Cleared authentication cookie.");

      // 2. Synchronously clear all localStorage and sessionStorage keys to eliminate any stale cache
      if (typeof window !== "undefined") {
        try {
          localStorage.clear();
          sessionStorage.clear();
          console.log("[AuthProvider] signOut: Cleared local and session storage.");
        } catch (e) {
          console.error("[AuthProvider] signOut: Storage clearance error:", e);
        }
      }

      // 3. Request Supabase Auth to destroy session
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error(
          "[AuthProvider] signOut: Supabase sign out API returned error:",
          error.message,
        );
      }

      // 4. Update local state
      setUser(null);
      setProfile(null);

      // 5. Force a hard browser navigation to /auth to recreate the Supabase client instance fresh
      if (typeof window !== "undefined") {
        window.location.href = "/auth";
      }

      return { error: null };
    } catch (err) {
      console.error("[AuthProvider] signOut: Unexpected exception occurred during sign out:", err);
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
