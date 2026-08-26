import React from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";

interface BookingSuccessPassProps {
  title: string;
  subtitle: string;
  badge: string;
  bookingRef: string | null;
  guestSummary: string;
}

export function BookingSuccessPass({
  title,
  subtitle,
  badge,
  bookingRef,
  guestSummary,
}: BookingSuccessPassProps) {
  return (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 mx-auto shadow-sm">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div>
        <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold uppercase tracking-widest">
          {badge}
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif text-slate-900 font-bold mt-2">
          {title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 font-medium max-w-md mx-auto leading-relaxed font-sans mt-1">
          {subtitle}
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-slate-200 max-w-md mx-auto shadow-sm flex flex-col items-center">
        <div className="text-sm font-mono font-bold text-emerald-800 tracking-widest">
          REF: {bookingRef || "SHF-849201"}
        </div>
        {guestSummary && (
          <div className="text-xs text-slate-600 font-sans mt-1 font-medium">
            {guestSummary}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Link
          to="/"
          className="px-6 py-3 rounded-full bg-white border border-slate-200 text-slate-800 font-mono text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all shadow-xs"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
}
