import { describe, expect, it } from "vitest";
import { pageHead } from "@/lib/seo";
import { Route as sitemapRoute } from "@/routes/sitemap[.]xml";
import { Route as robotsRoute } from "@/routes/robots[.]txt";

describe("SEO Canonical, Sitemap, and Robots.txt Verification", () => {
  describe("pageHead Canonical Tags", () => {
    it("generates absolute, self-referencing .com canonical link", () => {
      const head = pageHead({
        title: "Test Page",
        description: "Test description",
        path: "/solutions/concierge",
      });

      const canonicalLink = head.links.find((l) => l.rel === "canonical");
      expect(canonicalLink).toBeDefined();
      expect(canonicalLink?.href).toBe("https://shafskyaviation.com/solutions/concierge");
    });

    it("does NOT generate .in hreflang alternate links", () => {
      const head = pageHead({
        title: "Test Page",
        description: "Test description",
        path: "/airports/DEL",
      });

      const inAlternate = head.links.find(
        (l) => l.rel === "alternate" && "hrefLang" in l && (l as any).hrefLang === "en-IN"
      );
      expect(inAlternate).toBeUndefined();

      // Ensure no link has .in in its href
      head.links.forEach((l) => {
        expect(l.href).not.toContain("shafskyaviation.in");
      });
    });

    it("generates open graph URL pointing to .com", () => {
      const head = pageHead({
        title: "Test Page",
        description: "Test description",
        path: "/contact",
      });

      const ogUrl = head.meta.find((m) => "property" in m && m.property === "og:url");
      expect(ogUrl).toBeDefined();
      expect((ogUrl as any).content).toBe("https://shafskyaviation.com/contact");
    });
  });

  describe("Dynamic Sitemap (sitemap.xml)", () => {
    it("emits only valid, canonical https://shafskyaviation.com URLs", async () => {
      const handler = (sitemapRoute as any).options?.server?.handlers?.GET;
      expect(handler).toBeDefined();

      const response: Response = await handler();
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("application/xml");

      const xml = await response.text();

      // Must not contain any .in domain references
      expect(xml).not.toContain("shafskyaviation.in");

      // Must not contain any alternate hreflang tags to .in
      expect(xml).not.toContain('hreflang="en-IN"');

      // Must contain canonical .com URLs for indexable public pages
      expect(xml).toContain("<loc>https://shafskyaviation.com/</loc>");
      expect(xml).toContain("<loc>https://shafskyaviation.com/about-us</loc>");
      expect(xml).toContain("<loc>https://shafskyaviation.com/contact</loc>");
      expect(xml).toContain("<loc>https://shafskyaviation.com/privacy-policy</loc>");
      expect(xml).toContain("<loc>https://shafskyaviation.com/terms-and-conditions</loc>");
      expect(xml).toContain("<loc>https://shafskyaviation.com/cancellation-and-refund</loc>");
      expect(xml).toContain("<loc>https://shafskyaviation.com/solutions/concierge</loc>");
      expect(xml).toContain("<loc>https://shafskyaviation.com/solutions/aviation</loc>");
      expect(xml).toContain("<loc>https://shafskyaviation.com/solutions/transport</loc>");
      expect(xml).toContain("<loc>https://shafskyaviation.com/solutions/hotels</loc>");
      expect(xml).toContain("<loc>https://shafskyaviation.com/solutions/special-services</loc>");
      expect(xml).toContain("<loc>https://shafskyaviation.com/airports/DEL</loc>");

      // Must NOT contain non-indexable transactional pages
      expect(xml).not.toContain("/book/payment-result");
      expect(xml).not.toContain("/flight-verification");
      expect(xml).not.toContain("/verify");
      expect(xml).not.toContain("/account");
      expect(xml).not.toContain("/dashboard");
      expect(xml).not.toContain("/admin");
    });
  });

  describe("Robots.txt", () => {
    it("references only the .com sitemap and blocks private/transactional routes", async () => {
      const handler = (robotsRoute as any).options?.server?.handlers?.GET;
      expect(handler).toBeDefined();

      const response: Response = await handler();
      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("text/plain");

      const text = await response.text();

      // References ONLY .com sitemap and llms.txt
      expect(text).toContain("Sitemap: https://shafskyaviation.com/sitemap.xml");
      expect(text).toContain("LLMs-Txt: https://shafskyaviation.com/llms.txt");

      // Does NOT reference any .in domains
      expect(text).not.toContain("shafskyaviation.in");

      // Disallows private and transactional routes
      expect(text).toContain("Disallow: /api/");
      expect(text).toContain("Disallow: /auth");
      expect(text).toContain("Disallow: /account");
      expect(text).toContain("Disallow: /login");
      expect(text).toContain("Disallow: /dashboard");
      expect(text).toContain("Disallow: /admin");
      expect(text).toContain("Disallow: /super-admin");
      expect(text).toContain("Disallow: /_authenticated/");
      expect(text).toContain("Disallow: /verify/");
      expect(text).toContain("Disallow: /flight-verification");
      expect(text).toContain("Disallow: /book/payment-result");

      // Allows public pages
      expect(text).toContain("Allow: /");
    });
  });
});
