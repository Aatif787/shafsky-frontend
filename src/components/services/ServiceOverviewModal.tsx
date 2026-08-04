import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import {
  X,
  CheckCircle2,
  Clock,
  UserCheck,
  FileCheck2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { PlatformService } from "@/data/servicesPlatformData";

interface ServiceOverviewModalProps {
  service: PlatformService | null;
  onClose: () => void;
}

export const ServiceOverviewModal: React.FC<ServiceOverviewModalProps> = ({
  service,
  onClose,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!service) return null;

  const Icon = service.icon;

  const handleBookNow = () => {
    onClose();
    navigate({
      to: "/book",
      search: {
        service_id: service.bookingServiceId,
      } as any,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl bg-[#faf8f5] border border-[#e7e0d3] shadow-2xl p-6 sm:p-8 md:p-10"
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full bg-slate-200/60 hover:bg-slate-300/80 text-slate-700 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-4 pr-10">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#7c3aed] text-white shadow-lg shadow-purple-500/30">
              <Icon className="h-7 w-7" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-[#7c3aed] font-mono">
                <Sparkles className="h-3 w-3" />
                {service.categoryName}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
                {service.name}
              </h2>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                {service.oneLiner}
              </p>
            </div>
          </div>

          {/* Key Badges Strip */}
          <div className="mt-6 flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-white border border-[#e7e0d3]">
            <div className="text-xs font-bold text-emerald-700 font-mono">
              {service.startingPrice}
            </div>

            {service.badge && (
              <>
                <div className="h-4 w-px bg-slate-200" />
                <div className="text-xs font-extrabold uppercase text-[#7c3aed] font-mono">
                  {service.badge}
                </div>
              </>
            )}
          </div>

          {/* Modal Sections */}
          <div className="mt-6 space-y-6 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Overview */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Service Overview
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-700 bg-white p-4 rounded-2xl border border-[#e7e0d3]">
                {service.overview}
              </p>
            </div>

            {/* Included Features */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Included Features
              </h3>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {service.includedFeatures.map((ft, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-white border border-[#e7e0d3] text-xs font-semibold text-slate-800"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <span>{ft}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Who is this for & Requirements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#e7e0d3]">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-mono uppercase mb-2">
                  <UserCheck className="h-4 w-4 text-[#7c3aed]" />
                  <span>Who Is This For?</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {service.whoIsThisFor}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#e7e0d3]">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 font-mono uppercase mb-2">
                  <FileCheck2 className="h-4 w-4 text-[#7c3aed]" />
                  <span>Requirements</span>
                </div>
                <ul className="space-y-1">
                  {service.requirements.map((req, i) => (
                    <li key={i} className="text-xs text-slate-600 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#7c3aed]" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="mt-8 pt-5 border-t border-[#e7e0d3] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Uses official Shafsky booking engine</span>
            </div>

            <button
              type="button"
              onClick={handleBookNow}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-8 py-3.5 text-xs font-extrabold tracking-widest uppercase shadow-lg shadow-purple-500/25 transition active:scale-98 cursor-pointer"
            >
              <span>Book {service.name}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
