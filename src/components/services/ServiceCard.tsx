import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "@tanstack/react-router";
import { Clock, ArrowRight, Info, CheckCircle2 } from "lucide-react";
import { PlatformService } from "@/data/servicesPlatformData";

interface ServiceCardProps {
  service: PlatformService;
  onSelectLearnMore: (service: PlatformService) => void;
  index: number;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  onSelectLearnMore,
  index,
}) => {
  const navigate = useNavigate();
  const Icon = service.icon;

  const handleBookNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({
      to: "/book",
      search: {
        service_id: service.bookingServiceId,
      } as any,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      viewport={{ once: true }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: (index % 4) * 0.05 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white/85 backdrop-blur-md border border-[#e7e0d3] p-5 sm:p-6 shadow-[0_4px_20px_rgba(15,23,42,0.03)] hover:shadow-[0_16px_40px_rgba(15,23,42,0.08)] hover:border-[#7c3aed]/40 transition-all duration-300"
    >
      {/* Top Specular Sheen Glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-gradient-to-br from-[#7c3aed]/10 via-[#84cc16]/10 to-transparent blur-2xl group-hover:scale-125 transition-transform duration-500" />

      <div>
        {/* Header Strip: Icon + Category Badge */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#f8f6f0] to-[#eae4d5] text-[#7c3aed] border border-white shadow-sm group-hover:scale-110 group-hover:bg-[#7c3aed] group-hover:text-white transition-all duration-300">
            <Icon className="h-5 w-5" />
          </div>

          <span className="inline-flex items-center rounded-full bg-[#faf8f3] border border-[#e7e0d3] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-700 font-mono">
            {service.categoryName}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-extrabold text-slate-900 tracking-tight group-hover:text-[#7c3aed] transition-colors">
          {service.name}
        </h3>

        {/* 1-Line Explanation (Plain English) */}
        <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2 min-h-[36px]">
          {service.oneLiner}
        </p>

        {/* Badges: Starting Price & Category Tag */}
        <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
          <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200/60 font-mono">
            {service.startingPrice}
          </div>

          {service.badge && (
            <div className="text-[9px] font-extrabold uppercase tracking-wider text-[#7c3aed] bg-purple-50 px-2 py-1 rounded-md border border-purple-200/60 font-mono">
              {service.badge}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons: Learn More + Book Now */}
      <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={() => onSelectLearnMore(service)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-3 text-xs font-bold transition active:scale-98 cursor-pointer"
        >
          <Info className="h-3.5 w-3.5" />
          <span>Learn More</span>
        </button>

        <button
          type="button"
          onClick={handleBookNow}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-2.5 px-3 text-xs font-extrabold tracking-wide shadow-md shadow-purple-500/20 transition active:scale-98 cursor-pointer"
        >
          <span>Book Now</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
