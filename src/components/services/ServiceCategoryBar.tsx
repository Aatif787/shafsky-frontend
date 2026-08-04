import React from "react";
import { motion } from "framer-motion";
import { SERVICE_CATEGORIES, ServiceCategoryId } from "@/data/servicesPlatformData";

interface ServiceCategoryBarProps {
  activeCategory: ServiceCategoryId;
  onSelectCategory: (id: ServiceCategoryId) => void;
  serviceCounts: Record<ServiceCategoryId, number>;
}

export const ServiceCategoryBar: React.FC<ServiceCategoryBarProps> = ({
  activeCategory,
  onSelectCategory,
  serviceCounts,
}) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 min-w-max px-1">
        {SERVICE_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          const Icon = cat.icon;
          const count = serviceCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`relative inline-flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-bold transition-all outline-none cursor-pointer ${
                isActive
                  ? "text-white shadow-lg shadow-purple-500/20"
                  : "text-slate-600 bg-white/70 hover:bg-white border border-[#e7e0d3] hover:text-slate-900"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeCategoryTabPill"
                  className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#7c3aed] to-[#6d28d9]"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <Icon className={`h-4 w-4 relative z-10 ${isActive ? "text-white" : "text-[#7c3aed]"}`} />
              <span className="relative z-10">{cat.name}</span>

              <span
                className={`relative z-10 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] font-extrabold font-mono ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
