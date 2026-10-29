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
  "/support/": "/support",
  "/prestigious-projects/": "/prestigious-projects",

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
/**
 * Legacy URLs reported by Google Search Console as not found (404).
 * Every destination below is a current, relevant frontend route. Query-string
 * variants in the export are handled by pathname matching in resolveServerRedirect.
 * Job listings are intentionally not redirected because the current frontend has no
 * equivalent careers page; they should remain genuine 404s until one exists.
 */
export const SEARCH_CONSOLE_404_REDIRECTS: Record<string, string> = {
  "/ahmedabad-airport-meet-and-assist-services-by-shafsky-aviation": "/airports/AMD",
  "/castle-blue-hotel-new-delhi/": "/hotels/castle-blue",
  "/chandigarh-airport/": "/airports/IXC",
  "/chennai-airport-meet-and-greet-services/": "/airports/MAA",
  "/de-pavilion-hotel-new-delhi/": "/hotels/de-pavilion",
  "/guwahati/": "/airports/GAU",
  "/home/": "/",
  "/jaipur/": "/airports/JAI",
  "/lucknow/": "/airports/LKO",
  "/mangaluru/": "/airports/IXE",
  "/mumbai/": "/airports/BOM",
  "/new-delhi-airport-meet-and-greet-service/": "/airports/DEL",
  "/new-delhi/": "/airports/DEL",
  "/product-category/arrival/": "/services/guide",
  "/product-category/arrival/page/2/": "/services/guide",
  "/product-category/departure/": "/services/guide",
  "/product-category/departure/page/3/": "/services/guide",
  "/product-category/hotel/": "/solutions/hotels",
  "/product-category/transit/": "/services/guide",
  "/product-sitemap.xml": "/sitemap.xml",
  "/product-tag/ahmedabad-airport-meet-greet-service/": "/solutions/concierge",
  "/product-tag/bangalore-airport-meet-and-greet/": "/solutions/concierge",
  "/product-tag/bhubaneswar-meet-greet/": "/solutions/concierge",
  "/product-tag/check-in-assistance/page/6/": "/solutions/concierge",
  "/product-tag/fast-track-service/": "/solutions/concierge",
  "/product-tag/fast-track-service/page/3/": "/solutions/concierge",
  "/product-tag/fast-track-service/page/4/": "/solutions/concierge",
  "/product-tag/fast-track-service/page/6/": "/solutions/concierge",
  "/product-tag/meet-and-greet-service/": "/solutions/concierge",
  "/product-tag/meetandgreet/": "/solutions/concierge",
  "/product-tag/meetandgreet/page/2/": "/solutions/concierge",
  "/product-tag/meetandgreet/page/3/": "/solutions/concierge",
  "/product-tag/meetandgreet/page/5/": "/solutions/concierge",
  "/product-tag/vip-assistance/": "/solutions/concierge",
  "/product-tag/vip-assistance/page/1/": "/solutions/concierge",
  "/product/ahmedabad-airport-domestic-arrival-services/": "/airports/AMD",
  "/product/ahmedabad-airport-domestic-departure-services/": "/airports/AMD",
  "/product/ahmedabad-airport-international-arrival-services/": "/airports/AMD",
  "/product/ahmedabad-airport-international-departure-services/": "/airports/AMD",
  "/product/amritsar-airport-meet-greet-services/": "/airports/ATQ",
  "/product/bengaluru-airport-meet-greet-services/": "/airports/BLR",
  "/product/bhubaneswar-airport-domestic-arrival-services/": "/airports/BBI",
  "/product/bhubaneswar-airport-domestic-departure-services/": "/airports/BBI",
  "/product/chandigarh-airport-domestic-arrival-services/": "/airports/IXC",
  "/product/chandigarh-airport-international-arrival-services/": "/airports/IXC",
  "/product/chandigarh-airport-international-departure-services/": "/airports/IXC",
  "/product/chennai-airport-domestic-departure-services/": "/airports/MAA",
  "/product/chennai-airport-international-arrival-services/": "/airports/MAA",
  "/product/chennai-airport-international-departure-services/": "/airports/MAA",
  "/product/goa-airport-domestic-arrival-services-dabolim-airport-2/": "/airports/GOI",
  "/product/goa-airport-domestic-arrival-services/": "/airports/GOI",
  "/product/goa-airport-domestic-departure-services-dabolim-airport/": "/airports/GOI",
  "/product/goa-airport-domestic-departure-services/": "/airports/GOI",
  "/product/goa-airport-international-arrival-services-dabolim-airport/": "/airports/GOI",
  "/product/goa-airport-international-departure-services-dabolim-airport/": "/airports/GOI",
  "/product/goa-airport-international-departure-services/": "/airports/GOI",
  "/product/goa-airport-transit-services/": "/airports/GOI",
  "/product/guwahati-airport-domestic-arrival-services/": "/airports/GAU",
  "/product/guwahati-airport-domestic-departure-services/": "/airports/GAU",
  "/product/guwahati-airport-international-arrival-services/": "/airports/GAU",
  "/product/https-shafskyaviation-com-product-bangalore-airport-transit-services-preview_id6381preview_nonced14725b8d0_thumbnail_id1579previewtrue/": "/airports/BLR",
  "/product/hyderabad-airport-domestic-arrival-services/": "/airports/HYD",
  "/product/hyderabad-airport-domestic-departure-services/": "/airports/HYD",
  "/product/hyderabad-airport-international-departure-services/": "/airports/HYD",
  "/product/jaipur-airport-domestic-arrival-services/": "/airports/JAI",
  "/product/jaipur-airport-domestic-departure-services/": "/airports/JAI",
  "/product/jaipur-airport-international-arrival-services/": "/airports/JAI",
  "/product/jaipur-airport-international-departure-services/": "/airports/JAI",
  "/product/kolkata-airport-international-arrival-services/": "/airports/CCU",
  "/product/lucknow-airport-domestic-arrival-services/": "/airports/LKO",
  "/product/lucknow-airport-domestic-departure-services/": "/airports/LKO",
  "/product/lucknow-airport-international-arrival-services/": "/airports/LKO",
  "/product/lucknow-airport-international-departure-services/": "/airports/LKO",
  "/product/mangaluru-airport-domestic-departure-services/": "/airports/IXE",
  "/product/mangaluru-airport-international-arrival-services/": "/airports/IXE",
  "/product/mangaluru-airport-international-departure-services/": "/airports/IXE",
  "/product/mumbai-airport-domestic-arrival-services/": "/airports/BOM",
  "/product/mumbai-airport-domestic-departure-services/": "/airports/BOM",
  "/product/mumbai-airport-international-arrival-services/": "/airports/BOM",
  "/product/mumbai-airport-international-departure-services/": "/airports/BOM",
  "/product/mumbai-airport-transit-services/": "/airports/BOM",
  "/product/new-delhi-airport-domestic-arrival-services/": "/airports/DEL",
  "/product/new-delhi-airport-domestic-departure-services-terminal-3/": "/airports/DEL",
  "/product/new-delhi-airport-domestic-departure-services/": "/airports/DEL",
  "/product/new-delhi-airport-international-arrival-services/": "/airports/DEL",
  "/product/new-delhi-airport-international-departure-services/": "/airports/DEL",
  "/product/new-delhi-airport-transit-services/": "/airports/DEL",
  "/product/ranchi-airport-meet-greet-services/": "/airports/IXR",
  "/product/thiruvananthapuram-airport-domestic-departure-services/": "/airports/TRV",
  "/product/thiruvananthapuram-airport-international-arrival-services/": "/airports/TRV",
  "/product/thiruvananthapuram-airport-international-departure-services/": "/airports/TRV",
  "/product/thiruvananthpuram-airport-domestic-arrival-services/": "/airports/TRV",
  "/product/thiruvananthpuram-airport-domestic-departure-services/": "/airports/TRV",
  "/product/thiruvananthpuram-airport-international-departure-services/": "/airports/TRV",
  "/product/visakhapatnam-airport-meet-greet-services/": "/airports/VTZ"
};

