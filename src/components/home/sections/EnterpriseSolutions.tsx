import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Sparkles, CheckCircle2, ChevronRight, PhoneCall } from "lucide-react";
import { display, mono } from "../theme";
import { HOMEPAGE_PHOTOS } from "@/lib/homepage-photos";
import planeImg from "@/assets/others/plane.png";
import meetGreetImg from "@/assets/others/meetgreet.jpeg";

interface ServiceCategory {
  id: string;
  title: string;
  photo: string;
  alt: string;
  link: string;
  description: string;
  subServices: { label: string; link?: string }[];
}

const OFFICIAL_SERVICES: ServiceCategory[] = [
  {
    id: "meet-greet-lounge",
    title: "Meet & Greet and Lounge Service",
    photo: meetGreetImg,
    alt: "Shafsky Meet & Greet and Lounge Service Departure and Arrival Airport Team",
    link: "/solutions/concierge",
    description: "End-to-end airside hospitality with dedicated aerobridge escorts, security fast-track, and premier lounge access.",
    subServices: [
      { label: "Domestic Departure", link: "/book?service=meet-greet" },
      { label: "Domestic Arrival", link: "/book?service=meet-greet" },
      { label: "International Departure", link: "/book?service=meet-greet" },
      { label: "International Arrival", link: "/book?service=meet-greet" },
      { label: "Transit Service", link: "/book?service=meet-greet" },
    ],
  },
  {
    id: "air-charter",
    title: "Air Charter",
    photo: HOMEPAGE_PHOTOS.privateCharter.src,
    alt: "Shafsky Private Jet and Helicopter Air Charter",
    link: "/charter",
    description: "On-demand executive private jets, twin helicopters, and specialized mission aircraft on your schedule.",
    subServices: [
      { label: "Domestic and International Charter", link: "/book?service=charter" },
      { label: "Corporate Charter", link: "/book?service=charter" },
      { label: "Private Charter", link: "/book?service=charter" },
      { label: "Helicopter Charter", link: "/book?service=charter" },
      { label: "Tourism Charter", link: "/book?service=charter" },
      { label: "Pilgrim Charter", link: "/book?service=charter" },
      { label: "Celebrities Charter", link: "/book?service=charter" },
      { label: "Adventure Sport Charter", link: "/book?service=charter" },
      { label: "Wedding Charter", link: "/book?service=charter" },
      { label: "Air Ambulance charter", link: "/book?service=charter" },
    ],
  },
  {
    id: "transport-service",
    title: "Transport Service",
    photo: HOMEPAGE_PHOTOS.luxuryFleet.src,
    alt: "Chauffeured Airport and Tarmac Luxury Transport Vehicles",
    link: "/solutions/travel",
    description: "Immaculate chauffeured tarmac sedans, Mercedes Maybach, and luxury passenger coaches.",
    subServices: [
      { label: "Luxury Vehicles", link: "/book?service=transport" },
      { label: "MUV/ Large Vehicles", link: "/book?service=transport" },
      { label: "Economy / Standard Vehicles", link: "/book?service=transport" },
    ],
  },
  {
    id: "luxury-hotels",
    title: "Luxury Hotels",
    photo: HOMEPAGE_PHOTOS.luxuryHotel.src,
    alt: "Shafsky Luxury 7 Star 5 Star Hotel Suites and Transfers",
    link: "/solutions/travel",
    description: "Preferred partner rates at the world's most distinguished palace hotels, suites, and airport transit properties.",
    subServices: [
      { label: "7 Star Luxury Hotels", link: "/book?service=hotel" },
      { label: "5 Star Luxury Hotels", link: "/book?service=hotel" },
      { label: "3 Star Premium Hotels", link: "/book?service=hotel" },
    ],
  },
  {
    id: "special-services",
    title: "Special Services",
    photo: HOMEPAGE_PHOTOS.destinationCelebration.src,
    alt: "Specialized Tours, Armed PSO, Medical and Destination Services",
    link: "/solutions/concierge",
    description: "Specialized passenger care, armed security details, bespoke destination planning, and repatriation logistics.",
    subServices: [
      { label: "Tours & Travel", link: "/book?service=special" },
      { label: "Passport & VISA", link: "/book?service=special" },
      { label: "PSO (Personal Security Officer)", link: "/book?service=special" },
      { label: "Sight Seeing & Guide", link: "/book?service=special" },
      { label: "Infant Care", link: "/book?service=special" },
      { label: "Human Remains by Cargo", link: "/book?service=special" },
    ],
  },
];

