import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  applicationRouteForRole,
  dashboardRedirectTarget,
  readApplicationSession,
  rememberSession,
} from "@/auth/ensureSession";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/auth/tokenStore";

const FASTAPI_ACCESS = "fastapi-access-jwt";

afterEach(() => {
  clearAccessToken();
  rememberSession(null);
});

describe("post sign-up application navigation", () => {
  it("keeps the FastAPI session authenticated for the dashboard", () => {
    setAccessToken(FASTAPI_ACCESS);
    rememberSession({
      accessToken: FASTAPI_ACCESS,
      user: { id: "11111111-1111-4111-8111-111111111111", email: "new@example.com", role: "CUSTOMER" },
    });

    const session = readApplicationSession();
    expect(session?.userId).toBe("11111111-1111-4111-8111-111111111111");
    expect(session?.roles).toEqual(["customer"]);
    expect(applicationRouteForRole("customer")).toBe("/dashboard");
    expect(dashboardRedirectTarget(session)).toBeNull();
    expect(getAccessToken()).toBe(FASTAPI_ACCESS);
  });

  it("does not hard-reload after authentication", () => {
    const source = readFileSync(resolve(process.cwd(), "src/auth-system/signIn.tsx"), "utf8");
    const start = source.indexOf("if (!loading && user && profile");
    const end = source.indexOf("const changeMode");
    const navigation = source.slice(start, end);
    expect(navigation).toContain("navigate({ to: applicationRouteForRole(profile.role) })");
    expect(navigation).not.toContain("window.location.href");
  });

  it("sends a guest with no application session to sign-in", () => {
    expect(readApplicationSession()).toBeNull();
    expect(dashboardRedirectTarget(null)).toBe("/auth?mode=signin");
    expect(dashboardRedirectTarget({ userId: "guest_user", roles: [] })).toBe("/auth?mode=signin");
    expect(getAccessToken()).toBeNull();
  });

  it("keeps password login on the Clerk exchange path", () => {
    const source = readFileSync(resolve(process.cwd(), "src/auth-system/AuthProvider.tsx"), "utf8");
    const start = source.indexOf("const establishFreshClerkSignIn");
    const end = source.indexOf("const signUpClient");
    const login = source.slice(start, end);
    expect(login).toContain("signIn.password");
    expect(login).toContain("finalize()");
    expect(login).toContain("getFreshSessionToken()");
    expect(login).toContain("exchangeActiveClerkSession(freshToken)");
    expect(login).toContain('strategy: "oauth_google"');
    expect(login).not.toContain("localStorage");
    expect(login).not.toContain("sessionStorage");
  });

  it("keeps refresh and logout on the existing FastAPI endpoints", () => {
    const session = readFileSync(resolve(process.cwd(), "src/auth/ensureSession.ts"), "utf8");
    const provider = readFileSync(resolve(process.cwd(), "src/auth-system/AuthProvider.tsx"), "utf8");
    const store = readFileSync(resolve(process.cwd(), "src/auth/tokenStore.ts"), "utf8");
    expect(session).toContain("apiAuthRefresh");
    expect(provider).toContain("completeApplicationLogout");
    expect(store).not.toContain("localStorage");
    expect(store).not.toContain("sessionStorage");
  });
});
