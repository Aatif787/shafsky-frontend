import React, { lazy, Suspense } from "react";
import { Navigation } from "@/components/Navigation";
import { C } from "./theme";
import { ScrollSection } from "./ScrollSection";
import { HeroSection } from "./HeroSection";
import { BookingPanel } from "./booking/BookingPanel";
import { ViewportMount } from "./ViewportMount";

const WhyChooseUs = lazy(() => import("./sections/WhyChooseUs").then((m) => ({ default: m.WhyChooseUs })));
const TrustBar = lazy(() => import("./sections/TrustBar").then((m) => ({ default: m.TrustBar })));
const EnterpriseSolutions = lazy(() =>
  import("./sections/EnterpriseSolutions").then((m) => ({ default: m.EnterpriseSolutions })),
);
const VIPTestimonials = lazy(() =>
  import("./sections/VIPTestimonials").then((m) => ({ default: m.VIPTestimonials })),
);
const Journey = lazy(() => import("./sections/Journey").then((m) => ({ default: m.Journey })));
const FAQ = lazy(() => import("./sections/FAQ").then((m) => ({ default: m.FAQ })));
const FinalCTA = lazy(() => import("./sections/FinalCTA").then((m) => ({ default: m.FinalCTA })));
const Footer = lazy(() => import("./sections/Footer").then((m) => ({ default: m.Footer })));

function SectionFallback({ height = 360 }: { height?: number }) {
  return <div className="w-full bg-[#050b14]" style={{ minHeight: height }} aria-hidden />;
}

function Deferred({
  children,
  height,
}: {
  children: React.ReactNode;
  height?: number;
}) {
  return (
    <ViewportMount minHeight={height} fallback={<SectionFallback height={height} />}>
      <Suspense fallback={<SectionFallback height={height} />}>{children}</Suspense>
    </ViewportMount>
  );
}

export function Hero({ visible = true }: { visible?: boolean }) {
  return (
    <div
      className="sticky-safe relative min-h-screen"
      style={{ background: C.bg, color: C.ink, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <Navigation visible={visible} />
      <HeroSection visible={visible} />
      <BookingPanel />

      {/* 1. Quick Proof & Key Performance Stats Bar */}
      <Deferred height={200}>
        <TrustBar />
      </Deferred>

      {/* 2. OUR SERVICES: Core Aviation & Hospitality Suite */}
      <Deferred height={720}>
        <EnterpriseSolutions />
      </Deferred>

      {/* 3. VIP GUEST TESTIMONIALS: Celebrities, Cricketers & Leaders */}
      <Deferred height={680}>
        <VIPTestimonials />
      </Deferred>

      {/* 7. Why Choose Shafsky Aviation */}
      <ScrollSection id="why">
        <Deferred>
          <WhyChooseUs />
        </Deferred>
      </ScrollSection>

      {/* 8. 3-Step Passenger Journey */}
      <ScrollSection>
        <Deferred>
          <Journey />
        </Deferred>
      </ScrollSection>

      {/* 13. Frequently Asked Questions */}
      <ScrollSection>
        <Deferred>
          <FAQ />
        </Deferred>
      </ScrollSection>

      {/* 14. Final Booking Call to Action */}
      <Deferred height={320}>
        <FinalCTA />
      </Deferred>

      {/* 15. Luxury Footer */}
      <ScrollSection isLast>
        <Deferred height={280}>
          <Footer />
        </Deferred>
      </ScrollSection>
    </div>
  );
}
