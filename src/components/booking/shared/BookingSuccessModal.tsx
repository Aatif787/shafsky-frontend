import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, PhoneCall, MessageSquare, ArrowRight, X, Clock, ShieldCheck } from "lucide-react";
import { display, mono } from "@/components/home/theme";

interface BookingSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  referenceId: string;
  serviceTitle: string;
  subServiceTitle: string;
  summaryItems: { label: string; value: string }[];
  customerName: string;
  customerPhone: string;
  whatsAppUrl: string;
  isQuoteRequest?: boolean;
}

export function BookingSuccessModal({
  isOpen,
  onClose,
  referenceId,
  serviceTitle,
  subServiceTitle,
  summaryItems,
  customerName,
  customerPhone,
  whatsAppUrl,
  isQuoteRequest = false,
}: BookingSuccessModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 w-full max-w-xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 overflow-hidden max-h-[90vh] flex flex-col justify-between"
        >
          {/* Header */}
          <div>
            <div className="flex items-start justify-between pb-5 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="text-[10.5px] font-mono font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    {isQuoteRequest ? "Quote Request Received" : "Reservation Request Submitted"}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-950 mt-0.5" style={display}>
                    {serviceTitle}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Reference Badge */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">
                  Shafsky Booking Reference
                </div>
                <div className="text-lg font-mono font-bold text-slate-950 mt-0.5 tracking-wider">
                  {referenceId}
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-[#b38a2e] text-xs font-mono font-bold">
                <Clock size={12} />
                <span>Duty Officer Dispatched</span>
              </div>
            </div>

            {/* Structured Summary Items */}
            <div className="mt-5 space-y-2 max-h-[30vh] overflow-y-auto pr-1">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">
                Requested Service Summary:
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Service Category</span>
                  <span className="font-semibold text-slate-900">{serviceTitle}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Selected Option</span>
                  <span className="font-semibold text-slate-900">{subServiceTitle}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Lead Guest</span>
                  <span className="font-semibold text-slate-900">{customerName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Phone Contact</span>
                  <span className="font-semibold text-slate-900">{customerPhone}</span>
                </div>
                {summaryItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between py-1 border-b border-slate-200/60 last:border-0">
                    <span className="text-slate-500">{item.label}</span>
                    <span className="font-semibold text-slate-900 text-right max-w-[60%] truncate">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-200 font-mono"
            >
              <MessageSquare size={16} />
              <span>Connect on WhatsApp</span>
            </a>

            <a
              href="tel:+919599087959"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition font-mono"
            >
              <PhoneCall size={14} className="text-[#d4af37]" />
              <span>Call 24/7 Operations</span>
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
