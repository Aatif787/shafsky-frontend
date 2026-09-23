import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiAuthRefresh } from "@/auth/authClient";
import {
  completeApplicationLogout,
  establishApplicationSession,
  roleFromFastApiClaims,
} from "@/auth/clerkSession";
import { clearAccessToken, getAccessToken } from "@/auth/tokenStore";

const FASTAPI_ACCESS = "fastapi-access-jwt";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  clearAccessToken();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Clerk session exchange", () => {
  it("exchanges the Clerk token and stores the FastAPI access token from /me", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url.endsWith("/api/auth/clerk-exchange")) {
        const headers = new Headers(init?.headers);
        expect(headers.get("Authorization")).toBe("Bearer clerk-session-token");
        expect(init?.credentials).toBe("include");
        expect(init?.body).toBeUndefined();
        return jsonResponse({
          success: true,
          data: {
            accessToken: FASTAPI_ACCESS,
            refreshToken: null,
            user: {
              id: "user-1",
              email: "customer@example.com",
              role: "SUPER_ADMIN",
            },
          },
        });
      }
      if (url.endsWith("/api/auth/me")) {
        const headers = new Headers(init?.headers);
        expect(headers.get("Authorization")).toBe(`Bearer ${FASTAPI_ACCESS}`);
        return jsonResponse({
          success: true,
          data: {
            id: "user-1",
            email: "customer@example.com",
            role: "CUSTOMER",
          },
        });
      }
      throw new Error(`Unexpected request ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await establishApplicationSession("clerk-session-token");

    expect(result.error).toBeUndefined();
    expect(getAccessToken()).toBe(FASTAPI_ACCESS);
    expect(result.session?.user.email).toBe("customer@example.com");
    expect(result.session?.user.role).toBe("CUSTOMER");
    expect(result.session?.role).toBe("customer");
  });

  it("does not let a client or Clerk role override the FastAPI role", () => {
    expect(roleFromFastApiClaims("SUPER_ADMIN")).toBe("super_admin");
    expect(roleFromFastApiClaims("ADMIN")).toBe("admin");
    expect(roleFromFastApiClaims("CUSTOMER")).toBe("customer");
    expect(roleFromFastApiClaims("super_admin")).toBe("super_admin");
    expect(roleFromFastApiClaims("CLERK_ADMIN")).toBe("customer");
  });

  it("refreshes through the existing FastAPI refresh cookie endpoint", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toContain("/api/auth/refresh");
      expect(init?.method).toBe("POST");
      expect(init?.credentials).toBe("include");
      expect(init?.body).toBeUndefined();
      return jsonResponse({
        success: true,
        data: { accessToken: "rotated-fastapi-jwt", refreshToken: null },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiAuthRefresh();
    expect(result.data?.accessToken).toBe("rotated-fastapi-jwt");
  });

  it("clears the application token and signs out Clerk on logout", async () => {
    const clerkSignOut = vi.fn(async () => undefined);
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toContain("/api/auth/logout");
      expect(init?.method).toBe("POST");
      expect(init?.credentials).toBe("include");
      const headers = new Headers(init?.headers);
      expect(headers.get("Authorization")).toBe(`Bearer ${FASTAPI_ACCESS}`);
      return jsonResponse({ success: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { setAccessToken } = await import("@/auth/tokenStore");
    setAccessToken(FASTAPI_ACCESS);

    const result = await completeApplicationLogout({
      accessToken: FASTAPI_ACCESS,
      clerkSignOut,
    });

    expect(result.error).toBeUndefined();
    expect(getAccessToken()).toBeNull();
    expect(clerkSignOut).toHaveBeenCalledOnce();
  });

  it("stays unauthenticated when no Clerk token is available", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { setAccessToken } = await import("@/auth/tokenStore");
    setAccessToken("stale-token");

    const result = await establishApplicationSession("   ");

    expect(result.session).toBeUndefined();
    expect(result.error?.message).toMatch(/Missing Clerk session token/);
    expect(getAccessToken()).toBe("stale-token");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("leaves non-auth Supabase usage in place", () => {
    const client = readFileSync(
      resolve(process.cwd(), "src/integrations/supabase/client.ts"),
      "utf8",
    );
    const types = readFileSync(
      resolve(process.cwd(), "src/integrations/supabase/types.ts"),
      "utf8",
    );
    expect(client).toContain("createClient");
    expect(client).not.toContain("supabase.auth");
    expect(client).not.toContain(".auth.");
    expect(types.length).toBeGreaterThan(0);
  });
});
