import React from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Crown,
  Hotel,
  Ticket,
  Car,
  Package,
  HeartPulse,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Check,
} from "lucide-react";
import { type Airport } from "@/data/airports";
import { NoServicesState } from "@/components/ui/LuxuryFallbacks";
import { MeetGreetPackageComparison } from "@/components/airports/MeetGreetPackageComparison";

import { ASSETS } from "@/lib/assets";

const lounge = ASSETS.lounge;
const vipTransport1 = ASSETS.vipTransport;
const hotelImg = ASSETS.hotel;
const fastTrackImg = ASSETS.fastTrack;
const cargoAssistImg = ASSETS.cargoAssist;
const medicalAssistImg = ASSETS.medicalAssist;
const meetGreetImg = ASSETS.meetGreet;
const vipConciergeImg = ASSETS.concierge;

const SERVICE_IMAGES: Record<string, string> = {
  meet_greet: meetGreetImg,
  arr_meet_greet: meetGreetImg,
  dep_meet_greet: meetGreetImg,
  lounge: lounge,
  transfer: vipTransport1,
  fast_track: fastTrackImg,
  hotel: hotelImg,
  visa: fastTrackImg,
  baggage: cargoAssistImg,
  porter: cargoAssistImg,
  wheelchair: medicalAssistImg,
  concierge: vipConciergeImg,
};

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
