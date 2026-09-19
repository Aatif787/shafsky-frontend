import { createFileRoute } from "@tanstack/react-router";
import type { } from "@tanstack/react-start";
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
          "Disallow: /admin",
          "Disallow: /super-admin",
          "Disallow: /_authenticated/",
          "Disallow: /verify/",
          "Disallow: /flight-verification",
          "Disallow: /gallery",
          "",
          "User-agent: GPTBot",
          "Allow: /",
          "",
          "User-agent: Google-Extended",
          "Allow: /",
          "",
          "User-agent: PerplexityBot",
          "Allow: /",
          "",
          `Sitemap: ${BUSINESS.BASE_URL}/sitemap.xml`,
          `Sitemap: ${BUSINESS.IN_URL}/sitemap.xml`,
          `LLMs-Txt: ${BUSINESS.BASE_URL}/llms.txt`,
          `LLMs-Txt: ${BUSINESS.IN_URL}/llms.txt`,
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
