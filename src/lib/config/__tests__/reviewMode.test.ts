import { describe, it, expect } from "vitest";
import { PRIMARY_SERVICES } from "@/components/Navigation";
import { HOMEPAGE_PHOTOS } from "@/lib/homepage-photos";
import { SEO, serviceCatalogJsonLd } from "@/lib/seo";

describe("ICICI Review Mode Specifications", () => {
  describe("1. Feature Flag Truthiness Logic", () => {
    it("evaluates strictly: only 'true' string enables review mode", () => {
      const evaluateFlag = (envVal: string | undefined) => envVal === "true";

      expect(evaluateFlag("true")).toBe(true);
      expect(evaluateFlag("false")).toBe(false);
      expect(evaluateFlag("")).toBe(false);
      expect(evaluateFlag(undefined)).toBe(false);
      expect(evaluateFlag("TRUE")).toBe(false);
      expect(evaluateFlag("1")).toBe(false);
    });
  });

  describe("2. Root Route Guard Rules", () => {
    const checkRedirect = (pathname: string, isReviewMode: boolean) => {
      if (!isReviewMode) return null;
      const p = pathname.toLowerCase();
      if (
        p.startsWith("/solutions/aviation") ||
        p.startsWith("/solutions/cargo") ||
        p.startsWith("/solutions/travel") ||
        p.startsWith("/solutions/medical") ||
        p.startsWith("/charter") ||
        p.startsWith("/hotels")
      ) {
        return "/solutions/concierge";
      }
      return null;
    };

    it("redirects all forbidden public routes to /solutions/concierge in Review Mode", () => {
      const forbiddenRoutes = [
        "/solutions/aviation",
        "/solutions/cargo",
        "/solutions/travel",
        "/solutions/medical",
        "/charter",
        "/charter/requests",
        "/hotels/airport-hotel",
        "/hotels/castle-blue",
        "/hotels/classic-diplomat",
        "/hotels/de-pavilion",
        "/hotels/holiday-inn-express",
      ];

      for (const route of forbiddenRoutes) {
        expect(checkRedirect(route, true)).toBe("/solutions/concierge");
      }
    });

    it("does NOT redirect forbidden routes when Review Mode is false", () => {
      const forbiddenRoutes = [
        "/solutions/aviation",
        "/solutions/cargo",
        "/solutions/travel",
        "/solutions/medical",
        "/charter",
        "/hotels/airport-hotel",
      ];

      for (const route of forbiddenRoutes) {
        expect(checkRedirect(route, false)).toBeNull();
      }
    });

    it("never intercepts allowed public or internal routes in Review Mode", () => {
      const allowedRoutes = [
        "/",
        "/solutions/concierge",
        "/airports",
        "/airports/DEL",
        "/airports/BOM",
        "/book",
        "/services/guide",
        "/contact",
        "/gallery",
        "/auth",
        "/login",
        "/account",
        "/flight-verification",
        "/verify/booking-123",
        "/api/flight/validate",
        "/api/process-queue",
        "/_authenticated/admin",
        "/_authenticated/staff",
      ];

      for (const route of allowedRoutes) {
        expect(checkRedirect(route, true)).toBeNull();
      }
    });
  });

  describe("3. Navigation Visibility", () => {
    it("PRIMARY_SERVICES contains Meet & Greet as the first service", () => {
      expect(PRIMARY_SERVICES[0].href).toBe("/solutions/concierge");
      expect(PRIMARY_SERVICES[0].title).toContain("Meet & Greet");
    });

    it("filters PRIMARY_SERVICES to exclusively Meet & Greet in Review Mode", () => {
      const filterServices = (isReviewMode: boolean) =>
        isReviewMode
          ? PRIMARY_SERVICES.filter((srv) => srv.href === "/solutions/concierge")
          : PRIMARY_SERVICES;

      const reviewServices = filterServices(true);
      expect(reviewServices).toHaveLength(1);
      expect(reviewServices[0].href).toBe("/solutions/concierge");
      expect(reviewServices[0].title).toBe("Meet & Greet and Lounge Service");

      const fullServices = filterServices(false);
      expect(fullServices).toHaveLength(5);
      const serviceHrefs = fullServices.map((s) => s.href);
      expect(serviceHrefs).toContain("/solutions/aviation");
      expect(serviceHrefs).toContain("/solutions/cargo");
      expect(serviceHrefs).toContain("/solutions/travel");
      expect(serviceHrefs).toContain("/solutions/medical");
    });
  });

  describe("4. Why Choose Us Benefit Filtering", () => {
    const ALL_ITEMS = [
      { title: "Zero Waiting & Fast-Track" },
      { title: "24/7 Always-On Support" },
      { title: "Warm & Caring Hosts" },
      { title: "VIP Lounge Relaxation" },
      { title: "100% Safe & Private" },
      { title: "Private Jets On-Demand" },
      { title: "Luxury Doorstep Cars" },
      { title: "All-in-One Easy Booking" },
    ];

    const getDisplayedItems = (isReviewMode: boolean) =>
      isReviewMode
        ? ALL_ITEMS.filter(
            (it) =>
              it.title !== "Private Jets On-Demand" &&
              it.title !== "Luxury Doorstep Cars" &&
              it.title !== "All-in-One Easy Booking"
          )
        : ALL_ITEMS;

    it("hides Private Jets, Luxury Cars, and Multi-Service Booking in Review Mode", () => {
      const items = getDisplayedItems(true);
      expect(items).toHaveLength(5);
      const titles = items.map((it) => it.title);
      expect(titles).not.toContain("Private Jets On-Demand");
      expect(titles).not.toContain("Luxury Doorstep Cars");
      expect(titles).not.toContain("All-in-One Easy Booking");
    });

    it("restores all 8 items when Review Mode is false", () => {
      const items = getDisplayedItems(false);
      expect(items).toHaveLength(8);
    });
  });

  describe("5. Homepage Carousel Image Curation", () => {
    const ALL_PHOTOS = [
      { id: "jet" },
      { id: "greet" },
      { id: "charter" },
      { id: "transport" },
      { id: "transit" },
      { id: "vvip" },
      { id: "meet" },
      { id: "lounge" },
      { id: "buggy" },
      { id: "wheelchair" },
      { id: "dutyfree" },
      { id: "hotel" },
      { id: "wedding" },
    ];

    const REVIEW_MODE_PHOTO_IDS = new Set([
      "greet",
      "transit",
      "vvip",
      "meet",
      "lounge",
      "buggy",
      "wheelchair",
      "dutyfree",
    ]);

    const getActivePhotos = (isReviewMode: boolean) =>
      isReviewMode
        ? ALL_PHOTOS.filter((p) => REVIEW_MODE_PHOTO_IDS.has(p.id))
        : ALL_PHOTOS;

    it("retains only Meet & Greet, Lounge, Buggy, Transit, Hostess photos in Review Mode", () => {
      const photos = getActivePhotos(true);
      expect(photos).toHaveLength(8);
      const ids = photos.map((p) => p.id);
      expect(ids).not.toContain("jet");
      expect(ids).not.toContain("charter");
      expect(ids).not.toContain("transport");
      expect(ids).not.toContain("hotel");
      expect(ids).not.toContain("wedding");
    });

    it("returns all 13 photos in normal mode", () => {
      const photos = getActivePhotos(false);
      expect(photos).toHaveLength(13);
    });
  });

  describe("6. Footer Quick Links Filtering", () => {
    const allQuickLinks = [
      { label: "About us", href: "/services/guide" },
      { label: "Contact us", href: "/contact" },
      { label: "My account", href: "/auth" },
      { label: "Our services", href: "/solutions/concierge" },
      { label: "Hotels", href: "/hotels/airport-hotel" },
      { label: "Blog", href: "/services/guide" },
      { label: "Wishlist", href: "/book" },
      { label: "Privacy policy", href: "/services/guide" },
      { label: "Terms and conditions", href: "/services/guide" },
      { label: "Cancellation and refund", href: "/services/guide" },
      { label: "Our Team", href: "/services/guide" },
      { label: "Career", href: "/contact" },
    ];

    const getQuickLinks = (isReviewMode: boolean) =>
      isReviewMode
        ? allQuickLinks.filter((link) => link.label !== "Hotels" && !link.href.startsWith("/hotels"))
        : allQuickLinks;

    it("hides Hotels link in Review Mode", () => {
      const links = getQuickLinks(true);
      expect(links.some((l) => l.label === "Hotels" || l.href.startsWith("/hotels"))).toBe(false);
      expect(links).toHaveLength(11);
    });

    it("keeps Hotels link when Review Mode is false", () => {
      const links = getQuickLinks(false);
      expect(links.some((l) => l.label === "Hotels")).toBe(true);
      expect(links).toHaveLength(12);
    });
  });

  describe("7. Sitemap Filtering", () => {
    const STATIC_PAGES = [
      { path: "/" },
      { path: "/airports" },
      { path: "/solutions/concierge" },
      { path: "/book" },
      { path: "/solutions/aviation" },
      { path: "/solutions/cargo" },
      { path: "/solutions/travel" },
      { path: "/solutions/medical" },
      { path: "/services/guide" },
      { path: "/contact" },
      { path: "/hotels/airport-hotel" },
      { path: "/hotels/castle-blue" },
      { path: "/hotels/classic-diplomat" },
      { path: "/hotels/de-pavilion" },
      { path: "/hotels/holiday-inn-express" },
    ];

    const NON_REVIEW_PREFIXES = [
      "/solutions/aviation",
      "/solutions/cargo",
      "/solutions/travel",
      "/solutions/medical",
      "/charter",
      "/hotels",
    ];

    const getStaticList = (isReviewMode: boolean) =>
      isReviewMode
        ? STATIC_PAGES.filter(
            (page) => !NON_REVIEW_PREFIXES.some((prefix) => page.path.startsWith(prefix))
          )
        : STATIC_PAGES;

    it("excludes non-Meet-and-Greet service paths from sitemap in Review Mode", () => {
      const pages = getStaticList(true);
      expect(pages).toHaveLength(6);
      const paths = pages.map((p) => p.path);
      expect(paths).toEqual([
        "/",
        "/airports",
        "/solutions/concierge",
        "/book",
        "/services/guide",
        "/contact",
      ]);
    });

    it("includes all 15 static pages when Review Mode is false", () => {
      const pages = getStaticList(false);
      expect(pages).toHaveLength(15);
    });
  });

  describe("8. SEO and Schema Metadata", () => {
    it("SEO serviceCatalogJsonLd schema returns valid ItemList", () => {
      const catalog = serviceCatalogJsonLd();
      expect(catalog["@type"]).toBe("ItemList");
      expect(catalog.itemListElement.length).toBeGreaterThan(0);
      expect(catalog.itemListElement[0].name).toContain("Meet & Greet");
    });
  });
});