export const VERIFIED_LEGACY_REDIRECTS: Record<string, string> = {
  ...CONFIRMED_LEGACY_REDIRECTS,
  ...PENDING_VERIFICATION_LEGACY_REDIRECTS,
  ...SEARCH_CONSOLE_404_REDIRECTS,
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
  "/jobs",
] as const;

export const CANONICAL_HOST = "shafskyaviation.com";
export const CANONICAL_ORIGIN = `https://${CANONICAL_HOST}`;

const REDIRECT_HOSTS = new Set([
  "www.shafskyaviation.in",
  "www.shafskyaviation.com",
]);

const APEX_SERVED_HOSTS = new Set([
  CANONICAL_HOST,
  "shafskyaviation.in",
]);

const WWW_TO_APEX_HOSTS: Record<string, string> = {
  "www.shafskyaviation.in": "shafskyaviation.in",
  "www.shafskyaviation.com": "shafskyaviation.com",
};

// Build set of valid uppercase airport codes from registry
const VALID_AIRPORT_CODES = new Set(
  Object.keys(AIRPORT_REGISTRY).map((c) => c.toUpperCase())
);

/**
 * Resolves the client's original protocol (scheme) from request headers.
 * In reverse-proxy / CDN environments (such as Hostinger CDN, Cloudflare, Nginx),
 * HTTPS is terminated at the edge and forwarded to the Node upstream over HTTP.
 * This helper checks trusted forwarded headers in priority order:
 * 1. X-Forwarded-Proto (standard, handles comma-separated multi-hop chains)
 * 2. Cloudflare cf-visitor JSON header (e.g. {"scheme":"https"})
 * 3. X-Forwarded-Ssl / Front-End-Https ("on")
 * 4. X-Url-Scheme ("https" / "http")
 * 5. RFC 7239 Forwarded header (proto=https)
 * 6. Fallback to URL protocol (or default "http")
 */
