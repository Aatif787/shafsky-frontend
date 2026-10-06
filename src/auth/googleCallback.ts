/**
 * Google OAuth return handling (/auth/sso-callback).
 *
 * Clerk stays the identity provider and FastAPI stays the application
 * authority: every success path ends in a Clerk session token being exchanged
 * through POST /api/auth/clerk-exchange (+ /api/auth/me) by the injected
 * `exchange*` callbacks. This module only decides WHICH path to take, so the
 * decision logic is idempotent and unit-testable without React or Clerk.
 *
 * Order matters:
 *  1. An application session already established in this page is reused.
 *  2. An already-active Clerk session is exchanged. It is never treated as a
 *     new Google sign-in, so a reload/re-entry cannot create a second Clerk
 *     user or surface a bogus "email already linked" conflict.
 *  3. Otherwise the pending Clerk sign-in / sign-up from the OAuth redirect is
 *     completed. Genuine Clerk errors are returned unchanged.
 * Google OAuth is never started from here.
 */

import type { Role } from "@/auth-system/types";

export interface GoogleCallbackResult {
  error: Error | null;
  role?: Role;
}

interface ExistingSessionRef {
  sessionId?: string | null;
}

interface TransferableResource {
  status: string;
  isTransferable: boolean;
  existingSession?: ExistingSessionRef | null;
  create: (params: { transfer: true }) => Promise<{ error: Error | null }>;
}

export interface GoogleCallbackDeps {
  isLoaded: boolean;
  isSignedIn: boolean;
  signIn: TransferableResource;
  signUp: TransferableResource & {
    missingFields: readonly string[];
    finalize: () => Promise<{ error: Error | null }>;
  };
  /** Role of an application session already established in this page, if any. */
  reuseApplicationSession: () => Role | null;
  /** Fresh Clerk token -> FastAPI exchange -> application session. */
  exchangeFreshClerkSession: () => Promise<GoogleCallbackResult>;
  /** Finalize the completed Clerk sign-in, then exchange. */
  finalizeSignInAndExchange: () => Promise<GoogleCallbackResult>;
  setActiveSession: (sessionId: string) => Promise<void>;
  missingRequirementsError: (missingFields: string[]) => Error;
  handleRedirectCallback?: () => Promise<unknown>;
}

export async function completeGoogleCallback(
  deps: GoogleCallbackDeps,
): Promise<GoogleCallbackResult> {
  if (!deps.isLoaded) {
    return { error: new Error("Authentication is not ready.") };
  }

  const reused = deps.reuseApplicationSession();
  if (reused) {
    return { error: null, role: reused };
  }

  if (deps.isSignedIn) {
    return await deps.exchangeFreshClerkSession();
  }

  if (deps.handleRedirectCallback) {
    const hasRedirectParams =
      typeof window !== "undefined" &&
      (window.location.search.includes("__clerk") ||
        window.location.search.includes("code=") ||
        window.location.search.includes("state="));
    if (hasRedirectParams) {
      try {
        await deps.handleRedirectCallback();
        return await deps.exchangeFreshClerkSession();
      } catch (err) {
        if (deps.isSignedIn) {
          return await deps.exchangeFreshClerkSession();
        }
        return {
          error:
            err instanceof Error ? err : new Error("Google authentication callback failed."),
        };
      }
    }
  }

  const signInResource = deps.signIn;
  const signUpResource = deps.signUp;

  const finishNewGoogleUser = async (): Promise<GoogleCallbackResult> => {
    if (signUpResource.status !== "complete") {
      return { error: deps.missingRequirementsError([...signUpResource.missingFields]) };
    }
    const finalized = await signUpResource.finalize();
    if (finalized.error) {
      return { error: finalized.error };
    }
    return await deps.exchangeFreshClerkSession();
  };

  if (signInResource.status === "complete") {
    return await deps.finalizeSignInAndExchange();
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
    if (String(signInResource.status) !== "complete") {
      return { error: new Error("Google sign-in could not be completed.") };
    }
    return await deps.finalizeSignInAndExchange();
  }

  if (signUpResource.status === "complete") {
    return await finishNewGoogleUser();
  }

  if (signUpResource.status === "missing_requirements") {
    return { error: deps.missingRequirementsError([...signUpResource.missingFields]) };
  }

  const sessionId =
    signInResource.existingSession?.sessionId || signUpResource.existingSession?.sessionId;
  if (sessionId) {
    await deps.setActiveSession(sessionId);
    return await deps.exchangeFreshClerkSession();
  }

  return { error: new Error("Google sign-in could not be completed.") };
}
