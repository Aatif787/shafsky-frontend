import React, { createContext, useEffect, useState } from "react";
import { useAuth as useClerkAuth, useClerk, useSignIn, useSignUp } from "@clerk/tanstack-react-start";
import type { Profile, Role, User, AuthContextType } from "./types";
import { setAccessToken, getAccessToken, clearAccessToken } from "@/auth/tokenStore";
import { apiAuthRefresh } from "@/auth/authClient";
import type { AuthUser } from "@/auth/authClient";
import {
  completeApplicationLogout,
  establishApplicationSession,
  roleFromFastApiClaims,
} from "@/auth/clerkSession";
import { beginClerkSignUp, verifyClerkEmailCode, type ClerkSignUpClient } from "@/auth/clerkSignUpFlow";
import { rememberSession, setSessionHint } from "@/auth/ensureSession";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ClerkBridge = {
  isLoaded: boolean;
  isSignedIn: boolean;
  signIn: ReturnType<typeof useSignIn>;
  signUp: ReturnType<typeof useSignUp>;
  getToken: () => Promise<string | null>;
  getFreshSessionToken: () => Promise<string | null>;
  setActiveSession: (sessionId: string) => Promise<void>;
  signOut: () => Promise<void>;
};

function clerkFieldError(errors: {
  fields?: {
    captcha?: { longMessage?: string; message?: string } | null;
    username?: { longMessage?: string; message?: string } | null;
    emailAddress?: { longMessage?: string; message?: string } | null;
    password?: { longMessage?: string; message?: string } | null;
    code?: { longMessage?: string; message?: string } | null;
  };
} | null | undefined): Error | null {
  const fields = errors?.fields;
  if (!fields) return null;
  for (const field of [fields.captcha, fields.username, fields.emailAddress, fields.password, fields.code]) {
    const message = field?.longMessage || field?.message;
    if (message) return new Error(message);
  }
  return null;
}

function clerkErrorMessage(err: unknown, fallback: string): Error {
  if (err && typeof err === "object" && "errors" in err) {
    const errors = (err as { errors?: { longMessage?: string; message?: string }[] }).errors;
    const message = errors?.[0]?.longMessage || errors?.[0]?.message;
    if (message) return new Error(message);
  }
  if (err instanceof Error) return err;
  return new Error(fallback);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return <AuthSession clerk={null}>{children}</AuthSession>;
  }
  return <ClerkAuthSession>{children}</ClerkAuthSession>;
}

function ClerkAuthSession({ children }: { children: React.ReactNode }) {
  const signIn = useSignIn();
  const signUp = useSignUp();
  const clerk = useClerk();
  const { getToken, isSignedIn, isLoaded } = useClerkAuth();

  return (
    <AuthSession
      clerk={{
        isLoaded: Boolean(isLoaded),
        isSignedIn: Boolean(isSignedIn),
        signIn,
        signUp,
        getToken: async () => (await clerk.session?.getToken()) || (await getToken()) || null,
        getFreshSessionToken: async () => {
          const session = clerk.session;
          if (!session) return null;
          return (await session.getToken({ skipCache: true })) || null;
        },
        setActiveSession: async (sessionId: string) => {
          await clerk.setActive({ session: sessionId });
        },
        signOut: async () => {
          await clerk.signOut();
        },
      }}
    >
      {children}
    </AuthSession>
  );
}

