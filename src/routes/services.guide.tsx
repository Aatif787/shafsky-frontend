import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PlaneLanding,
  PlaneTakeoff,
  Shuffle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  MessageSquare,
  ArrowRight,
  Sparkles,
  Luggage,
  Users,
  Compass,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/home/sections/Footer";
import { BUSINESS } from "@/lib/constants";
import { display, mono } from "@/components/home/theme";

export const Route = createFileRoute("/services/guide")({
  head: () => ({
    meta: [
      { title: "Airport Assistance Guide — Shafsky Aviation Services" },
      {
        name: "description",
        content:
          "Simple guide to Shafsky Airport Assistance: how Meet & Greet works on arrival, departure, and transit across 20+ airports in India.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Airport Assistance Guide — Shafsky Aviation Services" },
      {
        property: "og:description",
        content: "How airport Meet & Greet, fast-track assistance, and luggage porter services work.",
      },
      { property: "og:url", content: `${BUSINESS.BASE_URL}/services/guide` },
      { property: "og:type", content: "article" },
      { property: "og:image", content: `${BUSINESS.BASE_URL}/og-image.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Airport Assistance Guide — Shafsky Aviation Services" },
      {
        name: "twitter:description",
        content: "Simple step-by-step guide to airport meet & greet and passenger assistance.",
      },
    ],
    links: [{ rel: "canonical", href: `${BUSINESS.BASE_URL}/services/guide` }],
  }),
  component: ServiceGuidePage,
});

function ServiceGuidePage() {
  const steps = [
    {
      num: "01",
      title: "Book Online in 60 Seconds",
      desc: "Select your airport, travel date, flight number, and passenger count on our website.",
      icon: Clock,
      badge: "Instant Confirmation",
    },
    {
      num: "02",
      title: "Meet Your Dedicated Host",
      desc: "Our uniformed representative meets you with a clear name placard right at the aerobridge gate or terminal entrance.",
      icon: Users,
      badge: "Flight-Tracked Meeting",
    },
    {
      num: "03",
      title: "Breeze Through the Airport",
      desc: "We take care of your luggage, guide you through quick check-in and security, and escort you to the lounge or your car.",
      icon: ShieldCheck,
      badge: "Zero Queues & Zero Stress",
    },
  ];

  const services = [
    {
      title: "Arrival Service",
      subtitle: "For passengers landing at the airport",
      icon: PlaneLanding,
      badge: "Landing",
      points: [
        "Warm greeting at the aerobridge exit with a personalized name placard",
        "Assistance with hand luggage and porter collection at the baggage belt",
        "Guided walk through customs and terminal exits directly to your vehicle",
        "Electric buggy transfer inside long terminal corridors (where available)",
      ],
    },
    {
      title: "Departure Service",
      subtitle: "For passengers taking off from the airport",
      icon: PlaneTakeoff,
      badge: "Takeoff",
      points: [
        "Curbside greeting at the departure terminal drop-off lane",
        "Dedicated luggage porter to manage all heavy suitcases",
        "Assistance with airline check-in desk and boarding pass collection",
        "Escort through security clearance directly to the lounge or boarding gate",
      ],
    },
    {
      title: "Transit & Connection",
      subtitle: "For passengers changing flights or terminals",
      icon: Shuffle,
      badge: "Connecting",
      points: [
        "Host meets you at your arrival gate immediately after deplaning",
        "Direct buggy or escorted transit transfer between connecting gates or terminals",
        "Re-check baggage assistance and connection verification",
        "Escort to your connecting flight's boarding gate on time",
      ],
    },
  ];

  const faqs = [
    {
      q: "Where will the representative meet me?",
      a: "For arrivals, our host waits for you right at the aerobridge door with a placard displaying your name. For departures, our team meets you at the airport curbside drop-off before you enter the terminal.",
    },
    {
      q: "What happens if my flight is delayed or early?",
      a: "Our operations desk tracks your flight live on radar 24/7. Your host will always be staged and waiting at your updated arrival or departure time without any extra action required from you.",
    },
    {
      q: "Can I book for my parents, elderly relatives, or children?",
      a: "Yes! Simply enter their name and phone number during booking. Our team will provide dedicated one-on-one white-glove assistance throughout their airport journey.",
    },
    {
      q: "How far in advance should I book?",
      a: "We recommend booking at least 12 hours prior to your travel time. For last-minute or urgent same-day bookings, our 24/7 WhatsApp desk provides immediate authorization.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 flex flex-col justify-between">
      <Navigation visible={true} />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 space-y-16">
        {/* 1. CLEAN HERO HEADER */}
        <section className="text-center max-w-3xl mx-auto space-y-4 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-100/80 border border-lime-300 text-lime-900 text-xs font-mono font-bold tracking-wider uppercase">
            <Sparkles size={13} className="text-lime-700" />
            <span>Passenger Service Guide</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight"
            style={display}
          >
            How Shafsky Airport <span className="text-lime-600">Assistance Works</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about our Meet & Greet, fast-track passenger support, and luggage assistance across India and global hubs.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="/#book"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-mono text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <span>Book Airport Service</span>
              <ArrowRight size={14} />
            </a>
            <a
              href="tel:+919599087959"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-mono text-xs font-bold transition"
            >
              <PhoneCall size={14} className="text-lime-600" />
              <span>24/7 Helpline: +91 9599087959</span>
            </a>
          </div>
        </section>

        {/* 2. 3 SIMPLE STEPS */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950" style={display}>
              Simple 3-Step Process
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              From reservation to car handover — effortless and smooth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-8 shadow-xs flex flex-col justify-between hover:border-lime-400 transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-black text-lime-600">{s.num}</span>
                      <div className="h-10 w-10 rounded-2xl bg-lime-50 border border-lime-200 flex items-center justify-center text-lime-700 group-hover:bg-lime-500 group-hover:text-slate-950 transition-colors">
                        <Icon size={18} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-950">{s.title}</h3>
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <span className="inline-block text-[10.5px] font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                      ✓ {s.badge}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. OUR SERVICES: WHAT'S INCLUDED */}
        <section className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950" style={display}>
              What's Included in Every Service
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Choose the exact assistance tailored for your flight direction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((svc, idx) => {
              const Icon = svc.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-7 shadow-xs space-y-5 flex flex-col justify-between hover:border-lime-400 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-10 w-10 rounded-2xl bg-slate-900 text-lime-400 flex items-center justify-center">
                        <Icon size={20} />
                      </div>
                      <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-lime-700 bg-lime-50 px-2.5 py-1 rounded-full border border-lime-200">
                        {svc.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-950" style={display}>
                        {svc.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{svc.subtitle}</p>
                    </div>

                    <ul className="space-y-2.5 pt-2">
                      {svc.points.map((pt, pIdx) => (
                        <li key={pIdx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-snug">
                          <CheckCircle2 size={15} className="text-lime-600 shrink-0 mt-0.5" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <a
                      href="/#book"
                      className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-lime-700 hover:text-lime-800 transition"
                    >
                      <span>Book {svc.title}</span>
                      <ArrowRight size={13} />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. FREQUENTLY ASKED QUESTIONS */}
        <section className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-950" style={display}>
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Quick answers to common questions from travelers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h4 className="text-sm font-bold text-slate-950 flex items-start gap-2">
                  <span className="text-lime-600 font-mono font-bold">Q.</span>
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed pl-5 font-normal">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* 5. INSTANT BOOKING & WHATSAPP BANNER */}
        <section className="rounded-3xl bg-slate-950 text-white p-8 sm:p-12 text-center space-y-5 shadow-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-400/20 text-lime-400 text-xs font-mono font-bold">
            <Compass size={14} />
            <span>Ready to Travel?</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight" style={display}>
            Book Your Airport Assistance in Seconds
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            Choose your airport, travel date, and let our dedicated team handle the rest with complete peace of mind.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="/#book"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-mono text-xs font-extrabold uppercase tracking-wider shadow-md transition"
            >
              <span>Book Airport Service Now</span>
              <ArrowRight size={14} />
            </a>

            <a
              href={`https://wa.me/919599087959?text=${encodeURIComponent(
                "Hello Shafsky Aviation, I would like assistance with booking an airport service."
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold transition"
            >
              <MessageSquare size={14} className="text-emerald-400" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
