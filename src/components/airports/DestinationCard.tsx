import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Plane } from "lucide-react";
import type { Airport } from "@/data/airports";

export function DestinationCard({ a, idx }: { a: Airport; idx: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 180, damping: 18 });
  const sy = useSpring(my, { stiffness: 180, damping: 18 });
  const rx = useTransform(sy, [-0.5, 0.5], [8, -8]);
  const ry = useTransform(sx, [-0.5, 0.5], [-10, 10]);

  function onMove(e: React.MouseEvent) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: Math.min(idx, 8) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1200 }}
      className="group relative"
    >
      <Link
        to="/airports/$code"
        params={{ code: a.code }}
        className="relative block aspect-[4/5] overflow-hidden rounded-[2px] bg-neutral-950"
        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* image */}
        <img
          src={a.cover}
          alt={`${a.city} — ${a.landmark}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[2200ms] ease-out group-hover:scale-110"
        />
        {/* gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        {/* blue glow sweep */}
        <div
          className="pointer-events-none absolute inset-0 -translate-x-full opacity-0 transition-all duration-1000 group-hover:translate-x-full group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(115deg, transparent 35%, rgba(0,180,255,0.35) 50%, transparent 65%)",
            mixBlendMode: "screen",
          }}
        />
        {/* glass overlay on hover */}
        <div
          className="absolute inset-0 opacity-0 backdrop-blur-[1px] transition-opacity duration-700 group-hover:opacity-100"
          style={{
            background: "linear-gradient(180deg, rgba(7,12,20,0.0) 40%, rgba(7,18,30,0.55) 100%)",
          }}
        />
        {/* top meta */}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-5 text-white">
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] backdrop-blur-md">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5ed3ff]" />
            {a.code}
          </div>
          <div className="rounded-full bg-black/40 p-2 transition-transform duration-700 group-hover:rotate-180">
            <Plane className="h-3.5 w-3.5 text-[#5ed3ff]" />
          </div>
        </div>
        {/* bottom content */}
        <div className="absolute inset-x-0 bottom-0 p-6 text-white">
          <div className="text-[10px] uppercase tracking-[0.28em] text-[#5ed3ff]/80">
            {a.country}
          </div>
          <h3
            className="mt-2 text-[28px] leading-[1.05] font-light"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            {a.city}
          </h3>
          <div
            className="mt-1 text-[12px] tracking-wide text-white/70 transition-colors group-hover:text-[#5ed3ff]"
            style={{ fontFamily: "Fraunces, serif", fontStyle: "italic" }}
          >
            {a.landmark}
          </div>
          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t border-white/15 pt-4">
            <span className="min-w-0 truncate text-[10px] uppercase tracking-[0.24em] text-white/60">
              Explore Destination
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-white transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#5ed3ff]" />
          </div>
        </div>
        {/* corner ticks */}
        <span className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l border-t border-white/40" />
        <span className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r border-t border-white/40" />
        <span className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b border-l border-white/40" />
        <span className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b border-r border-white/40" />
      </Link>
      {/* deep shadow on hover */}
      <div
        className="pointer-events-none absolute -inset-1 -z-10 rounded-[3px] opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: "radial-gradient(60% 60% at 50% 70%, rgba(0,140,255,0.35), transparent 70%)",
        }}
      />
    </motion.div>
  );
}
