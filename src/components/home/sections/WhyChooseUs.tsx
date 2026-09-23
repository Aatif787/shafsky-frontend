import {
  Clock,
  Sparkles,
  Award,
  Headphones,
  ShieldCheck,
  Plane,
  Car,
} from "lucide-react";
import { display, mono } from "../theme";
import { ICICI_REVIEW_MODE } from "@/lib/config/reviewMode";

export function WhyChooseUs() {
  const doorToDoorSteps = [
    {
      step: "01",
      title: "Doorstep Pickup",
      desc: "A luxury chauffeured vehicle arrives at your home or hotel on schedule, handling all luggage.",
    },
    {
      step: "02",
      title: "Curbside Host",
      desc: "Your dedicated host meets your car at the terminal with luggage porters and check-in support.",
    },
    {
      step: "03",
      title: "Fast-Track & Lounge",
      desc: "Breeze through priority security clearance and unwind in quiet VIP lounge suites.",
    },
    {
      step: "04",
      title: "Destination Arrival",
      desc: "Placard greeting at the aerobridge, baggage retrieval, and seamless handoff to your onward ride.",
    },
  ];

  const coreBenefits = [
    {
      icon: Clock,
      title: "Zero Waiting & Fast-Track",
      desc: "Skip crowded terminal queues. We handle your check-in, priority security clearance, and luggage so you move through without delay.",
    },
    {
      icon: Sparkles,
      title: "Warm & Caring Hosts",
      desc: "Your dedicated Guest Relations host welcomes you with genuine warmth, manages every bag, and guides you step-by-step through the terminal.",
    },
    {
      icon: Award,
      title: "VIP Lounge Relaxation",
      desc: "Unwind in peaceful luxury lounge suites complete with chef-prepared dining, refreshing drinks, and high-speed Wi-Fi before boarding.",
    },
    {
      icon: Headphones,
      title: "24/7 Operations Support",
      desc: "Our operations team tracks your aircraft in real time and is always a quick call or message away for delays or schedule changes.",
    },
    {
      icon: ShieldCheck,
      title: "100% Safe & Private",
      desc: "Strict confidentiality, verified security credentials, and private tarmac transfers for you and your family on every departure and arrival.",
    },
    {
      icon: Plane,
      title: "Private Jets On-Demand",
      desc: "Fly on your own schedule with direct point-to-point private jets and helicopters to any domestic or international destination.",
    },
    {
      icon: Car,
      title: "Luxury Doorstep Cars",
      desc: "Executive sedans and luxury cars ready curbside and airside to transport you smoothly between your doorstep and the aircraft.",
    },
  ];

  const displayedBenefits = ICICI_REVIEW_MODE
    ? coreBenefits.filter(
        (it) =>
          it.title !== "Private Jets On-Demand" &&
          it.title !== "Luxury Doorstep Cars"
      )
    : coreBenefits;

  return (
    <section
      id="why"
      className="relative px-6 py-20 md:px-14 md:py-28 bg-white border-b border-slate-200"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <p
            className="text-[11px] uppercase tracking-[0.35em] text-lime-700 font-bold"
            style={mono}
          >
            THE SHAFSKY STANDARD
          </p>
          <h2
            className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight"
            style={display}
          >
            Travel Made <span className="text-lime-600">Effortless & Simple.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Skip the airport stress — we handle every detail so you can just relax and enjoy your journey.
          </p>
        </div>

        {/* 1. DOOR-TO-DOOR SERVICE: Clean, open, horizontal stage progression */}
        {!ICICI_REVIEW_MODE && (
          <div className="mt-16 pt-10 border-t border-slate-200">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <span
                  className="text-[10px] font-mono font-bold uppercase tracking-widest text-lime-700"
                  style={mono}
                >
                  COMPLETE DOOR-TO-DOOR SERVICES
                </span>
                <h3
                  className="text-xl sm:text-2xl font-bold text-slate-950 mt-1.5"
                  style={display}
                >
                  From Your Doorstep Directly to Your Destination
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md leading-relaxed">
                One seamless itinerary connecting chauffeur pickup, airport host assistance, VIP lounge relaxation, and onward transit.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {doorToDoorSteps.map((st) => (
                <div
                  key={st.step}
                  className="pt-6 border-t-2 border-slate-200 hover:border-lime-500 transition-colors duration-200 group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-xs font-mono font-bold text-lime-600 tracking-wider"
                      style={mono}
                    >
                      STAGE {st.step}
                    </span>
                  </div>
                  <h4
                    className="text-base font-bold text-slate-950 group-hover:text-lime-700 transition-colors"
                    style={display}
                  >
                    {st.title}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. CORE SERVICE PILLARS: Clean open editorial grid with zero boxes */}
        <div className="mt-16 pt-10 border-t border-slate-200">
          <div className="mb-10">
            <span
              className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400"
              style={mono}
            >
              WHY CHOOSE US
            </span>
            <h3
              className="text-xl sm:text-2xl font-bold text-slate-950 mt-1.5"
              style={display}
            >
              Hospitality standards designed around your peace of mind
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            {displayedBenefits.map((it) => {
              const Icon = it.icon;
              return (
                <div key={it.title} className="group">
                  <div className="w-10 h-10 rounded-xl bg-lime-50 text-lime-700 flex items-center justify-center mb-4 group-hover:bg-lime-500 group-hover:text-slate-950 transition-colors duration-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4
                    className="text-base font-bold text-slate-950 group-hover:text-lime-700 transition-colors"
                    style={display}
                  >
                    {it.title}
                  </h4>
                  <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                    {it.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
