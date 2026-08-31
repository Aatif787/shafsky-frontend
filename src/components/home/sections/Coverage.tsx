import React from "react";
import { AirportShowcase } from "@/components/airports/AirportShowcase";
import { C, display, mono } from "../theme";
import { SectionLabel } from "./SectionLabel";

export function Coverage() {
  return (
    <section
      id="coverage"
      className="relative overflow-hidden py-16 sm:py-24 md:py-32 bg-[#fbf9f5] border-b border-[#e8dfc8]"
    >
      <div className="mx-auto max-w-[1480px]">
        <div className="px-4 sm:px-8 md:px-14 grid gap-8 sm:gap-12 md:grid-cols-12 items-start">
          <div className="md:col-span-6">
            <div
              className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em] text-[#a88b4a] font-bold"
              style={mono}
            >
              <span className="h-px w-8 bg-[#c5a869]/50" />
              <span>PAN-INDIA & GLOBAL NETWORK</span>
            </div>
            <h2 className="mt-4 sm:mt-6 text-[clamp(2.2rem,4.5vw,4rem)] leading-[1.05] text-slate-950 font-normal" style={display}>
              Comprehensive Coverage Across{" "}
              <span
                className="italic font-normal"
                style={{
                  background: "linear-gradient(135deg, #a88b4a 0%, #c5a869 50%, #8c733b 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Key Hubs.
              </span>
            </h2>
            <p className="mt-4 sm:mt-6 text-xs sm:text-sm md:text-[15px] leading-relaxed max-w-xl text-slate-600 font-normal">
              Active airside operations across <strong className="font-semibold text-slate-900">20+ Indian airports</strong> —
              from Delhi, Mumbai, and Bengaluru to Goa, Hyderabad, Kochi, Jaipur, and Amritsar.
              Wherever you fly in this network, Suswagatam is already on station.
            </p>
          </div>
          <div className="md:col-span-6 grid grid-cols-2 gap-4 sm:gap-6 md:mt-16">
            {[
              ["20+", "Indian Hubs"],
              ["24/7", "Live Dispatch"],
              ["< 12m", "Avg. Response"],
              ["Domestic + Intl", "Full Clearance"],
            ].map(([v, l]) => (
              <div key={l} className="border-l-2 pl-4 border-[#c5a869]">
                <div className="text-[28px] sm:text-[32px] leading-none text-slate-950 font-normal font-serif" style={display}>
                  {v}
                </div>
                <div
                  className="mt-1.5 text-[9.5px] uppercase tracking-[0.25em] text-slate-500 font-mono"
                  style={mono}
                >
                  {l}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Airport Showcase scrolling row */}
        <div className="mt-14 sm:mt-16 relative w-full overflow-hidden">
          <AirportShowcase />
        </div>
      </div>
    </section>
  );
}
