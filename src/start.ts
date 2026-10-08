import { createStart, createMiddleware, createCsrfMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { getAccessToken } from "./auth/tokenStore";

/**
 * Attaches the FastAPI access token as a Bearer header to server-function calls.
 *
 * Server functions are same-origin RPCs, and the default transport sends only
 * cookies, never an Authorization header. Without this, getTokenFromRequest()
 * cannot see the caller token and identity collapses to a cookie value the
 * browser can write. Adding the header restores a verifiable identity source.
 *
 * Additive only: when no token is present the request is forwarded untouched.
 */
const authFetch: typeof fetch = (input, init) => {
  if (typeof window === "undefined") {
    return fetch(input, init);
  }
  const token = getAccessToken();
  if (!token) {
    return fetch(input, init);
  }
  const base = init?.headers ?? (input instanceof Request ? input.headers : undefined);
  const headers = new Headers(base as HeadersInit);
  if (!headers.has("Authorization")) {
    headers.set("Authorization", "Bearer " + token);
  }
  return fetch(input, { ...init, headers });
};

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, errorMiddleware],
  serverFns: { fetch: authFetch },
}));
