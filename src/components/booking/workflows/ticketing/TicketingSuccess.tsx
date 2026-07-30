import React from "react";
import { BookingSuccessPass } from "../../shared/BookingSuccessPass";
import { MessageCircle, Phone, Mail, Clock, ShieldCheck, UserCheck } from "lucide-react";

interface TicketingSuccessProps {
  bookingRef: string;
  routeSummary: string;
  guestSummary: string;
}

export function TicketingSuccess({ bookingRef, routeSummary, guestSummary }: TicketingSuccessProps) {
  return (
    <div className="space-y-6">
      <BookingSuccessPass
        badge="Concierge Request Received"
        title="Flight Request Submitted Successfully"
        subtitle={`Our senior ticketing specialists are fetching live offline GDS & airline portal quotes for ${routeSummary}.`}
        bookingRef={bookingRef}
        guestSummary={guestSummary}
      />

      {/* Premium Concierge Fulfillment & SLA Banner */}
      <div className="p-6 rounded-[28px] bg-slate-900 text-white space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-serif font-bold text-slate-100">Dedicated Travel Specialist Assigned</h3>
              <span className="text-xs text-slate-400 font-mono">White-Glove Offline Flight Desk</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-mono font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Guaranteed Response: Within 15–30 Mins</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          We operate a luxury concierge model. To secure preferential fares and custom seat blocks, our internal team fetches live prices offline via secure partner GDS systems. You will receive curated options directly via WhatsApp and Email.
        </p>

        {/* 24/7 Support Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <a
            href="https://wa.me/447700900077"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 flex items-center gap-3 transition-all"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-xs font-bold block text-slate-100">WhatsApp Desk</span>
              <span className="text-[10px] text-slate-400 font-mono">Instant Response</span>
            </div>
          </a>

          <a
            href="tel:+447700900077"
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 flex items-center gap-3 transition-all"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-xs font-bold block text-slate-100">Priority Hotline</span>
              <span className="text-[10px] text-slate-400 font-mono">+44 7700 900077</span>
            </div>
          </a>

          <a
            href="mailto:concierge@shafskyaviation.com"
            className="p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 flex items-center gap-3 transition-all"
          >
            <Mail className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="text-xs font-bold block text-slate-100">Concierge Email</span>
              <span className="text-[10px] text-slate-400 font-mono">24/7 Desk Support</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
