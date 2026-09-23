import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, MessageSquare, PhoneCall } from "lucide-react";
import { display, mono } from "../theme";
import { HOMEPAGE_FAQS } from "@/lib/site-content";
import { ICICI_REVIEW_MODE } from "@/lib/config/reviewMode";

export function FAQ() {
  const allFaqs = HOMEPAGE_FAQS;
  const faqs = ICICI_REVIEW_MODE
    ? allFaqs.filter((f) => !f.q.toLowerCase().includes("charter") && !f.a.toLowerCase().includes("charter"))
    : allFaqs;

  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative px-4 py-16 sm:px-8 sm:py-24 md:px-14 md:py-32 bg-white border-b border-slate-200">
      <div className="mx-auto grid max-w-[1480px] gap-12 lg:gap-16 lg:grid-cols-12">
        {/* Left Column: Title & 24/7 Support Info */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div
              className="inline-flex items-center gap-2.5 text-[10px] uppercase tracking-[0.35em] text-lime-700 font-bold"
              style={mono}
            >
              <span className="h-px w-8 bg-lime-500" />
              <span>SHAFSKY AVIATION SERVICES</span>
              <span className="text-slate-300">·</span>
              <span>FREQUENTLY ASKED</span>
            </div>
            <h2
              className="mt-4 text-[clamp(2.2rem,4.5vw,3.8rem)] leading-[1.05] text-slate-950 font-bold tracking-tight"
              style={display}
            >
              Everything you need to know about{" "}
              <span className="text-lime-600 font-bold">
                our airport services.
              </span>
            </h2>
            <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-600 leading-relaxed font-normal max-w-md">
              Have questions about your upcoming trip or need arrangements for a large group? Our team is available 24/7.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 space-y-3">
            <a
              href="tel:+919599087959"
              className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-lime-700 transition-colors"
              style={mono}
            >
              <PhoneCall size={15} className="text-lime-600" />
              <span>24/7 Operations: +91 9599087959</span>
            </a>
            <div className="block">
              <a
                href="https://wa.me/919599087959"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-lime-700 transition-colors"
                style={mono}
              >
                <MessageSquare size={15} className="text-lime-600" />
                <span>WhatsApp Service Desk</span>
              </a>
            </div>
          </div>
        </div>

        {/* Right Column: Accordion Items */}
        <div className="lg:col-span-7 space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={faq.q}
                className="rounded-2xl bg-slate-50/80 border border-slate-200 transition-all duration-300 overflow-hidden shadow-xs hover:border-lime-500 hover:shadow-md hover:shadow-lime-500/10"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 p-6 text-left cursor-pointer"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-4">
                    <span
                      className="text-[11px] font-mono text-lime-700 font-bold"
                      style={mono}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="text-base sm:text-lg text-slate-950 font-bold"
                      style={display}
                    >
                      {faq.q}
                    </span>
                  </span>
                  <span className="h-8 w-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-lime-700 shrink-0">
                    {isOpen ? <Minus size={14} /> : <Plus size={14} />}
                  </span>
                </button>

                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-6 pl-14 text-xs sm:text-sm leading-relaxed text-slate-600 font-normal">
                    {faq.a}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
