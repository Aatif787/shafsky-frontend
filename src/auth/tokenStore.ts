/**
 * In-Memory Access Token Store for FastAPI JWT Authentication.
 *
 * Security Best Practice: Access tokens are stored ONLY in memory
 * to prevent XSS exfiltration. The Refresh Token is stored separately
 * in an HttpOnly, Secure, SameSite=Strict cookie managed by FastAPI.
 */

let accessTokenInMemory: string | null = null;

export function setAccessToken(token: string | null): void {
  accessTokenInMemory = token;
}

export function getAccessToken(): string | null {
  return accessTokenInMemory;
}

export function clearAccessToken(): void {
  accessTokenInMemory = null;
}
