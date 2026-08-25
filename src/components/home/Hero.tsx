import React, { lazy, Suspense } from "react";
import { Navigation } from "@/components/Navigation";
import { C } from "./theme";
import { ScrollSection } from "./ScrollSection";
import { HeroSection } from "./HeroSection";
import { BookingPanel } from "./booking/BookingPanel";
import { ViewportMount } from "./ViewportMount";

const SignatureConciergeSection = lazy(() =>
  import("./sections/SignatureConciergeSection").then((m) => ({ default: m.SignatureConciergeSection })),
);
const WhyChooseUs = lazy(() => import("./sections/WhyChooseUs").then((m) => ({ default: m.WhyChooseUs })));
const TrustBar = lazy(() => import("./sections/TrustBar").then((m) => ({ default: m.TrustBar })));
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
  return <div className="w-full bg-[#faf9f5]" style={{ minHeight: height }} aria-hidden />;
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
      <Deferred height={520}>
        <SignatureConciergeSection />
      </Deferred>
      <ScrollSection id="why">
        <Deferred>
          <WhyChooseUs />
        </Deferred>
      </ScrollSection>
      <ScrollSection>
        <Deferred height={220}>
          <TrustBar />
        </Deferred>
      </ScrollSection>
      <Deferred height={720}>
        <EnterpriseSolutions />
      </Deferred>
      <ScrollSection id="coverage">
        <Deferred height={480}>
          <Coverage />
        </Deferred>
      </ScrollSection>
      <ScrollSection>
        <Deferred>
          <Fleet />
        </Deferred>
      </ScrollSection>
      <ScrollSection>
        <Deferred>
          <Journey />
        </Deferred>
      </ScrollSection>
      <ScrollSection>
        <Deferred height={520}>
          <Testimonials />
        </Deferred>
      </ScrollSection>
      <ScrollSection>
        <Deferred>
          <FAQ />
        </Deferred>
      </ScrollSection>
      <ScrollSection>
        <Deferred>
          <FinalCTA />
        </Deferred>
      </ScrollSection>
      <ScrollSection isLast>
        <Deferred height={280}>
          <Footer />
        </Deferred>
      </ScrollSection>
    </div>
  );
}
