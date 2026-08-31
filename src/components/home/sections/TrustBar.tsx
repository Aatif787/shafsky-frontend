import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ShieldCheck, Globe2, Users, Clock } from "lucide-react";
import { C, mono, display } from "../theme";

function Counter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1600;
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setV(Math.round(end * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, end]);

  return (
    <span ref={ref} className="inline-flex items-baseline font-serif" style={display}>
      <span className="font-bold tracking-tight text-slate-950">{v.toLocaleString()}</span>
      <span className="text-2xl sm:text-3xl font-extrabold text-lime-600 ml-1 font-sans">{suffix}</span>
    </span>
  );
}

export function TrustBar() {
  const stats = [
    { n: 100, suf: "%", l: "Reliability", sub: "DGCA compliant airside safety record", Icon: ShieldCheck },
    { n: 20, suf: "+", l: "Airports", sub: "Live Indian hub operations", Icon: Globe2 },
    { n: 42000, suf: "+", l: "Guests", sub: "Welcomed across our network", Icon: Users },
    { n: 12, suf: "min", l: "Response", sub: "Average 24/7 dispatch timeline", Icon: Clock },
  ];

  return (
    <section className="relative px-6 py-12 md:px-14 md:py-16 bg-white border-y border-slate-100">
      <div className="mx-auto grid max-w-[1480px] grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
        {stats.map(({ n, suf, l, sub, Icon }, i) => (
          <motion.div
            key={l}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-slate-50/80 border border-slate-200/80 p-6 md:p-7 shadow-xs hover:border-lime-400 hover:shadow-md hover:shadow-lime-500/10 transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div
                  className="grid h-11 w-11 place-items-center rounded-xl bg-lime-50 border border-lime-300 text-lime-700 transition-transform duration-300 group-hover:scale-105"
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="text-3xl sm:text-4xl md:text-5xl leading-none">
                <Counter end={n} suffix={suf} />
              </div>

              <div
                className="mt-4 text-[10.5px] uppercase tracking-[0.25em] font-mono font-bold text-lime-700"
                style={mono}
              >
                {l}
              </div>

              <div className="mt-1 text-xs text-slate-600 font-normal">
                {sub}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
