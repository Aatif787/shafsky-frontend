import { createFileRoute } from "@tanstack/react-router";
import type { } from "@tanstack/react-start";
import { AIRPORT_REGISTRY } from "@/data/airportRegistry";
import { BUSINESS } from "@/lib/constants";
import { ICICI_REVIEW_MODE } from "@/lib/config/reviewMode";

const COM = BUSINESS.BASE_URL;
const TODAY = new Date().toISOString().split("T")[0];

export interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  lastmod?: string;
}

export const STATIC_PAGES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/airports", changefreq: "weekly", priority: "0.9" },
  { path: "/solutions/concierge", changefreq: "weekly", priority: "0.9" },
  { path: "/book", changefreq: "weekly", priority: "0.8" },
  { path: "/solutions/aviation", changefreq: "monthly", priority: "0.8" },
  { path: "/solutions/transport", changefreq: "monthly", priority: "0.7" },
  { path: "/solutions/hotels", changefreq: "monthly", priority: "0.7" },
  { path: "/solutions/special-services", changefreq: "monthly", priority: "0.6" },
  { path: "/services/guide", changefreq: "monthly", priority: "0.7" },
  { path: "/about-us", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/privacy-policy", changefreq: "monthly", priority: "0.5" },
  { path: "/terms-and-conditions", changefreq: "monthly", priority: "0.5" },
  { path: "/cancellation-and-refund", changefreq: "monthly", priority: "0.5" },
  { path: "/hotels/airport-hotel", changefreq: "monthly", priority: "0.6" },
  { path: "/hotels/castle-blue", changefreq: "monthly", priority: "0.5" },
  { path: "/hotels/classic-diplomat", changefreq: "monthly", priority: "0.5" },
  { path: "/hotels/de-pavilion", changefreq: "monthly", priority: "0.5" },
  { path: "/hotels/holiday-inn-express", changefreq: "monthly", priority: "0.5" },
];

const NON_REVIEW_PREFIXES = [
  "/solutions/aviation",
  "/solutions/transport",
  "/solutions/hotels",
  "/solutions/special-services",
  "/charter",
  "/hotels",
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const airportEntries: SitemapEntry[] = Object.keys(AIRPORT_REGISTRY).map((code) => ({
          path: `/airports/${code}`,
          changefreq: "weekly" as const,
          priority: "0.8",
        }));

        const staticList = ICICI_REVIEW_MODE
          ? STATIC_PAGES.filter(
              (page) => !NON_REVIEW_PREFIXES.some((prefix) => page.path.startsWith(prefix))
            )
          : STATIC_PAGES;

        const entries = [...staticList, ...airportEntries];

        const urls = entries.map((e) => {
          const loc = `${COM}${e.path}`;
          return [
            `  <url>`,
            `    <loc>${loc}</loc>`,
            `    <lastmod>${e.lastmod || TODAY}</lastmod>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n");
        });

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
