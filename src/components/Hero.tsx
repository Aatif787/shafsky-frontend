import React, { lazy, Suspense, useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Navigation } from "./Navigation";
import { useBranding } from "@/lib/branding/branding.context";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  MotionValue,
  AnimatePresence,
} from "framer-motion";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Shuffle,
  Calendar,
  HelpCircle,
  ChevronDown,
  Search,
  ShieldCheck,
  Headphones,
  Globe2,
  Sparkles,
  Clock,
  Award,
  Users,
  ArrowRight,
  HeartPulse,
  Hotel,
  Package,
  Car,
  Crown,
  Ticket,
  Menu,
  X,
} from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { format, parseISO, isValid } from "date-fns";

import heroJet from "@/assets/hero-jet.png";
import clouds from "@/assets/clouds.jpg";
import interior from "@/assets/interior.jpg";
import jetTarmac from "@/assets/jet-tarmac.jpg";
import cargo from "@/assets/cargo.jpg";
import medical from "@/assets/medical.jpg";
import concierge from "@/assets/concierge.jpg";
import ctaBg from "@/assets/cta-bg.jpg";
import lounge from "@/assets/lounge.png";
import meetVideo from "@/assets/meet.mp4";
import vipTransport1 from "@/assets/vip-transport-1.png";
import vipTransport2 from "@/assets/vip-transport-2.png";
import vipTransport3 from "@/assets/vip-transport-3.png";
import vipTransport4 from "@/assets/vip-transport-4.png";
import vipTransport5 from "@/assets/vip-transport-5.png";
import hotelImg from "@/assets/hotel.png";
import fastTrackImg from "@/assets/fast-track.png";
import cargoAssistImg from "@/assets/cargo-assist.png";
import medicalAssistImg from "@/assets/medical-assist.png";
import vipConciergeImg from "@/assets/vip-concierge.png";
import meetGreetImg from "@/assets/meet-greet.png";

import slide0 from "@/assets/image.png";
import slide1 from "@/assets/image1.png";
import slide2 from "@/assets/image2.png";
import slide3 from "@/assets/image3.png";
import world from "@/assets/world.png";

import { AirportShowcase } from "./airports/AirportShowcase";

const SLIDESHOW_IMAGES = [world, slide0, slide1, slide2, slide3, lounge, interior];

const display = { fontFamily: "'Fraunces', serif", fontWeight: 300, letterSpacing: "-0.02em" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

// Cream / teal palette
const C = {
  bg: "#faf5ea",
  paper: "#f5efe1",
  ink: "#0d2a36",
  mute: "#5b6b75",
  mint: "#5fb5ad",
  teal: "#0d5a6e",
  tealDeep: "#0a4252",
  line: "rgba(13,42,54,0.08)",
};

const NAV: [string, string, string][] = [
  ["01", "Book", "#book"],
  ["02", "Services", "#services"],
  ["03", "Why Us", "#why"],
  ["04", "Coverage", "#coverage"],
  ["05", "Contact", "/contact"],
];

function ScrollSection({
  children,
  isLast = false,
  id,
}: {
  children: React.ReactNode;
  isLast?: boolean;
  id?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: isLast ? ["start end", "end end"] : ["start end", "end start"],
  });

  const opacity = useTransform(
    scrollYProgress,
    isLast ? [0, 0.35, 1] : [0, 0.25, 0.75, 1],
    isLast ? [0, 1, 1] : [0, 1, 1, 0],
  );

  const y = useTransform(
    scrollYProgress,
    isLast ? [0, 0.35, 1] : [0, 0.25, 0.75, 1],
    isLast ? [60, 0, 0] : [60, 0, 0, -60],
  );

  const scale = useTransform(
    scrollYProgress,
    isLast ? [0, 0.35, 1] : [0, 0.25, 0.75, 1],
    isLast ? [0.97, 1, 1] : [0.97, 1, 1, 0.97],
  );

  return (
    <motion.div
      id={id}
      ref={containerRef}
      style={{ opacity, y, scale, willChange: "transform, opacity", position: "relative" }}
      className="relative origin-center"
    >
      {children}
    </motion.div>
  );
}

export function Hero({ visible = true }: { visible?: boolean }) {
  return (
    // `sticky-safe` enforces overflow-x: clip + overflow-y: visible so descendant
    // `position: sticky` sections (e.g. Services scroll-pinned stage) keep working.
    // Do NOT change to `overflow-hidden` — it silently breaks all sticky children.
    <div
      className="sticky-safe relative min-h-screen"
      style={{ background: C.bg, color: C.ink, fontFamily: "'Inter', sans-serif" }}
    >
      <Navigation visible={visible} />
      <HeroSection visible={visible} />
      <BookingPanel />
      <ScrollSection id="why">
        <WhyChooseUs />
      </ScrollSection>
      <ScrollSection>
        <TrustBar />
      </ScrollSection>
      <div className="hidden md:block">
        <Services />
      </div>
      <MobileServices />
      <ScrollSection id="coverage">
        <Coverage />
      </ScrollSection>
      <ScrollSection>
        <Fleet />
      </ScrollSection>
      <ScrollSection>
        <Journey />
      </ScrollSection>
      <ScrollSection>
        <Testimonials />
      </ScrollSection>
      <ScrollSection>
        <FAQ />
      </ScrollSection>
      <ScrollSection>
        <FinalCTA />
      </ScrollSection>
      <ScrollSection isLast>
        <Footer />
      </ScrollSection>
    </div>
  );
}

