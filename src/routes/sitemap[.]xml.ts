import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { AIRPORTS } from "@/data/airports";
import { BUSINESS } from "@/lib/constants";

const BASE_URL = BUSINESS.BASE_URL;
const TODAY = new Date().toISOString().split("T")[0];

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  lastmod?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0", lastmod: TODAY },
          { path: "/airports", changefreq: "weekly", priority: "0.9", lastmod: TODAY },
          { path: "/book", changefreq: "monthly", priority: "0.8", lastmod: TODAY },
          { path: "/charter", changefreq: "monthly", priority: "0.8", lastmod: TODAY },
          { path: "/contact", changefreq: "monthly", priority: "0.6", lastmod: TODAY },
          { path: "/services/guide", changefreq: "monthly", priority: "0.7", lastmod: TODAY },
          { path: "/solutions/aviation", changefreq: "monthly", priority: "0.7", lastmod: TODAY },
          { path: "/solutions/cargo", changefreq: "monthly", priority: "0.7", lastmod: TODAY },
          { path: "/solutions/concierge", changefreq: "monthly", priority: "0.7", lastmod: TODAY },
          { path: "/solutions/medical", changefreq: "monthly", priority: "0.7", lastmod: TODAY },
          { path: "/solutions/travel", changefreq: "monthly", priority: "0.7", lastmod: TODAY },
          ...AIRPORTS.map((a) => ({
            path: `/airports/${a.code}`,
            changefreq: "monthly" as const,
            priority: "0.7",
            lastmod: TODAY,
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
