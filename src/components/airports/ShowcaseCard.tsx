import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { Airport } from "@/data/airports";
import { display, mono } from "./Atoms";
import { getAirportAsset } from "@/lib/airport-assets";

export function ShowcaseCard({ a, idx }: { a: Airport; idx: number }) {
  const cardImage = getAirportAsset(a.code, "hero-mobile.webp") || a.mobCover || a.cover;
  const serviceCount = (a as any).availableServiceIds?.length || 4;
  const isFeatured = a.code === "DEL" || a.code === "BOM" || a.code === "DXB" || a.code === "AMD" || a.code === "BLR";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      transition={{ duration: 0.3, delay: Math.min(idx, 10) * 0.03, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="h-full w-full"
    >
      <Link
        to="/airports/$code"
        params={{ code: a.code }}
        className="group relative flex items-center gap-3.5 sm:gap-4 p-3 sm:p-3.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-[#7c3aed]/50 hover:shadow-md transition-all duration-300 overflow-hidden h-full"
      >
        {/* Left Compact Square Thumbnail */}
        <div className="relative h-20 w-20 sm:h-22 sm:w-22 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-100">
          <img
            src={cardImage}
            alt={`${a.city} Airport`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-[#7c3aed] text-white font-mono text-[10px] font-bold tracking-widest shadow-xs">
            {a.code}
          </span>
        </div>

        {/* Right Content Section */}
        <div className="flex flex-1 flex-col justify-between min-w-0 h-full py-0.5">
          <div>
            <div className="flex items-center justify-between gap-1">
              <h3
                className="text-base sm:text-lg font-serif font-bold text-slate-900 truncate group-hover:text-[#7c3aed] transition-colors"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {a.city}
              </h3>
              {isFeatured && (
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-purple-50 text-[#7c3aed] border border-purple-100 text-[9px] font-mono font-bold uppercase tracking-wider">
                  Featured
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 font-sans truncate mt-0.5">
              {a.airport?.name || `${a.country}`}
            </p>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono">
            <span className="text-slate-500 font-medium">
              {serviceCount} Services Available
            </span>

            <span className="inline-flex items-center gap-1 font-bold text-[#7c3aed] group-hover:translate-x-0.5 transition-transform">
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