/* ─────────────────── HERO ─────────────────── */
function HeroSection({ visible }: { visible: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 180]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % SLIDESHOW_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      ref={ref}
      style={{ position: "relative" }}
      className="relative md:h-screen md:min-h-[760px] h-auto min-h-0 w-full overflow-hidden"
    >
      <motion.div style={{ y, opacity: 1, position: "absolute" }} className="absolute inset-0">
        <AnimatePresence mode="popLayout">
          <motion.img
            key={currentIdx}
            src={SLIDESHOW_IMAGES[currentIdx]}
            alt="Shafsky Aviation services slideshow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full object-cover scale-110"
          />
        </AnimatePresence>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(250,245,234,0.55) 0%, rgba(250,245,234,0.2) 35%, rgba(250,245,234,0.95) 100%)",
          }}
        />
      </motion.div>

      <div className="relative z-10 mx-auto flex h-full max-w-[1480px] flex-col justify-center px-6 pt-28 pb-32 md:px-14 md:pt-28 md:pb-28 lg:pt-32">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 14 }}
          transition={{ duration: 0.9, delay: 0.4 }}
          className="flex items-center gap-3 text-[9px] md:text-[10px] uppercase tracking-[0.45em]"
          style={{ ...mono, color: "#ffffff" }}
        >
          <span className="h-px w-8 md:w-12 bg-white" />
          Shafsky Aviation Services Pvt. Ltd. · India & Global
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 40 }}
          transition={{ duration: 1.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 md:mt-8 max-w-[850px] text-[clamp(1.85rem,5.5vw,4.25rem)] leading-[1.12] font-extrabold tracking-tight"
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: "#ffffff",
            letterSpacing: "-0.02em",
          }}
        >
          <motion.span
            className="inline-block cursor-default origin-left"
            whileHover={{ scale: 1.02, color: "#f5efe1" }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            Welcome aboard
          </motion.span>
          <br />
          <motion.span
            className="inline-block cursor-default italic origin-left"
            style={{ color: "#ff6b00", display: "inline-block" }}
            whileHover={{
              scale: 1.08,
              rotate: -1.5,
              color: "#ff8533",
            }}
            transition={{ type: "spring", stiffness: 450, damping: 12 }}
          >
            Suswagatam
          </motion.span>{" "}
          <motion.span
            className="inline-block cursor-default origin-left"
            whileHover={{ scale: 1.02, color: "#f5efe1" }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            from
          </motion.span>
          <br />
          <motion.span
            className="inline-block cursor-default origin-left"
            whileHover={{ scale: 1.02, color: "#f5efe1" }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            Shafsky Aviation
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : 20 }}
          transition={{ duration: 0.9, delay: 0.95 }}
          className="mt-6 md:mt-8 max-w-xl text-[14px] md:text-[16px] leading-relaxed"
          style={{ color: "rgba(255, 255, 255, 0.85)" }}
        >
          Meet & Greet, private lounge access, premium ground transport, and concierge —
          orchestrated across India's busiest airports and global hubs since 2022.
        </motion.p>
      </div>

      {/* scroll cue */}
      <motion.div
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-[9px] uppercase tracking-[0.5em]"
        style={{ ...mono, color: C.mute }}
        animate={{ y: [0, 6, 0], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      >
        Book Below ↓
      </motion.div>
    </section>
  );
}

/* ─────────────────── BOOKING PANEL ─────────────────── */
function DoublePlaneIcon({ className }: { className?: string }) {
  return (
    <span
      className={`relative flex items-center justify-center h-4.5 w-4.5 shrink-0 ${className || ""}`}
    >
      {/* Background Curved Exchange Arrows SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute inset-0 w-full h-full text-current pointer-events-none"
      >
        {/* Left curved arrow */}
        <path d="M10 3.5A8.5 8.5 0 0 0 3 11.5" />
        <polyline points="1 9.5 3 11.5 5 9.5" />

        {/* Right curved arrow */}
        <path d="M14 20.5a8.5 8.5 0 0 0 7-8" />
        <polyline points="23 14.5 21 12.5 19 14.5" />
      </svg>

      {/* Top-Right Plane */}
      <Plane className="w-3.5 h-3.5 text-current translate-x-[2.5px] translate-y-[-2.5px] shrink-0 relative z-10" />

      {/* Bottom-Left Plane */}
      <Plane className="absolute w-3.5 h-3.5 text-current translate-x-[-2.5px] translate-y-[2.5px] rotate-180 shrink-0 z-10" />
    </span>
  );
}

function BookingPanel() {
  const [tab, setTab] = useState<"arrival" | "departure" | "connection">("arrival");
  const [showPassengerModal, setShowPassengerModal] = useState(false);
  const [adults, setAdults] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);
  const [bags, setBags] = useState(1);
  const [flightNumber, setFlightNumber] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

  // Connection Mode Extra Flight Inputs
  const [flightNumber2, setFlightNumber2] = useState("");
  const [departDate2, setDepartDate2] = useState("");
  const [datePopoverOpen2, setDatePopoverOpen2] = useState(false);

  const todayStart = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Field validation touched states
  const [touched, setTouched] = useState({
    flightNumber: false,
    departDate: false,
    flightNumber2: false,
    departDate2: false,
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowPassengerModal(false);
        setDatePopoverOpen(false);
        setDatePopoverOpen2(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Reset touched validation markers when tab changes
  useEffect(() => {
    setTouched({
      flightNumber: false,
      departDate: false,
      flightNumber2: false,
      departDate2: false,
    });
  }, [tab]);

  const dateValue = departDate && isValid(new Date(departDate)) ? parseISO(departDate) : undefined;
  const dateValue2 =
    departDate2 && isValid(new Date(departDate2)) ? parseISO(departDate2) : undefined;

  const isArrivalDepartureValid = flightNumber.trim() !== "" && departDate !== "";
  const isConnectionValid =
    flightNumber.trim() !== "" &&
    departDate !== "" &&
    flightNumber2.trim() !== "" &&
    departDate2 !== "";

  const isFormValid = tab === "connection" ? isConnectionValid : isArrivalDepartureValid;

  const tabs: [typeof tab, string, React.ComponentType<{ className?: string }>][] = [
    ["arrival", "Arrival", PlaneLanding],
    ["departure", "Departure", PlaneTakeoff],
    ["connection", "Connection", DoublePlaneIcon],
  ];

  return (
    <section id="book" className="relative -mt-20 md:-mt-32 px-4 pb-16 md:px-14 md:pb-32">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-[1280px] rounded-3xl shadow-[0_32px_120px_-16px_rgba(13,42,54,0.18)] border z-20 overflow-hidden"
        style={{
          borderColor: "rgba(255, 255, 255, 0.4)",
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.03) 50%, rgba(95, 181, 173, 0.06) 100%)",
          backdropFilter: "blur(45px) saturate(160%)",
          boxShadow:
            "0 32px 120px -16px rgba(13, 42, 54, 0.18), inset 0 1px 3px rgba(255, 255, 255, 0.65), inset 0 -1px 3px rgba(13, 90, 110, 0.15)",
        }}
      >
        {/* Decorative Specular Glare / Rainbow Sheen Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/12 pointer-events-none rounded-[22px]" />
        <div
          className="absolute inset-0 pointer-events-none rounded-[22px] opacity-[0.03]"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, rgba(255, 107, 0, 0.4) 0%, transparent 60%), radial-gradient(circle at 20% 80%, rgba(95, 181, 173, 0.4) 0%, transparent 60%)",
          }}
        />

        {/* Header Strip */}
        <div
          className="px-8 py-5 md:px-12 border-b border-white/15 rounded-t-[22px] relative z-10"
          style={{
            background:
              "linear-gradient(90deg, rgba(95, 181, 173, 0.08) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 107, 0, 0.04) 100%)",
          }}
        >
          <h2
            className="text-center text-[10px] font-bold uppercase tracking-[0.24em] flex items-center justify-center gap-2"
            style={{ color: C.teal, fontFamily: "'JetBrains Mono', monospace" }}
          >
            <Sparkles size={12} />
            WELCOME Aboard · GET AN INSTANT QUOTE FOR YOUR NEXT TRIP
            <Sparkles size={12} />
          </h2>
        </div>

        <div className="grid gap-8 p-6 md:grid-cols-12 md:gap-10 md:p-10">
          {/* LEFT — Tabs + Flight Info (7 cols on desktop) */}
          <div className="md:col-span-7 flex flex-col gap-6">
            {/* Tabs (Segmented Control) */}
            <div className="relative flex rounded-xl bg-white/10 border border-white/15 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] p-1 max-w-md">
              {tabs.map(([k, label, Icon]) => {
                const active = tab === k;
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setTab(k)}
                    className="relative flex-1 py-2.5 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] outline-none transition-colors z-10"
                    style={{
                      ...mono,
                      color: active ? "#ffffff" : C.mute,
                    }}
                  >
                    {active && (
                      <motion.div
                        layoutId="activeBookingTabPill"
                        className="absolute inset-0 rounded-lg"
                        style={{
                          backgroundColor: C.teal,
                          boxShadow:
                            "0 4px 12px rgba(13,90,110,0.35), inset 0 1px 1px rgba(255,255,255,0.25)",
                        }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className="h-3.5 w-3.5 relative z-20" />
                    <span className="relative z-20">{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Inputs */}
            {tab === "connection" ? (
              <div className="flex flex-col gap-5">
                {/* Row 1 */}
                <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[1.5fr_1.2fr_auto] sm:items-start">
                  <div className="flex gap-2 w-full items-start">
                    <div className="relative flex flex-col gap-1 flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Enter Your Flight Number e.g. AERO77"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                        onBlur={() => setTouched((t) => ({ ...t, flightNumber: true }))}
                        className={`w-full h-12 rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 focus:bg-white/20 focus:ring-4 focus:ring-teal/5 ${
                          touched.flightNumber && !flightNumber.trim()
                            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }`}
                        style={{
                          borderColor:
                            touched.flightNumber && !flightNumber.trim()
                              ? undefined
                              : "rgba(255,255,255,0.25)",
                          color: C.ink,
                          boxShadow:
                            "inset 0 1.5px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(255,255,255,0.1)",
                        }}
                      />
                      {touched.flightNumber && !flightNumber.trim() && (
                        <span className="text-[9px] text-red-500 font-medium ml-1 mt-0.5">
                          Flight number required
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label="Help"
                      className="grid h-12 w-12 shrink-0 place-items-center rounded-xl transition hover:bg-white/20 active:scale-95 border sm:hidden"
                      style={{
                        borderColor: "rgba(255,255,255,0.25)",
                        background: "rgba(255,255,255,0.08)",
                        backdropFilter: "blur(8px)",
                        color: C.teal,
                        boxShadow:
                          "inset 0 1px 1px rgba(255,255,255,0.2), 0 1.5px 3px rgba(0,0,0,0.02)",
                      }}
                    >
                      <HelpCircle className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="relative flex flex-col gap-1 w-full">
                    <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-haspopup="dialog"
                          aria-expanded={datePopoverOpen}
                          onBlur={() => setTouched((t) => ({ ...t, departDate: true }))}
                          className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 focus:bg-white/20 focus:ring-4 focus:ring-teal/5 cursor-pointer ${
                            touched.departDate && !departDate
                              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                              : ""
                          }`}
                          style={{
                            borderColor:
                              touched.departDate && !departDate
                                ? undefined
                                : "rgba(255,255,255,0.25)",
                            color: C.ink,
                            boxShadow:
                              "inset 0 1.5px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(255,255,255,0.1)",
                          }}
                        >
                          <span className="truncate flex items-center gap-2">
                            <Calendar size={14} style={{ color: C.teal }} />
                            {departDate && dateValue ? format(dateValue, "PPP") : "Arrival Date"}
                          </span>
                          <ChevronDown
                            size={14}
                            className={`opacity-60 transition-transform duration-200 ${datePopoverOpen ? "rotate-180" : ""}`}
                          />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-3 rounded-2xl shadow-xl border z-50 animate-in fade-in zoom-in-95 duration-200"
                        style={{
                          borderColor: "rgba(255,255,255,0.4)",
                          background:
                            "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%)",
                          backdropFilter: "blur(24px)",
                          color: C.ink,
                          boxShadow:
                            "0 24px 50px rgba(13,42,54,0.15), inset 0 1px 2px rgba(255,255,255,0.6)",
                        }}
                        align="start"
                      >
                        <CalendarPicker
                          mode="single"
                          selected={dateValue}
                          onSelect={(date) => {
                            if (date) {
                              setDepartDate(format(date, "yyyy-MM-dd"));
                              setDatePopoverOpen(false);
                            }
                          }}
                          initialFocus
                          disabled={{ before: todayStart }}
                        />
                      </PopoverContent>
                    </Popover>
                    {touched.departDate && !departDate && (
                      <span className="text-[9px] text-red-500 font-medium ml-1 mt-0.5">
                        Date is required
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    aria-label="Help"
                    className="hidden sm:grid h-12 w-12 place-items-center rounded-xl transition hover:bg-white/20 active:scale-95 border"
                    style={{
                      borderColor: "rgba(255,255,255,0.25)",
                      background: "rgba(255,255,255,0.08)",
                      backdropFilter: "blur(8px)",
                      color: C.teal,
                      boxShadow:
                        "inset 0 1px 1px rgba(255,255,255,0.2), 0 1.5px 3px rgba(0,0,0,0.02)",
                    }}
                  >
                    <HelpCircle className="h-5 w-5" />
                  </button>
                </div>

                {/* Row 2 */}
                <div className="grid gap-4 sm:grid-cols-[1.5fr_1.2fr_auto] items-start">
                  <div className="relative flex flex-col gap-1 w-full">
                    <input
                      type="text"
                      placeholder="Enter Your Flight Number e.g. AERO77"
                      value={flightNumber2}
                      onChange={(e) => setFlightNumber2(e.target.value.toUpperCase())}
                      onBlur={() => setTouched((t) => ({ ...t, flightNumber2: true }))}
                      className={`w-full h-12 rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 focus:bg-white/20 focus:ring-4 focus:ring-teal/5 ${
                        touched.flightNumber2 && !flightNumber2.trim()
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : ""
                      }`}
                      style={{
                        borderColor:
                          touched.flightNumber2 && !flightNumber2.trim()
                            ? undefined
                            : "rgba(255,255,255,0.25)",
                        color: C.ink,
                        boxShadow:
                          "inset 0 1.5px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(255,255,255,0.1)",
                      }}
                    />
                    {touched.flightNumber2 && !flightNumber2.trim() && (
                      <span className="text-[9px] text-red-500 font-medium ml-1 mt-0.5">
                        Flight number required
                      </span>
                    )}
                  </div>

                  <div className="relative flex flex-col gap-1 w-full">
                    <Popover open={datePopoverOpen2} onOpenChange={setDatePopoverOpen2}>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          aria-haspopup="dialog"
                          aria-expanded={datePopoverOpen2}
                          onBlur={() => setTouched((t) => ({ ...t, departDate2: true }))}
                          className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 focus:bg-white/20 focus:ring-4 focus:ring-teal/5 cursor-pointer ${
                            touched.departDate2 && !departDate2
                              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                              : ""
                          }`}
                          style={{
                            borderColor:
                              touched.departDate2 && !departDate2
                                ? undefined
                                : "rgba(255,255,255,0.25)",
                            color: C.ink,
                            boxShadow:
                              "inset 0 1.5px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(255,255,255,0.1)",
                          }}
                        >
                          <span className="truncate flex items-center gap-2">
                            <Calendar size={14} style={{ color: C.teal }} />
                            {departDate2 && dateValue2
                              ? format(dateValue2, "PPP")
                              : "Departure Date"}
                          </span>
                          <ChevronDown
                            size={14}
                            className={`opacity-60 transition-transform duration-200 ${datePopoverOpen2 ? "rotate-180" : ""}`}
                          />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-3 rounded-2xl shadow-xl border z-50 animate-in fade-in zoom-in-95 duration-200"
                        style={{
                          borderColor: "rgba(255,255,255,0.4)",
                          background:
                            "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%)",
                          backdropFilter: "blur(24px)",
                          color: C.ink,
                          boxShadow:
                            "0 24px 50px rgba(13,42,54,0.15), inset 0 1px 2px rgba(255,255,255,0.6)",
                        }}
                        align="start"
                      >
                        <CalendarPicker
                          mode="single"
                          selected={dateValue2}
                          onSelect={(date) => {
                            if (date) {
                              setDepartDate2(format(date, "yyyy-MM-dd"));
                              setDatePopoverOpen2(false);
                            }
                          }}
                          initialFocus
                          disabled={{ before: todayStart }}
                        />
                      </PopoverContent>
                    </Popover>
                    {touched.departDate2 && !departDate2 && (
                      <span className="text-[9px] text-red-500 font-medium ml-1 mt-0.5">
                        Date is required
                      </span>
                    )}
                  </div>

                  {/* Desktop spacer placeholder, hidden on mobile */}
                  <div className="hidden sm:block w-12 h-12 pointer-events-none" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[1.5fr_1.2fr_auto] sm:items-start">
                <div className="flex gap-2 w-full items-start">
                  <div className="relative flex flex-col gap-1 flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Enter Your Flight Number e.g. AERO77"
                      value={flightNumber}
                      onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                      onBlur={() => setTouched((t) => ({ ...t, flightNumber: true }))}
                      className={`w-full h-12 rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 focus:bg-white/20 focus:ring-4 focus:ring-teal/5 ${
                        touched.flightNumber && !flightNumber.trim()
                          ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                          : ""
                      }`}
                      style={{
                        borderColor:
                          touched.flightNumber && !flightNumber.trim()
                            ? undefined
                            : "rgba(255,255,255,0.25)",
                        color: C.ink,
                        boxShadow:
                          "inset 0 1.5px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(255,255,255,0.1)",
                      }}
                    />
                    {touched.flightNumber && !flightNumber.trim() && (
                      <span className="text-[9px] text-red-500 font-medium ml-1 mt-0.5">
                        Flight number required
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    aria-label="Help"
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-xl transition hover:bg-white/20 active:scale-95 border sm:hidden"
                    style={{
                      borderColor: "rgba(255,255,255,0.25)",
                      background: "rgba(255,255,255,0.08)",
                      backdropFilter: "blur(8px)",
                      color: C.teal,
                      boxShadow:
                        "inset 0 1px 1px rgba(255,255,255,0.2), 0 1.5px 3px rgba(0,0,0,0.02)",
                    }}
                  >
                    <HelpCircle className="h-5 w-5" />
                  </button>
                </div>

                <div className="relative flex flex-col gap-1 w-full">
                  <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-haspopup="dialog"
                        aria-expanded={datePopoverOpen}
                        onBlur={() => setTouched((t) => ({ ...t, departDate: true }))}
                        className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 focus:bg-white/20 focus:ring-4 focus:ring-teal/5 cursor-pointer ${
                          touched.departDate && !departDate
                            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                            : ""
                        }`}
                        style={{
                          borderColor:
                            touched.departDate && !departDate
                              ? undefined
                              : "rgba(255,255,255,0.25)",
                          color: C.ink,
                          boxShadow:
                            "inset 0 1.5px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(255,255,255,0.1)",
                        }}
                      >
                        <span className="truncate flex items-center gap-2">
                          <Calendar size={14} style={{ color: C.teal }} />
                          {departDate && dateValue
                            ? format(dateValue, "PPP")
                            : tab === "arrival"
                              ? "Arrival Date"
                              : "Departure Date"}
                        </span>
                        <ChevronDown
                          size={14}
                          className={`opacity-60 transition-transform duration-200 ${datePopoverOpen ? "rotate-180" : ""}`}
                        />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-3 rounded-2xl shadow-xl border z-50 animate-in fade-in zoom-in-95 duration-200"
                      style={{
                        borderColor: "rgba(255,255,255,0.4)",
                        background:
                          "linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.92) 100%)",
                        backdropFilter: "blur(24px)",
                        color: C.ink,
                        boxShadow:
                          "0 24px 50px rgba(13,42,54,0.15), inset 0 1px 2px rgba(255,255,255,0.6)",
                      }}
                      align="start"
                    >
                      <CalendarPicker
                        mode="single"
                        selected={dateValue}
                        onSelect={(date) => {
                          if (date) {
                            setDepartDate(format(date, "yyyy-MM-dd"));
                            setDatePopoverOpen(false);
                          }
                        }}
                        initialFocus
                        disabled={{ before: todayStart }}
                      />
                    </PopoverContent>
                  </Popover>
                  {touched.departDate && !departDate && (
                    <span className="text-[9px] text-red-500 font-medium ml-1 mt-0.5">
                      Date is required
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  aria-label="Help"
                  className="hidden sm:grid h-12 w-12 place-items-center rounded-xl transition hover:bg-white/20 active:scale-95 border"
                  style={{
                    borderColor: "rgba(255,255,255,0.25)",
                    background: "rgba(255,255,255,0.08)",
                    backdropFilter: "blur(8px)",
                    color: C.teal,
                    boxShadow:
                      "inset 0 1px 1px rgba(255,255,255,0.2), 0 1.5px 3px rgba(0,0,0,0.02)",
                  }}
                >
                  <HelpCircle className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* RIGHT — Pax/Bags + Search Button (5 cols on desktop) */}
          <div
            className="md:col-span-5 relative flex flex-col justify-between gap-6 border-t border-white/10 pt-8 mt-4 md:border-t-0 md:pt-0 md:mt-0 md:border-l md:pl-10"
            style={{ borderColor: "rgba(255,255,255,0.2)" }}
          >
            <div>
              <div
                className="flex items-center gap-2.5 text-xs font-semibold"
                style={{ color: C.ink }}
              >
                <span style={mono}>Need more than one service type?</span>
                <button
                  type="button"
                  aria-label="More information"
                  className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-bold border hover:bg-white/20 active:scale-95 transition"
                  style={{
                    borderColor: "rgba(255,255,255,0.25)",
                    background: "rgba(255,255,255,0.08)",
                    color: C.teal,
                  }}
                >
                  ?
                </button>
              </div>

              {/* Custom Interactive Passenger / Bag Selectors */}
              <div className="relative mt-4">
                <Popover open={showPassengerModal} onOpenChange={setShowPassengerModal}>
                  <PopoverTrigger asChild>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className="flex h-12 w-full items-center justify-between rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 cursor-pointer"
                        style={{
                          borderColor: "rgba(255,255,255,0.25)",
                          color: C.ink,
                          boxShadow:
                            "inset 0 1.5px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(255,255,255,0.1)",
                        }}
                      >
                        <span className="truncate flex items-center gap-2">
                          <Users size={14} style={{ color: C.teal }} />
                          {adults + childrenCount + infants} Pax ({adults} Ad)
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 opacity-60 transition-transform duration-200 ${showPassengerModal ? "rotate-180" : ""}`}
                        />
                      </button>

                      <button
                        type="button"
                        className="flex h-12 w-full items-center justify-between rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 cursor-pointer"
                        style={{
                          borderColor: "rgba(255,255,255,0.25)",
                          color: C.ink,
                          boxShadow:
                            "inset 0 1.5px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(255,255,255,0.1)",
                        }}
                      >
                        <span className="truncate flex items-center gap-2">
                          <Package size={14} style={{ color: C.teal }} />
                          {bags} Bag{bags > 1 ? "s" : ""}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 opacity-60 transition-transform duration-200 ${showPassengerModal ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[320px] p-5 rounded-2xl border backdrop-blur-2xl z-[100]"
                    style={{
                      borderColor: "rgba(255, 255, 255, 0.45)",
                      background:
                        "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.88) 100%)",
                      color: C.ink,
                      boxShadow:
                        "0 32px 60px rgba(13,42,54,0.22), inset 0 1px 2px rgba(255,255,255,0.6)",
                    }}
                    align="end"
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-2">
                      <h3
                        className="text-xs font-bold uppercase tracking-wider text-gray-800"
                        style={mono}
                      >
                        Choose travelers
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowPassengerModal(false)}
                        className="text-[10px] font-semibold uppercase tracking-wider text-teal hover:opacity-75"
                        style={{ ...mono, color: C.teal }}
                      >
                        Done
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Adult */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-800">Adult(s)</span>
                          <span className="text-[10px] text-gray-500 font-medium">12 years+</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setAdults(Math.max(1, adults - 1))}
                            disabled={adults <= 1}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-lg font-semibold transition hover:bg-black/5 active:scale-95 disabled:opacity-30 outline-none"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-gray-800">
                            {adults}
                          </span>
                          <button
                            type="button"
                            onClick={() => setAdults(adults + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-lg font-semibold transition hover:bg-black/5 active:scale-95 outline-none"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Child */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-800">Child</span>
                          <span className="text-[10px] text-gray-500 font-medium">
                            2 - 12 years
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                            disabled={childrenCount <= 0}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-lg font-semibold transition hover:bg-black/5 active:scale-95 disabled:opacity-30 outline-none"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-gray-800">
                            {childrenCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => setChildrenCount(childrenCount + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-lg font-semibold transition hover:bg-black/5 active:scale-95 outline-none"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Infant */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-800">Infant</span>
                          <span className="text-[10px] text-gray-500 font-medium">
                            Below 2 years
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setInfants(Math.max(0, infants - 1))}
                            disabled={infants <= 0}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-lg font-semibold transition hover:bg-black/5 active:scale-95 disabled:opacity-30 outline-none"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-gray-800">
                            {infants}
                          </span>
                          <button
                            type="button"
                            onClick={() => setInfants(infants + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-lg font-semibold transition hover:bg-black/5 active:scale-95 outline-none"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Bags */}
                      <div className="flex items-center justify-between border-t border-black/5 pt-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-800">Bag(s)</span>
                          <span className="text-[10px] text-gray-500 font-medium">
                            Standard check-in
                          </span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setBags(Math.max(0, bags - 1))}
                            disabled={bags <= 0}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-lg font-semibold transition hover:bg-black/5 active:scale-95 disabled:opacity-30 outline-none"
                          >
                            -
                          </button>
                          <span className="w-5 text-center text-xs font-bold text-gray-800">
                            {bags}
                          </span>
                          <button
                            type="button"
                            onClick={() => setBags(bags + 1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 text-lg font-semibold transition hover:bg-black/5 active:scale-95 outline-none"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Link
              to="/book"
              search={{
                origin: tab === "departure" ? flightNumber : "",
                destination: tab === "arrival" ? flightNumber : "",
                depart_date: departDate,
                pax_adults: adults,
                pax_children: childrenCount,
                pax_infants: infants,
                notes:
                  tab === "connection"
                    ? `Connection Flight 1: ${flightNumber} on ${departDate} | Flight 2: ${flightNumber2} on ${departDate2}`
                    : flightNumber
                      ? `Flight Number: ${flightNumber} (${tab})`
                      : "",
              }}
              onClick={(e) => {
                if (!isFormValid) {
                  e.preventDefault();
                  // Trigger validation display for all fields
                  setTouched({
                    flightNumber: true,
                    departDate: true,
                    flightNumber2: true,
                    departDate2: true,
                  });
                }
              }}
              className={`mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-[11px] font-semibold uppercase tracking-[0.24em] transition ${
                isFormValid
                  ? "hover:brightness-110 shadow-lg cursor-pointer"
                  : "opacity-45 cursor-not-allowed"
              }`}
              style={{
                ...mono,
                background: "linear-gradient(135deg, #0d5a6e 0%, #083c4b 100%)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                boxShadow: isFormValid
                  ? "0 12px 28px -6px rgba(13,90,110,0.55), inset 0 1px 1px rgba(255,255,255,0.3)"
                  : "none",
              }}
            >
              <Search className="h-4 w-4" />
              Search Flights
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Field({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div
      className="flex h-12 items-center gap-3 rounded-lg px-4"
      style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.25)" }}
    >
      {children}
      {icon}
    </div>
  );
}

function Select({ label, options }: { label: string; options: string[] }) {
  const [v, setV] = useState(options[0]);
  const selectId = `bk-${label.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
  return (
    <div className="relative">
      <label htmlFor={selectId} className="sr-only">
        {label}
      </label>
      <select
        id={selectId}
        aria-label={label}
        value={v}
        onChange={(e) => setV(e.target.value)}
        className="h-12 w-full appearance-none rounded-lg bg-transparent px-4 pr-10 text-[14px] outline-none"
        style={{ color: "#fff", border: "1px solid rgba(255,255,255,0.25)" }}
      >
        {options.map((o) => (
          <option key={o} value={o} style={{ color: C.ink }}>
            {o} {label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
    </div>
  );
}

/* ─────────────────── WHY CHOOSE US ─────────────────── */
function WhyChooseUs() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Established 2022",
      body: "Built for modern private aviation, putting safety, luxury, and absolute discretion at the core of every operation.",
    },
    {
      icon: Headphones,
      title: "24×7 Concierge",
      body: "Round-the-clock support across every time zone — one call, one signature experience.",
    },
    {
      icon: Globe2,
      title: "Pan-India + Global Network",
      body: "Live operations at 20+ Indian airports and 12+ international hubs with standing slot agreements.",
    },
    {
      icon: Sparkles,
      title: "Suswagatam Hospitality",
      body: "Warm Indian welcome paired with world-class professionalism — every guest, every flight.",
    },
    {
      icon: Clock,
      title: "Fast-Track Everything",
      body: "Skip the queues. Immigration, security and baggage handled before you even arrive.",
    },
    {
      icon: Award,
      title: "Elite Standards",
      body: "Vetted by family offices, diplomatic delegations, and Fortune 500 boards for seamless flight operations.",
    },
    {
      icon: Users,
      title: "Dedicated Personal Escort",
      body: "A single point of accountability from kerbside to cabin — never a handoff, never a wait.",
    },
    {
      icon: Plane,
      title: "End-to-end Travel",
      body: "Meet & Greet, lounge access, premium transport and hotel booking services — one team.",
    },
  ];
  return (
    <section
      id="why"
      className="relative px-6 py-16 md:px-14 md:py-36"
      style={{ background: C.paper }}
    >
      <div className="mx-auto max-w-[1480px]">
        <div className="text-center">
          <div
            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em]"
            style={{ ...mono, color: C.teal }}
          >
            <span className="h-px w-10" style={{ background: C.teal }} />
            Why Choose Shafsky
            <span className="h-px w-10" style={{ background: C.teal }} />
          </div>
          <h2
            className="mx-auto mt-6 max-w-3xl text-[clamp(2.2rem,5vw,4.4rem)] leading-[1.05]"
            style={display}
          >
            The standard the rest{" "}
            <span className="italic" style={{ color: C.teal }}>
              measure
            </span>{" "}
            against.
          </h2>
          <div className="mx-auto mt-6 flex items-center justify-center gap-4">
            <span className="h-px w-16" style={{ background: C.mint }} />
            <Plane className="h-4 w-4 -rotate-45" style={{ color: C.teal }} />
            <span className="h-px w-16" style={{ background: C.mint }} />
          </div>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10px" }}
                transition={{ duration: 0.7, delay: (i % 4) * 0.08 }}
                className="group relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white to-[#e8dfce] p-8 shadow-[10px_10px_20px_#e6ded0,-10px_-10px_20px_#ffffff] transition-all duration-500 hover:from-[#f5efe1] hover:to-[#f5efe1] hover:shadow-[inset_6px_6px_12px_#e6ded0,inset_-6px_-6px_12px_#ffffff]"
              >
                <div className="transition-transform duration-500 group-hover:translate-y-[1px]">
                  <div
                    className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-white to-[#e8dfce] shadow-[4px_4px_8px_#e6ded0,-4px_-4px_8px_#ffffff] transition-all duration-500 group-hover:from-[#f5efe1] group-hover:to-[#f5efe1] group-hover:shadow-[inset_3px_3px_6px_#e6ded0,inset_-3px_-3px_6px_#ffffff]"
                    style={{ color: C.teal }}
                  >
                    <Icon className="h-5 w-5 transition-transform duration-500 group-hover:scale-110" />
                  </div>
                  <h3 className="mt-6 text-[20px] leading-tight" style={display}>
                    {it.title}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed" style={{ color: C.mute }}>
                    {it.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── TRUST BAR ─────────────────── */
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1800;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(Math.round(end * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, end]);
  return (
    <span ref={ref}>
      {v.toLocaleString()}
      {suffix}
    </span>
  );
}

function TrustBar() {
  const stats: [number, string, string, string][] = [
    [100, "%", "Reliability", "Dispatch safety record"],
    [20, "+", "Airports", "India & global hubs"],
    [42000, "+", "Guests", "Welcomed annually"],
    [12, "min", "Response", "Average dispatch"],
  ];
  return (
    <section className="relative px-6 py-12 md:px-14 md:py-24" style={{ background: C.bg }}>
      <div className="mx-auto grid max-w-[1480px] grid-cols-1 xs:grid-cols-2 gap-6 md:gap-8 md:grid-cols-4">
        {stats.map(([n, suf, l, sub], i) => (
          <motion.div
            key={l}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: i * 0.08 }}
            className="group relative overflow-hidden rounded-[2rem] p-6 md:p-8 bg-gradient-to-br from-white to-[#f0e9db] shadow-[8px_8px_16px_#eee7d8,-8px_-8px_16px_#ffffff] transition-all duration-500 hover:from-[#faf5ea] hover:to-[#faf5ea] hover:shadow-[inset_6px_6px_12px_#eee7d8,inset_-6px_-6px_12px_#ffffff]"
          >
            <div className="transition-transform duration-500 group-hover:translate-y-[1px]">
              <div
                className="text-[clamp(1.8rem,4vw,3.4rem)] leading-none"
                style={{ ...display, color: C.ink }}
              >
                <Counter end={n} suffix={suf} />
              </div>
              <div
                className="mt-4 text-[10px] uppercase tracking-[0.35em]"
                style={{ ...mono, color: C.teal }}
              >
                {l}
              </div>
              <div className="mt-1 text-[12px]" style={{ color: C.mute }}>
                {sub}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="flex items-center gap-4 text-[10px] uppercase tracking-[0.45em]"
      style={{ ...mono, color: C.teal }}
    >
      <span className="h-px w-10" style={{ background: C.teal }} />
      {label}
    </motion.div>
  );
}

/* ─────────────────── SERVICES (full-scroll cinematic) ─────────────────── */
type Svc = {
  t: string;
  d: string;
  long: string;
  bullets: string[];
  img: string;
  video?: string;
  gallery?: string[];
  Icon: typeof Plane;
};

const SERVICES: Svc[] = [
  {
    t: "Meet & Greet",
    d: "Personal escort from kerb to gate",
    long: "A dedicated guest relations officer welcomes you the moment you arrive — kerbside or aerobridge — and stays with you until your journey is complete.",
    bullets: ["Kerb-to-cabin escort", "Multi-lingual officers", "Family & senior care"],
    img: meetGreetImg,
    video: meetVideo,
    Icon: Sparkles,
  },
  {
    t: "Lounge Access",
    d: "Premium domestic & international",
    long: "Curated access to the finest domestic and international lounges across our 20+ airport Indian network and 12+ global hubs.",
    bullets: ["Premium F&B", "Private suites on request", "Showers & rest pods"],
    img: lounge,
    Icon: Crown,
  },
  {
    t: "Fast-Track Immigration",
    d: "Skip the queues, every time",
    long: "Pre-cleared paperwork, dedicated counters and silent priority handling at immigration, security and baggage.",
    bullets: ["Priority immigration", "Dedicated security lane", "Baggage delivered first"],
    img: fastTrackImg,
    Icon: Ticket,
  },
  {
    t: "Premium Transport",
    d: "Chauffeured airport transfers",
    long: "BMW 7, Mercedes S-Class and Audi A8 with vetted chauffeurs — pre-staged at your aircraft door.",
    bullets: ["Tarmac transfers", "Luxury saloons & SUVs", "24×7 dispatch"],
    img: vipTransport1,
    gallery: [vipTransport1, vipTransport2, vipTransport3, vipTransport4, vipTransport5],
    Icon: Car,
  },
  {
    t: "Hotel Booking Services",
    d: "Curated stays near major hubs",
    long: "Trusted partnerships with airport-precinct flagships and inner-city palaces — booked, briefed and arrival-ready.",
    bullets: ["Late check-out hold", "Tarmac-to-suite handoff", "Loyalty matched"],
    img: hotelImg,
    Icon: Hotel,
  },
  {
    t: "Cargo Assistance",
    d: "Special baggage handled with care",
    long: "Musical instruments, sports equipment, art freight and oversize baggage — handled with insured, white-glove care.",
    bullets: ["White-glove handling", "Customs liaison", "End-to-end tracking"],
    img: cargoAssistImg,
    Icon: Package,
  },
  {
    t: "Medical Assistance",
    d: "Wheelchair & priority support",
    long: "Wheelchair, ambulift, nursing escort and full medevac coordination across our network of 20+ airports.",
    bullets: ["Wheelchair & ambulift", "Nursing escort", "Medevac coordination"],
    img: medicalAssistImg,
    Icon: HeartPulse,
  },
  {
    t: "VIP Concierge",
    d: "End-to-end travel orchestration",
    long: "One point of accountability for every detail — from charter and crew to dinner, drivers and discretion.",
    bullets: ["Single dedicated officer", "Charter coordination", "Absolute discretion"],
    img: vipConciergeImg,
    Icon: Award,
  },
];

function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  return (
    <section
      id="services"
      ref={ref}
      className="relative"
      style={{ background: C.ink, height: `${(SERVICES.length + 1) * 100}vh`, position: "relative" }}
    >
      {/* sticky stage */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* intro overlay (first viewport) */}
        <ServicesIntro progress={scrollYProgress} />

        {/* the 8 service stages */}
        {SERVICES.map((s, i) => (
          <ServiceStage
            key={s.t}
            s={s}
            index={i}
            progress={scrollYProgress}
            total={SERVICES.length}
          />
        ))}

        {/* progress rail */}
        <ServicesRail progress={scrollYProgress} />
      </div>
    </section>
  );
}

function ServicesIntro({ progress }: { progress: MotionValue<number> }) {
  const N = SERVICES.length;
  const end = 1 / (N + 1);
  const opacity = useTransform(progress, [0, end * 0.65, end], [1, 1, 0]);
  const y = useTransform(progress, [0, end], [0, -60]);
  const pointerEvents = useTransform(progress, [0, end * 0.95, end], ["auto", "auto", "none"]);
  return (
    <motion.div
      style={{ opacity, y, background: C.ink, color: "#fff", pointerEvents }}
      className="absolute inset-0 z-30 flex items-center justify-center px-4 md:px-14"
    >
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="rounded-[3rem] bg-gradient-to-br from-[#0e313f] to-[#0a1e27] p-10 md:p-16 shadow-[15px_15px_30px_#05151b,-15px_-15px_30px_#154357]">
          <div
            className="flex items-center gap-4 text-[10px] uppercase tracking-[0.45em]"
            style={{ ...mono, color: C.mint }}
          >
            <span className="h-px w-10" style={{ background: C.mint }} />
            04 — Our Services
          </div>
          <h2
            className="mt-8 max-w-4xl text-[clamp(2.4rem,6vw,5.5rem)] leading-[1.02]"
            style={display}
          >
            Eight services.
            <br />
            <span className="italic" style={{ color: C.mint }}>
              One signature welcome.
            </span>
          </h2>
          <p className="mt-8 max-w-xl text-[16px] leading-relaxed text-white/70">
            Scroll through each chapter of the Suswagatam journey — coordinated end-to-end by a
            single guest relations officer.
          </p>
          <div
            className="mt-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.5em] text-white/50"
            style={mono}
          >
            Scroll to begin{" "}
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            >
              ↓
            </motion.span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GallerySlideshow({
  images,
  alt,
  scale,
  y,
}: {
  images: string[];
  alt: string;
  scale: MotionValue<number>;
  y: MotionValue<number>;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <motion.div
      style={{ scale, y, transformOrigin: "center center" }}
      className="absolute inset-0 will-change-transform"
    >
      {images.map((src, i) => (
        <img
          key={`slideshow-${src}-${i}`}
          src={src}
          alt={`${alt} ${i + 1}`}
          loading={i === 0 ? "eager" : "lazy"}
          fetchPriority={i === 0 ? "high" : "low"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-[1200ms] ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        />
      ))}
    </motion.div>
  );
}

function ServiceStage({
  s,
  index,
  progress,
  total,
}: {
  s: Svc;
  index: number;
  progress: MotionValue<number>;
  total: number;
}) {
  const slot = 1 / (total + 1);
  const start = (index + 1) * slot;
  const end = (index + 2) * slot;
  const mid = (start + end) / 2;

  const opacity = useTransform(
    progress,
    [start - slot * 0.15, start, end, end + slot * 0.15],
    [0, 1, 1, 0],
  );
  const imgScale = useTransform(progress, [start, end], [1.06, 1.14]);
  const imgY = useTransform(progress, [start, end], [-12, 12]);
  const textY = useTransform(progress, [start, mid, end], [60, 0, -40]);
  const textOpacity = useTransform(
    progress,
    [start, mid - slot * 0.2, mid, end - slot * 0.1, end],
    [0, 1, 1, 1, 0],
  );

  const Icon = s.Icon;

  const pointerEvents = useTransform(
    progress,
    [start - slot * 0.05, start, end, end + slot * 0.05],
    ["none", "auto", "auto", "none"],
  );

  return (
    <motion.div
      style={{ opacity, zIndex: 10 + index, pointerEvents }}
      className="absolute inset-0 grid h-full w-full grid-cols-1 grid-rows-[42svh_minmax(0,1fr)] overflow-hidden md:grid-cols-2 md:grid-rows-1"
      aria-hidden={false}
    >
      <div
        className="relative isolate h-full min-h-0 w-full max-w-full overflow-hidden"
        style={{ contain: "strict" }}
      >
        <div className="absolute inset-0 overflow-hidden">
          {s.video ? (
            <video
              src={s.video}
              autoPlay
              loop
              muted
              playsInline
              disablePictureInPicture
              controls={false}
              onPause={(e) => {
                const v = e.currentTarget;
                v.play().catch(() => {});
              }}
              onContextMenu={(e) => e.preventDefault()}
              style={{
                pointerEvents: "none",
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
          ) : s.gallery ? (
            <GallerySlideshow images={s.gallery} alt={s.t} scale={imgScale} y={imgY} />
          ) : (
            <motion.img
              src={s.img}
              alt={s.t}
              loading="lazy"
              style={{ scale: imgScale, y: imgY, transformOrigin: "center center" }}
              className="block h-full w-full max-w-full object-cover object-center will-change-transform"
            />
          )}
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(10,66,82,0.45), rgba(13,42,54,0.15) 60%, transparent)",
          }}
        />
        <div
          className="pointer-events-none absolute bottom-4 left-4 text-[clamp(3.5rem,14vw,18rem)] leading-none text-white/15 md:bottom-12 md:left-12"
          style={display}
        >
          0{index + 1}
        </div>
      </div>

      <div
        className="relative flex min-h-0 items-center justify-center overflow-y-auto px-3 py-6 xs:px-4 xs:py-8 sm:px-8 md:px-12 md:py-12"
        style={{ background: C.ink, color: "#fff" }}
      >
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="w-full max-w-xl rounded-[2rem] bg-gradient-to-br from-[#0e313f] to-[#0a1e27] p-5 xs:p-6 sm:p-8 md:p-10 shadow-[10px_10px_20px_#05151b,-15px_-15px_30px_#154357]"
        >
          <div
            className="flex items-center gap-4 text-[10px] uppercase tracking-[0.45em]"
            style={{ ...mono, color: C.mint }}
          >
            <span
              className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#0e313f] to-[#0a1e27] shadow-[inset_3px_3px_6px_#05151b,inset_-3px_-3px_6px_#154357]"
              style={{ color: C.mint }}
            >
              <Icon className="h-4 w-4" />
            </span>
            Service 0{index + 1} of {total}
          </div>
          <h3
            className="mt-4 sm:mt-6 text-[clamp(1.75rem,4vw,3.0rem)] leading-[1.05]"
            style={display}
          >
            {s.t}
          </h3>
          <p
            className="mt-3 sm:mt-4 text-[11px] sm:text-[13px] uppercase tracking-[0.25em]"
            style={{ ...mono, color: "rgba(255,255,255,0.55)" }}
          >
            {s.d}
          </p>
          <p className="mt-4 sm:mt-8 text-[13.5px] sm:text-[15px] leading-relaxed text-white/80">
            {s.long}
          </p>
          <ul className="mt-4 sm:mt-8 grid gap-2.5">
            {s.bullets.map((b) => (
              <li
                key={b}
                className="flex items-center gap-3 text-[12px] sm:text-[13px] text-white/85"
              >
                <span className="h-px w-6" style={{ background: C.mint }} />
                {b}
              </li>
            ))}
          </ul>
          <div className="mt-6 sm:mt-10 flex flex-wrap gap-3">
            <Link
              to="/book"
              className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-br from-[#74d0c7] to-[#4fa098] px-5 py-3 sm:px-7 sm:py-3.5 text-[10px] sm:text-[11px] uppercase tracking-[0.3em] shadow-[4px_4px_10px_#05151b,-4px_-4px_10px_rgba(255,255,255,0.05)] transition-all duration-300 hover:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.25),inset_-3px_-3px_6px_rgba(255,255,255,0.2)]"
              style={{ ...mono, color: C.ink }}
            >
              Request this <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <a
              href={`https://wa.me/919599087959?text=Hi!%20I'm%20interested%20in%20booking%20the%20${encodeURIComponent(s.t)}%20airport%20concierge%20service.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-br from-[#0e313f] to-[#0a1e27] px-5 py-3 sm:px-7 sm:py-3.5 text-[10px] sm:text-[11px] uppercase tracking-[0.3em] shadow-[4px_4px_10px_#05151b,-4px_-4px_10px_rgba(255,255,255,0.05)] transition-all duration-300 hover:shadow-[inset_3px_3px_6px_#05151b,inset_-3px_-3px_6px_#154357]"
              style={{ ...mono, color: "#fff" }}
            >
              Talk to us
            </a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ServicesRail({ progress }: { progress: MotionValue<number> }) {
  const scaleY = useTransform(progress, [0, 1], [0, 1]);
  return (
    <div className="pointer-events-none absolute right-6 top-1/2 z-40 hidden -translate-y-1/2 md:block">
      <div className="relative h-[260px] w-px" style={{ background: "rgba(255,255,255,0.15)" }}>
        <motion.div style={{ scaleY, transformOrigin: "top" }} className="absolute inset-0 w-px" />
        <motion.div
          style={{ scaleY, transformOrigin: "top", background: C.mint }}
          className="absolute inset-0 w-px"
        />
      </div>
      <div className="mt-3 text-center text-[9px] tracking-[0.4em] text-white/40" style={mono}>
        SCROLL
      </div>
    </div>
  );
}

/* ─────────────────── MOBILE SERVICES (PREMIUM DETAILED ACCORDION/CAROUSEL) ─────────────────── */
function MobileServices() {
  const [activeIdx, setActiveIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const width = scrollRef.current.clientWidth;
    if (width === 0) return;
    const idx = Math.round(scrollLeft / width);
    if (idx !== activeIdx && idx >= 0 && idx < SERVICES.length) {
      setActiveIdx(idx);
    }
  };

  const scrollTo = (idx: number) => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({
      left: idx * width,
      behavior: "smooth",
    });
    setActiveIdx(idx);
  };

  return (
    <section
      id="services-mobile"
      className="block md:hidden py-16 text-white overflow-hidden"
      style={{ background: C.ink }}
    >
      <div className="px-6">
        <div
          className="flex items-center gap-3 text-[10px] uppercase tracking-[0.45em]"
          style={{ ...mono, color: C.mint }}
        >
          <span className="h-px w-10" style={{ background: C.mint }} />
          04 — Our Services
        </div>
        <h2 className="mt-6 text-3xl leading-tight font-extrabold" style={display}>
          Eight services.
          <br />
          <span className="italic" style={{ color: C.mint }}>
            One signature welcome.
          </span>
        </h2>

        {/* Horizontal Navigation Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mt-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x">
          {SERVICES.map((s, i) => {
            const active = i === activeIdx;
            return (
              <button
                key={s.t}
                onClick={() => scrollTo(i)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 ${
                  active
                    ? "bg-[#5fb5ad] text-[#0d2a36] shadow-md scale-105"
                    : "bg-white/5 text-white/60 border border-white/5"
                }`}
                style={mono}
              >
                0{i + 1} · {s.t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Swipeable Cards Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="mt-4 flex overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SERVICES.map((s, i) => {
          const Icon = s.Icon;
          return (
            <div key={s.t} className="w-full shrink-0 px-6 snap-center">
              <div
                className="overflow-hidden rounded-3xl border border-white/10 shadow-2xl relative"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(14,49,63,0.95) 0%, rgba(10,30,39,0.95) 100%)",
                }}
              >
                {/* Media Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  {s.video ? (
                    <video
                      src={s.video}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={s.img}
                      alt={s.t}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1e27] via-transparent to-transparent" />
                  <div
                    className="absolute top-4 right-4 text-3xl font-extrabold text-white/20"
                    style={display}
                  >
                    0{i + 1}
                  </div>
                </div>

                {/* Text Content */}
                <div className="p-6">
                  <div
                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#5fb5ad]"
                    style={mono}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {s.d}
                  </div>
                  <h3 className="mt-3 text-2xl font-bold" style={display}>
                    {s.t}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/70">{s.long}</p>

                  <ul className="mt-5 space-y-2">
                    {s.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2.5 text-xs text-white/80">
                        <span className="h-1 w-4 rounded-full bg-[#5fb5ad]" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex gap-3">
                    <Link
                      to="/book"
                      className="flex-1 text-center py-3.5 rounded-xl bg-gradient-to-r from-[#74d0c7] to-[#4fa098] text-[10px] font-bold uppercase tracking-wider text-[#0d2a36] shadow-lg transition-transform active:scale-98"
                      style={mono}
                    >
                      Book Service
                    </Link>
                    <a
                      href={`https://wa.me/919599087959?text=Hi!%20I'm%20interested%20in%20booking%20the%20${encodeURIComponent(s.t)}%20service.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center py-3.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-white transition-all active:scale-98"
                      style={mono}
                    >
                      Talk to us
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-1.5 mt-6">
        {SERVICES.map((s, i) => (
          <button
            key={`mobile-dot-${s.t || i}`}
            onClick={() => scrollTo(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === activeIdx ? "w-6 bg-[#5fb5ad]" : "w-1.5 bg-white/20"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

/* ─────────────────── COVERAGE / SHOWCASE ─────────────────── */
function Coverage() {
  return (
    <section
      id="coverage"
      className="relative overflow-hidden py-16 md:py-32"
      style={{ background: C.paper }}
    >
      <div className="mx-auto max-w-[1480px]">
        <div className="px-8 md:px-14 grid gap-12 md:grid-cols-12 items-start">
          <div className="md:col-span-6">
            <SectionLabel index="05" label="Global Coverage" />
            <h2 className="mt-8 text-[clamp(2rem,4.5vw,4rem)] leading-[1.02]" style={display}>
              We cover lots of{" "}
              <span className="italic" style={{ color: C.teal }}>
                airports.
              </span>
            </h2>
            <p className="mt-8 text-[15px] leading-relaxed max-w-xl" style={{ color: C.mute }}>
              Live operations at <strong style={{ color: C.ink }}>20+ Indian airports</strong> —
              from Delhi, Mumbai and Bengaluru to Srinagar, Goa and Trivandrum — plus{" "}
              <strong style={{ color: C.ink }}>12+ global hubs</strong> including Dubai, London,
              Singapore, New York and Tokyo. Wherever you fly, Suswagatam is already there.
            </p>
          </div>
          <div className="md:col-span-6 grid grid-cols-2 gap-6 md:mt-20">
            {[
              ["20+", "Indian Airports"],
              ["12+", "Global Hubs"],
              ["24/7", "Live Dispatch"],
              ["< 12m", "Avg. Response"],
            ].map(([v, l]) => (
              <div key={l} className="border-l pl-4" style={{ borderColor: C.mint }}>
                <div className="text-[28px] leading-none" style={{ ...display, color: C.ink }}>
                  {v}
                </div>
                <div
                  className="mt-1.5 text-[10px] uppercase tracking-[0.3em]"
                  style={{ ...mono, color: C.mute }}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Airport Showcase scrolling row */}
        <div className="mt-16 relative w-full overflow-hidden">
          <AirportShowcase />
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── FLEET (kept for richness) ─────────────────── */
function Fleet() {
  const fleet = [
    {
      name: "Delhi · IGI Terminal 3",
      cat: "Flagship Hub",
      img: heroJet,
      pax: "Domestic + Intl",
      range: "24×7",
      speed: "All Airlines",
    },
    {
      name: "Mumbai · CSMIA",
      cat: "Western Gateway",
      img: jetTarmac,
      pax: "T1 + T2",
      range: "24×7",
      speed: "All Airlines",
    },
    {
      name: "Bengaluru · Kempegowda",
      cat: "Southern Hub",
      img: interior,
      pax: "T1 + T2",
      range: "24×7",
      speed: "All Airlines",
    },
    {
      name: "Hyderabad · RGIA",
      cat: "Deccan Gateway",
      img: ctaBg,
      pax: "Integrated",
      range: "24×7",
      speed: "All Airlines",
    },
  ];
  const ref = useRef<HTMLDivElement>(null);
  return (
    <section className="relative overflow-hidden py-28 md:py-36" style={{ background: C.bg }}>
      <div className="mx-auto max-w-[1480px] px-8 md:px-14">
        <div className="flex items-end justify-between gap-8">
          <div>
            <SectionLabel index="06" label="Flagship Airports" />
            <h2 className="mt-8 text-[clamp(2rem,5vw,4.4rem)] leading-[1.02]" style={display}>
              Our{" "}
              <span className="italic" style={{ color: C.teal }}>
                signature
              </span>{" "}
              terminals.
            </h2>
          </div>
          <div className="hidden gap-2 md:flex" style={mono}>
            <button
              aria-label="Previous"
              onClick={() => ref.current?.scrollBy({ left: -480, behavior: "smooth" })}
              className="h-12 w-12 transition"
              style={{ border: `1px solid ${C.line}`, color: C.ink }}
            >
              ←
            </button>
            <button
              aria-label="Next"
              onClick={() => ref.current?.scrollBy({ left: 480, behavior: "smooth" })}
              className="h-12 w-12 transition"
              style={{ border: `1px solid ${C.line}`, color: C.ink }}
            >
              →
            </button>
          </div>
        </div>
      </div>

      <div
        ref={ref}
        className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6 md:px-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {fleet.map((f, i) => (
          <motion.article
            key={f.name}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.08 }}
            className="group relative w-[85vw] shrink-0 snap-start overflow-hidden sm:w-[480px] rounded-2xl"
            style={{ background: C.paper, border: `1px solid ${C.line}` }}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={f.img}
                alt={f.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-[1600ms] group-hover:scale-110"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to top, rgba(13,42,54,0.6), transparent)" }}
              />
              <div
                className="absolute left-5 top-5 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.3em]"
                style={{ ...mono, background: C.mint, color: C.ink }}
              >
                {f.cat}
              </div>
            </div>
            <div className="p-7">
              <h3 className="text-[24px] leading-tight" style={display}>
                {f.name}
              </h3>
              <div
                className="mt-6 grid grid-cols-3 gap-4 pt-6"
                style={{ ...mono, borderTop: `1px solid ${C.line}` }}
              >
                <Spec label="Terminals" value={f.pax} />
                <Spec label="Hours" value={f.range} />
                <Spec label="Coverage" value={f.speed} />
              </div>
              <div
                className="mt-6 flex items-center justify-between text-[10px] uppercase tracking-[0.3em]"
                style={{ ...mono, color: C.mute }}
              >
                <span>Available</span>
                <span className="flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 animate-pulse rounded-full"
                    style={{ background: C.mint }}
                  />
                  Live
                </span>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.3em]" style={{ color: C.mute }}>
        {label}
      </div>
      <div className="mt-1 text-[13px]" style={{ color: C.ink }}>
        {value}
      </div>
    </div>
  );
}

/* ─────────────────── JOURNEY ─────────────────── */
function Journey() {
  const steps = [
    ["Booking", "Tell us your flight — arrival, departure or connection — in just a few clicks."],
    [
      "Confirmation",
      "Instant quote and confirmation, with your dedicated guest relations officer assigned.",
    ],
    ["Welcome", "Meet your escort the moment you arrive — kerbside or aerobridge, your choice."],
    ["Fast-Track", "Immigration, security and baggage handled while you relax in the lounge."],
    [
      "Premium Transport",
      "Step into your chauffeured car or onward flight — no queue, no friction.",
    ],
    [
      "After-care",
      "We stay on watch until your journey is complete. Feedback shapes every next flight.",
    ],
  ];

  const getStepIcon = (t: string) => {
    const iconProps = { className: "h-5 w-5 text-[#0d5a6e]" };
    switch (t) {
      case "Booking":
        return <Calendar {...iconProps} />;
      case "Confirmation":
        return <ShieldCheck {...iconProps} />;
      case "Welcome":
        return <Crown {...iconProps} />;
      case "Fast-Track":
        return <Sparkles {...iconProps} />;
      case "Premium Transport":
        return <Car {...iconProps} />;
      case "After-care":
        return <Headphones {...iconProps} />;
      default:
        return <Plane {...iconProps} />;
    }
  };

  return (
    <section className="relative px-6 py-16 md:px-14 md:py-36" style={{ background: C.paper }}>
      <div className="mx-auto max-w-[1480px]">
        <SectionLabel index="07" label="Your Journey" />
        <h2 className="mt-8 max-w-3xl text-[clamp(2rem,5vw,4.4rem)] leading-[1.02]" style={display}>
          Six steps.{" "}
          <span className="italic" style={{ color: C.teal }}>
            One signature welcome.
          </span>
        </h2>

        <div className="relative mt-20">
          {/* Vertical center timeline line */}
          <div
            className="absolute left-[22px] top-0 h-full w-px md:left-1/2"
            style={{ background: `linear-gradient(to bottom, ${C.mint}, ${C.line}, transparent)` }}
          />

          {steps.map(([t, d], i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10px" }}
              transition={{ duration: 0.7, delay: 0.05 * i }}
              className={`relative mb-14 grid grid-cols-[44px_1fr] gap-6 md:grid-cols-2 md:gap-16 ${
                i % 2 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* Timeline Indicator Dot */}
              <div className="relative flex items-start">
                <div
                  className="absolute left-[16px] top-11 h-3 w-3 rounded-full md:left-1/2 md:-translate-x-1/2 z-10"
                  style={{ background: C.teal, boxShadow: `0 0 18px ${C.mint}` }}
                />
              </div>

              {/* Neumorphic Step Card */}
              <motion.div
                whileHover={{
                  y: -4,
                  boxShadow: "10px 10px 24px #e0d8c8, -10px -10px 24px #ffffff",
                }}
                className="p-8 rounded-[28px] transition-all duration-300 flex flex-col justify-between"
                style={{
                  background: C.paper,
                  boxShadow: "6px 6px 16px #e8e0d0, -6px -6px 16px #ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                }}
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    {/* Neumorphic icon wrapper */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300"
                      style={{
                        background: C.paper,
                        boxShadow: "inset 3px 3px 6px #e8e0d0, inset -3px -3px 6px #ffffff",
                      }}
                    >
                      {getStepIcon(t)}
                    </div>
                    <h3 className="text-xl font-bold" style={{ ...display, color: C.ink }}>
                      {t}
                    </h3>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: C.mute }}>
                    {d}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── TESTIMONIALS ─────────────────── */
function Testimonials() {
  const reviews = [
    {
      name: "Sachin Tendulkar",
      role: "Cricketing Legend",
      quote:
        "Excellent customer services! Whenever I needed something they were there for me. Shafsky Aviation understands what premium travel means.",
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
        "You are a great team player and you constantly help others meet their demands. Well done, Shafsky Aviation!",
      initials: "MA",
      color: "#059669",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=220&h=220&fit=crop",
    },
    {
      name: "Hemant Sharma",
      role: "Business Leader",
      quote:
        "The top-notch friendly and very professional customer service I've received from Shafsky Aviation is second to none.",
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
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  className="group relative overflow-hidden rounded-2xl p-8 md:p-10 transition-shadow hover:shadow-[0_20px_60px_-20px_rgba(13,90,110,0.25)]"
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
                        loading="eager"
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

/* ─────────────────── FAQ ─────────────────── */
function FAQ() {
  const faqs = [
    [
      "What is Suswagatam Meet & Greet?",
      "Suswagatam is Shafsky Aviation's signature welcome and assist service for domestic and international passengers across Indian airports — escort, fast-track, lounge, transport and more.",
    ],
    [
      "Which airports do you cover?",
      "We operate at 20+ Indian airports including Delhi, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Goa, Kochi, Jaipur and Srinagar — plus 12+ global hubs.",
    ],
    [
      "How do I book?",
      "Use the booking panel above. Choose Arrival, Departure or Connection, enter your flight number and date, and we'll confirm in minutes.",
    ],
    [
      "Do you accept last-minute bookings?",
      "Yes. We accept bookings up to 6 hours before departure (except 23:00–06:00 hrs). For urgent assistance, contact our 24×7 support.",
    ],
    [
      "Is the service available for groups?",
      "Absolutely — families, corporate teams and tour groups are welcome. Tell us your party size in the booking form.",
    ],
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative px-6 py-16 md:px-14 md:py-36" style={{ background: C.paper }}>
      <div className="mx-auto grid max-w-[1480px] gap-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <SectionLabel index="09" label="FAQ" />
          <h2 className="mt-8 text-[clamp(2rem,4vw,3.5rem)] leading-[1.02]" style={display}>
            Frequently{" "}
            <span className="italic" style={{ color: C.teal }}>
              asked.
            </span>
          </h2>
          <p className="mt-6 max-w-xs text-[14px]" style={{ color: C.mute }}>
            Or chat with us on WhatsApp at <strong style={{ color: C.ink }}>+91 9599087959</strong>.
          </p>
        </div>
        <div className="md:col-span-8">
          {faqs.map(([q, a], i) => {
            const isOpen = open === i;
            return (
              <div key={q} style={{ borderBottom: `1px solid ${C.line}` }}>
                <button
                  className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="flex items-baseline gap-6">
                    <span
                      className="text-[10px] tracking-[0.3em]"
                      style={{ ...mono, color: C.teal }}
                    >
                      0{i + 1}
                    </span>
                    <span
                      className="text-[clamp(1.05rem,1.5vw,1.35rem)]"
                      style={{ ...display, color: C.ink }}
                    >
                      {q}
                    </span>
                  </span>
                  <span
                    className={`transition-transform duration-500 ${isOpen ? "rotate-45" : ""}`}
                    style={{ color: C.teal }}
                  >
                    +
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-7 pl-14 text-[14px] leading-relaxed" style={{ color: C.mute }}>
                    {a}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── FINAL CTA ─────────────────── */
function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={ctaBg}
          alt="Sunset over the tarmac"
          loading="lazy"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(245,239,225,0.8), rgba(245,239,225,0.6), rgba(245,239,225,0.95))",
          }}
        />
      </div>
      <div className="relative mx-auto max-w-[1480px] px-6 py-20 text-center md:px-14 md:py-44">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
        >
          <div
            className="mx-auto inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em]"
            style={{ ...mono, color: C.teal }}
          >
            <span className="h-px w-10" style={{ background: C.teal }} />
            Ready when you are
            <span className="h-px w-10" style={{ background: C.teal }} />
          </div>
          <h2
            className="mx-auto mt-8 max-w-4xl text-[clamp(2.4rem,6vw,5.6rem)] leading-[1]"
            style={display}
          >
            Let us plan your{" "}
            <span className="italic" style={{ color: C.teal }}>
              next welcome.
            </span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-[15px]" style={{ color: C.mute }}>
            A guest relations officer will reply within minutes. Tell us only where, and when.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href="#book"
              className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-[12px] uppercase tracking-[0.3em] transition hover:brightness-110"
              style={{ ...mono, background: C.teal, color: "#fff" }}
            >
              Book Services →
            </a>
            <Link
              to="/charter"
              className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-[12px] uppercase tracking-[0.3em] transition hover:brightness-110"
              style={{ ...mono, background: C.mint, color: C.ink }}
            >
              <Plane className="h-3.5 w-3.5" /> Private Charter
            </Link>
            <a
              href="https://wa.me/919599087959"
              className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-[12px] uppercase tracking-[0.3em] transition"
              style={{ ...mono, border: `1px solid ${C.teal}`, color: C.teal }}
            >
              WhatsApp Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────────── FOOTER ─────────────────── */
function Footer() {
  const { branding } = useBranding();

  const nameParts = branding.company_name.split(" ");
  const firstPart = nameParts[0]?.toUpperCase() || "SHAFSKY";
  const restPart = nameParts.slice(1).join(" ")?.toUpperCase() || "AVIATION";

  return (
    <footer
      className="relative px-6 pb-12 pt-16 md:px-14"
      style={{ background: C.tealDeep, color: "#fff" }}
    >
      <div className="relative mx-auto max-w-[1480px]">
        <div
          className="grid gap-10 md:gap-16 pb-12 md:grid-cols-12"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              {branding.logo_url ? (
                <img
                  src={branding.logo_light_url || branding.logo_url}
                  alt={branding.company_name}
                  className="h-9 w-auto md:h-10 lg:h-[42px] object-contain"
                />
              ) : (
                <>
                  <div
                    className="grid h-9 w-9 place-items-center rounded-sm"
                    style={{ background: C.mint }}
                  >
                    <Plane className="h-4 w-4 -rotate-45" style={{ color: C.tealDeep }} />
                  </div>
                  <div style={mono}>
                    <div className="text-[14px] font-semibold tracking-[0.28em]">{firstPart}</div>
                    <div className="-mt-0.5 text-[8px] tracking-[0.45em] text-white/60">
                      {restPart} · SUSWAGATAM
                    </div>
                  </div>
                </>
              )}
            </div>
            <h3 className="mt-8 text-[clamp(1.8rem,3vw,2.6rem)] leading-[1.05]" style={display}>
              {branding.company_tagline || "Welcome Begins Before You Land."}
            </h3>
            <p className="mt-5 max-w-md text-[14px] leading-relaxed text-white/70">
              {branding.business_address}, {branding.city}, {branding.state}, {branding.country} -{" "}
              {branding.postal_code}
            </p>
            <p className="mt-3 text-[14px] text-white/70" style={mono}>
              {branding.support_phone}
            </p>
          </div>
          <div className="grid gap-10 md:col-span-7 md:grid-cols-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-white/50" style={mono}>
                Services
              </div>
              <ul className="mt-5 space-y-3 text-[14px] text-white/80">
                <li>
                  <Link to="/services/guide" className="transition hover:text-white">
                    Meet & Greet
                  </Link>
                </li>
                <li>
                  <Link to="/services/guide" className="transition hover:text-white">
                    Lounge Access
                  </Link>
                </li>
                <li>
                  <Link to="/services/guide" className="transition hover:text-white">
                    Transport
                  </Link>
                </li>
                <li>
                  <Link to="/services/guide" className="transition hover:text-white">
                    Hotels
                  </Link>
                </li>
                <li>
                  <Link to="/services/guide" className="transition hover:text-white">
                    Concierge
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-white/50" style={mono}>
                Company
              </div>
              <ul className="mt-5 space-y-3 text-[14px] text-white/80">
                <li>
                  <Link to="/" className="transition hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/" className="transition hover:text-white">
                    Our Team
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="transition hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-white/50" style={mono}>
                Legal
              </div>
              <ul className="mt-5 space-y-3 text-[14px] text-white/80">
                <li>
                  <Link to="/" className="transition hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/" className="transition hover:text-white">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="transition hover:text-white">
                    Admin Console
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div
          className="mt-8 flex flex-wrap items-center justify-between gap-4 text-[11px] text-white/50"
          style={mono}
        >
          <div>{branding.copyright_text}</div>
          <div className="flex gap-5">
            {branding.facebook_url && (
              <a
                href={branding.facebook_url}
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
            )}
            {branding.twitter_url && (
              <a
                href={branding.twitter_url}
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
            )}
            {branding.instagram_url && (
              <a
                href={branding.instagram_url}
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            )}
            {branding.linkedin_url && (
              <a
                href={branding.linkedin_url}
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            )}
            {branding.youtube_url && (
              <a
                href={branding.youtube_url}
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                YouTube
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
