import { useEffect, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from "framer-motion";
import { PageTransition } from "./PageTransition";

function useIsClient() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  return ready;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 right-0 z-[80] h-[2.5px] origin-left bg-gradient-to-r from-lime-500 via-lime-400 to-emerald-400"
      style={{ scaleX }}
    />
  );
}

function CursorGlow() {
  const reduce = useReducedMotion();
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const springX = useSpring(x, { stiffness: 70, damping: 22, mass: 0.4 });
  const springY = useSpring(y, { stiffness: 70, damping: 22, mass: 0.4 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: PointerEvent) => {
      x.set(e.clientX - 160);
      y.set(e.clientY - 160);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, x, y]);

  if (reduce) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[15] hidden h-80 w-80 rounded-full bg-lime-400/12 blur-3xl lg:block"
      style={{ x: springX, y: springY }}
    />
  );
}

function ClientMotionFX() {
  const ready = useIsClient();
  if (!ready) return null;
  return (
    <>
      <ScrollProgress />
      <CursorGlow />
      <PageTransition />
    </>
  );
}

export function MotionChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <ClientMotionFX />
      {children}
    </>
  );
}
