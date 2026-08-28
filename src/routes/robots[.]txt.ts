import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { BUSINESS } from "@/lib/constants";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const robotsTxt = [
          "User-agent: *",
          "Allow: /",
          "",
          "Disallow: /api/",
          "Disallow: /auth",
          "Disallow: /account",
          "Disallow: /login",
          "Disallow: /dashboard",
          "Disallow: /_authenticated/",
          "",
          `Sitemap: ${BUSINESS.BASE_URL}/sitemap.xml`,
        ].join("\n");

        return new Response(robotsTxt, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400",
          },
        });
      },
    },
  },
});
