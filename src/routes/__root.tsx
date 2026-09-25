import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  redirect,
} from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { ICICI_REVIEW_MODE } from "../lib/config/reviewMode";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { BrandingProvider } from "../lib/branding/branding.context";
import { BrandingHead } from "../lib/branding/BrandingHead";
import { Toaster } from "../components/ui/sonner";
import { ClerkProvider } from "@clerk/tanstack-react-start";
import { AuthProvider } from "../auth-system/AuthProvider";
import { AppErrorBoundary } from "../components/ui/AppErrorBoundary";
import { MotionChrome } from "../components/motion/MotionChrome";
import {
  isChunkLoadError,
  handleChunkReload,
  setupChunkRecovery,
} from "../lib/chunk-recovery";
import { BUSINESS } from "../lib/constants";
import { SEO } from "../lib/seo";
import { searchConsoleMeta } from "../lib/search-console";

const WhatsAppWidget = lazy(() =>
  import("../components/ui/WhatsAppWidget").then((m) => ({ default: m.WhatsAppWidget })),
);

function DeferredWhatsApp() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const win = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof win.requestIdleCallback === "function") {
      const id = win.requestIdleCallback(() => setReady(true), { timeout: 1800 });
      return () => win.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(() => setReady(true), 800);
    return () => window.clearTimeout(t);
  }, []);

  if (!ready) return null;
  return (
    <Suspense fallback={null}>
      <WhatsAppWidget />
    </Suspense>
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
    if (isChunkLoadError(error)) {
      handleChunkReload("tanstack_root_error_component");
    }
  }, [error]);

  const isChunk = isChunkLoadError(error);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          {isChunk ? "Application Update Available" : "This page didn't load"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isChunk
            ? "A newer version of the application is available. Click below to refresh and load the latest updates."
            : "Something went wrong on our end. You can try refreshing or head back home."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              if (isChunk) {
                window.location.reload();
              } else {
                router.invalidate();
                reset();
              }
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
          >
            {isChunk ? "Refresh Application" : "Try again"}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: ({ location }) => {
    if (ICICI_REVIEW_MODE) {
      const p = location.pathname.toLowerCase();
      if (
        p.startsWith("/solutions/aviation") ||
        p.startsWith("/solutions/cargo") ||
        p.startsWith("/solutions/travel") ||
        p.startsWith("/solutions/medical") ||
        p.startsWith("/charter") ||
        p.startsWith("/hotels")
      ) {
        throw redirect({ to: "/solutions/concierge" });
      }
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: SEO.defaultTitle },
      { name: "description", content: SEO.defaultDescription },
      { name: "author", content: "Shafsky Aviation Services" },
      { name: "application-name", content: "Shafsky" },
      { name: "geo.region", content: "IN-DL" },
      { name: "geo.placename", content: "New Delhi" },
      { name: "geo.position", content: "28.5562;77.1000" },
      { name: "ICBM", content: "28.5562, 77.1000" },
      { name: "format-detection", content: "telephone=no" },
      { name: "referrer", content: "strict-origin-when-cross-origin" },
      { property: "og:site_name", content: "Shafsky Aviation Services" },
      { property: "og:title", content: SEO.defaultTitle },
      { property: "og:description", content: SEO.defaultDescription },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${BUSINESS.BASE_URL}/og-image.jpg` },
      { property: "og:locale", content: "en_IN" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: SEO.defaultTitle },
      { name: "twitter:description", content: SEO.defaultDescription },
      { name: "twitter:image", content: `${BUSINESS.BASE_URL}/og-image.jpg` },
      { name: "theme-color", content: "#84cc16" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Shafsky" },
      ...searchConsoleMeta(),
    ],
    links: [
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/logo.png" },
      { rel: "icon", href: "/logo.png" },
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN">
      <head>
        <HeadContent />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-slate-900 focus:shadow-lg"
        >
          Skip to main content
        </a>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    return setupChunkRecovery();
  }, []);

  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const application = (
    <AppErrorBoundary name="RootApplication">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrandingProvider>
            <BrandingHead />
            <MotionChrome>
              <div className="sticky-safe relative min-h-screen" style={{ position: "relative" }}>
                {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
                <Outlet />
              </div>
            </MotionChrome>
            <DeferredWhatsApp />
            <Toaster position="top-right" richColors closeButton />
          </BrandingProvider>
        </AuthProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );

  if (!publishableKey) return application;

  return (
    <ClerkProvider publishableKey={publishableKey} signInUrl="/auth" signUpUrl="/auth">
      {application}
    </ClerkProvider>
  );
}
