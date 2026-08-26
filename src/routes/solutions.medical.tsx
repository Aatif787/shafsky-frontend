import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, useLocation } from "@tanstack/react-router";
import { ServiceLayout } from "@/components/services/ServiceLayout";

import medicalAssistImg from "@/assets/medical-assist.png";
import vipTransport1 from "@/assets/vip-transport-1.png";

export const Route = createFileRoute("/solutions/medical")({
  head: () => ({
    meta: [
      { title: "24/7 Air Ambulance & Medical Evacuation — Shafsky Aviation Services" },
      {
        name: "description",
        content:
          "Dedicated airborne ICU air ambulance flights, medical train compartments, flight doctor escort, and mortal remains HUM repatriation.",
      },
    ],
  }),
  component: MedicalAssistancePage,
});

function MedicalAssistancePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchObj: any = location.search || {};
  const activeSub = typeof searchObj === "object" && searchObj.sub ? searchObj.sub : "air_ambulance";

  const subServices = [
    {
      id: "air_ambulance",
      label: "Air Ambulance",
      tagline: "Airborne ICU Aircraft & Flight Doctor Escort",
      description: "Fully equipped fixed-wing ICU aircraft with ventilator, defibrillator, cardiac monitor, and board-certified flight physician and paramedic team.",
      image: medicalAssistImg,
      badge: "Critical Care",
    },
    {
      id: "train_ambulance",
      label: "Train Ambulance",
      tagline: "Medical Train Compartment Transfer",
      description: "Dedicated reserved train compartment converted into a mobile ICU unit for cost-effective long-distance patient transfer with onboard doctor.",
      image: vipTransport1,
      badge: "Rail ICU",
    },
    {
      id: "hum",
      label: "HUM Repatriation",
      tagline: "Dignified Human Remains Repatriation",
      description: "Dignified mortal remains transport with embassy documentation, embalming certification, customs clearance, and airside airport handoff.",
      image: medicalAssistImg,
      badge: "Repatriation",
    },
  ];

  const handleSelectSubService = (subId: string) => {
    navigate({ to: "/solutions/medical", search: { sub: subId } as any });
  };

  const currentSub = subServices.find((s) => s.id === activeSub) || subServices[0];

  return (
    <ServiceLayout
      category="Medical Assist"
      categoryHref="/solutions/medical"
      categoryId="medical_assistance"
      serviceName={currentSub.label}
      tagline={currentSub.tagline}
      description={currentSub.description}
      heroImage={currentSub.image}
      serviceId={currentSub.id}
      activeSubService={activeSub}
      subServices={subServices}
      onSelectSubService={handleSelectSubService}
      benefits={[
        {
          title: "Bed-to-Bed Transfer",
          description: "Complete ground ambulance and airborne ICU continuity from hospital room to destination receiving facility.",
          icon: undefined,
          highlight: "Bed-to-Bed",
        },
        {
          title: "Board-Certified Medical Crew",
          description: "Experienced flight doctors, intensivists, and critical-care paramedics onboard every flight.",
          icon: undefined,
          highlight: "ICU Crew",
        },
        {
          title: "Tarmac Ambulance Handoff",
          description: "Direct tarmac apron access allows ground ambulances to transfer patients straight to the aircraft ramp.",
          icon: undefined,
          highlight: "Ramp Access",
        },
        {
          title: "24/7 Medical Flight Staging",
          description: "Emergency flight dispatch within 2–4 hours of medical clearance and fit-to-fly assessment.",
          icon: undefined,
          highlight: "Rapid Dispatch",
        },
      ]}
      timelineSteps={[
        {
          number: "01",
          title: "Medical Assessment & Fit-to-Fly Clearance",
          description: "Our flight physician consults with the treating hospital to review patient vitals and issue flight clearance.",
          badge: "Step 1: Evaluation",
        },
        {
          number: "02",
          title: "Aircraft ICU Preparation & Ramp Staging",
          description: "The medical jet is configured with portable ICU equipment while ground ambulances are dispatched.",
          badge: "Step 2: Staging",
        },
        {
          number: "03",
          title: "Bedside Pickup & Airborne Transit",
          description: "Patient is transferred into the air ambulance with continuous monitoring by the flight physician.",
          badge: "Step 3: Flight",
        },
        {
          number: "04",
          title: "Destination Hospital Bed-to-Bed Handoff",
          description: "Direct transfer into the destination ICU receiving bed with complete medical chart handoff.",
          badge: "Step 4: Completion",
        },
      ]}
      faqs={[
        {
          q: "How quickly can an air ambulance be launched?",
          a: "Following medical chart review and fit-to-fly clearance, our medical jets can typically be airborne within 2 to 4 hours.",
        },
        {
          q: "What medical equipment is onboard the air ambulance?",
          a: "Each aircraft is equipped as a flying ICU, including multi-parameter cardiac monitors, mechanical ventilators, syringe pumps, suction units, emergency medications, and portable oxygen.",
        },
        {
          q: "Can family members travel with the patient?",
          a: "Yes. Depending on the aircraft model (e.g. King Air, Learjet, Hawker), 1 to 2 family members can accompany the patient at no extra charge.",
        },
      ]}
    />
  );
}
