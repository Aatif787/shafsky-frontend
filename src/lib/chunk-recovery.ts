/**
 * Shafsky Chunk Recovery Utility
 * Handles automatic recovery when users encounter stale deployment chunk 404s
 * (e.g. Vite dynamic import failure after a new Vercel deployment).
 */

const CHUNK_RELOAD_KEY = "shafsky_chunk_reload_ts";
const RELOAD_DEBOUNCE_MS = 15000; // 15s to prevent infinite reload loops

export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const message =
    typeof error === "string"
      ? error
      : (error as any)?.message ||
        (error as any)?.name ||
        (error as any)?.reason?.message ||
        String(error);

  const lower = message.toLowerCase();
  return (
    lower.includes("failed to fetch dynamically imported module") ||
    lower.includes("error loading dynamically imported module") ||
    lower.includes("loading chunk") ||
    lower.includes("importing a module script failed") ||
    lower.includes("unable to preload css") ||
    lower.includes("chunkloaderror")
  );
}

export function handleChunkReload(reason?: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const lastReloadStr = sessionStorage.getItem(CHUNK_RELOAD_KEY);
    const now = Date.now();
    if (lastReloadStr) {
      const lastReload = parseInt(lastReloadStr, 10);
      if (!isNaN(lastReload) && now - lastReload < RELOAD_DEBOUNCE_MS) {
        console.warn(
          `[ChunkRecovery] Chunk error detected (${reason || "unknown"}), but recent reload occurred ${Math.round((now - lastReload) / 1000)}s ago. Halting auto-reload to avoid loops.`
        );
        return false;
      }
    }
    sessionStorage.setItem(CHUNK_RELOAD_KEY, now.toString());
  } catch {
    // sessionStorage might be restricted; continue with reload attempt
  }

  console.info(
    `[ChunkRecovery] Stale deployment or missing asset chunk detected (${reason || "unknown"}). Reloading page to load latest application build...`
  );

  // Force reload to fetch the latest index.html and its chunk manifest
  window.location.reload();
  return true;
}

let isInitialized = false;

export function setupChunkRecovery(): () => void {
  if (typeof window === "undefined" || isInitialized) {
    return () => {};
  }

  isInitialized = true;

  const handlePreloadError = (event: Event) => {
    console.warn("[ChunkRecovery] vite:preloadError event caught");
    event.preventDefault?.();
    handleChunkReload("vite:preloadError");
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    if (isChunkLoadError(event.reason)) {
      console.warn("[ChunkRecovery] unhandledrejection chunk error caught:", event.reason);
      event.preventDefault?.();
      handleChunkReload("unhandledrejection");
    }
  };

  window.addEventListener("vite:preloadError", handlePreloadError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);

  return () => {
    window.removeEventListener("vite:preloadError", handlePreloadError);
    window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    isInitialized = false;
  };
}
