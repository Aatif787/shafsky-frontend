import React, { lazy, Suspense, useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Navigation } from "./Navigation";
import { HeroAircraft } from "./hero/HeroAircraft";
import { EnterpriseServicesPlatform } from "./services/EnterpriseServicesPlatform";
import { useBranding } from "@/lib/branding/branding.context";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  MotionValue,
  AnimatePresence,
} from "framer-motion";
import { useNavigate, Link } from "@tanstack/react-router";
import { ApiClient } from "@/lib/ApiClient";
import { toast } from "sonner";
import { FlightData } from "@/services/flight/FlightTypes";
import { ManualFlightEntryForm } from "@/components/booking/shared/ManualFlightEntryForm";
import { supabase } from "@/integrations/supabase/client";
import { AIRPORT_REGISTRY } from "@/data/airportRegistry";
import { IntelligentAirportAutocomplete } from "@/components/booking/shared/IntelligentAirportAutocomplete";
import {
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  Shuffle,
  Calendar,
  HelpCircle,
  ChevronDown,
  Search,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
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
  Building2,
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

const MotionLink = motion.create(Link);
const MotionA = motion.a;

const display = { fontFamily: "'Fraunces', serif", fontWeight: 300, letterSpacing: "-0.02em" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

// Light cream, off-white, lime green, violet & orange theme palette
const C = {
  bg: "#faf9f5",
  paper: "#ffffff",
  ink: "#0f172a",
  mute: "#64748b",
  lime: "#84cc16",
  limeDark: "#65a30d",
  violet: "#7c3aed",
  violetDark: "#6d28d9",
  violetLight: "#f5f3ff",
  orange: "#f97316",
  orangeLight: "#ffedd5",
  teal: "#7c3aed",
  tealDeep: "#6d28d9",
  mint: "#84cc16",
  line: "rgba(15,23,42,0.08)",
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
      <SignatureConciergeSection />
      <ScrollSection id="why">
        <WhyChooseUs />
      </ScrollSection>
      <ScrollSection>
        <TrustBar />
      </ScrollSection>
      <ScrollSection id="services">
        <EnterpriseServicesPlatform />
      </ScrollSection>
      <EnterpriseSolutions />
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
            fetchPriority={currentIdx === 0 ? "high" : "auto"}
            loading={currentIdx === 0 ? "eager" : "lazy"}
            decoding="async"
            width={1920}
            height={1080}
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

const SELECTOR_SERVICES = [
  { t: "Meet & Greet", Icon: Users },
  { t: "VIP Lounge", Icon: Hotel },
  { t: "Fast Track", Icon: Ticket },
  { t: "Airport Transfer", Icon: Car },
  { t: "Porter Service", Icon: Package },
  { t: "Baggage Assistance", Icon: Package },
  { t: "Visa Assistance", Icon: Sparkles },
  { t: "Hotel Booking", Icon: Building2 },
  { t: "Wheelchair Assistance", Icon: HeartPulse },
  { t: "Airport Concierge", Icon: Crown },
];

function ServicesSelectorBar({
  selectedService,
  onSelectService,
}: {
  selectedService: string | null;
  onSelectService: (serviceTitle: string) => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (serviceTitle: string) => {
    onSelectService(serviceTitle);
    const bookingElem = document.getElementById("book");
    if (bookingElem) {
      const rect = bookingElem.getBoundingClientRect();
      if (rect.top < 0 || rect.bottom > window.innerHeight) {
        bookingElem.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="w-full relative flex items-center justify-center py-1">
      {/* Icon Tabs Container */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-4 sm:gap-6 md:gap-7 overflow-x-auto snap-x snap-mandatory py-2 px-2 scrollbar-none w-full justify-start md:justify-center"
      >
        {SELECTOR_SERVICES.map((s) => {
          const Icon = s.Icon;
          const isSelected = selectedService === s.t;

          return (
            <motion.button
              key={`circ-selector-${s.t}`}
              type="button"
              onClick={() => handleSelect(s.t)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="group relative flex flex-col items-center gap-1.5 shrink-0 snap-center focus:outline-none cursor-pointer"
            >
              {/* Round Circle Container */}
              <div
                className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full transition-all duration-300 ${isSelected
                  ? "bg-gradient-to-tr from-[#7c3aed] to-[#9333ea] border-2 border-white text-white shadow-[0_6px_20px_rgba(124,58,237,0.45)] ring-4 ring-[#7c3aed]/25 scale-105"
                  : "bg-white/95 border border-gray-200/80 text-gray-600 shadow-sm hover:border-[#7c3aed]/50 hover:text-[#7c3aed] hover:scale-102"
                  }`}
              >
                <Icon
                  className={`h-4.5 w-4.5 sm:h-5 sm:w-5 transition-transform duration-300 ${isSelected ? "text-white scale-110" : "text-gray-600 group-hover:text-[#7c3aed]"
                    }`}
                />
              </div>

              {/* Label */}
              <span
                className={`text-[10px] sm:text-[11px] font-semibold tracking-tight transition-all whitespace-nowrap px-1.5 py-0.5 rounded-full ${isSelected
                  ? "text-[#7c3aed] font-extrabold bg-[#7c3aed]/10 border border-[#7c3aed]/20 shadow-xs"
                  : "text-gray-700 group-hover:text-[#7c3aed]"
                  }`}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {s.t}
              </span>

              {/* Active Underline Bar */}
              {isSelected && (
                <motion.div
                  layoutId="activeServiceBar"
                  className="absolute -bottom-1 h-0.5 w-8 rounded-full bg-[#7c3aed] shadow-[0_0_8px_#7c3aed]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function BookingPanel() {
  const navigate = useNavigate();
  const [validatingFlight, setValidatingFlight] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedAirportCode, setSelectedAirportCode] = useState<string>("DEL");
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

  // Flight state machine & manual entry mode state
  const [heroFlightStateMode, setHeroFlightStateMode] = useState<"IDLE" | "LOADING" | "VERIFIED" | "ERROR" | "MANUAL">("IDLE");
  const [heroFlightError, setHeroFlightError] = useState<string | null>(null);
  const [verifiedHeroFlight, setVerifiedHeroFlight] = useState<FlightData | null>(null);
  const [isManualMode, setIsManualMode] = useState(false);
  const [pendingVerifiedFlight, setPendingVerifiedFlight] = useState<FlightData | null>(null);

  const selectedServiceObj = useMemo(
    () => SELECTOR_SERVICES.find((s) => s.t === selectedService) || null,
    [selectedService]
  );

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

  const handleHomepageSearchFlight = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setTouched({
        flightNumber: true,
        departDate: true,
        flightNumber2: true,
        departDate2: true,
      });
      toast.error("Please fill in flight number and travel date.");
      return;
    }

    const cleanFlightNum = flightNumber.trim().toUpperCase().replace(/\s+/g, "");
    if (!cleanFlightNum || cleanFlightNum.length < 3) {
      toast.error("Please enter a valid flight number (e.g. AI302, EK504).");
      return;
    }

    setValidatingFlight(true);
    setHeroFlightStateMode("LOADING");
    setHeroFlightError(null);

    try {
      const response = await ApiClient.fetchWithAuth("/api/flight/validate", {
        method: "POST",
        body: JSON.stringify({
          flightNum: cleanFlightNum,
          departDate,
          tripType: tab === "arrival" ? "one_way" : "round_trip",
        }),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        const errMsg = formatFlightLookupError(resJson?.error || resJson?.message || resJson, response.status);
        setHeroFlightError(errMsg);
        setHeroFlightStateMode("ERROR");
        setValidatingFlight(false);
        return;
      }

      const rawData = resJson.data;
      const targetObj = rawData?.flightData || rawData?.flight_data || (Array.isArray(rawData) ? rawData[0] : rawData);

      if (!targetObj) {
        const errMsg = `Flight ${cleanFlightNum} could not be found for ${departDate}. Please check your flight number, try again, or enter flight details manually.`;
        setHeroFlightError(errMsg);
        setHeroFlightStateMode("ERROR");
        setValidatingFlight(false);
        return;
      }

      const flightInfo: FlightData = {
        flightNum: (targetObj?.flight?.iata || targetObj?.flightNum || targetObj?.flight_num || cleanFlightNum).toUpperCase(),
        carrier: {
          iata: targetObj?.airline?.iata || targetObj?.carrier?.iata || targetObj?.carrier_iata || cleanFlightNum.slice(0, 2).toUpperCase(),
          name: targetObj?.airline?.name || targetObj?.carrier?.name || targetObj?.carrier_name || null,
          logo: targetObj?.airline?.logo || null,
        },
        origin: {
          code: targetObj?.departure?.airport || targetObj?.origin?.code || targetObj?.origin_code || null,
          name: targetObj?.departure?.airport_name || targetObj?.origin?.name || targetObj?.origin_name || null,
          city: targetObj?.departure?.city || targetObj?.origin?.city || targetObj?.origin_city || null,
          country: targetObj?.departure?.country || targetObj?.origin?.country || null,
        },
        destination: {
          code: targetObj?.arrival?.airport || targetObj?.destination?.code || targetObj?.destination_code || null,
          name: targetObj?.arrival?.airport_name || targetObj?.destination?.name || targetObj?.destination_name || null,
          city: targetObj?.arrival?.city || targetObj?.destination?.city || targetObj?.destination_city || null,
          country: targetObj?.arrival?.country || targetObj?.destination?.country || null,
        },
        departure: {
          scheduledTime: targetObj?.departure?.scheduled || targetObj?.departure?.scheduledTime || targetObj?.scheduled_departure || null,
          terminal: targetObj?.departure?.terminal || null,
          gate: targetObj?.departure?.gate || null,
        },
        arrival: {
          scheduledTime: targetObj?.arrival?.scheduled || targetObj?.arrival?.scheduledTime || targetObj?.scheduled_arrival || null,
          terminal: targetObj?.arrival?.terminal || null,
          gate: targetObj?.arrival?.gate || null,
        },
        duration: targetObj?.duration?.formatted || targetObj?.duration_text || targetObj?.duration || targetObj?.flight_duration || null,
        status: targetObj?.status || "Scheduled",
        aircraft: {
          model: targetObj?.aircraft?.model || null,
        },
      };

      setVerifiedHeroFlight(flightInfo);
      setHeroFlightStateMode("VERIFIED");
      toast.success(`Flight ${flightInfo.flightNum} verified successfully!`);
    } catch (err: any) {
      console.error("[Hero] Validation error:", err);
      const errMsg = formatFlightLookupError(err);
      setHeroFlightError(errMsg);
      setHeroFlightStateMode("ERROR");
    } finally {
      setValidatingFlight(false);
    }
  };

  const proceedWithFlightData = (flightInfo: FlightData) => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("shafsky_validated_flight", JSON.stringify(flightInfo));
      } catch {
        // ignore cache write error
      }
    }

    toast.success(`Flight ${flightInfo.flightNum} configured!`);
    setValidatingFlight(false);

    navigate({
      to: "/book",
      search: {
        origin: selectedAirportCode || "DEL",
        service_id: selectedService || undefined,
        flight_number: flightInfo.flightNum,
        depart_date: departDate,
        direction: tab,
        pax_adults: adults,
        pax_children: childrenCount,
        pax_infants: infants,
        notes:
          tab === "connection"
            ? `Transit Flight 1: ${flightNumber} on ${departDate} | Flight 2: ${flightNumber2} on ${departDate2}`
            : `Flight Number: ${flightNumber} (${tab})`,
        from_hero: "true",
        validated: "true",
      } as any,
    });
  };

  const tabs: [typeof tab, string, React.ComponentType<{ className?: string }>][] = [
    ["arrival", "Arrival", PlaneLanding],
    ["departure", "Departure", PlaneTakeoff],
    ["connection", "Transit", DoublePlaneIcon],
  ];

  return (
    <section id="book" className="relative -mt-20 md:-mt-32 px-4 pb-16 md:px-14 md:pb-32">
      <HeroAircraft />
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
          className="px-6 py-4 md:px-10 border-b border-white/15 rounded-t-[22px] relative z-10 flex flex-col gap-4 items-center"
          style={{
            background:
              "linear-gradient(90deg, rgba(95, 181, 173, 0.08) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(255, 107, 0, 0.04) 100%)",
          }}
        >
          <ServicesSelectorBar
            selectedService={selectedService}
            onSelectService={setSelectedService}
          />

          {/* Dynamic Service Selection Banner */}
          <div className="w-full max-w-xl">
            <AnimatePresence mode="wait">
              {selectedServiceObj ? (
                <motion.div
                  key={selectedServiceObj.t}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-white/70 border border-[#7c3aed]/30 shadow-sm backdrop-blur-md"
                >
                  <div className="flex items-center gap-3.5 text-left">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7c3aed] to-[#9333ea] text-white shadow-md">
                      <selectedServiceObj.Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col">
                      <span
                        className="text-[9px] font-extrabold uppercase tracking-widest text-[#7c3aed]"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        Selected Service
                      </span>
                      <h3
                        className="text-sm font-extrabold text-gray-900 tracking-tight"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {selectedServiceObj.t}
                      </h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="text-[10px] font-mono uppercase font-bold text-slate-500 hover:text-purple-700 underline px-2 py-1"
                  >
                    Clear Choice
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty-service"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white/40 border border-dashed border-gray-300 text-xs font-semibold text-gray-700"
                >
                  <Sparkles className="h-4 w-4 text-[#7c3aed]" />
                  <span>Select travel details below, or tap an icon above for a specific service.</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <h2
            className="text-center text-[10px] font-bold uppercase tracking-[0.24em] flex items-center justify-center gap-2 mt-0.5"
            style={{ color: C.teal, fontFamily: "'JetBrains Mono', monospace" }}
          >
            <Sparkles size={12} />
            WELCOME ABOARD · GET AN INSTANT QUOTE FOR YOUR NEXT TRIP
            <Sparkles size={12} />
          </h2>
        </div>

        <motion.div
          key={`booking-form-grid-${selectedService || "none"}`}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="grid gap-8 p-6 md:grid-cols-12 md:gap-10 md:p-10 transition-all duration-300 opacity-100"
        >
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

            {/* Intelligent Searchable Airport Autocomplete */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                <span>Service Airport *</span>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedAirportCode) {
                      navigate({ to: "/airports/$code", params: { code: selectedAirportCode } });
                    }
                  }}
                  className="text-[9px] text-[#7c3aed] hover:underline font-semibold font-sans flex items-center gap-1 cursor-pointer"
                >
                  <span>Explore {selectedAirportCode} Hub Page</span>
                  <span>→</span>
                </button>
              </label>
              <IntelligentAirportAutocomplete
                value={selectedAirportCode ? `${AIRPORT_REGISTRY[selectedAirportCode]?.city || selectedAirportCode} (${selectedAirportCode})` : ""}
                onSelect={(ap) => {
                  setSelectedAirportCode(ap.code);
                }}
                placeholder="Type Airport Code (e.g. DEL, BOM), City or Name..."
              />
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
                        className={`w-full h-12 rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 focus:bg-white/20 focus:ring-4 focus:ring-teal/5 ${touched.flightNumber && !flightNumber.trim()
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
                  </div>

                  <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 cursor-pointer ${touched.departDate && !departDate
                          ? "border-red-400 focus:border-red-500"
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
                        <span className="truncate">
                          {departDate ? format(parseISO(departDate), "MMM dd, yyyy") : "Arrival Date"}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-60" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker
                        mode="single"
                        selected={dateValue}
                        onSelect={(d) => {
                          if (d) setDepartDate(format(d, "yyyy-MM-dd"));
                          setDatePopoverOpen(false);
                        }}
                        disabled={{ before: todayStart }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label="Help"
                        className="hidden sm:grid h-12 w-12 shrink-0 place-items-center rounded-xl transition hover:bg-white/20 active:scale-95 border cursor-pointer"
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
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-4 text-xs space-y-2 bg-slate-900/95 text-slate-100 border-slate-800 backdrop-blur-xl">
                      <p className="font-semibold text-teal-400">Where can I find my Flight Number?</p>
                      <p className="text-slate-300 leading-relaxed">
                        Your flight number is a 2 to 4 digit code preceded by your airline's 2-letter IATA designator (e.g. <strong>EK505</strong>, <strong>BA117</strong>, <strong>AI101</strong>). You can find it on your booking confirmation email, e-ticket, or boarding pass.
                      </p>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Row 2 (Connection Flight 2) */}
                <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[1.5fr_1.2fr_auto] sm:items-start">
                  <div className="flex gap-2 w-full items-start">
                    <div className="relative flex flex-col gap-1 flex-1 w-full">
                      <input
                        type="text"
                        placeholder="Connecting Flight e.g. AERO88"
                        value={flightNumber2}
                        onChange={(e) => setFlightNumber2(e.target.value.toUpperCase())}
                        onBlur={() => setTouched((t) => ({ ...t, flightNumber2: true }))}
                        className={`w-full h-12 rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 focus:bg-white/20 focus:ring-4 focus:ring-teal/5 ${touched.flightNumber2 && !flightNumber2.trim()
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
                          Connecting flight required
                        </span>
                      )}
                    </div>
                  </div>

                  <Popover open={datePopoverOpen2} onOpenChange={setDatePopoverOpen2}>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 cursor-pointer ${touched.departDate2 && !departDate2
                          ? "border-red-400 focus:border-red-500"
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
                        <span className="truncate">
                          {departDate2 ? format(parseISO(departDate2), "MMM dd, yyyy") : "Departure Date"}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-60" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarPicker
                        mode="single"
                        selected={dateValue2}
                        onSelect={(d) => {
                          if (d) setDepartDate2(format(d, "yyyy-MM-dd"));
                          setDatePopoverOpen2(false);
                        }}
                        disabled={{ before: dateValue || todayStart }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <div className="h-12 w-12 shrink-0 hidden sm:block" />
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
                      className={`w-full h-12 rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 focus:bg-white/20 focus:ring-4 focus:ring-teal/5 ${touched.flightNumber && !flightNumber.trim()
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
                </div>

                <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`flex h-12 w-full items-center justify-between rounded-xl border bg-white/5 backdrop-blur-md px-4 text-xs font-semibold uppercase outline-none transition-all hover:bg-white/15 hover:border-white/35 focus:border-teal/40 cursor-pointer ${touched.departDate && !departDate
                        ? "border-red-400 focus:border-red-500"
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
                      <span className="truncate">
                        {departDate
                          ? format(parseISO(departDate), "MMM dd, yyyy")
                          : tab === "arrival"
                            ? "Arrival Date"
                            : "Departure Date"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-60" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={dateValue}
                      onSelect={(d) => {
                        if (d) setDepartDate(format(d, "yyyy-MM-dd"));
                        setDatePopoverOpen(false);
                      }}
                      disabled={{ before: todayStart }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      aria-label="Help"
                      className="hidden sm:grid h-12 w-12 shrink-0 place-items-center rounded-xl transition hover:bg-white/20 active:scale-95 border cursor-pointer"
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
                  </PopoverTrigger>
                  <PopoverContent className="w-72 p-4 text-xs space-y-2 bg-slate-900/95 text-slate-100 border-slate-800 backdrop-blur-xl">
                    <p className="font-semibold text-teal-400">Where can I find my Flight Number?</p>
                    <p className="text-slate-300 leading-relaxed">
                      Your flight number is a 2 to 4 digit code preceded by your airline's 2-letter IATA designator (e.g. <strong>EK505</strong>, <strong>BA117</strong>, <strong>AI101</strong>). You can find it on your booking confirmation email, e-ticket, or boarding pass.
                    </p>
                  </PopoverContent>
                </Popover>
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
                          {bags} Bag{bags !== 1 ? "s" : ""}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 opacity-60 transition-transform duration-200 ${showPassengerModal ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>
                  </PopoverTrigger>

                  <PopoverContent className="w-80 p-5 bg-white/95 backdrop-blur-xl border border-black/10 shadow-2xl rounded-2xl">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-black/5 pb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                          Passengers & Luggage
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPassengerModal(false)}
                          className="text-gray-400 hover:text-gray-700"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Adult */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-gray-800">Adult</span>
                          <span className="text-[10px] text-gray-500 font-medium">12+ years</span>
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
                            Under 2 years
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
                          <span className="text-xs font-semibold text-gray-800">Check-in Bags</span>
                          <span className="text-[10px] text-gray-500 font-medium">Luggage items</span>
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

            {/* ERROR STATE BANNER */}
            {heroFlightStateMode === "ERROR" && heroFlightError && (
              <div className="mt-4 p-4 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs font-sans space-y-3">
                <div className="flex items-start gap-2.5 font-semibold">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{heroFlightError}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={handleHomepageSearchFlight}
                    className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] uppercase tracking-wider font-bold transition shadow-sm cursor-pointer"
                    style={mono}
                  >
                    Try Again / Fetch Flight
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeroFlightStateMode("MANUAL");
                      setIsManualMode(true);
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white font-mono text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                    style={mono}
                  >
                    Enter Flight Details Manually
                  </button>
                </div>
              </div>
            )}

            {/* VERIFIED FLIGHT RESULT CARD */}
            {heroFlightStateMode === "VERIFIED" && verifiedHeroFlight ? (
              <div className="mt-5 p-5 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 backdrop-blur-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono uppercase font-bold tracking-wider">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>✓ Verified Flight Schedule</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-300/90 font-bold uppercase">
                    {verifiedHeroFlight.status || "Scheduled"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-white border-y border-white/10 py-3 font-mono">
                  <div>
                    <div className="text-xl font-extrabold text-amber-300">{verifiedHeroFlight.origin.code || "DEP"}</div>
                    <div className="text-[10px] text-slate-300 font-sans">{verifiedHeroFlight.origin.city || verifiedHeroFlight.origin.name || "Origin"}</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <Plane className="h-4 w-4 text-amber-400" />
                    <div className="text-[9px] text-slate-300 mt-0.5 font-bold">{verifiedHeroFlight.carrier.name || verifiedHeroFlight.flightNum}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-amber-300">{verifiedHeroFlight.destination.code || "ARR"}</div>
                    <div className="text-[10px] text-slate-300 font-sans">{verifiedHeroFlight.destination.city || verifiedHeroFlight.destination.name || "Destination"}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => proceedWithFlightData(verifiedHeroFlight)}
                    className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-mono text-xs font-extrabold uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    style={mono}
                  >
                    <span>Proceed to Book Concierge</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setHeroFlightStateMode("IDLE");
                      setVerifiedHeroFlight(null);
                    }}
                    className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-[10px] uppercase tracking-wider font-bold transition cursor-pointer"
                    style={mono}
                  >
                    Change Flight
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  disabled={validatingFlight}
                  onClick={handleHomepageSearchFlight}
                  className={`mt-6 flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-[11px] font-semibold uppercase tracking-[0.24em] transition ${isFormValid && !validatingFlight
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
                  {validatingFlight ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-amber-300" />
                      <span>Fetching Flight...</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Fetch Flight</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                {/* Secondary Option: Explicit Manual Flight Entry Toggle */}
                <div className="mt-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setHeroFlightStateMode(isManualMode ? "IDLE" : "MANUAL");
                      setIsManualMode((prev) => !prev);
                    }}
                    className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-purple-700 transition underline underline-offset-4 cursor-pointer"
                    style={mono}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                    <span>{isManualMode ? "Hide Manual Flight Form" : "Or Enter Flight Details Manually"}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Prompt User Before Overwriting Manual Entry with API Verified Data */}
        <AnimatePresence>
          {pendingVerifiedFlight && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="mx-6 mb-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4 z-30"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    Verified Official Flight Schedule Found for {pendingVerifiedFlight.flightNum}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-mono" style={mono}>
                    Route: {pendingVerifiedFlight.origin.code} → {pendingVerifiedFlight.destination.code} | Carrier: {pendingVerifiedFlight.carrier.name}. Replace custom manual entries with official schedule?
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const info = pendingVerifiedFlight;
                    setPendingVerifiedFlight(null);
                    proceedWithFlightData(info);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-[10px] font-bold uppercase tracking-wider shadow-md transition"
                  style={mono}
                >
                  Use Verified Schedule
                </button>
                <button
                  type="button"
                  onClick={() => setPendingVerifiedFlight(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold uppercase tracking-wider transition"
                  style={mono}
                >
                  Keep Custom Details
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Smooth Expandable Manual Flight Entry Form */}
        <AnimatePresence>
          {isManualMode && (
            <div className="px-6 pb-8 md:px-10">
              <ManualFlightEntryForm
                direction={tab}
                initialValues={{
                  flightNum: flightNumber,
                  depDate: departDate,
                }}
                onClose={() => setIsManualMode(false)}
                onSubmit={(manualFlightData) => {
                  proceedWithFlightData(manualFlightData);
                }}
              />
            </div>
          )}
        </AnimatePresence>
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

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -8 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: (i % 4) * 0.06 }}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[24px] bg-[#f5f0e6] border border-white/60 p-7 shadow-[8px_8px_16px_rgba(200,188,170,0.65),-8px_-8px_16px_rgba(255,255,255,0.95)] transition-all duration-300 hover:shadow-[14px_14px_28px_rgba(190,178,160,0.75),-14px_-14px_28px_rgba(255,255,255,1)]"
              >
                <div>
                  <div
                    className="grid h-12 w-12 place-items-center rounded-xl bg-[#f5f0e6] border border-white/80 shadow-[4px_4px_8px_rgba(200,188,170,0.6),-4px_-4px_8px_rgba(255,255,255,0.9)] transition-all duration-300 group-hover:shadow-[inset_3px_3px_6px_rgba(200,188,170,0.6),inset_-3px_-3px_6px_rgba(255,255,255,0.9)]"
                    style={{ color: C.teal }}
                  >
                    <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold leading-tight text-[#0b1a24]" style={display}>
                    {it.title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-[#576875]">
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

/* ─────────────────── TRUST BAR / STATISTICS ─────────────────── */
function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1600;
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
    <span ref={ref} className="inline-flex items-baseline font-serif">
      <span className="font-extrabold tracking-tight text-[#0b1a24]">{v.toLocaleString()}</span>
      <span className="text-2xl sm:text-3xl font-bold text-[#0c3b46] ml-1 font-sans">{suffix}</span>
    </span>
  );
}

function TrustBar() {
  const stats = [
    { n: 100, suf: "%", l: "Reliability", sub: "Dispatch safety record", Icon: ShieldCheck },
    { n: 20, suf: "+", l: "Airports", sub: "India & global hubs", Icon: Globe2 },
    { n: 42000, suf: "+", l: "Guests", sub: "Welcomed annually", Icon: Users },
    { n: 12, suf: "min", l: "Response", sub: "Average dispatch", Icon: Clock },
  ];

  return (
    <section className="relative px-6 py-14 md:px-14 md:py-24" style={{ background: C.bg }}>
      <div className="mx-auto grid max-w-[1480px] grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {stats.map(({ n, suf, l, sub, Icon }, i) => (
          <motion.div
            key={l}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#faf8f5] border border-white/80 p-7 shadow-[6px_6px_12px_rgba(200,188,170,0.5),-6px_-6px_12px_rgba(255,255,255,0.9)] transition-all duration-300 hover:shadow-[10px_10px_20px_rgba(190,178,160,0.6),-10px_-10px_20px_rgba(255,255,255,1)]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div
                  className="grid h-10 w-10 place-items-center rounded-xl bg-[#faf8f5] border border-white/80 shadow-[3px_3px_6px_rgba(200,188,170,0.5),-3px_-3px_6px_rgba(255,255,255,0.9)] text-[#0c3b46] transition-transform duration-300 group-hover:scale-105"
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="text-3xl sm:text-4xl md:text-5xl leading-none">
                <Counter end={n} suffix={suf} />
              </div>

              <div
                className="mt-4 text-[10px] uppercase tracking-[0.3em] font-mono font-bold text-[#0c3b46]"
                style={mono}
              >
                {l}
              </div>

              <div className="mt-1 text-xs text-[#576875] font-body-luxury">
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

// Centralized Services derived directly from @/services/catalog
import { OFFICIAL_SHAFSKY_SERVICES, OFFICIAL_SHAFSKY_CATEGORIES } from "@/services/catalog";

/* ─────────────────── SIGNATURE AIRPORT CONCIERGE EXPERIENCE ─────────────────── */
function SignatureConciergeSection() {
  const highlights = [
    {
      title: "Arrival Concierge",
      desc: "Aerobridge greeting with personalized placard, priority passport clearance & luggage retrieval.",
      icon: PlaneLanding,
      tag: "Arrival",
    },
    {
      title: "Departure Concierge",
      desc: "Curbside porter greeting, expedited check-in desk clearance & premium lounge escort.",
      icon: PlaneTakeoff,
      tag: "Departure",
    },
    {
      title: "Transit Concierge",
      desc: "Gate-to-gate buggy transport, terminal transit navigation & luggage re-check liaison.",
      icon: Shuffle,
      tag: "Transit",
    },
    {
      title: "Meet & Greet VVIP",
      desc: "Private luxury tarmac transfer sedan directly to the aircraft gate steps.",
      icon: Crown,
      tag: "VVIP Tarmac",
    },
  ];

  return (
    <section id="airport-concierge" className="relative px-6 py-20 md:px-14 md:py-28 bg-[#faf8f5] text-slate-900 overflow-hidden border-y border-amber-200/50">
      {/* Soft Ambient Radial Glows - Pure Cream & Warm Ivory Theme */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-amber-100/60 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-stone-200/50 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-50/50 blur-[150px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-[1480px]">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em]"
            style={{ ...mono, color: "#92400e" }}
          >
            <span className="h-px w-10 bg-amber-400/60" />
            FLAGSHIP AIRPORT OFFERING
            <span className="h-px w-10 bg-amber-400/60" />
          </div>
          <h2
            className="mt-5 text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.05] font-serif text-slate-900 tracking-tight"
            style={display}
          >
            Signature Airport <span className="italic bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 bg-clip-text text-transparent">Concierge Experience.</span>
          </h2>
          <p className="mt-4 text-sm md:text-base text-slate-600 font-body-luxury max-w-2xl mx-auto leading-relaxed">
            Meet & Greet is our company's flagship airport experience — engineered to eliminate every queue, counter, and uncertainty across 20+ international airport hubs.
          </p>
        </div>

        {/* Flagship Hero Card Layout */}
        <div className="mt-14 relative rounded-[36px] border border-white/90 bg-gradient-to-br from-white/80 via-white/50 to-amber-50/30 shadow-[inset_0_1px_3px_0_rgba(255,255,255,1),0_25px_60px_-15px_rgba(217,119,6,0.12)] p-6 sm:p-10 lg:p-12 backdrop-blur-2xl backdrop-saturate-150 overflow-hidden">
          {/* Specular Liquid Light Rays */}
          <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-br from-white/90 via-white/40 to-transparent blur-2xl pointer-events-none opacity-80" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-gradient-to-tl from-amber-300/30 via-white/20 to-transparent blur-2xl pointer-events-none opacity-60" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Visual Media Showcase */}
            <div className="lg:col-span-5 relative h-72 sm:h-96 rounded-2xl overflow-hidden group shadow-xl border border-white/90">
              <img
                src={meetGreetImg}
                alt="Signature Airport Concierge Escort"
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent" />
              <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-amber-300 border border-amber-400/40" style={mono}>
                ★ Flagship Experience
              </div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="text-xl font-bold font-serif text-white">Suswagatam Escort</div>
                <div className="text-xs text-amber-100 mt-1 font-body-luxury">One dedicated officer for your entire airport journey.</div>
              </div>
            </div>

            {/* Highlights Grid */}
            <div className="lg:col-span-7 flex flex-col justify-between h-full gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {highlights.map((h) => {
                  const HIcon = h.icon;
                  return (
                    <div
                      key={h.title}
                      className="relative p-6 rounded-2xl bg-gradient-to-br from-white/80 via-white/40 to-amber-50/20 backdrop-blur-2xl backdrop-saturate-200 border border-white/90 shadow-[inset_0_1px_2px_0_rgba(255,255,255,0.9),0_12px_36px_rgba(217,119,6,0.08)] hover:shadow-[inset_0_1px_3px_0_rgba(255,255,255,1),0_22px_50px_rgba(217,119,6,0.18)] hover:border-amber-400/90 hover:bg-white/90 hover:-translate-y-1.5 hover:scale-[1.01] transition-all duration-500 ease-out group/h overflow-hidden"
                    >
                      {/* Pure Liquid Specular Reflection */}
                      <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-white/90 via-white/30 to-transparent rounded-full blur-xl pointer-events-none opacity-70 group-hover/h:scale-125 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-amber-500/10 opacity-50 group-hover/h:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-3.5">
                          <div className="h-11 w-11 rounded-2xl bg-gradient-to-b from-white/90 via-amber-100/60 to-amber-200/30 backdrop-blur-md text-amber-900 border border-white/90 shadow-[inset_0_1px_2px_rgba(255,255,255,1),0_4px_14px_rgba(217,119,6,0.12)] flex items-center justify-center group-hover/h:rotate-6 group-hover/h:scale-110 transition-all duration-300">
                            <HIcon size={20} />
                          </div>
                          <span className="text-[9px] font-mono uppercase tracking-wider text-amber-950 bg-white/80 backdrop-blur-xl px-3.5 py-1 rounded-full border border-white/90 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(217,119,6,0.08)]" style={mono}>
                            {h.tag}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 font-body-luxury group-hover/h:text-amber-800 transition-colors">
                          {h.title}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-body-luxury">
                          {h.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action CTA */}
              <div className="pt-4 border-t border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-600 font-body-luxury text-center sm:text-left">
                  Packages & pricing appear dynamically after selecting your airport hub.
                </div>
                <Link
                  to="/airports"
                  className="group/cta inline-flex items-center gap-3 rounded-xl bg-amber-600 hover:bg-amber-700 px-7 py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white shadow-lg shadow-amber-600/20 transition-all duration-300 active:scale-98 cursor-pointer shrink-0"
                  style={mono}
                >
                  <span>Explore Airport Services</span>
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover/cta:translate-x-1.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────── ENTERPRISE SOLUTIONS — PREMIUM GSAP SHOWCASE ─────────────────── */

/** Per-panel mouse-tracking parallax card */
function SolutionPanel({
  sol,
  idx,
}: {
  sol: {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    Icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties; color?: string }>;
    gradient: string;
    glowColor: string;
    iconColor: string;
    ctaLink: string;
    services: { name: string; icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties; color?: string }>; }[];
  };
  idx: number;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  /* ── GSAP scroll-triggered entrance ── */
  useEffect(() => {
    let ctx: ReturnType<typeof import("gsap").gsap.context> | null = null;

    (async () => {
      const gsapModule = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const gsap = gsapModule.gsap;
      gsap.registerPlugin(ScrollTrigger);

      if (!panelRef.current) return;

      ctx = gsap.context(() => {
        gsap.fromTo(
          panelRef.current,
          { y: 80, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panelRef.current,
              start: "top 88%",
              toggleActions: "play none none none",
            },
            delay: idx * 0.12,
          }
        );
      }, panelRef);
    })();

    return () => { ctx?.revert(); };
  }, [idx]);

  /* ── Mouse-tracking parallax depth + glow follow ── */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = panelRef.current;
    const glow = glowRef.current;
    const content = contentRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 … 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Subtle 3D tilt
    el.style.transform = `perspective(1200px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg) scale(1.015)`;

    // Content parallax shift
    if (content) {
      content.style.transform = `translate(${x * 8}px, ${y * 6}px)`;
    }

    // Glow follows cursor
    if (glow) {
      glow.style.opacity = "1";
      glow.style.left = `${e.clientX - rect.left}px`;
      glow.style.top = `${e.clientY - rect.top}px`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = panelRef.current;
    const glow = glowRef.current;
    const content = contentRef.current;
    if (el) el.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg) scale(1)";
    if (content) content.style.transform = "translate(0,0)";
    if (glow) glow.style.opacity = "0";
  }, []);

  const SolIcon = sol.Icon;

  return (
    <div
      ref={panelRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative overflow-hidden rounded-[36px] border border-black/[0.08] will-change-transform shadow-[0_4px_32px_rgba(0,0,0,0.06)]"
      style={{
        transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease",
        background: sol.gradient,
        boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
      }}
    >
      {/* ── Cursor-following glow orb ── */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 h-[320px] w-[320px] rounded-full blur-[100px] transition-opacity duration-500"
        style={{ background: sol.glowColor, opacity: 0 }}
      />

      {/* ── Animated ambient floating orb (always visible, slow drift) ── */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"
        style={{ background: sol.glowColor }}
      >
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-full"
        />
      </div>

      {/* ── Animated diagonal shine sweep on hover ── */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden">
        <motion.div
          animate={{ x: ["-120%", "120%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent skew-x-12"
        />
      </div>

      {/* ── Content layer ── */}
      <div
        ref={contentRef}
        className="relative z-10 p-8 sm:p-12 lg:p-14 will-change-transform"
        style={{ transition: "transform 0.3s ease-out" }}
      >
        {/* Top row: icon + badge */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-14 w-14 rounded-2xl bg-white/80 border border-black/[0.08] backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white transition-all duration-400">
            {React.createElement(SolIcon as any, { size: 28, color: sol.iconColor })}
          </div>
          <span
            className="rounded-full bg-white/80 border border-black/[0.06] backdrop-blur-sm px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-800 shadow-sm transition-all duration-400"
            style={mono}
          >
            {sol.badge}
          </span>
        </div>

        {/* Title & subtitle */}
        <h3
          className="text-[clamp(1.8rem,4vw,3.2rem)] font-bold font-serif text-slate-900 leading-[1.08] tracking-tight"
          style={display}
        >
          {sol.title}<span style={{ color: sol.iconColor }}>.</span>
        </h3>
        <p className="mt-3 text-sm sm:text-[15px] text-slate-600 font-body-luxury leading-relaxed max-w-lg">
          {sol.subtitle}
        </p>

        {/* Included services chips */}
        <div className="mt-8 flex flex-wrap gap-2.5">
          {sol.services.map((svc) => {
            const SvcIcon = svc.icon;
            return (
              <span
                key={svc.name}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/70 border border-black/[0.06] px-3.5 py-1.5 text-[11px] font-medium text-slate-700 backdrop-blur-sm group-hover:bg-white group-hover:border-black/[0.12] transition-all duration-300"
              >
                {React.createElement(SvcIcon as any, { size: 12, className: "shrink-0", color: sol.iconColor })}
                {svc.name}
              </span>
            );
          })}
        </div>

        {/* Explore CTA */}
        <div className="mt-10 pt-6 border-t border-black/[0.06]">
          <Link
            to={sol.ctaLink}
            className="group/cta inline-flex items-center gap-3 rounded-2xl bg-slate-900 border border-slate-800 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white transition-all duration-400 hover:bg-slate-800 hover:shadow-lg"
            style={mono}
          >
            <span>Explore</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-400 group-hover/cta:translate-x-2.5" />
          </Link>
        </div>
      </div>

      {/* ── Bottom border glow on hover ── */}
      <div
        className="absolute bottom-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(to right, transparent, ${sol.iconColor}, transparent)` }}
      />
    </div>
  );
}

function EnterpriseSolutions() {
  const solutions = [
    {
      id: "concierge",
      title: "Airport Services",
      subtitle: "Everything you need for a smooth airport journey.",
      badge: "Flagship",
      Icon: Crown,
      gradient: "linear-gradient(145deg, #fff7ed 0%, #fef3e2 40%, #fdf8f0 100%)",
      glowColor: "rgba(234,88,12,0.12)",
      iconColor: "#ea580c",
      ctaLink: "/solutions/concierge",
      services: [
        { name: "Meet & Greet", icon: Users },
        { name: "Airport Lounge", icon: Hotel },
        { name: "Fast Track", icon: Ticket },
        { name: "Airport Transfer", icon: Car },
      ],
    },
    {
      id: "travel",
      title: "Travel Services",
      subtitle: "Bespoke hotel curation, VIP flight ticketing, express visa desks & Michelin-grade onboard dining.",
      badge: "Travel",
      Icon: Globe2,
      gradient: "linear-gradient(145deg, #f0fdf4 0%, #ecfce8 40%, #f5fef2 100%)",
      glowColor: "rgba(101,163,13,0.12)",
      iconColor: "#65a30d",
      ctaLink: "/solutions/travel",
      services: [
        { name: "Air Ticketing", icon: Ticket },
        { name: "Hotel Booking", icon: Building2 },
        { name: "Visa Assistance", icon: Sparkles },
        { name: "On-board Meals", icon: Award },
      ],
    },
    {
      id: "cargo",
      title: "Cargo & Logistics",
      subtitle: "White-glove customs clearance, insured freight handling & climate-controlled live animal transport.",
      badge: "Freight",
      Icon: Package,
      gradient: "linear-gradient(145deg, #faf5ff 0%, #f5f0ff 40%, #f8f4ff 100%)",
      glowColor: "rgba(139,92,246,0.12)",
      iconColor: "#7c3aed",
      ctaLink: "/solutions/cargo",
      services: [
        { name: "Cargo Assistance", icon: Package },
        { name: "AVI (Pet Transport)", icon: HeartPulse },
      ],
    },
    {
      id: "medical",
      title: "Medical Assistance",
      subtitle: "24/7 ICU-equipped air ambulance medevac, specialized rail ambulance & dignified repatriation.",
      badge: "24/7 Critical",
      Icon: HeartPulse,
      gradient: "linear-gradient(145deg, #fff1f2 0%, #ffe4e6 40%, #fff5f6 100%)",
      glowColor: "rgba(225,29,72,0.1)",
      iconColor: "#e11d48",
      ctaLink: "/solutions/medical",
      services: [
        { name: "Air Ambulance", icon: Plane },
        { name: "Train Ambulance", icon: Car },
        { name: "HUM (Repatriation)", icon: ShieldCheck },
      ],
    },
    {
      id: "aviation",
      title: "Private Aviation",
      subtitle: "On-demand private jet charter with exclusive FBO terminal access & bespoke cabin luxury worldwide.",
      badge: "Executive",
      Icon: Plane,
      gradient: "linear-gradient(145deg, #fffbeb 0%, #fef9c3 40%, #fefce8 100%)",
      glowColor: "rgba(202,138,4,0.12)",
      iconColor: "#ca8a04",
      ctaLink: "/solutions/aviation",
      services: [
        { name: "Private Charter", icon: Crown },
      ],
    },
  ];

  return (
    <section id="solutions" className="relative px-6 py-24 md:px-14 md:py-36 overflow-hidden" style={{ background: '#faf5ea' }}>
      {/* Background ambient grain texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 mx-auto max-w-[1380px]">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div
            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em]"
            style={{ ...mono, color: '#7c3aed' }}
          >
            <span className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #7c3aed)' }} />
            ENTERPRISE SOLUTIONS
            <span className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #7c3aed)' }} />
          </div>
          <h2
            className="mt-6 text-[clamp(2.6rem,6vw,5.2rem)] leading-[1.0] text-slate-900 tracking-tight"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 400 }}
          >
            Five pillars of{" "}
            <span className="italic text-[#7c3aed]" style={{ fontFamily: 'var(--font-heading)' }}>
              aviation excellence.
            </span>
          </h2>
          <p className="mt-5 text-sm md:text-[15px] text-slate-600 font-body-luxury max-w-xl mx-auto leading-relaxed">
            Our complete portfolio — organized into specialized enterprise domains — serves every dimension of premium flight and airport transit.
          </p>
        </div>

        {/* Showcase Panels */}
        <div className="flex flex-col gap-10">
          {solutions.map((sol, i) => (
            <SolutionPanel key={sol.id} sol={sol} idx={i} />
          ))}
        </div>
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
      name: "Delhi · IGI Airport",
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
      pax: "Full Airport Coverage",
      range: "24×7",
      speed: "All Airlines",
    },
    {
      name: "Bengaluru · Kempegowda",
      cat: "Southern Hub",
      img: interior,
      pax: "Full Airport Coverage",
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
              className={`relative mb-14 grid grid-cols-[44px_1fr] gap-6 md:grid-cols-2 md:gap-16 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""
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
                  scale: 1.02,
                  y: -8,
                  boxShadow: "12px 12px 30px #dcd3c0, -12px -12px 30px #ffffff",
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
            <MotionA
              href="#book"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-[12px] uppercase tracking-[0.3em] shadow-lg transition hover:brightness-110"
              style={{ ...mono, background: C.teal, color: "#fff" }}
            >
              Book Services →
            </MotionA>
            <MotionLink
              to="/charter"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-[12px] uppercase tracking-[0.3em] shadow-lg transition hover:brightness-110"
              style={{ ...mono, background: C.mint, color: C.ink }}
            >
              <Plane className="h-3.5 w-3.5" /> Private Charter
            </MotionLink>
            <MotionA
              href="https://wa.me/919599087959"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-3 rounded-full px-8 py-4 text-[12px] uppercase tracking-[0.3em] transition"
              style={{ ...mono, border: `1px solid ${C.teal}`, color: C.teal }}
            >
              WhatsApp Us
            </MotionA>
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
                  className="h-11 sm:h-13 md:h-16 lg:h-18 max-h-[70px] w-auto object-contain scale-[2.2] sm:scale-[2.5] md:scale-[2.8] origin-left transition-all duration-300 transform-gpu hover:scale-[2.95]"
                />
              ) : (
                <>
                  <div
                    className="grid h-11 w-11 sm:h-12 sm:w-12 md:h-14 md:w-14 place-items-center rounded-2xl shadow-md"
                    style={{ background: C.mint }}
                  >
                    <Plane className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 -rotate-45" style={{ color: C.tealDeep }} />
                  </div>
                  <div style={mono}>
                    <div className="text-lg sm:text-xl md:text-2xl font-bold tracking-[0.28em]">{firstPart}</div>
                    <div className="mt-0.5 text-[9px] sm:text-[10px] tracking-[0.45em] text-white/60">
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
