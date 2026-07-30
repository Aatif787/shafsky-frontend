import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";
import fs from "node:fs";
import path from "node:path";

function fontVerificationPlugin() {
  return {
    name: "font-verification-plugin",
    buildStart() {
      const fontsDir = path.resolve(process.cwd(), "public/fonts");
      if (!fs.existsSync(fontsDir)) {
        console.warn("\x1b[33m%s\x1b[0m", "⚠️ [Font Management Warning] Public fonts directory '/public/fonts/' is missing!");
        return;
      }
      console.log("\x1b[32m%s\x1b[0m", "✓ [Font Management] Font system verified from /public/fonts/.");
    },
  };
}

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
    fontVerificationPlugin(),
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
