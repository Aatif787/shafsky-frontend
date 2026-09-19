import { createFileRoute } from "@tanstack/react-router";
import type { } from "@tanstack/react-start";
import { AIRPORT_REGISTRY } from "@/data/airportRegistry";
import { BUSINESS } from "@/lib/constants";

const COM = BUSINESS.BASE_URL;
const IN = BUSINESS.IN_URL;
const TODAY = new Date().toISOString().split("T")[0];

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  lastmod?: string;
}

const STATIC_PAGES: SitemapEntry[] = [
  { path: "/", changefreq: "weekly", priority: "1.0" },
  { path: "/airports", changefreq: "weekly", priority: "0.9" },
  { path: "/solutions/concierge", changefreq: "weekly", priority: "0.9" },
  { path: "/book", changefreq: "weekly", priority: "0.8" },
  { path: "/solutions/aviation", changefreq: "monthly", priority: "0.8" },
  { path: "/solutions/cargo", changefreq: "monthly", priority: "0.7" },
  { path: "/solutions/travel", changefreq: "monthly", priority: "0.7" },
  { path: "/solutions/medical", changefreq: "monthly", priority: "0.6" },
  { path: "/services/guide", changefreq: "monthly", priority: "0.7" },
  { path: "/contact", changefreq: "monthly", priority: "0.6" },
  { path: "/hotels/airport-hotel", changefreq: "monthly", priority: "0.6" },
  { path: "/hotels/castle-blue", changefreq: "monthly", priority: "0.5" },
  { path: "/hotels/classic-diplomat", changefreq: "monthly", priority: "0.5" },
  { path: "/hotels/de-pavilion", changefreq: "monthly", priority: "0.5" },
  { path: "/hotels/holiday-inn-express", changefreq: "monthly", priority: "0.5" },
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

        const entries = [...STATIC_PAGES, ...airportEntries];

        const urls = entries.flatMap((e) => {
          const com = `${COM}${e.path}`;
          const inn = `${IN}${e.path}`;
          const hreflang = [
            `    <xhtml:link rel="alternate" hreflang="en-IN" href="${inn}"/>`,
            `    <xhtml:link rel="alternate" hreflang="x-default" href="${com}"/>`,
          ];
          const body = (loc: string) =>
            [
              `  <url>`,
              `    <loc>${loc}</loc>`,
              `    <lastmod>${e.lastmod || TODAY}</lastmod>`,
              e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
              e.priority ? `    <priority>${e.priority}</priority>` : null,
              ...hreflang,
              `  </url>`,
            ]
              .filter(Boolean)
              .join("\n");
          return [body(com), body(inn)];
        });

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
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
