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
import { ServiceCategoryId } from "@/data/servicesPlatformData";

interface ServiceLayoutProps {
  category: string;
  categoryHref?: string;
  categoryId?: ServiceCategoryId;
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
  categoryId = "all",
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

      {/* 3. KEY BENEFITS */}
      <ServiceWhyChoose serviceName={serviceName} benefits={benefits} />

      {/* 4. SIMPLE 3-STEP PROCESS */}
      <ServiceHowItWorks serviceName={serviceName} steps={timelineSteps} />

      {/* 5. BOOKING SECTION CTA */}
      <AssistanceCTA
        heading={`Reserve ${serviceName} Service`}
        subheading="Experience seamless airside concierge. Proceed to step-by-step reservation."
      />

      {/* 6. RELATED SERVICES */}
      <RelatedServices services={relatedServices} title="Explore Connected Services" />

      {/* 7. SMALL FAQ */}
      <ServiceFAQ serviceName={serviceName} faqs={faqs} />
    </PageJourneyWrapper>
  );
}
