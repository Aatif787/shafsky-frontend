/**
 * Turn a Clerk session token into the existing FastAPI application session.
 *
 * Authorization stays on the FastAPI access JWT. Role comes only from
 * GET /api/auth/me. Clerk metadata and any client-supplied role are ignored.
 * The refresh token stays in the HttpOnly cookie set by the exchange response.
 */

import {
  apiAuthClerkExchange,
  apiAuthLogout,
  apiAuthMe,
  type AuthUser,
} from "./authClient";
import { clearAccessToken, setAccessToken } from "./tokenStore";
import type { Role } from "@/auth-system/types";

const STAFF_ROLES = new Set([
  "DUTY_OFFICER",
  "DISPATCHER",
  "MEET_AND_ASSIST_STAFF",
  "CONCIERGE_TEAM",
  "CUSTOMER_SUPPORT",
  "DRIVER",
  "FINANCE",
]);

export function roleFromFastApiClaims(role: string | null | undefined): Role {
  const normalized = (role || "").trim().toUpperCase();
  if (normalized === "SUPER_ADMIN") return "super_admin";
  if (normalized === "ADMIN" || normalized === "OPERATIONS_MANAGER") return "admin";
  if (STAFF_ROLES.has(normalized)) return "staff";
  return "customer";
}

export interface EstablishedSession {
  accessToken: string;
  user: AuthUser;
  role: Role;
}

export async function establishApplicationSession(
  clerkSessionToken: string,
): Promise<{ session?: EstablishedSession; error?: Error }> {
  const token = (clerkSessionToken || "").trim();
  if (!token) {
    return { error: new Error("Missing Clerk session token.") };
  }

  const exchanged = await apiAuthClerkExchange(token);
  const accessToken = exchanged.data?.accessToken || exchanged.data?.access_token;
  if (exchanged.error || !accessToken) {
    clearAccessToken();
    return { error: exchanged.error || new Error("Clerk exchange did not return an access token.") };
  }

  setAccessToken(accessToken);

  const me = await apiAuthMe(accessToken);
  if (me.error || !me.user) {
    clearAccessToken();
    return { error: me.error || new Error("Failed to load the application profile.") };
  }

  return {
    session: {
      accessToken,
      user: me.user,
      role: roleFromFastApiClaims(me.user.role),
    },
  };
}

export async function completeApplicationLogout(options: {
  accessToken?: string | null;
  clerkSignOut?: () => Promise<unknown>;
}): Promise<{ error?: Error }> {
  clearAccessToken();
  const loggedOut = await apiAuthLogout(options.accessToken || undefined);
  if (options.clerkSignOut) {
    try {
      await options.clerkSignOut();
    } catch (err) {
      return { error: err as Error };
    }
  }
  if (!loggedOut.success && loggedOut.error) {
    return { error: loggedOut.error };
  }
  return {};
}
