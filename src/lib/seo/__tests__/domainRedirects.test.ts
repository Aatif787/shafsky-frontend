import { describe, expect, it, vi } from "vitest";
import {
  resolveServerRedirect,
  extractClientProtocol,
  VERIFIED_LEGACY_REDIRECTS,
  UNMAPPED_LEGACY_PATTERNS,
  CANONICAL_HOST,
} from "../legacyRedirects";

vi.mock("@tanstack/react-start/server-entry", () => ({
  default: {
    fetch: async () => new Response("OK", { status: 200 }),
  },
}));

import serverEntry from "@/server";

describe("Domain Migration Server Redirects", () => {
  describe("Host Normalization (Serving .in and .com, www to apex)", () => {
    it("serves shafskyaviation.in directly without redirect (resolveServerRedirect returns null)", () => {
      const redirect = resolveServerRedirect(
        "https://shafskyaviation.in/",
        "shafskyaviation.in"
      );
      expect(redirect).toBeNull();
    });

    it("serves https://shafskyaviation.in/airports directly without redirect", () => {
      const redirect = resolveServerRedirect(
        "https://shafskyaviation.in/airports",
        "shafskyaviation.in"
      );
      expect(redirect).toBeNull();
    });

    it("redirects www.shafskyaviation.in to https://shafskyaviation.in/", () => {
      const redirect = resolveServerRedirect(
        "https://www.shafskyaviation.in/",
        "www.shafskyaviation.in"
      );
      expect(redirect).toBe("https://shafskyaviation.in/");
    });

    it("redirects www.shafskyaviation.com to https://shafskyaviation.com/", () => {
      const redirect = resolveServerRedirect(
        "https://www.shafskyaviation.com/",
        "www.shafskyaviation.com"
      );
      expect(redirect).toBe("https://shafskyaviation.com/");
    });

    it("redirects http://shafskyaviation.in/ to https://shafskyaviation.in/", () => {
      const redirect = resolveServerRedirect(
        "http://shafskyaviation.in/",
        "shafskyaviation.in"
      );
      expect(redirect).toBe("https://shafskyaviation.in/");
    });

    it("redirects http://shafskyaviation.com/ to https://shafskyaviation.com/", () => {
      const redirect = resolveServerRedirect(
        "http://shafskyaviation.com/",
        "shafskyaviation.com"
      );
      expect(redirect).toBe("https://shafskyaviation.com/");
    });

    it("preserves query strings during www to apex host normalization", () => {
      const redirectIn = resolveServerRedirect(
        "https://www.shafskyaviation.in/book?service=meet-greet&pax=2&airport=DEL",
        "www.shafskyaviation.in"
      );
      expect(redirectIn).toBe(
        "https://shafskyaviation.in/book?service=meet-greet&pax=2&airport=DEL"
      );

      const redirectCom = resolveServerRedirect(
        "https://www.shafskyaviation.com/book?service=meet-greet&pax=2&airport=DEL",
        "www.shafskyaviation.com"
      );
      expect(redirectCom).toBe(
        "https://shafskyaviation.com/book?service=meet-greet&pax=2&airport=DEL"
      );
    });
  });

  describe("Self-Redirect Prevention", () => {
    it("does NOT redirect canonical https://shafskyaviation.com/", () => {
      const redirect = resolveServerRedirect(
        "https://shafskyaviation.com/",
        "shafskyaviation.com"
      );
      expect(redirect).toBeNull();
    });

    it("does NOT redirect canonical public routes on shafskyaviation.com", () => {
      expect(
        resolveServerRedirect(
          "https://shafskyaviation.com/solutions/concierge",
          "shafskyaviation.com"
        )
      ).toBeNull();

      expect(
        resolveServerRedirect(
          "https://shafskyaviation.com/airports/DEL",
          "shafskyaviation.com"
        )
      ).toBeNull();

      expect(
        resolveServerRedirect(
          "https://shafskyaviation.com/contact",
          "shafskyaviation.com"
        )
      ).toBeNull();
    });

    it("does NOT redirect canonical public routes on shafskyaviation.in", () => {
      expect(
        resolveServerRedirect(
          "https://shafskyaviation.in/solutions/concierge",
          "shafskyaviation.in"
        )
      ).toBeNull();

      expect(
        resolveServerRedirect(
          "https://shafskyaviation.in/airports/DEL",
          "shafskyaviation.in"
        )
      ).toBeNull();

      expect(
        resolveServerRedirect(
          "https://shafskyaviation.in/contact",
          "shafskyaviation.in"
        )
      ).toBeNull();
    });
  });

  describe("Verified Legacy WordPress URL Mapping", () => {
    it("redirects /about-us/ to /about-us", () => {
      const redirect = resolveServerRedirect(
        "https://shafskyaviation.com/about-us/",
        "shafskyaviation.com"
      );
      expect(redirect).toBe("https://shafskyaviation.com/about-us");
    });

    it("redirects /contact-us/ and /contact/ to /contact", () => {
      expect(
        resolveServerRedirect("https://shafskyaviation.com/contact-us/", "shafskyaviation.com")
      ).toBe("https://shafskyaviation.com/contact");
      expect(
        resolveServerRedirect("https://shafskyaviation.com/contact/", "shafskyaviation.com")
      ).toBe("https://shafskyaviation.com/contact");
    });

    it("redirects legacy Meet & Greet URLs to /solutions/concierge", () => {
      expect(
        resolveServerRedirect("https://shafskyaviation.com/meet-and-greet/", "shafskyaviation.com")
      ).toBe("https://shafskyaviation.com/solutions/concierge");
      expect(
        resolveServerRedirect(
          "https://shafskyaviation.com/services/meet-and-greet/",
          "shafskyaviation.com"
        )
      ).toBe("https://shafskyaviation.com/solutions/concierge");
    });

    it("redirects legacy Transfer URLs to /solutions/transport", () => {
      expect(
        resolveServerRedirect("https://shafskyaviation.com/transfers/", "shafskyaviation.com")
      ).toBe("https://shafskyaviation.com/solutions/transport");
      expect(
        resolveServerRedirect(
          "https://shafskyaviation.com/airport-transfers/",
          "shafskyaviation.com"
        )
      ).toBe("https://shafskyaviation.com/solutions/transport");
      expect(
        resolveServerRedirect(
          "https://shafskyaviation.com/services/airport-transfers/",
          "shafskyaviation.com"
        )
      ).toBe("https://shafskyaviation.com/solutions/transport");
    });

    it("redirects legacy Hotel URLs to /solutions/hotels", () => {
      expect(
        resolveServerRedirect("https://shafskyaviation.com/hotels/", "shafskyaviation.com")
      ).toBe("https://shafskyaviation.com/solutions/hotels");
      expect(
        resolveServerRedirect(
          "https://shafskyaviation.com/services/hotel-booking/",
          "shafskyaviation.com"
        )
      ).toBe("https://shafskyaviation.com/solutions/hotels");
    });

    it("redirects legacy Charter URLs to /solutions/aviation", () => {
      expect(
        resolveServerRedirect("https://shafskyaviation.com/charter/", "shafskyaviation.com")
      ).toBe("https://shafskyaviation.com/solutions/aviation");
      expect(
        resolveServerRedirect(
          "https://shafskyaviation.com/private-charter/",
          "shafskyaviation.com"
        )
      ).toBe("https://shafskyaviation.com/solutions/aviation");
    });

    it("redirects legacy cancellation-refund URLs to /cancellation-and-refund", () => {
      expect(
        resolveServerRedirect(
          "https://shafskyaviation.com/cancellation-refund/",
          "shafskyaviation.com"
        )
      ).toBe("https://shafskyaviation.com/cancellation-and-refund");
      expect(
        resolveServerRedirect(
          "https://shafskyaviation.com/cancellation-refund",
          "shafskyaviation.com"
        )
      ).toBe("https://shafskyaviation.com/cancellation-and-refund");
    });
  });

  describe("Single-Hop Resolution (Preventing Redirect Chains)", () => {
    it("resolves both .in host and legacy path in a single 301 hop with query preservation", () => {
      const redirect = resolveServerRedirect(
        "http://shafskyaviation.in/services/meet-and-greet/?utm_source=google&pax=3",
        "shafskyaviation.in"
      );
      expect(redirect).toBe(
        "https://shafskyaviation.in/solutions/concierge?utm_source=google&pax=3"
      );
    });

    it("resolves www.shafskyaviation.in and legacy path in a single hop", () => {
      const redirect = resolveServerRedirect(
        "https://www.shafskyaviation.in/airport-transfers/",
        "www.shafskyaviation.in"
      );
      expect(redirect).toBe("https://shafskyaviation.in/solutions/transport");
    });

    it("resolves www.shafskyaviation.com and legacy path in a single hop", () => {
      const redirect = resolveServerRedirect(
        "https://www.shafskyaviation.com/airport-transfers/",
        "www.shafskyaviation.com"
      );
      expect(redirect).toBe("https://shafskyaviation.com/solutions/transport");
    });
  });

  describe("Airport Route Casing and Trailing Slashes", () => {
    it("normalizes lowercase airport codes to uppercase", () => {
      expect(
        resolveServerRedirect("https://shafskyaviation.com/airports/del", "shafskyaviation.com")
      ).toBe("https://shafskyaviation.com/airports/DEL");
      expect(
        resolveServerRedirect("https://shafskyaviation.com/airports/bom", "shafskyaviation.com")
      ).toBe("https://shafskyaviation.com/airports/BOM");
    });

    it("normalizes trailing slash on airport code", () => {
      expect(
        resolveServerRedirect("https://shafskyaviation.com/airports/DEL/", "shafskyaviation.com")
      ).toBe("https://shafskyaviation.com/airports/DEL");
      expect(
        resolveServerRedirect("https://shafskyaviation.com/airports/del/", "shafskyaviation.com")
      ).toBe("https://shafskyaviation.com/airports/DEL");
    });

    it("does not redirect already canonical airport URL", () => {
      expect(
        resolveServerRedirect("https://shafskyaviation.com/airports/DEL", "shafskyaviation.com")
      ).toBeNull();
    });
  });

  describe("Unknown Legacy URLs and Catch-All Safety", () => {
    it("never catch-alls unknown legacy WordPress URLs to homepage", () => {
      UNMAPPED_LEGACY_PATTERNS.forEach((pattern) => {
        const redirect = resolveServerRedirect(
          `https://shafskyaviation.com${pattern}`,
          "shafskyaviation.com"
        );
        // Should NOT redirect to "/"
        expect(redirect).not.toBe("https://shafskyaviation.com/");
      });
    });

    it("does not redirect unknown non-existent routes to homepage", () => {
      const redirect = resolveServerRedirect(
        "https://shafskyaviation.com/completely-random-page-xyz",
        "shafskyaviation.com"
      );
      expect(redirect).toBeNull();
    });

    it("does not redirect unknown airport codes to homepage", () => {
      const redirect = resolveServerRedirect(
        "https://shafskyaviation.com/airports/ZZZ",
        "shafskyaviation.com"
      );
      expect(redirect).toBeNull();
    });
  });

  describe("Server Fetch Entry Integration", () => {
    it("returns HTTP 301 before SSR when incoming host is insecure http://shafskyaviation.in", async () => {
      const request = new Request("http://shafskyaviation.in/airports", {
        headers: { Host: "shafskyaviation.in" },
      });
      const response = await serverEntry.fetch(request, {}, {});
      expect(response.status).toBe(301);
      expect(response.headers.get("Location")).toBe("https://shafskyaviation.in/airports");
      expect(response.headers.get("Cache-Control")).toContain("public");
    });

    it("returns HTTP 301 before SSR when incoming host is www.shafskyaviation.in", async () => {
      const request = new Request("https://www.shafskyaviation.in/airports", {
        headers: { Host: "www.shafskyaviation.in" },
      });
      const response = await serverEntry.fetch(request, {}, {});
      expect(response.status).toBe(301);
      expect(response.headers.get("Location")).toBe("https://shafskyaviation.in/airports");
      expect(response.headers.get("Cache-Control")).toContain("public");
    });

    it("returns HTTP 301 for legacy path with query parameter", async () => {
      const request = new Request(
        "https://shafskyaviation.com/services/meet-and-greet/?ref=partner",
        {
          headers: { Host: "shafskyaviation.com" },
        }
      );
      const response = await serverEntry.fetch(request, {}, {});
      expect(response.status).toBe(301);
      expect(response.headers.get("Location")).toBe(
        "https://shafskyaviation.com/solutions/concierge?ref=partner"
      );
    });

    it("does NOT return 301 when HTTPS request reaches Node as HTTP behind Hostinger proxy (preventing ERR_TOO_MANY_REDIRECTS)", async () => {
      // Simulates Hostinger CDN / reverse proxy terminating HTTPS and forwarding to Node over HTTP
      const request = new Request("http://shafskyaviation.com/", {
        headers: {
          Host: "shafskyaviation.com",
          "X-Forwarded-Proto": "https",
          "X-Forwarded-Host": "shafskyaviation.com",
        },
      });
      const response = await serverEntry.fetch(request, {}, {});
      // Must NOT return a redirect loop response (status 301)
      expect(response.status).toBe(200);
      expect(await response.text()).toBe("OK");
      expect(response.headers.get("X-Frame-Options")).toBe("DENY");
    });

    it("does NOT return 301 when HTTPS request reaches Node on 127.0.0.1 internal port behind proxy", async () => {
      // Simulates proxy forwarding to Node upstream at 127.0.0.1:3000
      const request = new Request("http://127.0.0.1:3000/airports/DEL", {
        headers: {
          Host: "127.0.0.1:3000",
          "X-Forwarded-Host": "shafskyaviation.com",
          "X-Forwarded-Proto": "https",
        },
      });
      const response = await serverEntry.fetch(request, {}, {});
      expect(response.status).toBe(200);
      expect(await response.text()).toBe("OK");
    });

    it("returns 301 with Vary headers when genuinely insecure HTTP request is received", async () => {
      const request = new Request("http://shafskyaviation.com/", {
        headers: {
          Host: "shafskyaviation.com",
          "X-Forwarded-Proto": "http",
        },
      });
      const response = await serverEntry.fetch(request, {}, {});
      expect(response.status).toBe(301);
      expect(response.headers.get("Location")).toBe("https://shafskyaviation.com/");
      expect(response.headers.get("Vary")).toContain("X-Forwarded-Proto");
      expect(response.headers.get("Vary")).toContain("X-Forwarded-Host");
    });
  });

  describe("Client Protocol Extraction from Proxy Headers", () => {
    it("extracts single x-forwarded-proto header", () => {
      expect(extractClientProtocol({ "x-forwarded-proto": "https" })).toBe("https");
      expect(extractClientProtocol({ "x-forwarded-proto": "http" })).toBe("http");
      expect(extractClientProtocol(new Headers({ "x-forwarded-proto": "https" }))).toBe("https");
    });

    it("extracts leftmost proto from multi-hop comma-separated x-forwarded-proto", () => {
      expect(extractClientProtocol({ "x-forwarded-proto": "https, http" })).toBe("https");
      expect(extractClientProtocol({ "x-forwarded-proto": "http, https" })).toBe("http");
      expect(extractClientProtocol({ "x-forwarded-proto": "https,https" })).toBe("https");
    });

    it("extracts scheme from Cloudflare cf-visitor JSON header", () => {
      expect(extractClientProtocol({ "cf-visitor": '{"scheme":"https"}' })).toBe("https");
      expect(extractClientProtocol({ "cf-visitor": '{"scheme":"http"}' })).toBe("http");
    });

    it("extracts https from x-forwarded-ssl: on", () => {
      expect(extractClientProtocol({ "x-forwarded-ssl": "on" })).toBe("https");
      expect(extractClientProtocol({ "x-forwarded-ssl": "ON" })).toBe("https");
      expect(extractClientProtocol({ "x-forwarded-ssl": "1" })).toBe("https");
    });

    it("extracts https from front-end-https: on", () => {
      expect(extractClientProtocol({ "front-end-https": "on" })).toBe("https");
    });

    it("extracts proto from x-url-scheme", () => {
      expect(extractClientProtocol({ "x-url-scheme": "https" })).toBe("https");
      expect(extractClientProtocol({ "x-url-scheme": "http" })).toBe("http");
    });

    it("extracts proto from RFC 7239 Forwarded header", () => {
      expect(
        extractClientProtocol({ forwarded: "for=192.0.2.60;proto=https;by=203.0.113.43" })
      ).toBe("https");
      expect(
        extractClientProtocol({ forwarded: "proto=http" })
      ).toBe("http");
    });

    it("falls back to URL scheme when headers are absent", () => {
      expect(extractClientProtocol(null, "https://shafskyaviation.com/")).toBe("https");
      expect(extractClientProtocol(null, "http://shafskyaviation.com/")).toBe("http");
      expect(extractClientProtocol({}, "https://shafskyaviation.com/")).toBe("https");
    });

    it("defaults to http when neither headers nor URL are provided", () => {
      expect(extractClientProtocol(null, null)).toBe("http");
    });
  });

  describe("Reverse Proxy & Hostinger CDN HTTPS Requests (Loop Prevention)", () => {
    it("does NOT redirect canonical https://shafskyaviation.com/ when reaching Node as HTTP with x-forwarded-proto: https", () => {
      const redirect = resolveServerRedirect(
        "http://shafskyaviation.com/",
        "shafskyaviation.com",
        "https"
      );
      expect(redirect).toBeNull();
    });

    it("does NOT redirect canonical routes when reaching Node as HTTP with x-forwarded-proto: https", () => {
      expect(
        resolveServerRedirect(
          "http://shafskyaviation.com/solutions/concierge",
          "shafskyaviation.com",
          "https"
        )
      ).toBeNull();

      expect(
        resolveServerRedirect(
          "http://shafskyaviation.com/airports/DEL",
          "shafskyaviation.com",
          "https"
        )
      ).toBeNull();

      expect(
        resolveServerRedirect(
          "http://shafskyaviation.com/contact",
          "shafskyaviation.com",
          "https"
        )
      ).toBeNull();
    });

    it("does NOT redirect when internal URL is 127.0.0.1:3000 but x-forwarded-host is shafskyaviation.com and proto is https", () => {
      const redirect = resolveServerRedirect(
        "http://127.0.0.1:3000/",
        "shafskyaviation.com",
        "https"
      );
      expect(redirect).toBeNull();
    });

    it("does NOT redirect when multi-hop proxy sends x-forwarded-proto: https, http", () => {
      const redirect = resolveServerRedirect(
        "http://shafskyaviation.com/",
        "shafskyaviation.com",
        "https, http"
      );
      expect(redirect).toBeNull();
    });

    it("does NOT redirect when Headers object with cf-visitor scheme: https is passed", () => {
      const headers = new Headers({
        "cf-visitor": '{"scheme":"https"}',
      });
      const redirect = resolveServerRedirect(
        "http://shafskyaviation.com/",
        "shafskyaviation.com",
        headers
      );
      expect(redirect).toBeNull();
    });

    it("does NOT redirect https://shafskyaviation.in/ when reaching Node as HTTP behind proxy", () => {
      const redirect = resolveServerRedirect(
        "http://shafskyaviation.in/",
        "shafskyaviation.in",
        "https"
      );
      expect(redirect).toBeNull();
    });
  });

  describe("Insecure HTTP-to-HTTPS Upgrades Behind Proxy", () => {
    it("redirects insecure HTTP to HTTPS on shafskyaviation.com", () => {
      const redirect = resolveServerRedirect(
        "http://shafskyaviation.com/",
        "shafskyaviation.com",
        "http"
      );
      expect(redirect).toBe("https://shafskyaviation.com/");
    });

    it("redirects insecure HTTP to HTTPS on shafskyaviation.in", () => {
      const redirect = resolveServerRedirect(
        "http://shafskyaviation.in/",
        "shafskyaviation.in",
        "http"
      );
      expect(redirect).toBe("https://shafskyaviation.in/");
    });

    it("preserves query parameters during HTTP-to-HTTPS redirect", () => {
      const redirect = resolveServerRedirect(
        "http://shafskyaviation.com/book?service=concierge&airport=DEL&step=2",
        "shafskyaviation.com",
        "http"
      );
      expect(redirect).toBe(
        "https://shafskyaviation.com/book?service=concierge&airport=DEL&step=2"
      );
    });
  });

  describe("Proxy www Normalization", () => {
    it("normalizes www.shafskyaviation.com to https://shafskyaviation.com/ behind HTTPS proxy", () => {
      const redirect = resolveServerRedirect(
        "http://www.shafskyaviation.com/",
        "www.shafskyaviation.com",
        "https"
      );
      expect(redirect).toBe("https://shafskyaviation.com/");
    });

    it("normalizes www.shafskyaviation.com to https://shafskyaviation.com/ from insecure HTTP in a single hop", () => {
      const redirect = resolveServerRedirect(
        "http://www.shafskyaviation.com/",
        "www.shafskyaviation.com",
        "http"
      );
      expect(redirect).toBe("https://shafskyaviation.com/");
    });

    it("normalizes www.shafskyaviation.in to https://shafskyaviation.in/ behind HTTPS proxy without cross-domain redirect", () => {
      const redirect = resolveServerRedirect(
        "http://www.shafskyaviation.in/",
        "www.shafskyaviation.in",
        "https"
      );
      expect(redirect).toBe("https://shafskyaviation.in/");
    });

    it("preserves query parameters during www normalization behind proxy", () => {
      const redirect = resolveServerRedirect(
        "http://www.shafskyaviation.com/contact?utm_campaign=winter2026",
        "www.shafskyaviation.com",
        "https"
      );
      expect(redirect).toBe("https://shafskyaviation.com/contact?utm_campaign=winter2026");
    });
  });

  describe("Proxy Legacy SEO Route Normalization", () => {
    it("redirects legacy WordPress route /about-us/ to /about-us behind proxy", () => {
      const redirect = resolveServerRedirect(
        "http://shafskyaviation.com/about-us/",
        "shafskyaviation.com",
        "https"
      );
      expect(redirect).toBe("https://shafskyaviation.com/about-us");
    });

    it("redirects legacy service URL /services/meet-and-greet/ to /solutions/concierge behind proxy", () => {
      const redirect = resolveServerRedirect(
        "http://shafskyaviation.com/services/meet-and-greet/",
        "shafskyaviation.com",
        "https"
      );
      expect(redirect).toBe("https://shafskyaviation.com/solutions/concierge");
    });

    it("normalizes www, legacy route, and query string in a single hop behind proxy", () => {
      const redirect = resolveServerRedirect(
        "http://www.shafskyaviation.com/services/meet-and-greet/?ref=promo",
        "www.shafskyaviation.com",
        "https"
      );
      expect(redirect).toBe("https://shafskyaviation.com/solutions/concierge?ref=promo");
    });

    it("normalizes airport lowercase code and trailing slash behind proxy", () => {
      const redirect = resolveServerRedirect(
        "http://shafskyaviation.com/airports/del/",
        "shafskyaviation.com",
        "https"
      );
      expect(redirect).toBe("https://shafskyaviation.com/airports/DEL");
    });

    it("does not redirect unmapped legacy admin routes behind proxy", () => {
      UNMAPPED_LEGACY_PATTERNS.forEach((pattern) => {
        const redirect = resolveServerRedirect(
          `http://shafskyaviation.com${pattern}`,
          "shafskyaviation.com",
          "https"
        );
        expect(redirect).not.toBe("https://shafskyaviation.com/");
      });
    });
  });
});
