import { useEffect } from "react";
import Lenis from "lenis";

/**
 * SmoothScroll mounts Lenis momentum smooth scrolling for a classical,
 * weighted, luxury inertial scroll experience.
 * Automatically respects prefers-reduced-motion and cleans up on unmount.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect reduced motion accessibility
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let lenis: Lenis | null = null;
    let rafId = 0;

    try {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.2,
      });

      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      // Gracefully route hash anchor clicks (e.g. #book, #services) through Lenis
      const handleAnchorClick = (e: MouseEvent) => {
        const target = (e.target as HTMLElement)?.closest("a");
        if (!target) return;
        const href = target.getAttribute("href");
        if (href && href.startsWith("#") && href.length > 1) {
          const el = document.querySelector(href);
          if (el) {
            e.preventDefault();
            lenis?.scrollTo(el as HTMLElement, { offset: -70 });
          }
        }
      };
      document.addEventListener("click", handleAnchorClick, { passive: false });

      return () => {
        document.removeEventListener("click", handleAnchorClick);
        if (rafId) cancelAnimationFrame(rafId);
        lenis?.destroy();
      };
    } catch (e) {
      console.warn("[SmoothScroll] Lenis initialization skipped:", e);
      return () => {
        if (rafId) cancelAnimationFrame(rafId);
      };
    }
  }, []);

  return null;
}

export default SmoothScroll;
