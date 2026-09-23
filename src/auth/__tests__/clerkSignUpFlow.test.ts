import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { beginClerkSignUp, verifyClerkEmailCode, type ClerkSignUpClient } from "@/auth/clerkSignUpFlow";
import { clearAccessToken, getAccessToken } from "@/auth/tokenStore";

const FASTAPI_ACCESS = "fastapi-access-jwt";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function attempt(status: string, extra: { missingFields?: string[]; unverifiedFields?: string[] } = {}) {
  return { status, ...extra };
}

afterEach(() => {
  clearAccessToken();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Clerk sign-up verification", () => {
  it("does not exchange while sign-up is incomplete and prepares an email code", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const client: ClerkSignUpClient = {
      create: vi.fn(async () => ({
        error: null,
        attempt: attempt("missing_requirements", { unverifiedFields: ["email_address"] }),
      })),
      sendEmailCode: vi.fn(async () => ({
        error: null,
        attempt: attempt("missing_requirements", { unverifiedFields: ["email_address"] }),
      })),
      verifyEmailCode: vi.fn(),
      finalize: vi.fn(),
      getSessionToken: vi.fn(),
    };

    const result = await beginClerkSignUp(client, {
      email: "new@example.com",
      password: "UatClerk2026!Aa",
      fullName: "UAT Customer",
    });

    expect(result.error).toBeNull();
    expect(result.verificationRequired).toBe(true);
    expect(result.session).toBeUndefined();
    expect(client.create).toHaveBeenCalledWith(
      expect.objectContaining({ emailAddress: "new@example.com", username: "newuser" }),
    );
    expect(client.sendEmailCode).toHaveBeenCalledOnce();
    expect(client.finalize).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps an invalid code incomplete and does not exchange", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const client: ClerkSignUpClient = {
      create: vi.fn(),
      sendEmailCode: vi.fn(),
      verifyEmailCode: vi.fn(async () => ({
        error: new Error("Incorrect code"),
        attempt: attempt("missing_requirements", { unverifiedFields: ["email_address"] }),
      })),
      finalize: vi.fn(),
      getSessionToken: vi.fn(),
    };

    const result = await verifyClerkEmailCode(client, "000000");

    expect(result.verificationRequired).toBe(true);
    expect(result.session).toBeUndefined();
    expect(result.error?.message).toBe("Incorrect code");
    expect(client.verifyEmailCode).toHaveBeenCalledWith("000000");
    expect(client.finalize).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("exchanges exactly once after the email code completes sign-up", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.endsWith("/api/auth/clerk-exchange")) {
        return jsonResponse({
          success: true,
          data: { accessToken: FASTAPI_ACCESS, refreshToken: null },
        });
      }
      if (url.endsWith("/api/auth/me")) {
        return jsonResponse({
          success: true,
          data: { id: "user-1", email: "new@example.com", role: "CUSTOMER" },
        });
      }
      throw new Error(`Unexpected request ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);
    const client: ClerkSignUpClient = {
      create: vi.fn(),
      sendEmailCode: vi.fn(),
      verifyEmailCode: vi.fn(async () => ({
        error: null,
        attempt: attempt("complete"),
      })),
      finalize: vi.fn(async () => ({
        error: null,
        attempt: attempt("complete"),
      })),
      getSessionToken: vi.fn(async () => "clerk-session-token"),
    };

    const result = await verifyClerkEmailCode(client, "424242");

    expect(result.error).toBeNull();
    expect(result.verificationRequired).toBe(false);
    expect(result.session?.role).toBe("customer");
    expect(getAccessToken()).toBe(FASTAPI_ACCESS);
    expect(client.finalize).toHaveBeenCalledOnce();
    const exchangeCalls = fetchMock.mock.calls.filter((call) =>
      String(call[0]).endsWith("/api/auth/clerk-exchange"),
    );
    const meCalls = fetchMock.mock.calls.filter((call) => String(call[0]).endsWith("/api/auth/me"));
    expect(exchangeCalls).toHaveLength(1);
    expect(meCalls).toHaveLength(1);
  });

  it("keeps existing password login on the Clerk sign-in then exchange path", () => {
    const source = readFileSync(resolve(process.cwd(), "src/auth-system/AuthProvider.tsx"), "utf8");
    const start = source.indexOf("const establishFreshClerkSignIn");
    const end = source.indexOf("const signUpClient");
    const login = source.slice(start, end);
    expect(login).toContain("signIn.password");
    expect(login).toContain("mfa.sendEmailCode()");
    expect(login).toContain("mfa.verifyEmailCode");
    expect(login).toContain("finalize()");
    expect(login).toContain("getFreshSessionToken()");
    expect(login).toContain("exchangeActiveClerkSession(freshToken)");
    expect(login).toContain('strategy: "oauth_google"');
    expect(login).toContain("completeGoogleReturn");
    expect(login).not.toContain("beginClerkSignUp");
  });

  it("routes Google OAuth return through finalize, fresh token, and exchange", () => {
    const provider = readFileSync(resolve(process.cwd(), "src/auth-system/AuthProvider.tsx"), "utf8");
    const callback = readFileSync(resolve(process.cwd(), "src/routes/auth.sso-callback.tsx"), "utf8");
    const ui = readFileSync(resolve(process.cwd(), "src/auth-system/signIn.tsx"), "utf8");
    expect(provider).toContain("signIn.sso");
    expect(provider).toContain("getFreshSessionToken()");
    expect(provider).toContain("establishApplicationSession");
    expect(provider).toContain("clerk.isSignedIn");
    expect(provider).toContain("exchangeFreshClerkSession()");
    expect(provider).toContain("session_exists");
    expect(callback).toContain("completeGoogleReturn");
    expect(callback).toContain("applicationRouteForRole");
    expect(ui).toContain("Continue with Google");
    expect(ui).toContain("signInWithGoogle");
    expect(ui).toContain("staffSignIn");
    expect(ui).toContain("result.role");
  });
});
