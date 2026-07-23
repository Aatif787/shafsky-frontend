import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

export default defineConfig({
  server: { port: 5173 },
  build: {
    chunkSizeWarningLimit: 1500,
  },
  optimizeDeps: {
    include: [
      "@tanstack/react-query",
      "@tanstack/react-router",
      "@supabase/supabase-js",
      "lucide-react",
      "clsx",
      "tailwind-merge",
    ],
  },
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      server: {
        entry: "server",
        prerender: {
          routes: ["/", "/airports", "/services/guide", "/contact"],
          crawlLinks: true,
        },
      },
    } as any),
    nitro({
      preset: "vercel",
    }),
    viteReact(),
  ],
});

