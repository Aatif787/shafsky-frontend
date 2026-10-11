import { describe, expect, it } from "vitest";
import {
  resolveServerRedirect,
  VERIFIED_LEGACY_REDIRECTS,
  UNMAPPED_LEGACY_PATTERNS,
  CANONICAL_HOST,
} from "../legacyRedirects";
import serverEntry from "@/server";

describe("Domain Migration Server Redirects", () => {
  describe("Host Normalization (.in and www to .com)", () => {
    it("redirects shafskyaviation.in root to https://shafskyaviation.com/", () => {
      const redirect = resolveServerRedirect("http://shafskyaviation.in/", "shafskyaviation.in");
      expect(redirect).toBe("https://shafskyaviation.com/");
    });

    it("redirects https://shafskyaviation.in/airports to https://shafskyaviation.com/airports", () => {
      const redirect = resolveServerRedirect(
        "https://shafskyaviation.in/airports",
        "shafskyaviation.in"
      );
      expect(redirect).toBe("https://shafskyaviation.com/airports");
    });

    it("redirects www.shafskyaviation.com to https://shafskyaviation.com/", () => {
      const redirect = resolveServerRedirect(
        "https://www.shafskyaviation.com/",
        "www.shafskyaviation.com"
      );
      expect(redirect).toBe("https://shafskyaviation.com/");
    });

    it("redirects www.shafskyaviation.in to https://shafskyaviation.com/", () => {
      const redirect = resolveServerRedirect(
        "https://www.shafskyaviation.in/",
        "www.shafskyaviation.in"
      );
      expect(redirect).toBe("https://shafskyaviation.com/");
    });

    it("preserves query strings during host normalization", () => {
      const redirect = resolveServerRedirect(
        "https://shafskyaviation.in/book?service=meet-greet&pax=2&airport=DEL",
        "shafskyaviation.in"
      );
      expect(redirect).toBe(
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
        "https://shafskyaviation.com/solutions/concierge?utm_source=google&pax=3"
      );
    });

    it("resolves www.shafskyaviation.in and legacy path in a single hop", () => {
      const redirect = resolveServerRedirect(
        "https://www.shafskyaviation.in/airport-transfers/",
        "www.shafskyaviation.in"
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
    it("returns HTTP 301 before SSR when incoming host is shafskyaviation.in", async () => {
      const request = new Request("http://shafskyaviation.in/airports", {
        headers: { Host: "shafskyaviation.in" },
      });
      const response = await serverEntry.fetch(request, {}, {});
      expect(response.status).toBe(301);
      expect(response.headers.get("Location")).toBe("https://shafskyaviation.com/airports");
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
  });
});
