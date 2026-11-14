import { type Airport } from "@/data/airports";
import { LIGHT, display, SectionLabel } from "./Atoms";
import { MeetGreetPackageComparison } from "./MeetGreetPackageComparison";
import { ServicesGallery } from "./ServicesGallery";
import { AirportMediaGallery } from "./AirportMediaGallery";

export function DestinationBody({ a, bookingSearch }: { a: Airport; bookingSearch?: Record<string, unknown> }) {
  return (
    <div style={{ backgroundColor: LIGHT.bg, color: LIGHT.ink }}>
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
