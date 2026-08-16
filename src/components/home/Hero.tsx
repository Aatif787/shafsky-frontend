import React, { lazy, Suspense } from "react";
import { Navigation } from "@/components/Navigation";
import { C } from "./theme";
import { ScrollSection } from "./ScrollSection";
import { HeroSection } from "./HeroSection";
import { BookingPanel } from "./booking/BookingPanel";

const SignatureConciergeSection = lazy(() =>
  import("./sections/SignatureConciergeSection").then((m) => ({ default: m.SignatureConciergeSection })),
);
const WhyChooseUs = lazy(() => import("./sections/WhyChooseUs").then((m) => ({ default: m.WhyChooseUs })));
const TrustBar = lazy(() => import("./sections/TrustBar").then((m) => ({ default: m.TrustBar })));
const EnterpriseServicesPlatform = lazy(() =>
  import("@/components/services/EnterpriseServicesPlatform").then((m) => ({
    default: m.EnterpriseServicesPlatform,
  })),
);
const EnterpriseSolutions = lazy(() =>
  import("./sections/EnterpriseSolutions").then((m) => ({ default: m.EnterpriseSolutions })),
);
const Coverage = lazy(() => import("./sections/Coverage").then((m) => ({ default: m.Coverage })));
const Fleet = lazy(() => import("./sections/Fleet").then((m) => ({ default: m.Fleet })));
const Journey = lazy(() => import("./sections/Journey").then((m) => ({ default: m.Journey })));
const Testimonials = lazy(() => import("./sections/Testimonials").then((m) => ({ default: m.Testimonials })));
const FAQ = lazy(() => import("./sections/FAQ").then((m) => ({ default: m.FAQ })));
const FinalCTA = lazy(() => import("./sections/FinalCTA").then((m) => ({ default: m.FinalCTA })));
const Footer = lazy(() => import("./sections/Footer").then((m) => ({ default: m.Footer })));

function SectionFallback({ height = 360 }: { height?: number }) {
  return <div className="w-full animate-pulse bg-[#faf9f5]" style={{ minHeight: height }} aria-hidden />;
}

export function Hero({ visible = true }: { visible?: boolean }) {
  return (
    // `sticky-safe` enforces overflow-x: clip + overflow-y: visible so descendant
    // `position: sticky` sections (e.g. Services scroll-pinned stage) keep working.
    // Do NOT change to `overflow-hidden` — it silently breaks all sticky children.
    <div
      className="sticky-safe relative min-h-screen"
      style={{ background: C.bg, color: C.ink, fontFamily: "'Inter', sans-serif" }}
    >
      <Navigation visible={visible} />
      <HeroSection visible={visible} />
      <BookingPanel />
      <Suspense fallback={<SectionFallback height={520} />}>
        <SignatureConciergeSection />
      </Suspense>
      <ScrollSection id="why">
        <Suspense fallback={<SectionFallback />}>
          <WhyChooseUs />
        </Suspense>
      </ScrollSection>
      <ScrollSection>
        <Suspense fallback={<SectionFallback height={220} />}>
          <TrustBar />
        </Suspense>
      </ScrollSection>
      <ScrollSection id="services">
        <Suspense fallback={<SectionFallback height={640} />}>
          <EnterpriseServicesPlatform />
        </Suspense>
      </ScrollSection>
      <Suspense fallback={<SectionFallback height={720} />}>
        <EnterpriseSolutions />
      </Suspense>
      <ScrollSection id="coverage">
        <Suspense fallback={<SectionFallback height={480} />}>
          <Coverage />
        </Suspense>
      </ScrollSection>
      <ScrollSection>
        <Suspense fallback={<SectionFallback />}>
          <Fleet />
        </Suspense>
      </ScrollSection>
      <ScrollSection>
        <Suspense fallback={<SectionFallback />}>
          <Journey />
        </Suspense>
      </ScrollSection>
      <ScrollSection>
        <Suspense fallback={<SectionFallback height={520} />}>
          <Testimonials />
        </Suspense>
      </ScrollSection>
      <ScrollSection>
        <Suspense fallback={<SectionFallback />}>
          <FAQ />
        </Suspense>
      </ScrollSection>
      <ScrollSection>
        <Suspense fallback={<SectionFallback />}>
          <FinalCTA />
        </Suspense>
      </ScrollSection>
      <ScrollSection isLast>
        <Suspense fallback={<SectionFallback height={280} />}>
          <Footer />
        </Suspense>
      </ScrollSection>
    </div>
  );
}