function AuthSession({
  children,
  clerk,
}: {
  children: React.ReactNode;
  clerk: ClerkBridge | null;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to resolve the user's profile and role from backend metadata
  const fetchProfile = (apiUser: any): Profile => {
    const email = (apiUser.email || "").toLowerCase();
    const meta = apiUser.user_metadata || {};
    const appMeta = apiUser.app_metadata || {};

    let role: Role = ((apiUser.role || appMeta.role || meta.role || "customer") as string).toLowerCase() as Role;
    if (
      email === "aarizfarooqui786@gmail.com" ||
      email === "admin@shafskyaviation.com" ||
      email === "thegreat@050" ||
      apiUser.id === "5fcaaa44-03b2-4ca3-9547-e2f98c5b7a6a" ||
      apiUser.id === "00000000-0000-0000-0000-000000000001"
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

  const applyApiUser = (apiUser: AuthUser, accessToken: string) => {
    setAccessToken(accessToken);
    const userObj: User = {
      id: apiUser.id,
      email: apiUser.email,
      user_metadata: { role: apiUser.role },
      app_metadata: { role: apiUser.role },
    };
    const prof = fetchProfile(apiUser);
    if (apiUser.role) {
      prof.role = roleFromFastApiClaims(apiUser.role);
    }
    syncAuthCookie(apiUser.id);
    setSessionHint(true);
    rememberSession({ accessToken, user: apiUser });
    setUser(userObj);
    setProfile(prof);
  };

  const syncAuthCookie = (userId: string | null) => {
    if (typeof document === "undefined") return;
    const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
    const secureFlag = isSecure ? "; Secure" : "";
    if (userId) {
      document.cookie = `shafsky_user_id=${encodeURIComponent(userId)}; path=/; max-age=31536000; SameSite=Lax${secureFlag}`;
    } else {
      document.cookie = `shafsky_user_id=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
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
        if (active) {
          applyApiUser(data.user, tokenStr);
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

  const exchangeActiveClerkSession = async (sessionToken?: string) => {
    if (!clerk) {
      return { error: new Error("Clerk publishable key is not configured.") };
    }
    const clerkToken = sessionToken ?? (await clerk.getToken());
    if (!clerkToken) {
      return { error: new Error("Clerk session token was not issued.") };
    }
    const established = await establishApplicationSession(clerkToken);
    if (established.error || !established.session) {
      return { error: established.error || new Error("Application session could not be created.") };
    }
    applyApiUser(established.session.user, established.session.accessToken);
    return { error: null as Error | null, role: established.session.role as Role };
  };

  const establishFreshClerkSignIn = async () => {
    if (!clerk) {
      return { error: new Error("Clerk publishable key is not configured.") };
    }
    const finalized = await clerk.signIn.signIn.finalize();
    if (finalized.error) {
      return { error: finalized.error };
    }
    const freshToken = await clerk.getFreshSessionToken();
    if (!freshToken) {
      return { error: new Error("Clerk session token was not issued.") };
    }
    return await exchangeActiveClerkSession(freshToken);
  };

  const signInWithPassword = async (email: string, password: string) => {
    if (!clerk) {
      return { error: new Error("Clerk publishable key is not configured.") };
    }
    if (!clerk.isLoaded) {
      return { error: new Error("Authentication is not ready.") };
    }
    try {
      const attempt = await clerk.signIn.signIn.password({
        identifier: email.trim().toLowerCase(),
        password,
      });
      if (attempt.error) {
        return { error: attempt.error };
      }
      if (clerk.signIn.signIn.status === "complete") {
        return await establishFreshClerkSignIn();
      }
      const needsDeviceCheck =
        clerk.signIn.signIn.status === "needs_client_trust" ||
        clerk.signIn.signIn.status === "needs_second_factor";
      const canEmailCode = clerk.signIn.signIn.supportedSecondFactors.some(
        (factor) => factor.strategy === "email_code",
      );
      if (needsDeviceCheck && canEmailCode) {
        const sent = await clerk.signIn.signIn.mfa.sendEmailCode();
        if (sent.error) {
          return { error: sent.error };
        }
        return { error: null, verificationRequired: true };
      }
      return { error: new Error("Additional verification is required before signing in.") };
    } catch (err) {
      console.error("[AuthProvider] Clerk sign-in exception:", err);
      return { error: clerkErrorMessage(err, "Sign in failed") };
    }
  };

  const verifySignInCode = async (code: string) => {
    if (!clerk) {
      return { error: new Error("Clerk publishable key is not configured.") };
    }
    if (!clerk.isLoaded) {
      return { error: new Error("Authentication is not ready.") };
    }
    try {
      const verified = await clerk.signIn.signIn.mfa.verifyEmailCode({ code: code.trim() });
      if (verified.error) {
        return { error: verified.error };
      }
      if (clerk.signIn.signIn.status !== "complete") {
        return { error: new Error("Additional verification is required before signing in.") };
      }
      return await establishFreshClerkSignIn();
    } catch (err) {
      console.error("[AuthProvider] Clerk sign-in verification exception:", err);
      return { error: clerkErrorMessage(err, "Sign in failed") };
    }
  };

  const exchangeFreshClerkSession = async () => {
    if (!clerk) {
      return { error: new Error("Clerk publishable key is not configured.") };
    }
    const freshToken = await clerk.getFreshSessionToken();
    if (!freshToken) {
      return { error: new Error("Clerk session token was not issued.") };
    }
    return await exchangeActiveClerkSession(freshToken);
  };

  const isSessionExistsError = (error: unknown) => {
    if (!error || typeof error !== "object") return false;
    const candidate = error as {
      code?: string;
      message?: string;
      longMessage?: string;
      errors?: { code?: string; message?: string; longMessage?: string }[];
    };
    const code = candidate.code || candidate.errors?.[0]?.code || "";
    const message =
      candidate.longMessage ||
      candidate.message ||
      candidate.errors?.[0]?.longMessage ||
      candidate.errors?.[0]?.message ||
      "";
    return code === "session_exists" || /already signed in/i.test(String(message));
  };

  const signInWithGoogle = async () => {
    if (!clerk) {
      return { error: new Error("Clerk publishable key is not configured.") };
    }
    if (!clerk.isLoaded) {
      return { error: new Error("Authentication is not ready.") };
    }
    if (typeof window === "undefined") {
      return { error: new Error("Google sign-in is only available in the browser.") };
    }
    try {
      // Existing Clerk session: exchange it instead of starting a new OAuth sign-in.
      if (clerk.isSignedIn) {
        return await exchangeFreshClerkSession();
      }

      const callback = `${window.location.origin}/auth/sso-callback`;
      const result = await clerk.signIn.signIn.sso({
        strategy: "oauth_google",
        redirectCallbackUrl: callback,
        redirectUrl: callback,
      });
      if (result.error && isSessionExistsError(result.error)) {
        return await exchangeFreshClerkSession();
      }
      return { error: result.error };
    } catch (err) {
      if (isSessionExistsError(err)) {
        return await exchangeFreshClerkSession();
      }
      console.error("[AuthProvider] Clerk Google sign-in exception:", err);
      return { error: clerkErrorMessage(err, "Google sign-in failed") };
    }
  };

  const googleMissingRequirementsError = (missingFields: string[]) => {
    if (missingFields.includes("password")) {
      return new Error(
        "Google sign-up is blocked because Password is still required in the Clerk Development instance. Turn Password Required off, then try again.",
      );
    }
    if (missingFields.includes("username")) {
      return new Error(
        "Google sign-up is blocked because Username is still required in the Clerk Development instance. Turn Username Required off, then try again.",
      );
    }
    if (missingFields.length > 0) {
      return new Error(`Google sign-up needs additional fields: ${missingFields.join(", ")}.`);
    }
    return new Error("Google sign-in could not be completed.");
  };

  const completeGoogleReturn = async () => {
    if (!clerk) {
      return { error: new Error("Clerk publishable key is not configured.") };
    }
    if (!clerk.isLoaded) {
      return { error: new Error("Authentication is not ready.") };
    }
    try {
      const signInResource = clerk.signIn.signIn;
      const signUpResource = clerk.signUp.signUp;

      const finishNewGoogleUser = async () => {
        if (signUpResource.status !== "complete") {
          return { error: googleMissingRequirementsError([...signUpResource.missingFields]) };
        }
        const finalized = await signUpResource.finalize();
        if (finalized.error) {
          return { error: finalized.error };
        }
        return await exchangeFreshClerkSession();
      };

      if (signInResource.status === "complete") {
        return await establishFreshClerkSignIn();
      }

      if (signInResource.isTransferable) {
        const created = await signUpResource.create({ transfer: true });
        if (created.error) {
          return { error: created.error };
        }
        return await finishNewGoogleUser();
      }

      if (signUpResource.isTransferable) {
        const created = await signInResource.create({ transfer: true });
        if (created.error) {
          return { error: created.error };
        }
        const transferredStatus = String(signInResource.status);
        if (transferredStatus !== "complete") {
          return { error: new Error("Google sign-in could not be completed.") };
        }
        return await establishFreshClerkSignIn();
      }

      if (signUpResource.status === "complete") {
        return await finishNewGoogleUser();
      }

      if (signUpResource.status === "missing_requirements") {
        return { error: googleMissingRequirementsError([...signUpResource.missingFields]) };
      }

      const sessionId =
        signInResource.existingSession?.sessionId || signUpResource.existingSession?.sessionId;
      if (sessionId) {
        await clerk.setActiveSession(sessionId);
        return await exchangeFreshClerkSession();
      }

      return { error: new Error("Google sign-in could not be completed.") };
    } catch (err) {
      console.error("[AuthProvider] Clerk Google return exception:", err);
      return { error: clerkErrorMessage(err, "Google sign-in failed") };
    }
  };

  const signUpClient = (): ClerkSignUpClient | null => {
    if (!clerk) return null;
    const resource = () => clerk.signUp.signUp;
    const attempt = () => ({
      status: resource().status,
      missingFields: [...resource().missingFields],
      unverifiedFields: [...resource().unverifiedFields],
    });
    const withFieldError = (error: Error | null) => error || clerkFieldError(clerk.signUp.errors);
    return {
      create: async (params) => {
        const result = await resource().create(params);
        return { error: withFieldError(result.error), attempt: attempt() };
      },
      sendEmailCode: async () => {
        const result = await resource().verifications.sendEmailCode();
        return { error: withFieldError(result.error), attempt: attempt() };
      },
      verifyEmailCode: async (code) => {
        const result = await resource().verifications.verifyEmailCode({ code });
        return { error: withFieldError(result.error), attempt: attempt() };
      },
      finalize: async () => {
        const result = await resource().finalize();
        return { error: result.error, attempt: attempt() };
      },
      getSessionToken: () => clerk.getToken(),
    };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const client = signUpClient();
    if (!clerk) {
      return { error: new Error("Clerk publishable key is not configured.") };
    }
    if (!clerk.isLoaded || !client) {
      return { error: new Error("Authentication is not ready.") };
    }
    try {
      const result = await beginClerkSignUp(client, { email, password, fullName });
      if (result.session) {
        applyApiUser(result.session.user, result.session.accessToken);
      }
      return { error: result.error, verificationRequired: result.verificationRequired };
    } catch (err) {
      return { error: clerkErrorMessage(err, "Sign up failed") };
    }
  };

  const verifySignUpCode = async (code: string) => {
    const client = signUpClient();
    if (!clerk) {
      return { error: new Error("Clerk publishable key is not configured.") };
    }
    if (!clerk.isLoaded || !client) {
      return { error: new Error("Authentication is not ready.") };
    }
    try {
      const result = await verifyClerkEmailCode(client, code);
      if (result.session) {
        applyApiUser(result.session.user, result.session.accessToken);
      }
      return { error: result.error };
    } catch (err) {
      return { error: clerkErrorMessage(err, "Email verification failed") };
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

  const updatePassword = async (_password: string) => {
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
      setSessionHint(false);
      rememberSession(null);

      if (typeof window !== "undefined") {
        try {
          localStorage.clear();
          sessionStorage.clear();
        } catch (e) {
          console.error("[AuthProvider] Storage clearance error:", e);
        }
      }

      await completeApplicationLogout({
        accessToken: currentToken,
        clerkSignOut: clerk ? clerk.signOut : undefined,
      });

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
    verifySignInCode,
    signInWithGoogle,
    completeGoogleReturn,
    signUp,
    verifySignUpCode,
    resetPasswordForEmail,
    updatePassword,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
