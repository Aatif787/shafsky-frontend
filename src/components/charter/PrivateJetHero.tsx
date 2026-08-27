import React, { useState } from "react";
import {
  Menu,
  X,
  Plane,
  Clock,
  MessageCircle,
  Phone,
  ArrowRight,
  Lock,
  Globe,
  Award,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PrivateCharterRequestFlow } from "./PrivateCharterRequestFlow";

const FLEET_CATEGORIES = [
  {
    category: "Light Jet",
    models: "Citation XLS+ • Phenom 300E • Premier 1A",
    passengers: "4–7 Guests",
    range: "1,800 nm (Up to 3.5 hrs)",
    speed: "450 kts",
    description: "Agile, cost-efficient regional travel with exceptional short-runway capability.",
  },
  {
    category: "Midsize Jet",
    models: "Hawker 850XP • Learjet 60XR • Citation Sovereign",
    passengers: "7–9 Guests",
    range: "2,600 nm (Up to 5 hrs)",
    speed: "470 kts",
    description: "Spacious stand-up cabin comfort paired with cross-continent non-stop endurance.",
  },
  {
    category: "Super Midsize Jet",
    models: "Challenger 350 • Gulfstream G280 • Citation Longitude",
    passengers: "8–10 Guests",
    range: "3,400 nm (Up to 6.5 hrs)",
    speed: "485 kts",
    description: "Transcontinental range with gourmet full galley, lie-flat club seating, and baggage capacity.",
  },
  {
    category: "Heavy Jet",
    models: "Challenger 605 • Falcon 900LX • Legacy 650",
    passengers: "10–16 Guests",
    range: "4,500 nm (Up to 9 hrs)",
    speed: "490 kts",
    description: "Dedicated flight attendant service, dual cabin zones, and Michelin-class dining.",
  },
  {
    category: "Ultra Long Range",
    models: "Global 6000 • Gulfstream G650ER • Falcon 8X",
    passengers: "12–19 Guests",
    range: "7,500 nm (Up to 14 hrs)",
    speed: "515 kts",
    description: "Intercontinental non-stop luxury with private master stateroom and Ka-band satellite suite.",
  },
  {
    category: "VIP Airliner",
    models: "Airbus ACJ319neo • Boeing BBJ • Lineage 1000",
    passengers: "19–50+ Guests",
    range: "Global Intercontinental",
    speed: "470 kts",
    description: "Bespoke airborne residence featuring boardroom, master bedroom, and ensuite shower suite.",
  },
];

const ADVANTAGES = [
  {
    icon: Clock,
    title: "15-Minute Curbside-to-Airborne",
    desc: "Bypass commercial airport terminals completely via private general aviation FBO suites with direct tarmac boarding.",
  },
  {
    icon: Lock,
    title: "100% Manifest Confidentiality",
    desc: "Strict non-disclosure agreements, private tail registration handling, and discrete diplomatic security protocols.",
  },
  {
    icon: Globe,
    title: "Access to 5,000+ Global Runways",
    desc: "Land closer to your final destination at private executive airports inaccessible to commercial airlines.",
  },
  {
    icon: Award,
    title: "Tailored Flight Operations Desk",
    desc: "Dedicated flight coordinator assigned to manage landing permits, gourmet catering, and chauffeur positioning.",
  },
];

const FAQS = [
  {
    q: "How does the Private Charter request workflow operate?",
    a: "Submit your route, dates, and party details online. Our charter flight operations desk instantly reviews runway parameters, aircraft availability, and positioning to deliver a tailored quotation and aircraft options.",
  },
  {
    q: "Is there any payment required when submitting an enquiry?",
    a: "No. Submitting a charter enquiry is 100% free with zero upfront obligation. You only confirm and settle payment once you approve the specific aircraft proposal and flight itinerary.",
  },
  {
    q: "How fast can an aircraft be dispatched for short-notice departures?",
    a: "For priority and emergency itineraries, our flight desk can dispatch verified aircraft in as little as 2 to 4 hours, subject to slots, permits, and crew positioning.",
  },
  {
    q: "Can I travel with pets in the main aircraft cabin?",
    a: "Yes. Pets travel in the main cabin alongside you in complete comfort without crates or cargo segregation.",
  },
];

