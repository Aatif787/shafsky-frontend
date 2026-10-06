import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/auth/authClient", () => ({
  apiAuthClerkExchange: vi.fn(),
  apiAuthMe: vi.fn(),
  apiAuthLogout: vi.fn(),
  apiAuthRefresh: vi.fn(),
}));

import { apiAuthClerkExchange, apiAuthMe } from "@/auth/authClient";
import { establishApplicationSession } from "@/auth/clerkSession";
import {
  applicationRouteForRole,
  readApplicationSession,
  rememberSession,
} from "@/auth/ensureSession";
import { completeGoogleCallback, type GoogleCallbackDeps } from "@/auth/googleCallback";
import { clearAccessToken, getAccessToken } from "@/auth/tokenStore";
import type { Role } from "@/auth-system/types";

const exchange = vi.mocked(apiAuthClerkExchange);
const me = vi.mocked(apiAuthMe);

function backendReturns(role: string) {
  exchange.mockResolvedValue({ data: { accessToken: "fastapi-jwt", user: { id: "u1", email: "x", role } } });
  me.mockResolvedValue({ user: { id: "u1", email: "x", role } });
}

/** Fake of the real AuthProvider exchange: Clerk token -> FastAPI -> app session. */
function makeExchange(clerkTokenIssued = true) {
  return vi.fn(async () => {
    if (!clerkTokenIssued) return { error: new Error("Clerk session token was not issued.") };
    const established = await establishApplicationSession("clerk-fresh-token");
    if (established.error || !established.session) return { error: established.error as Error };
    rememberSession({ accessToken: established.session.accessToken, user: established.session.user });
    return { error: null, role: established.session.role as Role };
  });
}

function makeDeps(overrides: Partial<GoogleCallbackDeps> = {}) {
  const exchangeFreshClerkSession = makeExchange();
  const deps: GoogleCallbackDeps & { signInCreate: ReturnType<typeof vi.fn>; signUpCreate: ReturnType<typeof vi.fn> } = {
    isLoaded: true,
    isSignedIn: false,
    signIn: {
      status: "needs_identifier",
      isTransferable: false,
      existingSession: null,
      create: vi.fn(async () => ({ error: null })),
    },
    signUp: {
      status: "missing_requirements",
      isTransferable: false,
      existingSession: null,
      missingFields: [],
      create: vi.fn(async () => ({ error: null })),
      finalize: vi.fn(async () => ({ error: null })),
    },
    reuseApplicationSession: () => {
      const live = readApplicationSession();
      return live ? (live.roles[0] as Role) : null;
    },
    exchangeFreshClerkSession,
    finalizeSignInAndExchange: exchangeFreshClerkSession,
    setActiveSession: vi.fn(async () => {}),
    missingRequirementsError: (f: string[]) => new Error(`missing: ${f.join(",")}`),
    ...overrides,
  } as never;
  deps.signInCreate = deps.signIn.create as never;
  deps.signUpCreate = deps.signUp.create as never;
  return deps;
}

beforeEach(() => {
  vi.clearAllMocks();
});
afterEach(() => {
  clearAccessToken();
  rememberSession(null);
});

