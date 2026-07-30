import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Search,
  ChevronDown,
  PhoneCall,
  ArrowRight,
  HelpCircle,
  Crown,
  Hotel,
  Package,
  HeartPulse,
  Plane,
  X,
} from "lucide-react";
import { FadeInView } from "@/components/ui/interactions";

export interface FAQItem {
  id: string;
  category: "concierge" | "travel" | "cargo" | "medical" | "charter";
  categoryLabel: string;
  q: string;
  a: string;
  highlight?: string;
  relatedServiceId?: string;
  relatedServiceLink?: string;
  relatedServiceTitle?: string;
}

const FAQ_DATASET: FAQItem[] = [
  // AIRPORT CONCIERGE
  {
    id: "concierge-1",
    category: "concierge",
    categoryLabel: "Airport Concierge",
    q: "How does the Meet & Greet aerobridge greeting work upon flight arrival?",
    a: "Our uniformed Guest Relations Officer meets you directly at the aircraft exit gate or aerobridge holding a discrete, luxury name placard. They assist with hand luggage, escort you through priority diplomatic immigration lines, and manage baggage claim.",
    highlight: "Aerobridge Escort",
    relatedServiceId: "meet_greet",
    relatedServiceLink: "/solutions/concierge?sub=meet_greet",
    relatedServiceTitle: "Meet & Greet Service",
  },
  {
    id: "concierge-2",
    category: "concierge",
    categoryLabel: "Airport Concierge",
    q: "Can I access VIP airport lounges regardless of my ticket airline class?",
    a: "Yes. Shafsky Aviation grants private VIP lounge access to all registered guests regardless of your commercial ticket class or airline loyalty tier. Enjoy private rest suites, shower facilities, gourmet buffets, and high-speed Wi-Fi.",
    highlight: "Lounge Privilege",
    relatedServiceId: "lounge",
    relatedServiceLink: "/solutions/concierge?sub=lounge",
    relatedServiceTitle: "Airport Lounge Access",
  },
  {
    id: "concierge-3",
    category: "concierge",
    categoryLabel: "Airport Concierge",
    q: "How much time does Fast Track priority immigration clearance save?",
    a: "Fast Track diplomatic clearance bypasses standard arrival and departure queues, reducing typical 60–90 minute immigration wait times down to under 10–15 minutes.",
    highlight: "90 Mins Saved",
    relatedServiceId: "fast_track",
    relatedServiceLink: "/solutions/concierge?sub=fast_track",
    relatedServiceTitle: "Fast Track Clearance",
  },
  {
    id: "concierge-4",
    category: "concierge",
    categoryLabel: "Airport Concierge",
    q: "What ground transportation options are available for tarmac transfers?",
    a: "We operate a chauffeured executive fleet including Mercedes-Maybach, Mercedes S-Class, BMW 7 Series, and Range Rover vehicles for direct tarmac apron transfers and city hotel transport.",
    highlight: "Maybach Fleet",
    relatedServiceId: "transport",
    relatedServiceLink: "/solutions/concierge?sub=transport",
    relatedServiceTitle: "Ground Transportation",
  },

  // TRAVEL SERVICES
  {
    id: "travel-1",
    category: "travel",
    categoryLabel: "Travel Services",
    q: "How does the 5-Star Luxury Hotel Handoff work?",
    a: "Upon landing, our airside host coordinates directly with your destination 5-star hotel concierge. Your luggage is transferred directly from the aircraft to your hotel suite, and key cards are prepared prior to your arrival.",
    highlight: "Hotel Integration",
    relatedServiceId: "hotel",
    relatedServiceLink: "/solutions/travel?sub=hotel",
    relatedServiceTitle: "Luxury Hotel Handoff",
  },
  {
    id: "travel-2",
    category: "travel",
    categoryLabel: "Travel Services",
    q: "Do you handle diplomatic visa assistance and embassy clearance?",
    a: "Yes. Our diplomatic relations desk prepares priority visa-on-arrival, e-visa authorizations, and consular clearance for international delegations, VIPs, and corporate executives.",
    highlight: "Visa Liaison",
    relatedServiceId: "visa",
    relatedServiceLink: "/solutions/travel?sub=visa",
    relatedServiceTitle: "Consular Visa Desk",
  },

  // CARGO & LOGISTICS
  {
    id: "cargo-1",
    category: "cargo",
    categoryLabel: "Cargo & Logistics",
    q: "What measures are in place for Live Pet AVI transport?",
    a: "Our AVI escorts utilize IATA-certified climate-controlled tarmac vehicles and bonded holding suites. Dedicated veterinary professionals accompany your pet from aircraft unloading through instant customs release.",
    highlight: "IATA Certified AVI",
    relatedServiceId: "avi",
    relatedServiceLink: "/solutions/cargo?sub=avi",
    relatedServiceTitle: "Live Animal AVI Transit",
  },

  // MEDICAL ASSISTANCE
  {
    id: "medical-1",
    category: "medical",
    categoryLabel: "Medical Assistance",
    q: "How quickly can an airborne ICU medevac air ambulance be dispatched?",
    a: "Our 24/7 command center dispatches critical care air ambulance aircraft within 90–120 minutes of flight confirmation, complete with specialized flight physicians and life support equipment.",
    highlight: "Dispatch < 120m",
    relatedServiceId: "air_ambulance",
    relatedServiceLink: "/solutions/medical?sub=air_ambulance",
    relatedServiceTitle: "Air Ambulance Medevac",
  },

  // PRIVATE CHARTER
  {
    id: "charter-1",
    category: "charter",
    categoryLabel: "Private Aviation",
    q: "What aircraft categories are available for on-demand private charter?",
    a: "Our global charter fleet includes Light Jets (Phenom 300), Midsize Executive Jets (Citation XLS+), Heavy Jets (Gulfstream G650, Global 6000), and Ultra Long Range Transcontinental Aircraft.",
    highlight: "Global Fleet",
    relatedServiceId: "jet_charter",
    relatedServiceLink: "/charter",
    relatedServiceTitle: "Private Jet Charter",
  },
];

