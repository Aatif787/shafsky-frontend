import {
  Sparkles
} from "lucide-react";
import { type Airport } from "@/data/airports";
import { MeetGreetPackageComparison } from "@/components/airports/MeetGreetPackageComparison";

interface AirportServicesAvailableProps {
  a: Airport;
}

export function AirportServicesAvailable({ a }: AirportServicesAvailableProps) {
  return (
    <section id="services-available" className="my-16 relative">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#c5a059]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Airport VIP Packages</span>
          </div>
          <h2
            className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-white"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Available Packages at <span className="italic text-[#c5a059]">{a.city} ({a.code})</span>.
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-white/60 font-sans max-w-2xl">
            All-inclusive airside escort, fast-track customs clearance, VIP lounge access, and tarmac transfers.
          </p>
        </div>
      </div>

      {/* MASTER PACKAGES COMPARISON GRID */}
      <MeetGreetPackageComparison airportCode={a.code} />
    </section>
  );
}
