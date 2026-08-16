import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ShieldCheck, Globe2, Users, Clock } from "lucide-react";
import { C, mono } from "../theme";

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
    <span ref={ref} className="inline-flex items-baseline font-serif">
      <span className="font-extrabold tracking-tight text-[#0b1a24]">{v.toLocaleString()}</span>
      <span className="text-2xl sm:text-3xl font-bold text-[#0c3b46] ml-1 font-sans">{suffix}</span>
    </span>
  );
}

export function TrustBar() {
  const stats = [
    { n: 100, suf: "%", l: "Reliability", sub: "Dispatch safety record", Icon: ShieldCheck },
    { n: 20, suf: "", l: "Airports", sub: "Indian network", Icon: Globe2 },
    { n: 42000, suf: "+", l: "Guests", sub: "Welcomed annually", Icon: Users },
    { n: 12, suf: "min", l: "Response", sub: "Average dispatch", Icon: Clock },
  ];

  return (
    <section className="relative px-6 py-14 md:px-14 md:py-24" style={{ background: C.bg }}>
      <div className="mx-auto grid max-w-[1480px] grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {stats.map(({ n, suf, l, sub, Icon }, i) => (
          <motion.div
            key={l}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -6 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-[#faf8f5] border border-white/80 p-7 shadow-[6px_6px_12px_rgba(200,188,170,0.5),-6px_-6px_12px_rgba(255,255,255,0.9)] transition-all duration-300 hover:shadow-[10px_10px_20px_rgba(190,178,160,0.6),-10px_-10px_20px_rgba(255,255,255,1)]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div
                  className="grid h-10 w-10 place-items-center rounded-xl bg-[#faf8f5] border border-white/80 shadow-[3px_3px_6px_rgba(200,188,170,0.5),-3px_-3px_6px_rgba(255,255,255,0.9)] text-[#0c3b46] transition-transform duration-300 group-hover:scale-105"
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>

              <div className="text-3xl sm:text-4xl md:text-5xl leading-none">
                <Counter end={n} suffix={suf} />
              </div>

              <div
                className="mt-4 text-[10px] uppercase tracking-[0.3em] font-mono font-bold text-[#0c3b46]"
                style={mono}
              >
                {l}
              </div>

              <div className="mt-1 text-xs text-[#576875] font-body-luxury">
                {sub}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
