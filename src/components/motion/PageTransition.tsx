import { useEffect, useRef, useState } from "react";
import { useRouter, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { createPortal, flushSync } from "react-dom";
import { useBranding } from "@/lib/branding/branding.context";
import { FALLBACK_BRANDING } from "@/lib/branding/branding.constants";
import { display, mono } from "@/components/home/theme";

type Stage = "idle" | "cover" | "reveal";

const COVER_MS = 520;
const REVEAL_MS = 420;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function isInternalPageLink(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "" && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return false;
  }
  try {
    const url = new URL(anchor.href, window.location.origin);
    if (url.origin !== window.location.origin) return false;
    if (url.pathname === window.location.pathname && url.search === window.location.search) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function PageTransition() {
  const reduce = useReducedMotion();
  const router = useRouter();
  const { branding } = useBranding();
  const logoSrc = branding.logo_url || branding.logo_light_url || FALLBACK_BRANDING.logo_url;
  const companyName = branding.company_name || FALLBACK_BRANDING.company_name;
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [stage, setStage] = useState<Stage>("idle");
  const coverStarted = useRef(0);
  const revealTimer = useRef<number>(0);
  const idleTimer = useRef<number>(0);
  const lastPath = useRef(pathname);

  const stageRef = useRef<Stage>("idle");
  stageRef.current = stage;

  const startCover = () => {
    if (reduce) return;
    window.clearTimeout(revealTimer.current);
    window.clearTimeout(idleTimer.current);
    coverStarted.current = performance.now();
    document.documentElement.classList.add("route-cover");
    document.documentElement.classList.remove("route-enter");
    flushSync(() => setStage("cover"));
  };

  const startReveal = () => {
    const elapsed = performance.now() - coverStarted.current;
    const wait = Math.max(0, COVER_MS - elapsed);
    window.clearTimeout(revealTimer.current);
    window.clearTimeout(idleTimer.current);
    revealTimer.current = window.setTimeout(() => {
      document.documentElement.classList.remove("route-cover");
      document.documentElement.classList.add("route-enter");
      setStage("reveal");
      idleTimer.current = window.setTimeout(() => {
        document.documentElement.classList.remove("route-enter");
        setStage("idle");
      }, REVEAL_MS);
    }, wait);
  };

  useEffect(() => {
    if (reduce) return;

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a");
      if (!anchor) return;
      if (!isInternalPageLink(anchor)) return;
      startCover();
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [reduce]);

  useEffect(() => {
    if (reduce) return;
    const subscribe = (router as { subscribe?: (event: string, cb: (event: any) => void) => () => void }).subscribe;
    if (typeof subscribe !== "function") return;
    return subscribe("onBeforeNavigate", (event) => {
      const fromPath = event?.fromLocation?.pathname;
      const toPath = event?.toLocation?.pathname;
      if (!fromPath || !toPath || fromPath === toPath) return;
      startCover();
    });
  }, [router, reduce]);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (stageRef.current === "cover") {
      startReveal();
      return;
    }
    if (reduce) return;
    startCover();
    startReveal();
  }, [pathname, reduce]);

  useEffect(() => {
    const preload = new Image();
    preload.src = logoSrc;
  }, [logoSrc]);

  useEffect(() => {
    return () => {
      window.clearTimeout(revealTimer.current);
      window.clearTimeout(idleTimer.current);
      document.documentElement.classList.remove("route-cover", "route-enter");
    };
  }, []);

  if (reduce) return null;

  const covering = stage === "cover" || stage === "reveal";
  const open = stage === "cover";

  const overlay = (
    <AnimatePresence>
      {covering && (
        <motion.div
          key="page-transition"
          className="pointer-events-none fixed inset-0 z-[200] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
          aria-hidden
        >
          <motion.div
            className="absolute inset-0 bg-[#f7fee7]/92"
            initial={{ opacity: 0 }}
            animate={{ opacity: open ? 1 : 0 }}
            transition={{ duration: 0.32, ease: EASE }}
          />

          <motion.div
            className="absolute left-1/2 top-1/2 h-[min(70vw,520px)] w-[min(70vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(163,230,53,0.35)_0%,rgba(255,255,255,0)_70%)]"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: open ? 1.15 : 1.6, opacity: open ? 1 : 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          />

          <motion.div
            className="absolute top-0 h-full w-[38%] bg-gradient-to-r from-transparent via-lime-300/70 to-transparent blur-md"
            initial={{ x: "-50vw", opacity: 0 }}
            animate={{
              x: open ? "120vw" : "160vw",
              opacity: open ? [0, 1, 1, 0] : 0,
            }}
            transition={{ duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
          />

          <div className="absolute inset-0 z-10 grid place-items-center px-6">
            <div className="flex flex-col items-center">
            <motion.div
              className="relative flex h-36 w-36 items-center justify-center overflow-hidden rounded-[1.85rem] border-2 border-lime-400 bg-white p-4 shadow-[0_16px_50px_-10px_rgba(132,204,22,0.4)] sm:h-40 sm:w-40"
              initial={{ scale: 0.84, opacity: 0 }}
              animate={{
                scale: open ? 1 : 0.92,
                opacity: open ? 1 : 0,
              }}
              transition={{ duration: 0.38, ease: EASE }}
            >
              <img
                src={logoSrc}
                alt={companyName}
                className="h-full w-full object-contain object-center"
                draggable={false}
                onError={(event) => {
                  (event.currentTarget as HTMLImageElement).src = FALLBACK_BRANDING.logo_url;
                }}
              />
            </motion.div>

            <motion.div
              className="mt-5 text-center text-[clamp(1.7rem,4.6vw,2.8rem)] font-bold tracking-tight text-slate-950"
              style={display}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: open ? 1 : 0, y: open ? 0 : -8 }}
              transition={{ duration: 0.32, ease: EASE }}
            >
              SHAFSKY
            </motion.div>

            <motion.div
              className="mt-2 h-[3px] w-24 origin-center rounded-full bg-gradient-to-r from-lime-300 via-lime-500 to-lime-300"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: open ? 1 : 0, opacity: open ? 1 : 0 }}
              transition={{ duration: 0.38, delay: open ? 0.08 : 0, ease: EASE }}
            />

            <motion.p
              className="mt-2.5 text-[10px] font-bold uppercase tracking-[0.42em] text-lime-700"
              style={mono}
              initial={{ opacity: 0 }}
              animate={{ opacity: open ? 1 : 0 }}
              transition={{ duration: 0.28, delay: open ? 0.12 : 0 }}
            >
              Aviation Services
            </motion.p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(overlay, document.body);
}
