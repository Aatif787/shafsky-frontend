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
import { getAirportServices, type Airport } from "@/data/airports";
import { NoServicesState } from "@/components/ui/LuxuryFallbacks";
import { MeetGreetPackageComparison } from "@/components/airports/MeetGreetPackageComparison";

// Service image mapping
import lounge from "@/assets/lounge.png";
import vipTransport1 from "@/assets/vip-transport-1.png";
import hotelImg from "@/assets/hotel.png";
import fastTrackImg from "@/assets/fast-track.png";
import cargoAssistImg from "@/assets/cargo-assist.png";
import medicalAssistImg from "@/assets/medical-assist.png";
import meetGreetImg from "@/assets/meet-greet.png";
import vipConciergeImg from "@/assets/vip-concierge.png";

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
  // STRICT FILTER: Display ONLY services available for this airport
  const availableServices = getAirportServices(a.code);

  return (
    <section id="services-available" className="my-16 relative">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#c5a059]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Staged Airside Offerings</span>
          </div>
          <h2
            className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-white"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Available Concierge Services at <span className="italic text-[#c5a059]">{a.city}</span>.
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-white/60 font-sans max-w-2xl">
            Showing only verified available services staged for {a.airport.name || a.city}. Zero unavailable listings.
          </p>
        </div>

        <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-mono text-[#c5a059]">
          {availableServices.length} Staged Services Available
        </div>
      </div>

      {/* SERVICES GRID */}
      {availableServices.length === 0 ? (
        <NoServicesState locationName={a.city} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableServices.map((svc, idx) => {
            const isMeetGreet = svc.id === "meet_greet" || svc.id.includes("meet_greet");
            const isLounge = svc.id === "lounge";
            const svcImg = SERVICE_IMAGES[svc.id] || SERVICE_IMAGES["concierge"];

            return (
              <motion.div
                key={svc.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className={`group relative flex flex-col justify-between rounded-3xl overflow-hidden border transition-all duration-300 shadow-xl ${isMeetGreet
                    ? "bg-gradient-to-b from-[#121a29] to-[#0a0e17] border-[#c5a059]/60 shadow-[#c5a059]/10"
                    : isLounge
                      ? "bg-gradient-to-b from-[#0f1d24] to-[#091218] border-[#5fb5ad]/60 shadow-[#5fb5ad]/10"
                      : "bg-[#0e131d]/90 border-white/10 hover:border-[#c5a059]/40"
                  }`}
              >
                {/* Top Image Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-black/40">
                  <img
                    src={svcImg}
                    alt={svc.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e131d] via-black/30 to-transparent" />

                  {/* PREMIUM BADGE FOR MEET & GREET */}
                  {isMeetGreet && (
                    <div className="absolute top-4 left-4 z-10">
                      <span
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#c5a059] to-[#d4c09d] text-[#081119] text-[9px] font-mono uppercase tracking-[0.25em] font-extrabold shadow-lg"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        <Crown className="w-3 h-3 fill-[#081119]" />
                        ✦ PREMIUM MEET & GREET
                      </span>
                    </div>
                  )}

                  {/* PREMIUM BADGE FOR AIRPORT LOUNGE */}
                  {isLounge && (
                    <div className="absolute top-4 left-4 z-10">
                      <span
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#5fb5ad] text-[#081119] text-[9px] font-mono uppercase tracking-[0.25em] font-extrabold shadow-lg"
                        style={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        <Hotel className="w-3 h-3" />
                        ✦ VIP LOUNGE SANCTUARY
                      </span>
                    </div>
                  )}

                  {/* Pricing / Type Tag */}
                  <div className="absolute bottom-4 right-4 z-10">
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[9px] font-mono uppercase tracking-widest text-[#c5a059]">
                      {svc.type === "package" ? "Multi-Tier Package" : "Direct Reservation"}
                    </span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      className="text-2xl font-serif text-white font-medium group-hover:text-[#c5a059] transition-colors"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {svc.title}
                    </h3>

                    <p className="mt-2 text-xs text-white/70 leading-relaxed font-sans">
                      {svc.desc}
                    </p>

                    {/* Available Packages Teaser */}
                    {svc.packages && svc.packages.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-white/10">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#c5a059] mb-1.5">
                          Included Package Tiers:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {svc.packages.map((pkg) => (
                            <span
                              key={pkg.id}
                              className="text-[9px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white/80"
                            >
                              {pkg.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer CTA Button */}
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <Link
                      to="/book"
                      search={{ origin: a.code, service_id: svc.id, booking_mode: "individual" } as any}
                      className="group/btn flex w-full items-center justify-between px-5 py-3 rounded-2xl bg-white/[0.04] border border-white/15 hover:border-[#c5a059] hover:bg-[#c5a059]/10 text-white font-mono text-xs uppercase tracking-[0.2em] transition-all duration-300"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      <span className="group-hover/btn:text-[#c5a059] transition-colors">Book Service</span>
                      <ArrowRight className="w-4 h-4 text-[#c5a059] transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* MEET & GREET FLAGSHIP TIER COMPARISON */}
      {availableServices.some((s) => s.id === "meet_greet" || s.id.includes("meet_greet")) && (
        <div className="mt-16 pt-12 border-t border-white/10">
          <MeetGreetPackageComparison airportCode={a.code} />
        </div>
      )}
    </section>
  );
}