export function extractClientProtocol(
  headers?: Headers | Record<string, string | string[] | null | undefined> | null,
  fallbackUrl?: string | URL | null
): "https" | "http" {
  if (headers) {
    const getHeader = (name: string): string | null => {
      if (headers instanceof Headers) {
        return headers.get(name);
      }
      const lowerName = name.toLowerCase();
      for (const [k, v] of Object.entries(headers)) {
        if (k.toLowerCase() === lowerName && v != null) {
          return Array.isArray(v) ? v[0] : String(v);
        }
      }
      return null;
    };

    // 1. Standard X-Forwarded-Proto (first entry is original client in proxy chain)
    const forwardedProto = getHeader("x-forwarded-proto");
    if (forwardedProto) {
      const first = forwardedProto.split(",")[0].trim().toLowerCase();
      if (first === "https" || first === "http") {
        return first;
      }
    }

    // 2. Cloudflare cf-visitor
    const cfVisitor = getHeader("cf-visitor");
    if (cfVisitor) {
      if (cfVisitor.includes('"scheme":"https"')) {
        return "https";
      }
      if (cfVisitor.includes('"scheme":"http"')) {
        return "http";
      }
      try {
        const parsed = JSON.parse(cfVisitor);
        if (parsed?.scheme?.toLowerCase() === "https") return "https";
        if (parsed?.scheme?.toLowerCase() === "http") return "http";
      } catch {
        // ignore parse error
      }
    }

    // 3. X-Forwarded-Ssl
    const xForwardedSsl = getHeader("x-forwarded-ssl");
    if (xForwardedSsl?.toLowerCase() === "on" || xForwardedSsl === "1") {
      return "https";
    }

    // 4. Front-End-Https
    const frontEndHttps = getHeader("front-end-https");
    if (frontEndHttps?.toLowerCase() === "on" || frontEndHttps === "1") {
      return "https";
    }

    // 5. X-Url-Scheme
    const xUrlScheme = getHeader("x-url-scheme");
    if (xUrlScheme?.toLowerCase() === "https") {
      return "https";
    }
    if (xUrlScheme?.toLowerCase() === "http") {
      return "http";
    }

    // 6. RFC 7239 Forwarded: proto=https
    const forwarded = getHeader("forwarded");
    if (forwarded) {
      const match = forwarded.match(/proto=(https|http)/i);
      if (match) {
        return match[1].toLowerCase() as "https" | "http";
      }
    }
  }

  // 7. Fallback to URL scheme
  if (fallbackUrl) {
    try {
      const url = typeof fallbackUrl === "string" ? new URL(fallbackUrl) : fallbackUrl;
      return url.protocol === "https:" ? "https" : "http";
    } catch {
      // ignore invalid URL
    }
  }

  return "http";
}