export function EnterpriseSolutions() {
  const [selectedService, setSelectedService] = useState<ServiceCategory | null>(null);
  const navigate = useNavigate();

  return (
    <section
      id="services"
      className="relative px-4 pt-6 pb-16 sm:px-8 sm:pt-8 sm:pb-24 md:px-10 lg:px-12 md:pt-10 md:pb-28 bg-white text-slate-900 overflow-hidden border-b border-slate-200"
    >
      <div className="mx-auto max-w-[1560px]">
        {/* Section Header: Our Services */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-8">
          <div
            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em] text-lime-700 font-bold"
            style={mono}
          >
            <span className="h-px w-8 bg-lime-500" />
            <span>EXCELLENCE IN AVIATION</span>
            <span className="h-px w-8 bg-lime-500" />
          </div>
          <h2
            className="mt-2 text-[clamp(2.2rem,4.5vw,4rem)] leading-[1.06] text-slate-950 tracking-tight font-bold"
            style={display}
          >
            Our <span className="text-lime-600 font-bold">Services.</span>
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-normal leading-relaxed">
            The authoritative suite of airport hospitality, private charter aviation, luxury transport, 5-star accommodations, and specialized travel solutions.
          </p>
        </div>

        {/* Top Floating Airplane Visual with Vapor Contrails */}
        <div className="relative flex flex-col items-center justify-center mb-10 sm:mb-14 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center"
          >
            {/* Contrail Vapor Trails Adjusted for Ascending Angle */}
            <svg
              className="absolute -left-36 sm:-left-56 top-1/2 -translate-y-[20%] w-72 sm:w-[420px] h-32 pointer-events-none opacity-50 -rotate-[10deg]"
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
                  <stop offset="100%" stopColor="#84cc16" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="contrail-grad-2" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0" />
                  <stop offset="60%" stopColor="#94a3b8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#84cc16" stopOpacity="0.8" />
                </linearGradient>
              </defs>
            </svg>

            {/* Luxury Private Jet Tilted Upward */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative z-10 w-56 sm:w-72 md:w-80 lg:w-96 drop-shadow-[0_20px_35px_rgba(15,23,42,0.18)] -rotate-[10deg]"
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

        {/* Clean 5 Official Service Circular Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-8 items-start justify-items-center">
          {OFFICIAL_SERVICES.map((srv, idx) => (
            <motion.div
              key={srv.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="flex flex-col items-center text-center w-full group cursor-pointer"
              onClick={() => setSelectedService(srv)}
            >
              {/* Circular Photo */}
              <div
                className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 lg:w-52 lg:h-52 rounded-full overflow-hidden border-4 border-slate-100 shadow-[0_10px_25px_-8px_rgba(0,0,0,0.15)] group-hover:border-lime-500 group-hover:shadow-[0_15px_30px_-5px_rgba(132,204,22,0.35)] group-hover:scale-105 transition-all duration-500 bg-slate-100 mb-4"
              >
                <img
                  src={srv.photo}
                  alt={srv.alt}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.08)] pointer-events-none group-hover:shadow-[inset_0_0_15px_rgba(132,204,22,0.2)] transition-shadow duration-300" />
              </div>

              {/* Service Pillar Heading */}
              <h3
                className="text-sm sm:text-base md:text-lg font-bold text-slate-900 tracking-tight group-hover:text-lime-700 transition-colors duration-300 max-w-[200px]"
                style={display}
              >
                {srv.title}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Interactive Sub-Services Modal Drawer */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
              onClick={() => setSelectedService(null)}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-2xl bg-white rounded-3xl border-2 border-lime-500/40 shadow-2xl p-6 sm:p-8 md:p-10 overflow-hidden max-h-[90vh] flex flex-col justify-between"
            >
              <div>
                {/* Header with Close Button */}
                <div className="flex items-start justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-lime-500/30 shrink-0 shadow-sm">
                      <img
                        src={selectedService.photo}
                        alt={selectedService.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 text-[10px] font-bold font-mono uppercase tracking-widest text-lime-700" style={mono}>
                        <Sparkles size={13} className="text-lime-600" />
                        <span>SHAFSKY OFFICIAL PROTOCOLS</span>
                      </div>
                      <h3 className="mt-1 text-xl sm:text-2xl font-bold text-slate-950" style={display}>
                        {selectedService.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                        {selectedService.description}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedService(null)}
                    className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 transition cursor-pointer shrink-0"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Sub-Services Interactive Grid */}
                <div className="mt-6">
                  <div className="text-[11px] uppercase tracking-wider font-mono font-bold text-slate-500 mb-3" style={mono}>
                    Select a Specific Service Option:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[40vh] overflow-y-auto pr-1">
                    {selectedService.subServices.map((sub, sidx) => (
                      <Link
                        key={sidx}
                        to={sub.link || selectedService.link}
                        onClick={() => setSelectedService(null)}
                        className="group flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-lime-500 hover:bg-lime-50/40 transition-all duration-200 shadow-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={16} className="text-lime-600 group-hover:scale-110 transition-transform shrink-0" />
                          <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-lime-800 transition-colors">
                            {sub.label}
                          </span>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-lime-700 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action CTAs */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <a
                  href="tel:+919599087959"
                  className="inline-flex items-center gap-2 text-xs font-mono text-slate-600 hover:text-lime-700 transition"
                  style={mono}
                >
                  <PhoneCall size={14} className="text-lime-600" />
                  <span>24/7 Operations Desk Support</span>
                </a>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <Link
                    to={selectedService.link}
                    onClick={() => setSelectedService(null)}
                    className="group/btn relative overflow-hidden flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-xl bg-[#84cc16] px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md shadow-lime-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-lime-500/40 hover:-translate-y-0.5 cursor-pointer"
                    style={mono}
                  >
                    <div className="absolute inset-0 w-[200%] -translate-x-[150%] bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover/btn:translate-x-full transition-transform duration-700 ease-in-out" />
                    <div className="absolute inset-0 bg-[#a3e635] translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
                    <span className="relative z-10">Book Now</span>
                    <ArrowRight size={14} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
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
