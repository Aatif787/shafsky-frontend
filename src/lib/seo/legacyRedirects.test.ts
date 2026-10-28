import { describe, expect, it } from "vitest";
import { resolveServerRedirect, VERIFIED_LEGACY_REDIRECTS } from "./legacyRedirects";

describe("Google Search Console legacy URL redirects", () => {
  it("includes the legacy 404 paths with relevant current destinations", () => {
    expect(VERIFIED_LEGACY_REDIRECTS["/new-delhi-airport-meet-and-greet-service/"]).toBe("/airports/DEL");
    expect(VERIFIED_LEGACY_REDIRECTS["/product/mumbai-airport-international-arrival-services/"]).toBe("/airports/BOM");
    expect(VERIFIED_LEGACY_REDIRECTS["/product-category/hotel/"]).toBe("/solutions/hotels");
    expect(VERIFIED_LEGACY_REDIRECTS["/castle-blue-hotel-new-delhi/"]).toBe("/hotels/castle-blue");
    expect(Object.keys(VERIFIED_LEGACY_REDIRECTS).filter((path) => path.startsWith("/product/")).length).toBeGreaterThan(50);
  });

  it("returns a permanent redirect for mapped legacy paths and preserves query strings", () => {
    const target = resolveServerRedirect(
      "https://shafskyaviation.com/product/new-delhi-airport-transit-services/?utm_source=legacy",
      "shafskyaviation.com",
      "https",
    );
    expect(target).toBe("https://shafskyaviation.com/airports/DEL?utm_source=legacy");
  });

  it("does not send obsolete job listings to an unrelated page", () => {
    expect(
      resolveServerRedirect(
        "https://shafskyaviation.com/jobs/guest-relationship-executive/",
        "shafskyaviation.com",
        "https",
      ),
    ).toBeNull();
  });

  it("normalizes airport code casing and trailing slash in one redirect", () => {
    expect(
      resolveServerRedirect("https://shafskyaviation.com/airports/del/", "shafskyaviation.com", "https"),
    ).toBe("https://shafskyaviation.com/airports/DEL");
  });
});
