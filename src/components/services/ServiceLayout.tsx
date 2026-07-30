import React from "react";
import { PageJourneyWrapper } from "@/components/site/PageJourneyWrapper";
import { ServiceHero, type SubServiceOption } from "./ServiceHero";
import { ServiceWhyChoose, type BenefitCard } from "./ServiceWhyChoose";
import { ServiceHowItWorks, type TimelineStep } from "./ServiceHowItWorks";
import { ServiceFeatures, type FeatureItem } from "./ServiceFeatures";
import { ServiceAudience, type PersonaItem } from "./ServiceAudience";
import { ServiceFAQ, type FAQPair } from "./ServiceFAQ";
import { RelatedServices, type RelatedServiceItem } from "@/components/navigation/RelatedServices";
import { AssistanceCTA } from "@/components/navigation/AssistanceCTA";
import { SafetyReliability, QualityStandards } from "@/components/trust/TrustMasterSection";

interface ServiceLayoutProps {
  category: string;
  categoryHref?: string;
  serviceName: string;
  tagline: string;
  description: string;
  heroImage: string;
  serviceId?: string;
  activeSubService?: string;
  subServices?: SubServiceOption[];
  onSelectSubService?: (id: string) => void;
  benefits?: BenefitCard[];
  timelineSteps?: TimelineStep[];
  features?: FeatureItem[];
  audiences?: PersonaItem[];
  faqs?: FAQPair[];
  relatedServices?: RelatedServiceItem[];
}

export function ServiceLayout({
  category,
  categoryHref = "/solutions/concierge",
  serviceName,
  tagline,
  description,
  heroImage,
  serviceId = "meet_greet",
  activeSubService,
  subServices = [],
  onSelectSubService,
  benefits,
  timelineSteps,
  faqs,
  relatedServices,
}: ServiceLayoutProps) {
  return (
    <PageJourneyWrapper
      category={category}
      categoryHref={categoryHref}
      current={serviceName}
    >
      {/* 1. HERO & SHORT OVERVIEW */}
      <ServiceHero
        category={category}
        title={serviceName}
        tagline={tagline}
        description={description}
        heroImage={heroImage}
        activeSubService={activeSubService}
        subServices={subServices}
        onSelectSubService={onSelectSubService}
        serviceId={serviceId}
      />

      {/* 2. KEY BENEFITS */}
      <ServiceWhyChoose serviceName={serviceName} benefits={benefits} />

      {/* 3. SIMPLE 3-STEP PROCESS */}
      <ServiceHowItWorks serviceName={serviceName} steps={timelineSteps} />

      {/* 4. BOOKING SECTION CTA */}
      <AssistanceCTA
        heading={`Reserve ${serviceName} Service`}
        subheading="Experience seamless airside concierge. Proceed to step-by-step reservation."
      />

      {/* 5. RELATED SERVICES */}
      <RelatedServices services={relatedServices} title="Explore Connected Services" />

      {/* 6. SMALL FAQ */}
      <ServiceFAQ serviceName={serviceName} faqs={faqs} />
    </PageJourneyWrapper>
  );
}
