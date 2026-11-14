import { motion } from "framer-motion";
import {
  ConciergeBell,
  Plane,
  MapPin,
  Globe,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { type Airport } from "@/data/airports";
import { LIGHT, display, SectionLabel } from "./Atoms";
import { MeetGreetPackageComparison } from "./MeetGreetPackageComparison";
import { ServicesGallery } from "./ServicesGallery";
import { AirportMediaGallery } from "./AirportMediaGallery";

export function DestinationBody({ a, bookingSearch }: { a: Airport; bookingSearch?: Record<string, unknown> }) {
  const quickInfoChips = [
    a.code ? { label: "Airport Code", value: a.code, Icon: Plane } : null,
    a.city ? { label: "City", value: a.city, Icon: MapPin } : null,
    a.country ? { label: "Country", value: a.country, Icon: Globe } : null,
    { label: "Concierge Status", value: "Live Authoritative", Icon: ConciergeBell },
    { label: "24/7 Support", value: "24/7 Operations", Icon: Clock },
    { label: "VIP Assist", value: "Airside Escort", Icon: ShieldCheck },
  ].filter(Boolean) as Array<{ label: string; value: string; Icon: any }>;

  return (
    <div style={{ backgroundColor: LIGHT.bg, color: LIGHT.ink }}>
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

      {/* 2. Available Services & Dynamic Meet & Greet Packages */}
      <section id="available-services" className="px-4 py-16 sm:px-8 md:px-16 md:py-20 bg-white border-y border-slate-200">
        <div className="text-center max-w-4xl mx-auto flex flex-col items-center">
          <SectionLabel index="01" label="Airside Concierge Catalog" />
          <h2 className="mt-4 text-[clamp(2rem,3.5vw,3rem)] font-bold text-slate-900 leading-[1.1]" style={display}>
            Available services at <span className="italic">{a.city} ({a.code})</span>.
          </h2>
        </div>

        {/* Dynamic Master Airport Package Comparison */}
        <div className="mt-10">
          <MeetGreetPackageComparison
            key={`${a.code}-${bookingSearch?.direction || "def"}`}
            airportCode={a.code}
            bookingSearch={bookingSearch}
          />
        </div>
      </section>


      {/* Multi-Image Gallery (only renders for hubs with >1 photo) */}
      <AirportMediaGallery
        airportCode={a.code}
        airportCity={a.city}
        airportName={a.airport?.name}
      />

      {/* 3. Departure & Arrival Services Visual Gallery */}
      <ServicesGallery airportCity={a.city} airportCode={a.code} />
    </div>
  );
}
