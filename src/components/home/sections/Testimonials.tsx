import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { C, display, mono } from "../theme";
import { SectionLabel } from "./SectionLabel";

export function Testimonials() {
  const reviews = [
    {
      name: "Sachin Tendulkar",
      role: "Cricketing Legend",
      quote:
        "Excellent customer services! Whenever I needed something they were there for me. Shafsky Aviation Services understands what premium travel means.",
      initials: "ST",
      color: "#0d5a6e",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=220&h=220&fit=crop",
    },
    {
      name: "Anuradha Prasad",
      role: "Media Executive",
      quote:
        "One good thing with Shafsky — no hold time when you call. Instant response, every single time. That's rare in this industry.",
      initials: "AP",
      color: "#2d6a4f",
    },
    {
      name: "Madhur Bhandarkar",
      role: "Film Director",
      quote:
        "Thank you for always being on hand to offer help. I especially appreciate you coming up with new ways of working in the aviation field.",
      initials: "MB",
      color: "#6b21a8",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=220&h=220&fit=crop",
    },
    {
      name: "Rajeev Shukla",
      role: "Sports Administrator",
      quote:
        "Great service, efficient communication and a really easy way to manage travel with lots of help and support to get the right deal.",
      initials: "RS",
      color: "#b45309",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=220&h=220&fit=crop",
    },
    {
      name: "Gautam Gambhir",
      role: "Cricketer & Public Servant",
      quote:
        "Excellent service from their team — they helped clarify all my questions and Shafsky deals with very professional manners.",
      initials: "GG",
      color: "#0369a1",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=220&h=220&fit=crop",
    },
    {
      name: "Mohd Azharuddin",
      role: "Former Indian Captain",
      quote:
        "You are a great team player and you constantly help others meet their demands. Well done, Shafsky Aviation Services!",
      initials: "MA",
      color: "#059669",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=220&h=220&fit=crop",
    },
    {
      name: "Hemant Sharma",
      role: "Business Leader",
      quote:
        "The top-notch friendly and very professional customer service I've received from Shafsky Aviation Services is second to none.",
      initials: "HS",
      color: "#dc2626",
    },
    {
      name: "Barun Das",
      role: "Media Industry Veteran",
      quote:
        "I chatted with their team. Very helpful and answered all my questions. They found the best coverage for me at a great price.",
      initials: "BD",
      color: "#7c3aed",
      image: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=220&h=220&fit=crop",
    },
    {
      name: "Ram Gopal Varma",
      role: "Filmmaker",
      quote:
        "Fantastic company! Best service, efficient communication, and an unmatched level of personal attention to every detail.",
      initials: "RV",
      color: "#ea580c",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=220&h=220&fit=crop",
    },
  ];

  const [cardsPerView, setCardsPerView] = useState(3);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setCurrent(0);
  }, [cardsPerView]);

  const totalPages = Math.ceil(reviews.length / cardsPerView);

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDirection(1);
      setCurrent((p) => (p + 1) % totalPages);
    }, 5000);
  }, [totalPages]);

  useEffect(() => {
    startAutoPlay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startAutoPlay]);

  const goTo = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
    startAutoPlay();
  };

  const prev = () => {
    setDirection(-1);
    setCurrent((p) => (p - 1 + totalPages) % totalPages);
    startAutoPlay();
  };
  const next = () => {
    setDirection(1);
    setCurrent((p) => (p + 1) % totalPages);
    startAutoPlay();
  };

  const visibleReviews = reviews.slice(
    current * cardsPerView,
    current * cardsPerView + cardsPerView,
  );

  return (
    <section
      className="relative px-6 py-16 md:px-14 md:py-36 overflow-hidden"
      style={{ background: C.bg }}
    >
      <div className="mx-auto max-w-[1480px]">
        <SectionLabel index="08" label="In Their Words" />
        <h2 className="mt-8 max-w-4xl text-[clamp(2rem,5vw,4.4rem)] leading-[1.02]" style={display}>
          Trusted by those who{" "}
          <span className="italic" style={{ color: C.teal }}>
            demand excellence.
          </span>
        </h2>

        {/* Carousel */}
        <div className="relative mt-16">
          {/* Arrow buttons */}
          <button
            onClick={prev}
            aria-label="Previous testimonials"
            className="absolute -left-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border text-[20px] transition hover:scale-110 active:scale-95 md:flex"
            style={{ background: C.paper, borderColor: C.line, color: C.ink }}
          >
            ‹
          </button>
          <button
            onClick={next}
            aria-label="Next testimonials"
            className="absolute -right-2 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border text-[20px] transition hover:scale-110 active:scale-95 md:flex"
            style={{ background: C.paper, borderColor: C.line, color: C.ink }}
          >
            ›
          </button>

          {/* Cards grid */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={current}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -60 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
              {visibleReviews.map((r, i) => (
                <motion.figure
                  key={r.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.12 }}
                  className="group relative overflow-hidden rounded-2xl p-8 md:p-10 transition-all duration-300 hover:shadow-[0_20px_60px_-20px_rgba(13,90,110,0.25)]"
                  style={{ background: C.paper, border: `1px solid ${C.line}` }}
                >
                  {/* Large decorative quote */}
                  <div
                    className="absolute -top-6 right-6 text-[120px] leading-none select-none"
                    style={{ ...display, color: "rgba(95,181,173,0.12)" }}
                  >
                    "
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, si) => (
                      <svg key={si} className="h-4 w-4" viewBox="0 0 20 20" fill="#f59e0b">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote
                    className="relative text-[16px] md:text-[18px] leading-relaxed min-h-[100px]"
                    style={{ ...display, color: C.ink }}
                  >
                    "{r.quote}"
                  </blockquote>

                  {/* Author */}
                  <div className="relative mt-8 flex items-center gap-4">
                    <div
                      className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full shadow-md"
                      style={{ background: r.color, border: `2px solid ${C.teal}` }}
                    >
                      <img
                        src={r.image}
                        alt={r.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                      <div
                        className="absolute inset-0 items-center justify-center text-[14px] font-bold text-white"
                        style={{ display: "none" }}
                      >
                        {r.initials}
                      </div>
                    </div>
                    <div>
                      <div className="text-[14px] font-bold" style={{ color: C.ink }}>
                        {r.name}
                      </div>
                      <div
                        className="text-[11px] uppercase tracking-[0.2em]"
                        style={{ ...mono, color: C.teal }}
                      >
                        {r.role}
                      </div>
                    </div>
                  </div>

                  {/* Hover accent bar */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-[3px] w-full origin-left"
                    style={{ background: `linear-gradient(90deg, ${C.teal}, ${C.mint})` }}
                    initial={{ scaleX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.4 }}
                  />
                </motion.figure>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={`testi-dot-${i}`}
                onClick={() => goTo(i)}
                aria-label={`Go to page ${i + 1}`}
                className="relative h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: current === i ? 28 : 10,
                  background: current === i ? C.teal : C.line,
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