describe("Google SSO callback completion", () => {
  it("A. new Google customer: sign-up transfer -> exchange -> '/'", async () => {
    backendReturns("CUSTOMER");
    const deps = makeDeps();
    deps.signIn.isTransferable = true;
    deps.signUp.create = vi.fn(async () => {
      deps.signUp.status = "complete";
      return { error: null };
    });
    const result = await completeGoogleCallback(deps);
    expect(result.error).toBeNull();
    expect(applicationRouteForRole(result.role)).toBe("/");
    expect(deps.signUp.finalize).toHaveBeenCalledTimes(1);
    expect(exchange).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBe("fastapi-jwt");
    expect(readApplicationSession()?.userId).toBe("u1");
  });

  it("B. existing Google customer: completed sign-in -> exchange -> '/'", async () => {
    backendReturns("CUSTOMER");
    const deps = makeDeps();
    deps.signIn.status = "complete";
    const result = await completeGoogleCallback(deps);
    expect(result.error).toBeNull();
    expect(applicationRouteForRole(result.role)).toBe("/");
    expect(exchange).toHaveBeenCalledTimes(1);
  });

  it("C. active Clerk session is exchanged without any new sign-in/sign-up attempt", async () => {
    backendReturns("CUSTOMER");
    const deps = makeDeps({ isSignedIn: true });
    const result = await completeGoogleCallback(deps);
    expect(result.error).toBeNull();
    expect(applicationRouteForRole(result.role)).toBe("/");
    expect(deps.signInCreate).not.toHaveBeenCalled();
    expect(deps.signUpCreate).not.toHaveBeenCalled();
    expect(deps.signUp.finalize).not.toHaveBeenCalled();
    expect(exchange).toHaveBeenCalledTimes(1);
  });

  it("D. admin Google login -> '/admin'", async () => {
    backendReturns("ADMIN");
    const deps = makeDeps();
    deps.signIn.status = "complete";
    const result = await completeGoogleCallback(deps);
    expect(result.role).toBe("admin");
    expect(applicationRouteForRole(result.role)).toBe("/admin");
  });

  it("E. super-admin Google login -> '/admin'", async () => {
    backendReturns("SUPER_ADMIN");
    const deps = makeDeps();
    deps.signIn.status = "complete";
    const result = await completeGoogleCallback(deps);
    expect(result.role).toBe("super_admin");
    expect(applicationRouteForRole(result.role)).toBe("/admin");
  });

  it("F. failed FastAPI exchange surfaces the real error, no role, no session", async () => {
    exchange.mockResolvedValue({ error: new Error("Account is disabled") });
    const deps = makeDeps({ isSignedIn: true });
    const result = await completeGoogleCallback(deps);
    expect(result.error?.message).toBe("Account is disabled");
    expect(result.role).toBeUndefined();
    expect(getAccessToken()).toBeNull();
    expect(readApplicationSession()).toBeNull();
  });

  it("F2. failed /api/auth/me also surfaces an error and clears the token", async () => {
    exchange.mockResolvedValue({ data: { accessToken: "fastapi-jwt", user: { id: "u1", email: "x", role: "CUSTOMER" } } });
    me.mockResolvedValue({ error: new Error("Failed to fetch profile (HTTP 401)") });
    const result = await completeGoogleCallback(makeDeps({ isSignedIn: true }));
    expect(result.error?.message).toContain("Failed to fetch profile");
    expect(getAccessToken()).toBeNull();
  });

  it("G. re-entry after success reuses the application session (no second exchange)", async () => {
    backendReturns("CUSTOMER");
    const first = await completeGoogleCallback(makeDeps({ isSignedIn: true }));
    expect(first.error).toBeNull();
    const again = makeDeps({ isSignedIn: true });
    const second = await completeGoogleCallback(again);
    expect(second).toEqual({ error: null, role: "customer" });
    expect(exchange).toHaveBeenCalledTimes(1);
    expect(again.signInCreate).not.toHaveBeenCalled();
    expect(again.signUpCreate).not.toHaveBeenCalled();
  });

  it("G2. reload (empty memory) with an active Clerk session re-exchanges instead of erroring", async () => {
    backendReturns("CUSTOMER");
    const result = await completeGoogleCallback(
      makeDeps({ isSignedIn: true }),
    );
    expect(result.error).toBeNull();
    expect(result.role).toBe("customer");
  });

  it("does not run before Clerk is loaded", async () => {
    const deps = makeDeps({ isLoaded: false });
    const result = await completeGoogleCallback(deps);
    expect(result.error?.message).toBe("Authentication is not ready.");
    expect(exchange).not.toHaveBeenCalled();
  });

  it("preserves a genuine Clerk transfer error unchanged", async () => {
    const real = new Error("That email address is taken. Please try another.");
    const deps = makeDeps();
    deps.signIn.isTransferable = true;
    deps.signUp.create = vi.fn(async () => ({ error: real }));
    const result = await completeGoogleCallback(deps);
    expect(result.error).toBe(real);
    expect(exchange).not.toHaveBeenCalled();
  });
});

describe("H. password login and wiring remain unchanged", () => {
  const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

  it("password path still uses signIn.password -> finalize -> fresh token -> exchange", () => {
    const source = read("src/auth-system/AuthProvider.tsx");
    const start = source.indexOf("const signInWithPassword");
    const end = source.indexOf("const verifySignInCode");
    const password = source.slice(start, end);
    expect(password).toContain("signIn.signIn.password");
    expect(password).toContain("establishFreshClerkSignIn()");
    expect(source).toContain("exchangeActiveClerkSession(freshToken)");
  });

  it("callback waits for Clerk, runs once, never starts OAuth, never goes back to /auth", () => {
    const callback = read("src/routes/auth.sso-callback.tsx");
    expect(callback).toContain("!clerkLoaded");
    expect(callback).toContain("hasRun.current");
    expect(callback).not.toContain("signInWithGoogle");
    expect(callback).not.toContain("setTimeout");
    expect(callback).not.toContain("window.location");
    const nav = callback.match(/navigate\(\{[^}]*\}\)/)?.[0] ?? "";
    expect(nav).toContain("applicationRouteForRole(result.role)");

    const module = read("src/auth/googleCallback.ts");
    expect(module).not.toContain("oauth_google");
    expect(module).not.toContain("localStorage");
  });

  it("provider guards the callback with a single-flight ref", () => {
    const source = read("src/auth-system/AuthProvider.tsx");
    expect(source).toContain("googleReturnInflight");
  });
});
