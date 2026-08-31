import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { C, display, mono } from "../theme";
import { ShieldCheck, ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";

interface Review {
  name: string;
  role: string;
  affiliation: string;
  quote: string;
  hub: string;
}

const REVIEWS: Review[] = [
  {
    name: "Managing Director",
    role: "Private Wealth & Multi-Family Office",
    affiliation: "Singapore & Mumbai",
    quote:
      "Shafsky Aviation represents the highest standard of airside discretion in India. Their officers manage our principals' tarmac transfers and customs fast-track with flawless military precision.",
    hub: "BOM · Mumbai CSMIA",
  },
  {
    name: "Head of Corporate Travel",
    role: "Global Management Consultancy",
    affiliation: "New Delhi & London",
    quote:
      "Having our executive leadership escorted from the aircraft door directly to their chauffeured vehicle in under 12 minutes has saved countless hours. Unmatched responsiveness.",
    hub: "DEL · Delhi IGI T3",
  },
  {
    name: "Chief Aviation Officer",
    role: "Private Flight Operations",
    affiliation: "Dubai & Bengaluru",
    quote:
      "When our private jet lands in Bengaluru or Hyderabad, Shafsky handles ground FBO coordination, passenger lounge liaison, and customs bonded baggage with absolute professionalism.",
    hub: "BLR · Kempegowda Intl",
  },
  {
    name: "Senior Diplomatic Protocol Officer",
    role: "Embassy Operations",
    affiliation: "New Delhi",
    quote:
      "During state visits and high-level international delegations, Shafsky's round-the-clock airside coordination and DGCA compliant protocol execution have been exceptional.",
    hub: "DEL · Embassy Protocol",
  },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % REVIEWS.length);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  };

  const review = REVIEWS[current];

  return (
    <section className="relative px-4 py-20 sm:px-8 sm:py-28 md:px-14 md:py-36 bg-[#050b14] text-white border-b border-[#c5a869]/20">
      <div className="mx-auto max-w-[1280px]">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
          <div
            className="inline-flex items-center gap-3 text-[9.5px] sm:text-[10.5px] uppercase tracking-[0.35em] sm:tracking-[0.45em] text-[#d9c18b] font-bold"
            style={mono}
          >
            <span className="h-px w-8 sm:w-12 bg-[#c5a869]/50" />
            <span>INSTITUTIONAL TRUST & VERIFICATION</span>
            <span className="h-px w-8 sm:w-12 bg-[#c5a869]/50" />
          </div>
          <h2
            className="mt-4 sm:mt-5 text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.05] text-white font-normal"
            style={display}
          >
            Endorsed by Family Offices &{" "}
            <span
              className="italic font-normal"
              style={{
                background: "linear-gradient(135deg, #d9c18b 0%, #c5a869 50%, #fef3e2 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Enterprise Leaders.
            </span>
          </h2>
        </div>

        {/* Testimonial Card Display */}
        <div className="relative rounded-3xl bg-[#0a1424] border border-[#c5a869]/30 p-8 sm:p-12 md:p-16 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)]">
          <Quote className="h-12 w-12 text-[#c5a869]/25 mb-6" />

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="space-y-8"
            >
              <p
                className="text-lg sm:text-2xl md:text-[28px] text-slate-100 font-normal leading-relaxed"
                style={display}
              >
                "{review.quote}"
              </p>

              <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-base font-bold text-white tracking-wide">
                    {review.name}
                  </div>
                  <div className="text-xs text-[#d9c18b] font-medium mt-0.5">
                    {review.role} · {review.affiliation}
                  </div>
                  <div
                    className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-mono"
                    style={mono}
                  >
                    Verified Operations Hub: {review.hub}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className="fill-[#c5a869] text-[#c5a869]"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <div className="mt-10 flex items-center justify-between pt-6 border-t border-white/10">
            <div className="text-xs text-slate-400 font-mono" style={mono}>
              <span>{String(current + 1).padStart(2, "0")}</span>
              <span className="text-[#c5a869] mx-2">/</span>
              <span>{String(REVIEWS.length).padStart(2, "0")}</span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="h-10 w-10 rounded-xl bg-[#11223b] border border-[#c5a869]/30 text-[#d9c18b] hover:bg-[#c5a869] hover:text-[#050b14] flex items-center justify-center transition cursor-pointer"
                aria-label="Previous testimonial"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="h-10 w-10 rounded-xl bg-[#11223b] border border-[#c5a869]/30 text-[#d9c18b] hover:bg-[#c5a869] hover:text-[#050b14] flex items-center justify-center transition cursor-pointer"
                aria-label="Next testimonial"
              >
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
