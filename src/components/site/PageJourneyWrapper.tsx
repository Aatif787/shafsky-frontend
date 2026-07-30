import React, { ReactNode } from "react";
import { Navigation } from "@/components/Navigation";
import { Breadcrumbs, BreadcrumbItem } from "@/components/navigation/Breadcrumbs";
import { PrevNextNav, NavigationStep } from "@/components/navigation/PrevNextNav";
import { RelatedServices, RelatedServiceItem } from "@/components/navigation/RelatedServices";
import { AssistanceCTA } from "@/components/navigation/AssistanceCTA";
import { CustomerConfidence } from "@/components/trust/TrustMasterSection";

interface PageJourneyWrapperProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  category?: string;
  categoryHref?: string;
  current?: string;
  subService?: string;
  prevNav?: NavigationStep | null;
  nextNav?: NavigationStep | null;
  relatedServices?: RelatedServiceItem[];
  showBreadcrumbs?: boolean;
  showPrevNext?: boolean;
  showRelated?: boolean;
  showCTA?: boolean;
  showNav?: boolean;
  className?: string;
}

export function PageJourneyWrapper({
  children,
  breadcrumbs,
  category,
  categoryHref,
  current,
  subService,
  prevNav,
  nextNav,
  relatedServices,
  showBreadcrumbs = true,
  showPrevNext = true,
  showRelated = true,
  showCTA = true,
  showNav = true,
  className = "",
}: PageJourneyWrapperProps) {
  return (
    <div className={`min-h-screen bg-[#FAF9F5] text-slate-900 flex flex-col justify-between relative ${className}`}>
      {/* 1. STICKY GLASS NAVBAR */}
      {showNav && <Navigation visible={true} />}

      {/* 2. MAIN PAGE CONTENT CONTAINER */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-24 sm:pt-28 pb-16">
        {/* BREADCRUMBS AT TOP OF CONTENT */}
        {showBreadcrumbs && (
          <div className="mb-6 sm:mb-8">
            <Breadcrumbs
              items={breadcrumbs}
              category={category}
              categoryHref={categoryHref}
              current={current}
              subService={subService}
            />
          </div>
        )}

        {/* PAGE CONTENT */}
        {children}

        {/* PREVIOUS / NEXT NAVIGATION */}
        {showPrevNext && (
          <PrevNextNav prev={prevNav} next={nextNav} />
        )}

        {/* RELATED SERVICES */}
        {showRelated && (
          <RelatedServices services={relatedServices} />
        )}

        {/* DISTRIBUTED TRUST STATS (Testimonials disabled globally) */}
        {category !== "Coverage" && <CustomerConfidence />}

        {/* NEED ASSISTANCE? BOOK YOUR SERVICE NOW. CTA */}
        {showCTA && (
          <AssistanceCTA />
        )}
      </main>
    </div>
  );
}
