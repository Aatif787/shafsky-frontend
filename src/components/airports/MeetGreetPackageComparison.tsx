import React from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Crown, Check, ArrowRight } from "lucide-react";
import { getAirportRegistryEntry } from "@/data/airportRegistry";

interface MeetGreetPackageComparisonProps {
  airportCode: string;
  selectedPackageId?: string;
  onSelectPackage?: (pkg: any) => void;
  showBookButton?: boolean;
}

export function MeetGreetPackageComparison({
  airportCode,
  selectedPackageId,
  onSelectPackage,
  showBookButton = true,
}: MeetGreetPackageComparisonProps) {
  const airportEntry = getAirportRegistryEntry(airportCode);
  const cityName = airportEntry?.city || airportCode;

  const registryPackages = airportEntry?.meetGreetPackages || [
    {
      id: "silver",
      title: "Silver Concierge",
      tagline: "Standard Aerobridge Escort & Buggy Transit",
      price: "₹5,500 / pax",
      duration: "Up to 2 Hours",
      features: ["Aerobridge exit welcome with placard", "Dedicated porter for up to 3 bags", "Priority terminal queue assistance"],
    },
    {
      id: "gold",
      title: "Gold VIP Sanctuary",
      tagline: "Fast Track Immigration & Lounge Access",
      price: "₹8,500 / pax",
      popular: true,
      duration: "Up to 4 Hours",
      features: ["Personal Guest Relations Officer", "Fast-track security & immigration bypass", "3-Hour VIP Lounge Sanctuary pass", "Unlimited baggage porter support"],
    },
    {
      id: "elite",
      title: "Elite Presidential",
      tagline: "Airside Maybach Tarmac & Diplomatic Gate",
      price: "₹18,000 / pax",
      duration: "Full Transit",
      features: ["Direct tarmac limousine transfer", "Private VIP lounge suite reservation", "Diplomatic customs clearance desk", "Curbside executive chauffeur handoff"],
    },
  ];

  return (
    <div className="space-y-8 my-10">
      {/* SECTION TITLE & METADATA */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-[#7c3aed] text-[10px] font-mono font-bold uppercase tracking-widest">
          <Crown className="w-3.5 h-3.5" />
          <span>Flagship Meet & Greet Tier Comparison</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-serif text-slate-900 font-bold">
          Dynamic Concierge Packages for <span className="italic text-[#7c3aed]">{cityName}</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 font-sans">
          Compare verified packages staged specifically for {airportEntry?.name || cityName}. {registryPackages.length} tailored tiers available.
        </p>
      </div>

      {/* DYNAMIC COMPARISON CARDS GRID */}
      <div className={`grid grid-cols-1 ${registryPackages.length === 2 ? "md:grid-cols-2 max-w-4xl mx-auto" : "md:grid-cols-3"} gap-6 lg:gap-8`}>
        {registryPackages.map((pkg: any, index: number) => {
          const isRec = !!pkg.isRecommended;
          const isSelected = selectedPackageId === pkg.id;

          return (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -6 }}
              className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all duration-300 overflow-hidden ${
                isRec
                  ? "bg-white border-2 border-[#7c3aed] shadow-lg shadow-[#7c3aed]/10 scale-[1.02] z-10"
                  : isSelected
                  ? "bg-white border-2 border-[#7c3aed]"
                  : "bg-white border border-slate-200 shadow-sm hover:border-slate-300"
              }`}
            >
              {/* RECOMMENDED BADGE (MOST POPULAR) */}
              {isRec && (
                <div className="absolute top-0 right-0 left-0 py-1 bg-[#7c3aed] text-white text-center text-[10px] font-mono uppercase tracking-widest font-bold flex items-center justify-center gap-1.5 shadow-sm">
                  <Crown className="w-3.5 h-3.5 fill-white" />
                  <span>✦ MOST POPULAR CHOICE ✦</span>
                </div>
              )}

              <div className={isRec ? "pt-4" : ""}>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xl font-serif text-slate-900 font-bold">{pkg.title}</h4>
                  <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-mono text-[10px] font-bold">
                    {pkg.duration}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-sans mt-2 leading-relaxed">
                  {pkg.tagline || pkg.desc}
                </p>

                {/* PRICE HIGHLIGHT */}
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline gap-2">
                  <span className="text-2xl font-serif font-bold text-[#7c3aed]">
                    {pkg.price}
                  </span>
                </div>

                {/* INCLUDED SERVICES CHECKLIST */}
                <div className="mt-6 space-y-2.5">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                    Included Airside Protocols
                  </div>
                  {(pkg.features || pkg.includedServices || []).map((feat: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                      <Check className="w-4 h-4 text-[#84cc16] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* BOOK PACKAGE ACTION */}
              {showBookButton && (
                <div className="mt-8 pt-4 border-t border-slate-100">
                  <Link
                    to="/book"
                    search={{ origin: airportCode, service_id: "meet_greet", booking_mode: "package", package_id: pkg.id } as any}
                    onClick={() => onSelectPackage && onSelectPackage(pkg)}
                    className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-xs font-mono font-bold uppercase tracking-widest transition-all ${
                      isRec
                        ? "bg-[#84cc16] text-[#0f172a] hover:bg-[#65a30d] shadow-sm"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    <span>Book Package</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
