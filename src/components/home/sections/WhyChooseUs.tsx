import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Headphones, Award, Globe2, Clock, Sparkles, Plane, Users } from "lucide-react";
import { C, display, mono } from "../theme";

export function WhyChooseUs() {
  const items = [
    {
      icon: Clock,
      title: "Zero Waiting & Fast-Track",
      body: "Skip long airport queues. We take care of your check-in, security, and luggage so you breeze right through.",
    },
    {
      icon: Headphones,
      title: "24/7 Always-On Support",
      body: "Have a question or flight update? Our friendly team is always just one quick call or WhatsApp message away.",
    },
    {
      icon: Sparkles,
      title: "Warm & Caring Hosts",
      body: "Your personal host welcomes you with a warm smile, carries your bags, and guides you step-by-step.",
    },
    {
      icon: Award,
      title: "VIP Lounge Relaxation",
      body: "Rest in quiet luxury lounges with gourmet food, refreshing drinks, and high-speed Wi-Fi before boarding.",
    },
    {
      icon: ShieldCheck,
      title: "100% Safe & Private",
      body: "Top-tier safety and complete privacy for you and your family on every flight and ground journey.",
    },
    {
      icon: Plane,
      title: "Private Jets On-Demand",
      body: "Fly on your own schedule to any city without commercial crowds, delays, or stress.",
    },
    {
      icon: Users,
      title: "Luxury Doorstep Cars",
      body: "Clean, chauffeured luxury cars waiting right outside the terminal to take you smoothly to your hotel or home.",
    },
    {
      icon: Globe2,
      title: "All-in-One Easy Booking",
      body: "Airport hospitality, luxury hotel stays, ground cars, and flights booked together in one simple place.",
    },
  ];

  return (
    <section
      id="why"
      className="relative px-6 py-16 md:px-14 md:py-28 bg-white border-b border-slate-200"
    >
      <div className="mx-auto max-w-[1480px]">
        <div className="text-center max-w-3xl mx-auto">
          <div
            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em] text-lime-700 font-bold"
            style={mono}
          >
            <span className="h-px w-10 bg-lime-500" />
            THE SHAFSKY PROMISE
            <span className="h-px w-10 bg-lime-500" />
          </div>
          <h2
            className="mx-auto mt-4 text-[clamp(2.2rem,5vw,4.2rem)] leading-[1.08] text-slate-950 font-bold tracking-tight"
            style={display}
          >
            Travel Made <span className="text-lime-600 font-bold">Effortless & Simple.</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed font-normal">
            Skip the airport stress — we handle every detail so you can just relax and enjoy your journey.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: (i % 4) * 0.05 }}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-slate-50/80 border border-slate-200 p-7 shadow-xs hover:border-lime-500 hover:shadow-lg hover:shadow-lime-500/10 transition-all duration-300"
              >
                <div>
                  <div
                    className="grid h-12 w-12 place-items-center rounded-xl bg-lime-50 border border-lime-300 text-lime-700 shadow-xs transition-all duration-300 group-hover:bg-slate-950 group-hover:text-lime-400 group-hover:border-slate-800"
                  >
                    <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold leading-tight text-slate-950" style={display}>
                    {it.title}
                  </h3>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600 font-normal">
                    {it.body}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