export function PrivateJetHero() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const navLinks = [
    { name: "Start", href: "#start" },
    { name: "Story", href: "#story" },
    { name: "Fleet", href: "#fleet" },
    { name: "Benefits", href: "#benefits" },
    { name: "FAQ", href: "#faq" },
  ];

  const openWhatsAppSpecialist = () => {
    const msg = encodeURIComponent(
      "Hello Shafsky Aviation, I would like to speak with a Private Charter Specialist regarding an upcoming flight requirement."
    );
    window.open(`https://wa.me/919599087959?text=${msg}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1A1715] font-['Inter',sans-serif] selection:bg-[#84CC16] selection:text-black">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION WITH VIDEO BACKGROUND
         ───────────────────────────────────────────────────────────── */}
      <section id="start" className="relative h-screen overflow-hidden">
        {/* Background Video (100vh, object-cover, autoplay, muted, loop) */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4"
        />

        {/* Cinematic Subtle Dark Gradient Overlay for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70 pointer-events-none" />

        {/* Content Wrapper */}
        <div className="relative z-10 flex h-full flex-col">
          {/* Navigation Bar */}
          <header className="w-full">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 md:px-8 py-6">
              {/* Brand Logo / Name */}
              <Link
                to="/"
                className="text-2xl font-semibold tracking-tight text-white transition-colors hover:text-white/80"
              >
                SkyElite <span className="text-xs font-mono font-bold tracking-widest text-[#84CC16] uppercase ml-1">Charter</span>
              </Link>

              {/* Desktop Nav Items */}
              <nav className="hidden items-center gap-8 md:flex">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm font-semibold text-white/90 transition-colors hover:text-[#84CC16]"
                  >
                    {link.name}
                  </a>
                ))}
              </nav>

              {/* Desktop Direct Action */}
              <div className="hidden md:flex items-center gap-3">
                <button
                  type="button"
                  onClick={openWhatsAppSpecialist}
                  className="px-4 py-2 rounded-full border border-white/30 hover:border-[#84CC16] text-xs font-semibold text-white hover:text-white transition flex items-center gap-1.5 backdrop-blur-sm"
                >
                  <Phone className="w-3.5 h-3.5 text-[#84CC16]" /> Specialist
                </button>
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(true)}
                  className="px-5 py-2 rounded-full bg-[#84CC16] hover:bg-[#65A30D] text-[#0D1F03] font-bold text-xs transition shadow-lg shadow-[#84CC16]/25"
                >
                  Request a Charter
                </button>
              </div>

              {/* Mobile Hamburger Toggle */}
              <div className="flex md:hidden">
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="rounded-lg p-2 text-white transition-colors hover:text-white/80 focus:outline-none"
                  aria-label="Toggle navigation menu"
                >
                  {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
              <div className="px-6 md:hidden">
                <div className="rounded-2xl bg-[#FAF8F5]/98 p-6 shadow-2xl backdrop-blur-md border border-[#E5DFD5] space-y-4">
                  <nav className="flex flex-col space-y-3">
                    {navLinks.map((link) => (
                      <a
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-base font-semibold text-[#1A1715] hover:text-[#4D7C0F] transition-colors"
                      >
                        {link.name}
                      </a>
                    ))}
                  </nav>
                  <div className="pt-4 border-t border-[#E5DFD5] flex flex-col gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsRequestModalOpen(true);
                      }}
                      className="w-full py-2.5 rounded-full bg-[#84CC16] text-[#0D1F03] font-bold text-xs text-center transition shadow-sm"
                    >
                      Request a Charter
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        openWhatsAppSpecialist();
                      }}
                      className="w-full py-2.5 rounded-full border border-[#DCD5C9] text-[#1A1715] font-semibold text-xs text-center transition"
                    >
                      Speak to a Specialist
                    </button>
                  </div>
                </div>
              </div>
            )}
          </header>

          {/* Main Hero Content Area */}
          <main className="flex flex-1 items-center justify-center px-4 text-center">
            <div className="-mt-16 md:-mt-24 flex flex-col items-center justify-center max-w-4xl space-y-6">
              {/* Eyebrow Label */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-[#84CC16]/40 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#84CC16] animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#84CC16]">
                  PRIVATE CHARTER
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-2">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-tight tracking-tight text-white drop-shadow-md">
                  Fly Beyond Ordinary.
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow-sm font-medium">
                  Private aviation tailored around your exact schedule, route and requirements.
                </p>
              </div>

              {/* Primary & Secondary Call to Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2 w-full max-w-md">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(true)}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#84CC16] hover:bg-[#65A30D] text-[#0D1F03] font-bold text-sm transition-all shadow-xl shadow-[#84CC16]/25 flex items-center justify-center gap-2 group"
                >
                  Request a Charter <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#0D1F03]" />
                </button>
                <button
                  type="button"
                  onClick={openWhatsAppSpecialist}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 text-[#84CC16]" /> Speak to a Specialist
                </button>
              </div>
            </div>
          </main>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. EMBEDDED CHARTER ENQUIRY SECTION (LIGHT CREAM & LIME)
         ───────────────────────────────────────────────────────────── */}
      <section id="story" className="py-20 md:py-28 px-6 md:px-8 max-w-7xl mx-auto bg-[#FAF8F5]">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#4D7C0F] font-bold">
            Bespoke Aviation Concierge
          </span>
          <h2 className="text-3xl md:text-5xl font-normal text-[#1A1715]">
            Your Flight. Your Terms.
          </h2>
          <p className="text-sm md:text-base text-[#78716C] leading-relaxed">
            Experience complete autonomy over your departure times, destination cities, and cabin configuration with zero commercial layovers.
          </p>
        </div>

        {/* Embedded Request Flow Widget */}
        <div className="my-8">
          <PrivateCharterRequestFlow />
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. FLEET CATEGORY SHOWCASE (LIGHT CREAM & LIME)
         ───────────────────────────────────────────────────────────── */}
      <section id="fleet" className="py-20 bg-[#F5F0EB] border-y border-[#E5DFD5] px-6 md:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[#4D7C0F] font-bold">
                Curated Aircraft Fleet
              </span>
              <h2 className="text-3xl md:text-4xl font-normal text-[#1A1715]">
                Global Private Aviation Categories
              </h2>
            </div>
            <p className="text-xs md:text-sm text-[#78716C] max-w-md font-medium">
              From light jets for short regional hops to ultra-long-range intercontinental airliners with private staterooms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FLEET_CATEGORIES.map((fleet, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-[#E5DFD5] hover:border-[#84CC16] hover:shadow-lg transition-all space-y-4 flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#1A1715] group-hover:text-[#4D7C0F] transition-colors">
                      {fleet.category}
                    </span>
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-[#F4FCE3] text-[#365314] border border-[#84CC16]/30">
                      {fleet.passengers}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-[#4D7C0F] font-bold">{fleet.models}</div>
                  <p className="text-xs text-[#78716C] leading-relaxed pt-1">{fleet.description}</p>
                </div>

                <div className="pt-4 border-t border-[#E5DFD5] flex items-center justify-between text-xs text-[#78716C] font-medium">
                  <span>Range: {fleet.range}</span>
                  <span>Speed: {fleet.speed}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. BENEFITS & CONCIERGE ADVANTAGES
         ───────────────────────────────────────────────────────────── */}
      <section id="benefits" className="py-20 md:py-28 px-6 md:px-8 max-w-7xl mx-auto space-y-12 bg-[#FAF8F5]">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#4D7C0F] font-bold">
            The SkyElite Standard
          </span>
          <h2 className="text-3xl md:text-4xl font-normal text-[#1A1715]">
            Engineered for Flawless Travel
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ADVANTAGES.map((adv, idx) => {
            const Icon = adv.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white border border-[#E5DFD5] shadow-sm space-y-3"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#F4FCE3] border border-[#84CC16]/40 text-[#4D7C0F] flex items-center justify-center shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#1A1715]">{adv.title}</h3>
                <p className="text-xs text-[#78716C] leading-relaxed">{adv.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. ENTERPRISE FAQ ACCORDION
         ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 bg-[#F5F0EB] border-t border-[#E5DFD5] px-6 md:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#4D7C0F] font-bold">
              Common Inquiries
            </span>
            <h2 className="text-3xl md:text-4xl font-normal text-[#1A1715]">
              Private Charter FAQs
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-[#E5DFD5] overflow-hidden shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between text-sm font-semibold text-[#1A1715] hover:text-[#4D7C0F] transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-[#4D7C0F] font-mono text-lg font-bold ml-4">
                    {openFaqIndex === idx ? "−" : "+"}
                  </span>
                </button>
                {openFaqIndex === idx && (
                  <div className="px-5 pb-5 text-xs text-[#78716C] leading-relaxed border-t border-[#E5DFD5] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. MODAL DIALOG OVERLAY (LIGHT CREAM & LIME)
         ───────────────────────────────────────────────────────────── */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-4xl my-8">
            <PrivateCharterRequestFlow onClose={() => setIsRequestModalOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default PrivateJetHero;
