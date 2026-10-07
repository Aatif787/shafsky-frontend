import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Plus, Minus, MessageSquare, PhoneCall, ArrowRight } from "lucide-react";
import { HOMEPAGE_FAQS } from "@/lib/site-content";
import { ICICI_REVIEW_MODE } from "@/lib/config/reviewMode";

export function FAQ() {
  const allFaqs = HOMEPAGE_FAQS;
  const faqs = ICICI_REVIEW_MODE
    ? allFaqs.filter((f) => !f.q.toLowerCase().includes("charter") && !f.a.toLowerCase().includes("charter"))
    : allFaqs;

  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="relative px-4 py-20 sm:px-8 sm:py-28 md:px-12 bg-white border-b border-slate-200">
      <div className="mx-auto max-w-4xl">
        {/* Upper Side Header (Classical & Centered) */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center justify-center gap-2.5 text-[11px] uppercase tracking-[0.3em] text-lime-700 font-semibold font-mono">
            <span className="h-px w-6 bg-lime-600/50" />
            <span>SHAFSKY AVIATION SERVICES</span>
            <span className="text-slate-300">·</span>
            <span>FAQ</span>
            <span className="h-px w-6 bg-lime-600/50" />
          </div>

          <h2 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-slate-950 font-raleway leading-[1.15]">
            Frequently Asked{" "}
            <span className="text-lime-700 font-bold">
              Questions
            </span>
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Need help with your trip? We're here 24/7.
          </p>
        </div>

        {/* Accordion List (Classical & Simple Hairline Design) */}
        <div className="border-t border-slate-200 divide-y divide-slate-200">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={faq.q} className="transition-colors">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-6 py-5 sm:py-6 text-left cursor-pointer group"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <div className="flex items-start sm:items-center gap-3.5 sm:gap-5 min-w-0">
                    <span className="text-xs sm:text-sm font-mono text-lime-700 font-semibold shrink-0 pt-0.5 sm:pt-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base sm:text-lg md:text-[18px] text-slate-900 font-semibold font-raleway leading-snug group-hover:text-lime-700 transition-colors">
                      {faq.q}
                    </span>
                  </div>

                  <span
                    className={`h-7 w-7 sm:h-8 sm:w-8 rounded-full border flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isOpen
                        ? "bg-lime-50 border-lime-600 text-lime-700"
                        : "bg-white border-slate-200 text-slate-400 group-hover:border-slate-300 group-hover:text-slate-700"
                    }`}
                  >
                    {isOpen ? <Minus size={13} strokeWidth={2.2} /> : <Plus size={13} strokeWidth={2.2} />}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-6 pl-7 sm:pl-10 space-y-4">
                        <p className="text-sm sm:text-base leading-relaxed text-slate-600 font-normal">
                          {faq.a}
                        </p>

                        {"cta" in faq && faq.cta && (
                          <div className="pt-1">
                            {faq.cta.external ? (
                              <a
                                href={faq.cta.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-lime-700 transition-colors shadow-xs group/btn cursor-pointer"
                              >
                                <span>{faq.cta.label}</span>
                                <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
                              </a>
                            ) : (
                              <a
                                href={faq.cta.href}
                                onClick={(e) => {
                                  if (faq.cta?.href === "/#book" || faq.cta?.href === "#book") {
                                    const el = document.getElementById("book");
                                    if (el) {
                                      e.preventDefault();
                                      el.scrollIntoView({ behavior: "smooth", block: "start" });
                                      window.history.replaceState(null, "", "#book");
                                    }
                                  }
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs sm:text-sm font-semibold hover:bg-lime-700 transition-colors shadow-xs group/btn cursor-pointer"
                              >
                                <span>{faq.cta.label}</span>
                                <ArrowRight size={14} className="transition-transform group-hover/btn:translate-x-0.5" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Bottom Concierge & Support Line */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="text-sm font-semibold text-slate-900 font-raleway">
              Need assistance or special arrangements?
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Our 24/7 flight operations desk is ready to assist your journey.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:+919599087959"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase tracking-wider text-slate-800 hover:text-lime-700 hover:border-lime-500/50 transition-colors font-mono"
            >
              <PhoneCall size={13} className="text-lime-600" />
              <span>+91 9599087959</span>
            </a>
            <a
              href="https://wa.me/919599087959"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold uppercase tracking-wider text-slate-800 hover:text-lime-700 hover:border-lime-500/50 transition-colors font-mono"
            >
              <MessageSquare size={13} className="text-lime-600" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
