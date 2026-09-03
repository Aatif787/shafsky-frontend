import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles, CheckCircle2, ChevronRight, PhoneCall, Check } from "lucide-react";
import { display, mono } from "../theme";
import { HOMEPAGE_PHOTOS } from "@/lib/homepage-photos";
import planeImg from "@/assets/others/plane.png";
import meetGreetImg from "@/assets/others/meetgreet.jpeg";
import servicesImg from "@/assets/others/services.png";

interface SubServiceOption {
  label: string;
  subParam: string;
  tagline?: string;
}

interface ServiceCategory {
  id: string;
  serviceParam: string;
  title: string;
  photo: string;
  alt: string;
  badge: string;
  description: string;
  subServices: SubServiceOption[];
}

const OFFICIAL_SERVICES: ServiceCategory[] = [
  {
    id: "meet-greet-lounge",
    serviceParam: "meet-greet",
    title: "Meet & Greet and Lounge Service",
    photo: meetGreetImg,
    alt: "Shafsky Meet & Greet and Lounge Service Departure and Arrival Airport Team",
    badge: "Airside Concierge",
    description: "End-to-end airside hospitality with dedicated personal escorts, security fast-track, and premier VIP lounge access.",
    subServices: [
      { label: "Domestic Departure", subParam: "Domestic Departure", tagline: "Curbside greeting, baggage porter & lounge access" },
      { label: "Domestic Arrival", subParam: "Domestic Arrival", tagline: "Aerobridge greeting & baggage claim assistance" },
      { label: "International Departure", subParam: "International Departure", tagline: "Priority immigration escort & duty free assistance" },
      { label: "International Arrival", subParam: "International Arrival", tagline: "Arrival gate reception & fast-track clearance" },
      { label: "Transit Service", subParam: "Transit Service", tagline: "Seamless terminal transfer & transit lounge comfort" },
    ],
  },
  {
    id: "air-charter",
    serviceParam: "charter",
    title: "Air Charter",
    photo: HOMEPAGE_PHOTOS.privateCharter.src,
    alt: "Shafsky Private Jet and Helicopter Air Charter",
    badge: "VIP Aviation",
    description: "On-demand executive private jets, twin helicopters, and specialized mission aircraft on your schedule.",
    subServices: [
      { label: "Domestic and International Charter", subParam: "Domestic and International Charter", tagline: "Long-range private jets and executive airliners" },
      { label: "Corporate Charter", subParam: "Corporate Charter", tagline: "Executive travel for leadership teams and roadshows" },
      { label: "Private Charter", subParam: "Private Charter", tagline: "Exclusive point-to-point luxury jet flights" },
      { label: "Helicopter Charter", subParam: "Helicopter Charter", tagline: "Twin-turbine helicopters for rooftop and city transfers" },
      { label: "Tourism Charter", subParam: "Tourism Charter", tagline: "Scenic leisure flights & private safari air tours" },
      { label: "Pilgrim Charter", subParam: "Pilgrim Charter", tagline: "Dedicated charters to holy shrines & pilgrimage circuits" },
      { label: "Celebrities Charter", subParam: "Celebrities Charter", tagline: "Discreet charters with confidential VIP manifests" },
      { label: "Adventure Sport Charter", subParam: "Adventure Sport Charter", tagline: "Air transport for sports teams & mountain destinations" },
      { label: "Wedding Charter", subParam: "Wedding Charter", tagline: "Group aircraft charters for destination weddings" },
      { label: "Air Ambulance Charter", subParam: "Air Ambulance Charter", tagline: "ICU-equipped aircraft with aero-medical doctor" },
    ],
  },
  {
    id: "transport-service",
    serviceParam: "transport",
    title: "Transport Service",
    photo: HOMEPAGE_PHOTOS.luxuryFleet.src,
    alt: "Chauffeured Airport and Tarmac Luxury Transport Vehicles",
    badge: "Ground Fleet",
    description: "Immaculate chauffeured tarmac sedans, Mercedes-Benz Maybach, and luxury passenger coaches.",
    subServices: [
      { label: "Luxury Vehicles", subParam: "Luxury Vehicles", tagline: "Chauffeured Mercedes-Maybach, S-Class & BMW 7-Series" },
      { label: "MUV / Large Vehicles", subParam: "MUV / Large Vehicles", tagline: "Spacious Toyota Vellfire & Mercedes V-Class vans" },
      { label: "Economy / Standard", subParam: "Economy / Standard", tagline: "Executive airport transfers & reliable city sedans" },
    ],
  },
  {
    id: "luxury-hotels",
    serviceParam: "hotel",
    title: "Luxury Hotels",
    photo: HOMEPAGE_PHOTOS.luxuryHotel.src,
    alt: "Shafsky Luxury 7 Star 5 Star Hotel Suites and Transfers",
    badge: "VIP Accommodations",
    description: "Preferred partner rates at distinguished palace resorts, 5-star executive suites, and airport transit hotels.",
    subServices: [
      { label: "7 Star Hotels", subParam: "7 Star Hotels", tagline: "Royal palace estates, heritage suites & private villas" },
      { label: "5 Star Hotels", subParam: "5 Star Hotels", tagline: "Premier luxury city hotels & airport transit properties" },
      { label: "3 Star Hotels", subParam: "3 Star Hotels", tagline: "Comfortable executive transit stays & airport rooms" },
    ],
  },
  {
    id: "special-services",
    serviceParam: "special",
    title: "Special Services",
    photo: HOMEPAGE_PHOTOS.destinationCelebration.src,
    alt: "Specialized Tours, Armed PSO, Medical and Destination Services",
    badge: "Specialized Missions",
    description: "Specialized passenger care, armed close protection officers, bespoke destination planning, and cargo repatriation.",
    subServices: [
      { label: "Tours & Travel", subParam: "Tours & Travel", tagline: "Curated luxury vacations & bespoke holiday circuits" },
      { label: "Passport & VISA", subParam: "Passport & VISA", tagline: "Expedited visa facilitation & embassy clearance" },
      { label: "PSO (Personal Security Officer)", subParam: "PSO (Personal Security Officer)", tagline: "Armed & unarmed close protection security details" },
      { label: "Sightseeing & Guide", subParam: "Sightseeing & Guide", tagline: "Private licensed heritage guides & multi-lingual experts" },
      { label: "Infant Care", subParam: "Infant Care", tagline: "Dedicated mother & child airport transit care" },
      { label: "Human Remains by Cargo", subParam: "Human Remains by Cargo", tagline: "Dignified, discreet repatriation logistics & permits" },
    ],
  },
];

