import React from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronRight, Home, Sparkles } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  category?: string;
  categoryHref?: string;
  current?: string;
  subService?: string;
  className?: string;
}

const CATEGORY_MAP: Record<string, { label: string; href: string }> = {
  "/solutions/concierge": { label: "Airport Concierge", href: "/solutions/concierge" },
  "/solutions/travel": { label: "Travel Services", href: "/solutions/travel" },
  "/solutions/cargo": { label: "Cargo & Logistics", href: "/solutions/cargo" },
  "/solutions/medical": { label: "Medical Assistance", href: "/solutions/medical" },
  "/solutions/aviation": { label: "Private Aviation", href: "/solutions/aviation" },
  "/charter": { label: "Private Aviation", href: "/charter" },
  "/airports": { label: "Coverage", href: "/airports" },
  "/services/guide": { label: "About", href: "/services/guide" },
  "/contact": { label: "Contact", href: "/contact" },
  "/book": { label: "Book Now", href: "/book" },
};

const SUB_SERVICE_MAP: Record<string, string> = {
  meet_greet: "Meet & Greet",
  lounge: "Airport Lounge",
  fast_track: "Fast Track",
  transport: "Transportation",
  hotel: "Hotel Booking",
  visa: "Visa Assistance",
  ticketing: "Air Ticketing",
  meals: "On-board Meals",
  cargo: "Cargo Assistance",
  cargo_assistance: "Cargo Assistance",
  avi: "AVI (Pet Transport)",
  avi_pet_transport: "AVI (Pet Transport)",
  air_ambulance: "Air Ambulance Medevac",
  train_ambulance: "Train Ambulance",
  hum: "HUM Repatriation",
  hum_repatriation: "HUM Repatriation",
  charter: "Private Charter",
};

export function Breadcrumbs({
  items,
  category,
  categoryHref,
  current,
  subService,
  className = "",
}: BreadcrumbsProps) {
  const location = useLocation();
  const searchObj = (location.search || {}) as Record<string, any>;
  const activeSubFromUrl =
    typeof searchObj === "object" && searchObj.sub
      ? String(searchObj.sub)
      : typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("sub") || subService
        : subService;

  let computedItems: BreadcrumbItem[] = [];

  if (items && items.length > 0) {
    computedItems = items;
  } else {
    computedItems.push({ label: "Home", href: "/" });

    const matchedCategory = category
      ? { label: category, href: categoryHref || "#" }
      : CATEGORY_MAP[location.pathname];

    if (matchedCategory) {
      const isCategoryActive = !current && !activeSubFromUrl;
      computedItems.push({
        label: matchedCategory.label,
        href: isCategoryActive ? undefined : matchedCategory.href,
        active: isCategoryActive,
      });
    }

    if (current) {
      const isCurrentActive = !activeSubFromUrl;
      computedItems.push({
        label: current,
        active: isCurrentActive,
      });
    }

    if (activeSubFromUrl && SUB_SERVICE_MAP[activeSubFromUrl]) {
      computedItems.push({
        label: SUB_SERVICE_MAP[activeSubFromUrl],
        active: true,
      });
    }
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`relative z-20 flex items-center flex-wrap gap-2 text-xs font-mono tracking-wider py-3.5 px-4 sm:px-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md ${className}`}
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      <div className="flex items-center gap-2 text-white/50 hover:text-[#c5a059] transition-colors">
        <Home className="w-3.5 h-3.5 text-[#c5a059]" />
      </div>

      {computedItems.map((item, idx) => {
        const isLast = idx === computedItems.length - 1;

        return (
          <React.Fragment key={idx}>

            <ChevronRight className="w-3 h-3 text-[#c5a059]/60 shrink-0" />

            {item.active || !item.href || isLast ? (
              <span className="flex items-center gap-1.5 font-semibold text-[#c5a059] tracking-widest uppercase">
                {isLast && <Sparkles className="w-3 h-3 animate-pulse text-[#c5a059]" />}
                {item.label}
              </span>
            ) : (
              <Link
                to={item.href}
                className="text-white/70 hover:text-white uppercase tracking-widest transition-colors duration-200"
              >
                {item.label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