export function EnterpriseFAQ() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>("concierge-1");

  const categories = [
    { id: "all", label: "All Categories", icon: HelpCircle },
    { id: "concierge", label: "Concierge", icon: Crown },
    { id: "travel", label: "Travel", icon: Hotel },
    { id: "cargo", label: "Cargo & AVI", icon: Package },
    { id: "medical", label: "Medical Medevac", icon: HeartPulse },
    { id: "charter", label: "Private Aviation", icon: Plane },
  ];

  const filteredFaqs = FAQ_DATASET.filter((faq) => {
    if (activeCategory !== "all" && faq.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        faq.q.toLowerCase().includes(q) ||
        faq.a.toLowerCase().includes(q) ||
        faq.categoryLabel.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const toggleAccordion = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section className="my-20 relative">
      <FadeInView>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-emerald-700 font-bold">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Enterprise Knowledge Center</span>
            </div>
            <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 font-sans font-medium max-w-xl">
            Everything you need to know about Meet & Greet escorts, fast-track immigration, air ambulance evacuations, and private jet charters.
          </p>
        </div>
      </FadeInView>

      {/* SEARCH INPUT BAR */}
      <FadeInView>
        <div className="relative mb-8 max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-emerald-600">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQs (e.g., fast track, pet, ambulance, Maybach)..."
            className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white border border-slate-200 focus:border-emerald-500 text-sm text-slate-900 font-semibold placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 shadow-xs transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              type="button"
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </FadeInView>

      {/* CATEGORY FILTER TABS */}
      <FadeInView>
        <div className="flex flex-wrap items-center gap-2 mb-10 p-1.5 rounded-2xl bg-white border border-slate-200 w-fit shadow-xs">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </FadeInView>

      {/* ACCORDION FAQ LIST OR FALLBACK */}
      {filteredFaqs.length === 0 ? (
        /* NO MATCH FALLBACK STATE */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 sm:p-12 rounded-[32px] bg-white border border-slate-200 text-center max-w-2xl mx-auto shadow-sm relative overflow-hidden"
        >
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto mb-4">
            <HelpCircle className="w-7 h-7" />
          </div>

          <h3 className="text-2xl font-serif text-slate-900 font-bold">
            No exact FAQ matched "{searchQuery}"
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium max-w-lg mx-auto leading-relaxed font-sans">
            Our 24/7 aviation command desk is ready to answer specific questions regarding custom airside staging, diplomatic clearance, or flight itineraries.
          </p>

          {/* CONTACT & RELATED SERVICE TRIGGERS */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="tel:+919599087959"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#84cc16] hover:bg-[#65a30d] text-[#0f172a] font-mono text-xs font-extrabold uppercase tracking-widest transition-all shadow-sm"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call 24/7 Desk (+91 9599087959)</span>
            </a>

            <Link
              to="/solutions/concierge"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-800 font-mono text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xs"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-4 h-4 text-emerald-600" />
            </Link>
          </div>
        </motion.div>
      ) : (
        /* FAQ ACCORDION LIST */
        <div className="space-y-3.5">
          {filteredFaqs.map((faq) => {
            const isOpen = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden bg-white ${
                  isOpen
                    ? "border-emerald-300 shadow-sm"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* QUESTION HEADER BUTTON */}
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  type="button"
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 font-bold hidden sm:inline-block">
                      {faq.categoryLabel}
                    </span>
                    <h3 className="text-base sm:text-lg font-serif font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {faq.q}
                    </h3>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen
                        ? "rotate-180 bg-emerald-600 border-emerald-600 text-white"
                        : "bg-slate-100 border-slate-200 text-slate-700"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {/* ANIMATED ANSWER CONTENT */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-0 border-t border-slate-100">
                        <p className="mt-4 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed font-sans">
                          {faq.a}
                        </p>

                        {faq.relatedServiceLink && (
                          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-500 font-medium">Related Service:</span>
                            <Link
                              to={faq.relatedServiceLink}
                              className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-bold"
                            >
                              <span>{faq.relatedServiceTitle || "Learn More"}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
