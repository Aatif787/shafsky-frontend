import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plane } from "lucide-react";

export function Preloader({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"loading" | "exiting" | "fading" | "gone">("loading");
  const finished = useRef(false);

  // Skip / quick enter on user keypress
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        if (!finished.current) {
          finished.current = true;
          setPhase("gone");
          onFinish();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onFinish]);

  // Smooth progress animation with safety timeout
  useEffect(() => {
    if (phase !== "loading") return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          if (!finished.current) {
            finished.current = true;
            setPhase("exiting");
            setTimeout(() => {
              setPhase("gone");
              onFinish();
            }, 200);
          }
          return 100;
        }
        return prev + 10;
      });
    }, 40);

    // Hard fallback after 600ms
    const safety = setTimeout(() => {
      if (!finished.current) {
        finished.current = true;
        setPhase("gone");
        onFinish();
      }
    }, 600);

    return () => {
      clearInterval(interval);
      clearTimeout(safety);
    };
  }, [phase, onFinish]);

  if (phase === "gone") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="preloader"
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden pointer-events-none"
        style={{ background: "#faf5ea" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "exiting" ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Main loading content */}
        <div className="relative flex flex-col items-center justify-center w-full max-w-[540px] px-8 select-none">
          {/* Top branding text */}
          <div className="text-center font-mono uppercase tracking-[0.3em] mb-14">
            <div className="text-[12px] font-semibold text-[#0d2a36]">SHAFSKY AVIATION SERVICES</div>
            <div className="mt-1.5 text-[8px] text-[#5b6b75]/60">VIP CONCIERGE · EST. 2022</div>
          </div>

          {/* Thin horizontal progress track */}
          <div className="relative w-full h-[1px] bg-[#0d2a36]/10 mb-6">
            <div
              className="absolute top-0 left-0 h-[1px] bg-[#0d5a6e] transition-all duration-75"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-0 w-8 h-8 pointer-events-none flex items-center justify-center text-[#0d5a6e]"
              style={{
                left: `${progress}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <Plane className="w-4 h-4 rotate-45" />
            </div>
          </div>

          <div className="flex items-center justify-between w-full font-mono text-[9px] text-[#5b6b75]/80 uppercase tracking-[0.2em]">
            <span>ENGINEERING THE EDGE OF FLIGHT</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