export function EnterpriseSolutions() {
  const [selectedService, setSelectedService] = useState<ServiceCategory | null>(null);
  const navigate = useNavigate();

  return (
    <section
      id="services"
      className="relative px-4 pt-8 pb-16 sm:px-8 sm:pt-12 sm:pb-24 md:px-10 lg:px-12 md:pt-14 md:pb-28 bg-white text-slate-900 overflow-hidden border-b border-slate-200"
    >
      <div className="mx-auto max-w-[1560px]">
        {/* Section Header: Our Services */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div
            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em] text-[#b38a2e] font-bold"
            style={mono}
          >
            <span className="h-px w-8 bg-[#d4af37]" />
            <span>EXCELLENCE IN AVIATION</span>
            <span className="h-px w-8 bg-[#d4af37]" />
          </div>
          <h2
            className="mt-2 text-[clamp(2.2rem,4.5vw,4rem)] leading-[1.06] text-slate-950 tracking-tight font-bold"
            style={display}
          >
            Our <span className="text-[#b38a2e] font-bold">Services.</span>
          </h2>
        </div>

        {/* Top Centered Hostess / Services Visual with Animation & Hover Effects */}
        <div className="relative flex flex-col items-center justify-center mb-8 sm:mb-12 pt-2">
          {/* Ambient Golden Glow Aura */}
          <div className="absolute -inset-4 w-72 h-72 sm:w-80 sm:h-80 bg-gradient-to-b from-amber-200/20 via-lime-200/10 to-transparent rounded-full blur-3xl pointer-events-none opacity-60 group-hover:opacity-90 transition-opacity duration-700" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            animate={{ y: [0, -8, 0] }}
            transition={{
              y: { duration: 4.5, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
            }}
            whileHover={{ scale: 1.04, y: -4 }}
            whileTap={{ scale: 0.98 }}
            className="relative flex flex-col items-center justify-center w-full max-w-md mx-auto cursor-pointer group select-none"
          >
            <img
              src={servicesImg}
              alt="Shafsky Dedicated Services Hostess — Namaste Welcome"
              className="w-full max-w-[200px] sm:max-w-[240px] md:max-w-[280px] h-auto object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.16)] group-hover:drop-shadow-[0_30px_55px_rgba(212,175,55,0.3)] transition-all duration-500"
              loading="eager"
            />
            {/* Subtle Welcome Badge on Hover */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-amber-300/60 shadow-sm text-[11px] font-mono font-bold text-amber-800 tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Namaste — At Your Service</span>
            </motion.div>
          </motion.div>
        </div>

        {/* ORIGINAL 5-CARD HORIZONTAL ALIGNMENT SHOWCASE */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-8 items-start justify-items-center max-w-7xl mx-auto">
          {OFFICIAL_SERVICES.map((srv, idx) => (
                <motion.div
                  key={srv.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className="flex flex-col items-center text-center w-full group cursor-pointer"
                  onClick={() => {
                    if (srv.id === "meet-greet-lounge") {
                      navigate({ to: "/solutions/concierge" });
                    } else if (srv.id === "air-charter") {
                      navigate({ to: "/solutions/aviation" });
                    } else if (srv.id === "luxury-hotels") {
                      navigate({ to: "/solutions/travel" });
                    } else if (srv.id === "transport-service") {
                      navigate({ to: "/solutions/cargo" });
                    } else if (srv.id === "special-services") {
                      navigate({ to: "/solutions/medical" });
                    } else {
                      setSelectedService(srv);
                    }
                  }}
                >
                  {/* Circular Authentic Photo */}
                  <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-slate-100 shadow-[0_10px_25px_-8px_rgba(0,0,0,0.12)] group-hover:border-lime-500 group-hover:shadow-[0_15px_30px_-5px_rgba(132,204,22,0.35)] group-hover:scale-105 transition-all duration-500 bg-white mb-4">
                    <picture className="w-full h-full block">
                      <source srcSet={srv.photo} type="image/jpeg" />
                      <img
                        src={srv.photo}
                        alt={srv.alt}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                    </picture>
                    <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.08)] pointer-events-none group-hover:shadow-[inset_0_0_15px_rgba(132,204,22,0.2)] transition-shadow duration-300" />
                  </div>

                  {/* Service Pillar Heading */}
                  <h3
                    className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight group-hover:text-lime-700 transition-colors duration-300 max-w-[210px] leading-snug"
                    style={display}
                  >
                    {srv.title}
                  </h3>
                </motion.div>
              ))}
            </div>

        {/* Bottom Floating Airplane Visual with Contrail Aesthetics */}
        <div className="relative flex flex-col items-center justify-center mt-12 sm:mt-16 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center w-full"
          >
            {/* Contrail Vapor Trails */}
            <svg
              className="absolute -left-36 sm:-left-60 md:-left-80 top-1/2 -translate-y-[20%] w-full max-w-[900px] h-44 pointer-events-none opacity-45 -rotate-[12deg]"
              viewBox="0 0 350 90"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 10 50 Q 140 45 320 40"
                stroke="url(#contrail-grad-1)"
                strokeWidth="2.5"
                strokeDasharray="8 5"
                strokeLinecap="round"
              />
              <path
                d="M 30 68 Q 160 55 330 45"
                stroke="url(#contrail-grad-2)"
                strokeWidth="1.8"
                strokeDasharray="5 5"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="contrail-grad-1" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0" />
                  <stop offset="60%" stopColor="#94a3b8" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="contrail-grad-2" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0" />
                  <stop offset="60%" stopColor="#94a3b8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>

            {/* Luxury Private Jet (Reduced Container Width, Tilted Upward) */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-full max-w-2xl md:max-w-3xl lg:max-w-4xl drop-shadow-[0_25px_50px_rgba(15,23,42,0.2)] -rotate-[12deg]"
            >
              <img
                src={planeImg}
                alt="Shafsky Aviation Executive Jet"
                className="w-full h-auto object-contain select-none pointer-events-none"
                loading="eager"
              />
            </motion.div>
          </motion.div>
        </div>

      </div>

      {/* DEDICATED SERVICE PANEL MODAL (Opens upon clicking a Primary Service Card) */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
              onClick={() => setSelectedService(null)}
            />

            {/* Dedicated Service Panel Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-2xl bg-white rounded-3xl border-2 border-[#d4af37]/50 shadow-2xl p-6 sm:p-8 md:p-10 overflow-hidden max-h-[90vh] flex flex-col justify-between"
            >
              <div>
                {/* Header with Real Service Photo & Close Button */}
                <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#d4af37]/40 shrink-0 shadow-sm bg-slate-100">
                      <img
                        src={selectedService.photo}
                        alt={selectedService.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div
                        className="inline-flex items-center gap-1.5 text-[10.5px] font-bold font-mono uppercase tracking-widest text-[#b38a2e]"
                        style={mono}
                      >
                        <Sparkles size={12} className="text-[#d4af37]" />
                        <span>{selectedService.badge}</span>
                      </div>
                      <h3 className="mt-1 text-xl sm:text-2xl font-bold text-slate-950" style={display}>
                        {selectedService.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {selectedService.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 transition cursor-pointer shrink-0"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Sub-Services Selection Grid */}
                <div className="mt-6">
                  <div
                    className="text-[11px] uppercase tracking-wider font-mono font-bold text-slate-500 mb-3"
                    style={mono}
                  >
                    Choose Option to Begin:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[42vh] overflow-y-auto pr-1">
                    {selectedService.subServices.map((sub, sidx) => (
                      <Link
                        key={sidx}
                        to="/book"
                        search={{
                          service: selectedService.serviceParam,
                          sub: sub.subParam,
                        }}
                        onClick={() => setSelectedService(null)}
                        className="group flex flex-col justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#d4af37] hover:bg-amber-50/40 transition-all duration-200 shadow-xs cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <CheckCircle2 size={15} className="text-[#b38a2e] group-hover:scale-110 transition-transform shrink-0" />
                            <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#b38a2e] transition-colors">
                              {sub.label}
                            </span>
                          </div>
                          <ChevronRight size={15} className="text-slate-400 group-hover:text-[#b38a2e] group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                        {sub.tagline && (
                          <p className="text-[11px] text-slate-500 mt-1 pl-6 line-clamp-1">
                            {sub.tagline}
                          </p>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action CTAs */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <a
                  href="tel:+919599087959"
                  className="inline-flex items-center gap-2 text-xs font-mono text-slate-600 hover:text-[#b38a2e] transition"
                  style={mono}
                >
                  <PhoneCall size={14} className="text-[#d4af37]" />
                  <span>24/7 Operations Desk Support</span>
                </a>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    to="/book"
                    search={{ service: selectedService.serviceParam }}
                    onClick={() => setSelectedService(null)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-slate-800 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all font-mono cursor-pointer"
                  >
                    <span>Open Experience</span>
                    <ArrowRight size={14} className="text-[#d4af37]" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default EnterpriseSolutions;
