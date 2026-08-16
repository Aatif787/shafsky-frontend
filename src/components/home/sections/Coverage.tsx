import React from "react";
import { AirportShowcase } from "@/components/airports/AirportShowcase";
import { C, display, mono } from "../theme";
import { SectionLabel } from "./SectionLabel";

export function Coverage() {
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
              Live operations at <strong style={{ color: C.ink }}>20 Indian airports</strong> —
              from Delhi, Mumbai and Bengaluru to Goa, Kochi, Jaipur and Trivandrum.
              Wherever you fly in this network, Suswagatam is already there.
            </p>
          </div>
          <div className="md:col-span-6 grid grid-cols-2 gap-6 md:mt-20">
            {[
              ["20", "Indian Airports"],
              ["24/7", "Live Dispatch"],
              ["< 12m", "Avg. Response"],
              ["Domestic + Intl", "At every hub"],
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

