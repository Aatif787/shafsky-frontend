import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { TiltCard, FadeInView } from "@/components/ui/interactions";

export interface NavigationStep {
  title: string;
  category?: string;
  href: string;
  description?: string;
}

interface PrevNextNavProps {
  prev?: NavigationStep | null;
  next?: NavigationStep | null;
  className?: string;
}

const ROUTE_FLOW: NavigationStep[] = [
  {
    title: "Home",
    category: "Overview",
    href: "/",
    description: "Engineering the Edge of Flight",
  },
  {
    title: "Airport Services",
    category: "Flagship Services",
    href: "/solutions/concierge",
    description: "Everything you need for a smooth airport journey",
  },
  {
    title: "Travel Services",
    category: "Bespoke Hospitality",
    href: "/solutions/travel",
    description: "Hotel, Visa, Ticketing & Catering",
  },
  {
    title: "Cargo & Logistics",
    category: "White-Glove Freight",
    href: "/solutions/cargo",
    description: "Air Cargo & Live Animal AVI",
  },
  {
    title: "Medical Assist",
    category: "Emergency Medevac",
    href: "/solutions/medical",
    description: "24/7 ICU Air & Train Ambulance",
  },
  {
    title: "Private Aviation",
    category: "VIP Charter",
    href: "/charter",
    description: "On-demand Private Jet Charter",
  },
  {
    title: "Coverage",
    category: "Destinations & Hubs",
    href: "/airports",
    description: "19 Hubs & Global Airport Network",
  },
  {
    title: "About",
    category: "Service Guide",
    href: "/services/guide",
    description: "The Shafsky Standard & Experience",
  },
  {
    title: "Contact",
    category: "24/7 Concierge",
    href: "/contact",
    description: "Reach our Operational Command",
  },
  {
    title: "Book Now",
    category: "Instant Booking",
    href: "/book",
    description: "Reserve your Luxury Service",
  },
];

export function PrevNextNav({ prev, next, className = "" }: PrevNextNavProps) {
  const location = useLocation();

  let resolvedPrev = prev;
  let resolvedNext = next;

  if (resolvedPrev === undefined || resolvedNext === undefined) {
    const currentIndex = ROUTE_FLOW.findIndex(
      (step) => step.href === location.pathname
    );

    if (currentIndex !== -1) {
      if (resolvedPrev === undefined) {
        const prevIdx =
          currentIndex > 0 ? currentIndex - 1 : ROUTE_FLOW.length - 1;
        resolvedPrev = ROUTE_FLOW[prevIdx];
      }
      if (resolvedNext === undefined) {
        const nextIdx =
          currentIndex < ROUTE_FLOW.length - 1 ? currentIndex + 1 : 0;
        resolvedNext = ROUTE_FLOW[nextIdx];
      }
    }
  }

  return (
    <FadeInView>
      <nav
        aria-label="Previous and Next navigation"
        className={`my-12 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 ${className}`}
      >
        {/* PREVIOUS PAGE CARD */}
        {resolvedPrev ? (
          <TiltCard maxTilt={8} scale={1.02} className="rounded-3xl">
            <Link
              to={resolvedPrev.href}
              className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-[#7c3aed]/50 transition-all duration-300 shadow-xs hover:shadow-md overflow-hidden h-full text-left"
            >
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#7c3aed] font-bold">
                <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
                <span>Previous Experience</span>
              </div>

              <div className="mt-4">
                <h4 className="text-lg sm:text-xl font-heading font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors">
                  {resolvedPrev.title}
                </h4>
                {resolvedPrev.description && (
                  <p className="mt-1 text-xs text-slate-600 font-medium line-clamp-1 font-sans">
                    {resolvedPrev.description}
                  </p>
                )}
              </div>
            </Link>
          </TiltCard>
        ) : (
          <div />
        )}

        {/* NEXT PAGE CARD */}
        {resolvedNext ? (
          <TiltCard maxTilt={8} scale={1.02} className="rounded-3xl">
            <Link
              to={resolvedNext.href}
              className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-[#7c3aed]/50 transition-all duration-300 shadow-xs hover:shadow-md overflow-hidden h-full text-right sm:text-right"
            >
              <div className="flex items-center justify-end gap-2 text-[10px] font-mono uppercase tracking-[0.25em] text-[#7c3aed] font-bold">
                <span>Next Experience</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-end gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#7c3aed]" />
                  <h4 className="text-lg sm:text-xl font-heading font-bold text-slate-900 group-hover:text-[#7c3aed] transition-colors">
                    {resolvedNext.title}
                  </h4>
                </div>
                {resolvedNext.description && (
                  <p className="mt-1 text-xs text-slate-600 font-medium line-clamp-1 font-sans">
                    {resolvedNext.description}
                  </p>
                )}
              </div>
            </Link>
          </TiltCard>
        ) : (
          <div />
        )}
      </nav>
    </FadeInView>
  );
}
