import React, { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Car,
  PhoneCall,
  MessageSquare,
} from "lucide-react";
import { display } from "@/components/home/theme";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";
import { useWebsiteContacts } from "@/hooks/useWebsiteContacts";

export const Route = createFileRoute("/solutions/transport")({
  head: () =>
    pageHead({
      title: "Airport Luxury Transfers & Chauffeured Fleet | Shafsky",
      description:
        "Chauffeured airport transfers in Mercedes-Maybach, Toyota Vellfire, and executive sedans across India. Book tarmac and curbside passenger transport with Shafsky.",
      path: "/solutions/transport",
      keywords: ["airport transfer India", "chauffeured luxury car", "Maybach airport pickup"],
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Airport Transfers", path: "/solutions/transport" },
        ]),
      ],
    }),
  component: DedicatedTransportServicePage,
});
import {
  TRANSPORT_OPTIONS,
  TRANSPORTATION_VEHICLE_CATALOG,
  type TransportOptionId,
  type TransportOptionDef,
} from "@/data/transportation";
import { VehicleDetailsSection } from "@/components/transportation/VehicleDetailsSection";
import { Footer } from "@/components/home/sections/Footer";

export type { TransportOptionId, TransportOptionDef };

function DedicatedTransportServicePage() {
  const navigate = useNavigate();
  const { getPrimaryContact } = useWebsiteContacts();
  const primaryTransportContact = getPrimaryContact("transport");

  const [selectedOptionId, setSelectedOptionId] = useState<TransportOptionId>("Luxury Vehicles");
  const [activeVehicleId, setActiveVehicleId] = useState<string>("merc-maybach-s-class");

  const activeOption =
    TRANSPORT_OPTIONS.find((o) => o.id === selectedOptionId) || TRANSPORT_OPTIONS[0];

  const handleSelectOption = (optId: TransportOptionId) => {
    setSelectedOptionId(optId);


    // Automatically select first valid canonical vehicle of the new category
    const targetOpt = TRANSPORT_OPTIONS.find((o) => o.id === optId) || TRANSPORT_OPTIONS[0];
    if (targetOpt.vehicles && targetOpt.vehicles.length > 0) {
      setActiveVehicleId(targetOpt.vehicles[0].id);
    }
  };

  // Vehicles directly from active canonical category (Luxury: 12, MUV: 15, Economy: 11)
  const displayVehicles = activeOption.vehicles || [];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-lime-200">
      {/* ─────────────────────────────────────────────────────────────
          1. COMPLETE HERO PHOTO & TRANSPORT SERVICE TITLE
          ───────────────────────────────────────────────────────────── */}
      <section className="relative px-4 pt-4 pb-8 sm:px-6 lg:px-8 border-b border-slate-100">
        <div className="mx-auto max-w-6xl">
          {/* Header Bar with Back Button & Breadcrumbs */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <button
              onClick={() => {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  navigate({ to: "/" });
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-lime-500 hover:text-lime-700 hover:bg-lime-50/50 shadow-sm transition-all cursor-pointer"
            >
              <ArrowLeft size={14} className="text-lime-600" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2.5">
              {primaryTransportContact && (
                <a
                  href={primaryTransportContact.tel_link}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-semibold shadow-2xs transition-colors"
                >
                  <PhoneCall size={12} className="text-lime-400" />
                  <span className="hidden sm:inline">Dispatch:</span> {primaryTransportContact.formatted}
                </a>
              )}
              <a
                href={`https://wa.me/${primaryTransportContact?.full_phone_number?.replace(/\D/g, "") || "919599087957"}?text=${encodeURIComponent("Hello Shafsky Aviation Transport Desk, I would like to inquire about chauffeur transportation.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-mono text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                title="Chat with Transport Desk on WhatsApp"
              >
                <MessageSquare size={12} className="text-white" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
              <button
                type="button"
                onClick={() => {
                  document.getElementById("transport-enquiry-form")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime-500 hover:bg-lime-400 active:bg-lime-600 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider shadow-sm transition-all cursor-pointer"
              >
                <Car size={13} className="stroke-[2.5]" />
                <span>Book Fleet</span>
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <div className="text-center max-w-3xl mx-auto mb-6">
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight"
              style={display}
            >
              Transport Service
            </h1>
          </div>


        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. VEHICLE SHOWROOM: CINEMATIC STAGE, CIRCULAR SELECTOR & DETAILS
          ───────────────────────────────────────────────────────────── */}
      <section className="py-10 sm:py-14 bg-slate-50 border-b border-slate-200 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {TRANSPORT_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelectOption(option.id)}
                className={`rounded-full border px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition ${selectedOptionId === option.id ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-700 border-slate-200 hover:border-violet-400"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {displayVehicles.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveVehicleId(item.id)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${activeVehicleId === item.id ? "border-violet-500 bg-violet-50 text-slate-950" : "border-slate-200 bg-white text-slate-700 hover:border-violet-300"}`}
              >
                {item.name}
              </button>
            ))}
          </div>
          {displayVehicles.find((item) => item.id === activeVehicleId) && (
            <VehicleDetailsSection vehicle={displayVehicles.find((item) => item.id === activeVehicleId)!} />
          )}
        </div>
      </section>
      {/* ─────────────────────────────────────────────────────────────
          5. COMPANY CATALOG CONTENT & UNCOPPED GALLERY
          ───────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-white px-4 sm:px-6 lg:px-8 border-t border-slate-100">
        <div className="mx-auto max-w-6xl">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[0.35em] text-lime-700 font-bold font-mono bg-lime-50 px-3.5 py-1 rounded-full border border-lime-200 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500 inline-block" />
              <span>FLEET CATEGORIES & DETAILS</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight" style={display}>
              Transport Inclusions & Fleet.
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Chauffeured tarmac transfers, executive MPVs, and luxury inter-city transport.
            </p>
          </div>

          {/* 2-Column Balanced Editorial Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
            {/* Left Column: Transport inclusions from the approved reference */}
            <div className="lg:col-span-6 flex flex-col justify-start space-y-7">
              <p className="text-base sm:text-lg text-slate-900 leading-relaxed">
                Our Luxury Transport Fleet Provides A Comfortable And Stylish Experience For Both Business And Leisure Travel, Ensuring An Enjoyable Journey
              </p>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0a196f] tracking-tight mb-3" style={display}>
                  India’s Premier Door-to-Door Transport Network:
                </h3>
                <ol className="list-decimal pl-6 space-y-1.5 text-base sm:text-lg text-slate-900">
                  <li>Airport to Hotel</li>
                  <li>Hotel to Airport.</li>
                  <li>Pickup &amp; Drop Right at Your Doorstep</li>
                  <li>Pan-India Network Coverage</li>
                  <li>On-Time, Reliable Transportation</li>
                </ol>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0a196f] tracking-tight mb-3" style={display}>
                  Vehicle Hygiene &amp; Comfort:
                </h3>
                <ol className="list-decimal pl-6 space-y-1.5 text-base sm:text-lg text-slate-900">
                  <li>Regularly Sanitized &amp; Well-Maintained Vehicles</li>
                  <li>Spacious Seating with Premium Comfort</li>
                  <li>Clean Interiors with Fresh Air &amp; Pleasant Ambience</li>
                </ol>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-[#8a7418] tracking-tight mb-3" style={display}>
                  Car Fleets:
                </h3>
                <ul className="list-disc pl-6 space-y-1.5 text-base sm:text-lg text-slate-900">
                  <li><strong>Ultra Luxury:</strong> Bentley</li>
                  <li><strong>Premium Luxury:</strong> BMW, Mercedes, Audi</li>
                  <li><strong>Luxury SUVs:</strong> Range Rover, Land Cruiser</li>
                  <li><strong>Premium SUVs:</strong> Defender, Toyota Fortuner</li>
                  <li><strong>Premium:</strong> Toyota Camry, Innova Hycross</li>
                  <li><strong>Executive:</strong> Kia Carnival, Honda City</li>
                  <li><strong>Standard:</strong> Swift Dzire, Tata Tigor</li>
                  <li><strong>Luxury Coaches (Buses):</strong> Volvo Bus VVIP</li>
                </ul>
              </div>
            </div>


          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
}
