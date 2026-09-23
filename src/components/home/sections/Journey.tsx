import { ArrowRight } from "lucide-react";
import { display, mono } from "../theme";
import { ICICI_REVIEW_MODE } from "../../../lib/config/reviewMode";

export function Journey() {
  const steps = [
    {
      num: "01",
      title: "Online Reservation",
      desc: ICICI_REVIEW_MODE
        ? "Provide your flight details and travel preferences online for fast confirmation."
        : "Provide your flight details and travel preferences online for instant booking confirmation in 60 seconds.",
    },
    {
      num: "02",
      title: "Dedicated Host Assigned",
      desc: "Your personal Guest Relations host is confirmed with direct contact details for pre-flight coordination.",
    },
    {
      num: "03",
      title: "Personal Placard Welcome",
      desc: "Meet your host the moment you arrive — right at the aircraft aerobridge or terminal curbside entrance.",
    },
    {
      num: "04",
      title: "Priority Fast-Track",
      desc: "Passport control, security screening, and baggage collection handled smoothly so you skip long queues.",
    },
    {
      num: "05",
      title: ICICI_REVIEW_MODE ? "VIP Lounge & Gate Escort" : "VIP Lounge & Transfer",
      desc: ICICI_REVIEW_MODE
        ? "Relax in a quiet VIP lounge suite or take a comfortable buggy transfer directly to your departure gate."
        : "Relax in a quiet VIP lounge suite or step directly into your chauffeured vehicle waiting outside.",
    },
    {
      num: "06",
      title: "Dedicated After-Care",
      desc: "Our operations team stays in touch until you safely board your flight or reach your final destination.",
    },
  ];

  return (
    <section className="relative px-6 py-20 md:px-14 md:py-28 bg-[#faf8f5] border-b border-slate-200">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto">
          <p
            className="text-[11px] uppercase tracking-[0.35em] text-lime-700 font-bold"
            style={mono}
          >
            THE GUEST JOURNEY
          </p>
          <h2
            className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-slate-950 tracking-tight"
            style={display}
          >
            Six steps. <span className="text-lime-600">One signature standard.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            From booking to final arrival, enjoy a smooth journey and welcoming hospitality.
          </p>
        </div>

        {/* 6 Steps Linear Progression: Clean, open, box-free layout */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-12">
          {steps.map((st) => (
            <div
              key={st.num}
              className="pt-6 border-t-2 border-slate-300 hover:border-lime-500 transition-colors duration-200 group"
            >
              <div className="flex items-center justify-between mb-4">
                <span
                  className="text-2xl font-bold font-mono text-lime-600 tracking-tight"
                  style={mono}
                >
                  {st.num}
                </span>
                <span
                  className="text-[10px] font-mono font-semibold uppercase tracking-widest text-slate-400"
                  style={mono}
                >
                  PHASE
                </span>
              </div>
              <h3
                className="text-lg font-bold text-slate-950 group-hover:text-lime-700 transition-colors"
                style={display}
              >
                {st.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {st.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Simple Clean Action Link */}
        <div className="mt-16 pt-8 text-center border-t border-slate-200">
          <a
            href="/#book"
            onClick={(e) => {
              const el = document.getElementById("book");
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-900 hover:text-lime-600 transition-colors cursor-pointer"
            style={mono}
          >
            <span>Ready to travel? Book your airport service</span>
            <ArrowRight className="w-4 h-4 text-lime-600" />
          </a>
        </div>
      </div>
    </section>
  );
}
