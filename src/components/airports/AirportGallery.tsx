import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X, Image as ImageIcon, Sparkles } from "lucide-react";
import type { Airport } from "@/data/airports";

// Default high-res fallback visuals
import lounge from "@/assets/lounge.png";
import vipTransport1 from "@/assets/vip-transport-1.png";
import meetGreetImg from "@/assets/meet-greet.png";
import fastTrackImg from "@/assets/fast-track.png";

interface AirportGalleryProps {
  a: Airport;
}

export function AirportGallery({ a }: AirportGalleryProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const images =
    a.slideshow && a.slideshow.length > 0
      ? a.slideshow
      : [a.cover, lounge, meetGreetImg, vipTransport1, fastTrackImg];

  return (
    <section className="my-20 relative">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#c5a059]">
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Visual Tour & Infrastructure</span>
          </div>
          <h2
            className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-white"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Airport Gallery & <span className="italic text-[#c5a059]">Ambience.</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-white/60 font-sans max-w-2xl">
            Cinematic imagery of terminal concourses, VIP lounge suites, and tarmac transfers at {a.city}.
          </p>
        </div>

        <div className="text-xs text-white/50 font-mono tracking-wider">
          {images.length} High-Res Visuals
        </div>
      </div>

      {/* GALLERY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((imgUrl, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -4 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            onClick={() => setActiveImage(imgUrl)}
            className="group relative h-64 sm:h-72 rounded-3xl overflow-hidden border border-white/10 shadow-xl cursor-pointer bg-black/40"
          >
            <img
              src={imgUrl}
              alt={`${a.city} airport gallery visual ${idx + 1}`}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
              <span className="text-[10px] font-mono uppercase tracking-widest text-white/80">
                {a.city} Hub Visual #{idx + 1}
              </span>
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl p-4 sm:p-10 flex items-center justify-center cursor-pointer"
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-10"
              aria-label="Close Lightbox"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl max-h-[85vh] rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeImage}
                alt={`${a.city} airport gallery expanded`}
                className="max-h-[80vh] w-auto object-contain mx-auto rounded-3xl"
              />
              <div className="p-4 bg-[#0a0e17] text-center text-xs font-mono text-[#c5a059] uppercase tracking-widest">
                {a.airport?.name || a.city} — Shafsky Aviation Services Signature Visual
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
