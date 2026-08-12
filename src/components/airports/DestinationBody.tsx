import { useState } from "react";
import { motion } from "framer-motion";
import {
  ExternalLink,
  X,
  ConciergeBell,
  ArrowRight,
  Plane,
  MapPin,
  Globe,
  Clock,
  ShieldCheck,
  Sparkles,
  Inbox,
  CheckCircle2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { getAirportServices, type Airport } from "@/data/airports";
import { LIGHT, display, mono, SectionLabel, GridCard, StatusDot } from "./Atoms";
import { MeetGreetPackageComparison } from "./MeetGreetPackageComparison";
import { AssistanceCTA } from "@/components/navigation/AssistanceCTA";

const SERVICE_IMAGES: Record<string, string> = {
  "meet-greet": "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1920&q=95",
  lounge: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=95",
  "fast-track": "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=95",
  transfer: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1920&q=95",
  porter: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=95",
  baggage: "https://images.unsplash.com/photo-1553531384-cc14c8086119?auto=format&fit=crop&w=1920&q=95",
  visa: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=1920&q=95",
  hotel: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=95",
  wheelchair: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1920&q=95",
  concierge: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1920&q=95",
};

export function DestinationBody({ a }: { a: Airport }) {
  const airportServices = getAirportServices(a.code);

  const quickInfoChips = [
    a.code ? { label: "Airport Code", value: a.code, Icon: Plane } : null,
    a.city ? { label: "City", value: a.city, Icon: MapPin } : null,
    a.country ? { label: "Country", value: a.country, Icon: Globe } : null,
    airportServices.length > 0
      ? { label: "Available Services", value: `${airportServices.length} Services`, Icon: ConciergeBell }
      : null,
    { label: "24/7 Support", value: "24/7 Operations", Icon: Clock },
    { label: "VIP Assistance", value: "Airside Escort", Icon: ShieldCheck },
  ].filter(Boolean) as Array<{ label: string; value: string; Icon: any }>;

  return (
    <div style={{ background: LIGHT.bg, color: LIGHT.ink }}>
      {/* 1. Airport Quick Info Chips Section */}
      <section className="px-4 pt-10 pb-6 sm:px-8 md:px-16 mx-auto max-w-[1600px]">
        <div className="flex flex-wrap items-center gap-3.5">
          {quickInfoChips.map((chip) => {
            const IconComponent = chip.Icon;
            return (
              <motion.div
                key={`chip-${chip.label}`}
                whileHover={{ y: -2 }}
                className="flex items-center gap-3 rounded-2xl bg-white border border-[#e2e8f0] px-4 py-3 shadow-xs"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-[#7c3aed]">
                  <IconComponent className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 font-bold">
                    {chip.label}
                  </div>
                  <div className="text-xs font-bold text-slate-900 font-sans">{chip.value}</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 2. Airport Specifications & Details */}
      <section className="px-4 py-12 sm:px-8 md:px-16 md:py-16">
        <SectionLabel index="01" label="Airport Overview" />
        <h2 className="mt-4 max-w-4xl text-[clamp(2rem,3.5vw,3rem)] font-bold text-slate-900 leading-[1.1]" style={display}>
          {a.airport?.name || `${a.city} (${a.code})`} Specifications.
        </h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-3xl border border-slate-200 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 bg-slate-200 shadow-sm">
          {[
            ["IATA Code", a.code],
            ["ICAO Code", a.icao],
            ["Elevation", a.airport?.elevation || "150 ft"],
            ["Runways", a.airport?.runways || "2 Parallel Runways"],
            ["Operator", a.airport?.operator || "International Airport Authority"],
            ["Airport Type", a.airport?.type || "International Hub"],
            ["Terminals", a.airport?.terminals || "2 Terminals"],
            ["Capacity", a.airport?.capacity || "15M Pax / Year"],
            ["Domestic Operations", a.airport?.domestic || "100+ daily flights"],
            ["International Operations", a.airport?.intl || "40+ weekly flights"],
            ["Status", "Operational 24/7"],
          ].map(([k, v]) => (
            <div key={`airport-spec-${k}`} className="min-w-0 p-5 bg-white">
              <div className="text-[9px] uppercase tracking-widest text-slate-500 font-mono font-bold">
                {k}
              </div>
              <div className="mt-1.5 text-base font-bold text-slate-900 font-serif" style={display}>
                {v}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Available Services & Dynamic Meet & Greet Packages */}
      <section id="available-services" className="px-4 py-16 sm:px-8 md:px-16 md:py-20 bg-white border-y border-slate-200">
        <SectionLabel index="02" label="Airside Concierge Catalog" />
        <h2 className="mt-4 max-w-4xl text-[clamp(2rem,3.5vw,3rem)] font-bold text-slate-900 leading-[1.1]" style={display}>
          Available services at <span className="text-[#7c3aed] italic">{a.city} ({a.code})</span>.
        </h2>

        {/* Dynamic Master Airport Package Comparison */}
        <div className="mt-10">
          <MeetGreetPackageComparison airportCode={a.code} />
        </div>
      </section>

      {/* 4. Book Service CTA Banner */}
      <AssistanceCTA
        heading={`Ready for VIP Arrival at ${a.city}?`}
        subheading={`Reserve custom airside escort, lounge access, and chauffeured transit at ${a.code}.`}
      />

      {/* 5. Airport FAQ Section */}
      <section className="px-4 py-16 sm:px-8 md:px-16 md:py-20 max-w-5xl mx-auto">
        <SectionLabel index="03" label="Frequently Asked Questions" />
        <h2 className="mt-4 text-[clamp(1.8rem,3vw,2.5rem)] font-serif font-bold text-slate-900" style={display}>
          Airport Concierge FAQs.
        </h2>
        <div className="mt-8 space-y-4">
          {a.faqs.map(([q, ans], i) => (
            <FAQ key={`faq-${q}-${i}`} q={q} a={ans} />
          ))}
        </div>
      </section>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="block w-full border-b border-slate-200 py-5 text-left transition"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6">
        <h4 className="min-w-0 text-lg md:text-xl font-serif text-slate-900" style={display}>
          {q}
        </h4>
        <span
          className="shrink-0 text-xl font-bold transition-transform text-[#7c3aed]"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </div>
      {open && (
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 font-sans">
          {a}
        </p>
      )}
    </button>
  );
}
