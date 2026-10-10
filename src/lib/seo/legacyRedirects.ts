import { AIRPORT_REGISTRY } from "@/data/airportRegistry";

/**
 * Explicit mapping of verified legacy WordPress URLs to current canonical TanStack Start routes.
 *
 * SAFETY RULES:
 * 1. Only verified legacy routes are listed here.
 * 2. Unmapped / unknown legacy URLs (like /wp-admin, /feed, /author/*) MUST NOT redirect to homepage.
 * 3. Never use a catch-all redirect.
 */
/**
 * TIER 1: CONFIRMED LEGACY REDIRECTS
 * Directly verified from the legacy WordPress site structure and audit report.
 */
export const CONFIRMED_LEGACY_REDIRECTS: Record<string, string> = {
  // Brand & company pages
  "/about-us": "/about-us",
  "/about-us/": "/about-us",
  "/contact-us": "/contact",
  "/contact-us/": "/contact",
  "/contact/": "/contact",

  // Hub & coverage pages
  "/airports/": "/airports",

  // Legal & compliance
  "/privacy-policy/": "/privacy-policy",
  "/terms-and-conditions/": "/terms-and-conditions",
  "/cancellation-refund": "/cancellation-and-refund",
  "/cancellation-refund/": "/cancellation-and-refund",
  "/cancellation-and-refund/": "/cancellation-and-refund",
};

/**
 * TIER 2: PENDING VERIFICATION FROM WORDPRESS EXPORT & SEARCH CONSOLE
 * Common WordPress permalink slug variants for core services.
 * NOTE: These are provisional heuristic mappings based on previous site service names.
 * Final confirmation requires cross-referencing the real WordPress XML export / DB dump
 * and Google Search Console historical crawl data.
 */
export const PENDING_VERIFICATION_LEGACY_REDIRECTS: Record<string, string> = {
  // Services: Meet & Greet / VIP Concierge
  "/meet-and-greet": "/solutions/concierge",
  "/meet-and-greet/": "/solutions/concierge",
  "/services/meet-and-greet": "/solutions/concierge",
  "/services/meet-and-greet/": "/solutions/concierge",

  // Services: Chauffeured Airport Transfers
  "/transfers": "/solutions/transport",
  "/transfers/": "/solutions/transport",
  "/airport-transfers": "/solutions/transport",
  "/airport-transfers/": "/solutions/transport",
  "/services/airport-transfers": "/solutions/transport",
  "/services/airport-transfers/": "/solutions/transport",

  // Services: Luxury & Transit Hotels
  "/hotels/": "/solutions/hotels",
  "/services/hotel-booking": "/solutions/hotels",
  "/services/hotel-booking/": "/solutions/hotels",

  // Services: Private Jet & Helicopter Charter
  "/charter": "/solutions/aviation",
  "/charter/": "/solutions/aviation",
  "/private-charter": "/solutions/aviation",
  "/private-charter/": "/solutions/aviation",
  "/services/private-charter": "/solutions/aviation",
  "/services/private-charter/": "/solutions/aviation",

  // Services: Special Assistance
  "/special-services": "/solutions/special-services",
  "/special-services/": "/solutions/special-services",
  "/services/special-services": "/solutions/special-services",
  "/services/special-services/": "/solutions/special-services",
};

/**
 * Active legacy mapping table combining confirmed and provisional service mappings.
 */
export const VERIFIED_LEGACY_REDIRECTS: Record<string, string> = {
  ...CONFIRMED_LEGACY_REDIRECTS,
  ...PENDING_VERIFICATION_LEGACY_REDIRECTS,
};

/**
 * List of known legacy WordPress endpoints that are intentionally unmapped.
 * These will NOT redirect to homepage, allowing standard 404 handling.
 */
export const UNMAPPED_LEGACY_PATTERNS = [
  "/wp-admin",
  "/wp-login.php",
  "/xmlrpc.php",
  "/wp-content",
  "/wp-includes",
  "/feed",
  "/comments/feed",
  "/author",
  "/category",
  "/tag",
] as const;

export const CANONICAL_HOST = "shafskyaviation.com";
export const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

const REDIRECT_HOSTS = new Set([
  "shafskyaviation.in",
  "www.shafskyaviation.in",
  "www.shafskyaviation.com",
]);

// Build set of valid uppercase airport codes from registry
const VALID_AIRPORT_CODES = new Set(
  Object.keys(AIRPORT_REGISTRY).map((c) => c.toUpperCase())
);

/**
 * Resolves whether a request needs an HTTP 301 redirect to normalize:
 * 1. Hostname (.in or www.* -> shafskyaviation.com)
 * 2. Protocol (http -> https on production hosts)
 * 3. Verified legacy WordPress routes
 * 4. Airport route casing and trailing slashes (/airports/del/ -> /airports/DEL)
 * 5. General trailing slashes (except root /)
 *
 * Prevents redirect chains by resolving host, legacy path, and casing in a single hop.
 * Prevents redirect loops by verifying that the target does not equal the incoming URL.
 * Never redirects unknown legacy URLs to the homepage.
 */
export function resolveServerRedirect(
  requestUrl: string | URL,
  hostHeader?: string | null
): string | null {
  const url = typeof requestUrl === "string" ? new URL(requestUrl) : requestUrl;

  const rawHost = (hostHeader || url.host || "").trim();
  const hostname = rawHost.split(":")[0].toLowerCase();

  const isProductionRedirectHost = REDIRECT_HOSTS.has(hostname);
  const isCanonicalHost = hostname === CANONICAL_HOST;

  // If host is neither a known redirect host nor canonical, only apply path rewrites
  // if on localhost/preview (or preserve local host)
  const targetHost = isProductionRedirectHost ? CANONICAL_HOST : hostname;
  const targetProtocol = isProductionRedirectHost ? "https:" : url.protocol;

  const rawPath = url.pathname;

  let targetPath = rawPath;

  // 1. Check explicit verified legacy redirect mappings
  if (rawPath in VERIFIED_LEGACY_REDIRECTS) {
    targetPath = VERIFIED_LEGACY_REDIRECTS[rawPath];
  } else {
    // 2. Check airport routes: /airports/:code or /airports/:code/
    const airportMatch = rawPath.match(/^\/airports\/([^/]+)\/?$/i);
    if (airportMatch) {
      const inputCode = airportMatch[1].toUpperCase();
      if (VALID_AIRPORT_CODES.has(inputCode)) {
        const canonicalAirportPath = `/airports/${inputCode}`;
        if (rawPath !== canonicalAirportPath) {
          targetPath = canonicalAirportPath;
        }
      }
    } else if (rawPath.length > 1 && rawPath.endsWith("/")) {
      // 3. Trailing slash normalization for public paths (e.g. /contact/ -> /contact)
      const stripped = rawPath.replace(/\/+$/, "");
      targetPath = stripped || "/";
    }
  }

  // Determine if redirect is required
  const hostChanged = isProductionRedirectHost && hostname !== CANONICAL_HOST;
  const pathChanged = targetPath !== rawPath;

  if (!hostChanged && !pathChanged) {
    return null; // Already canonical, no redirect needed
  }

  // Construct target URL
  const destination = new URL(url.toString());
  if (isProductionRedirectHost || isCanonicalHost) {
    destination.protocol = "https:";
    destination.host = CANONICAL_HOST;
  }
  destination.pathname = targetPath;
  destination.search = url.search; // Preserves query string exactly

  const destinationString = destination.toString();

  // Safety check: Avoid redirecting to the exact same URL (loop prevention)
  if (destinationString === url.toString()) {
    return null;
  }

  return destinationString;
}
