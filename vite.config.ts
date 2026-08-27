import { defineConfig, loadEnv } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";
import fs from "node:fs";
import path from "node:path";

import { reticle } from '@reticlehq/vite-plugin';
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const rawBackend = env.VITE_BACKEND_API_URL || process.env.VITE_BACKEND_API_URL || "http://127.0.0.1:8003";
  const backendTarget = rawBackend
    .replace(/^(VITE_BACKEND_API_URL|BACKEND_API_URL|VITE_FASTAPI_URL)\s*=\s*/i, "")
    .replace(/^["']|["']$/g, "")
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "") || "http://127.0.0.1:8003";

  return {
    server: {
      port: 5174,
      host: "127.0.0.1",
      headers: {
        "Permissions-Policy":
          'accelerometer=(self "https://checkout.razorpay.com" "https://api.razorpay.com"), gyroscope=(self "https://checkout.razorpay.com" "https://api.razorpay.com"), camera=(), microphone=(), geolocation=()',
      },
      proxy: {
        "/api": {
          target: backendTarget,
          changeOrigin: true,
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
        },
      },
    },
  build: {
    target: "es2022",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/framer-motion")) return "vendor-motion";
          if (id.includes("node_modules/gsap")) return "vendor-gsap";
          if (id.includes("node_modules/lucide-react")) return "vendor-icons";
          if (id.includes("node_modules/@supabase")) return "vendor-supabase";
          if (id.includes("node_modules/date-fns")) return "vendor-date";
        },
      },
    },
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
  plugins: [reticle(),
    fontVerificationPlugin(),
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      server: {
        entry: "server",
        prerender: {
          routes: ["/", "/airports", "/contact"],
          crawlLinks: false,
        },
      },
    } as any),
    nitro({
      preset: "vercel",
    }),
    viteReact(),
  ],
  };
});