/**
 * Resolves whether a request needs an HTTP 301 redirect to normalize:
 * 1. Hostname (www.shafskyaviation.in -> shafskyaviation.in, www.shafskyaviation.com -> shafskyaviation.com; both apex domains serve directly with no cross-domain redirect)
 * 2. Protocol (http -> https on apex serving domains and www redirect hosts)
 * 3. Verified legacy WordPress routes
 * 4. Airport route casing and trailing slashes (/airports/del/ -> /airports/DEL)
 * 5. General trailing slashes (except root /)
 *
 * Prevents redirect chains by resolving host, legacy path, and casing in a single hop.
 * Prevents redirect loops by:
 * - Recognizing trusted forwarded protocols (e.g. X-Forwarded-Proto) from proxies/CDNs so HTTPS requests reaching Node via HTTP are not redirected again.
 * - Checking if destination matches the client's effective URL (protocol + host + path + query).
 * - Verifying that the target does not equal the incoming URL.
 *
 * Never redirects unknown legacy URLs to the homepage.
 */
export function resolveServerRedirect(
  requestUrl: string | URL,
  hostHeader?: string | null,
  protoHeader?: string | Headers | Record<string, string | string[] | null | undefined> | null
): string | null {
  const url = typeof requestUrl === "string" ? new URL(requestUrl) : requestUrl;

  const rawHost = (
    (typeof hostHeader === "string" && hostHeader.split(",")[0].trim()) ||
    url.host ||
    ""
  ).trim();
  const hostname = rawHost.split(":")[0].toLowerCase();

  const isProductionRedirectHost = REDIRECT_HOSTS.has(hostname);
  const isApexHost = APEX_SERVED_HOSTS.has(hostname);

  const targetHost = isProductionRedirectHost
    ? WWW_TO_APEX_HOSTS[hostname]
    : hostname;

  // Resolve effective client protocol
  let effectiveProtocol: "https" | "http";
  if (typeof protoHeader === "string") {
    const cleaned = protoHeader.split(",")[0].trim().toLowerCase();
    effectiveProtocol = cleaned === "https" ? "https" : "http";
  } else if (protoHeader && typeof protoHeader === "object") {
    effectiveProtocol = extractClientProtocol(protoHeader, url);
  } else {
    // If protoHeader is not supplied, derive from requestUrl
    effectiveProtocol = url.protocol === "https:" ? "https" : "http";
  }

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
      // Do not redirect unmapped legacy patterns (e.g. /jobs/*, /wp-admin/*)
      const isUnmapped = UNMAPPED_LEGACY_PATTERNS.some(
        (prefix) => rawPath === prefix || rawPath.startsWith(`${prefix}/`)
      );
      if (!isUnmapped) {
        const stripped = rawPath.replace(/\/+$/, "");
        targetPath = stripped || "/";
      }
    }
  }

  // Determine if redirect is required
  const hostChanged = isProductionRedirectHost && hostname !== targetHost;
  const protocolChanged = (isProductionRedirectHost || isApexHost) && effectiveProtocol === "http";
  const pathChanged = targetPath !== rawPath;

  if (!hostChanged && !protocolChanged && !pathChanged) {
    return null; // Already canonical, no redirect needed
  }

  // Construct target URL
  const destination = new URL(url.toString());
  if (isProductionRedirectHost || isApexHost) {
    destination.protocol = "https:";
    destination.host = targetHost;
    destination.port = "";
  }
  destination.pathname = targetPath;
  destination.search = url.search; // Preserves query string exactly

  const destinationString = destination.toString();

  // Safety check 1: Exact string match with incoming URL
  if (destinationString === url.toString()) {
    return null;
  }

  // Safety check 2: Logical match against effective incoming request (loop prevention behind reverse proxies)
  if (
    destination.protocol === `${effectiveProtocol}:` &&
    destination.hostname.toLowerCase() === hostname &&
    destination.pathname === rawPath &&
    destination.search === url.search
  ) {
    return null;
  }

  return destinationString;
}
