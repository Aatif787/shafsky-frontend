import React from "react";
import { Link } from "@tanstack/react-router";
import { Plane, PhoneCall, Mail, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { useBranding } from "@/lib/branding/branding.context";
import { C, display, mono } from "../theme";

export function Footer() {
  const { branding } = useBranding();

  return (
    <footer className="relative px-4 sm:px-8 pb-12 pt-16 sm:pt-20 md:px-14 bg-[#03070e] text-white border-t border-[#c5a869]/25">
      <div className="relative mx-auto max-w-[1480px]">
        <div className="grid gap-10 md:gap-16 pb-12 md:grid-cols-12 border-b border-white/10">
          {/* Column 1: Brand & Headquarters */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-11 w-11 rounded-xl bg-[#0a1424] border border-[#c5a869]/40 p-1 shadow-md">
                <img
                  src={branding.logo_url || "/logo.png"}
                  alt={branding.company_name || "Shafsky Aviation Services"}
                  className="h-full w-full object-contain filter brightness-110"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
              <div>
                <div className="text-xl font-bold font-serif tracking-tight text-white" style={display}>
                  SHAFSKY
                </div>
                <div className="text-[9px] uppercase tracking-[0.35em] text-[#c5a869] font-mono -mt-1 font-semibold" style={mono}>
                  Aviation Services
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs sm:text-sm text-slate-300 leading-relaxed font-light max-w-sm">
              Official Aviation Ground Operations & Airport Services Partner based at IGI Airport Terminal 1, New Delhi. Delivering bespoke airside hospitality and executive private charters since 2022.
            </p>

            <div className="mt-6 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin size={15} className="text-[#c5a869] shrink-0 mt-0.5" />
                <span>8/5, Ground Floor, West Mehram Nagar Gate No.1, Opp. IGI Airport Terminal 1, New Delhi 110010</span>
              </div>
              <div className="flex items-center gap-2.5">
                <PhoneCall size={14} className="text-[#c5a869] shrink-0" />
                <a href="tel:+919599087959" className="hover:text-[#d9c18b] font-mono" style={mono}>
                  +91 9599087959 (24/7 Operations Desk)
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-[#c5a869] shrink-0" />
                <a href="mailto:ops@shafsky.com" className="hover:text-[#d9c18b]">
                  ops@shafsky.com
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Links Columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:col-span-8">
            {/* Column 2: Airport Services */}
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-[#d9c18b] font-bold" style={mono}>
                Airport Services
              </div>
              <ul className="mt-5 space-y-2.5 text-xs sm:text-[13px] text-slate-300">
                <li>
                  <Link to="/solutions/concierge" className="transition hover:text-white">
                    Meet & Greet Escort
                  </Link>
                </li>
                <li>
                  <Link to="/solutions/concierge" className="transition hover:text-white">
                    Passport Fast-Track
                  </Link>
                </li>
                <li>
                  <Link to="/solutions/concierge" className="transition hover:text-white">
                    Executive Lounge Access
                  </Link>
                </li>
                <li>
                  <Link to="/solutions/travel" className="transition hover:text-white">
                    Airside Tarmac Sedans
                  </Link>
                </li>
                <li>
                  <Link to="/airports" className="transition hover:text-[#d9c18b] font-semibold">
                    All 20+ Airport Hubs →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Private Aviation & Logistics */}
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-[#d9c18b] font-bold" style={mono}>
                Aviation Solutions
              </div>
              <ul className="mt-5 space-y-2.5 text-xs sm:text-[13px] text-slate-300">
                <li>
                  <Link to="/charter" className="transition hover:text-white">
                    Private Jet Charter
                  </Link>
                </li>
                <li>
                  <Link to="/charter" className="transition hover:text-white">
                    Helicopter Transfers
                  </Link>
                </li>
                <li>
                  <Link to="/solutions/medical" className="transition hover:text-white">
                    24/7 ICU Air Ambulance
                  </Link>
                </li>
                <li>
                  <Link to="/solutions/cargo" className="transition hover:text-white">
                    AVI Pet Transport
                  </Link>
                </li>
                <li>
                  <Link to="/solutions/cargo" className="transition hover:text-white">
                    Express Cargo Logistics
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Trust, Governance & Verification */}
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-[#d9c18b] font-bold" style={mono}>
                Governance & Trust
              </div>
              <ul className="mt-5 space-y-2.5 text-xs sm:text-[13px] text-slate-300">
                <li>
                  <Link to="/flight-verification" className="transition hover:text-[#d9c18b]">
                    Flight & PNR Status
                  </Link>
                </li>
                <li>
                  <Link to="/services/guide" className="transition hover:text-white">
                    Standards & Heritage
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="transition hover:text-white">
                    Duty Manager Contact
                  </Link>
                </li>
                <li>
                  <Link to="/account" className="transition hover:text-white">
                    VIP Client Portal
                  </Link>
                </li>
                <li>
                  <Link to="/services/guide" className="transition hover:text-white">
                    Terms & Privacy Protocol
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Legal Copyright Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Shafsky Aviation Services Pvt. Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400" style={mono}>
            <ShieldCheck size={14} className="text-[#c5a869]" />
            <span>DGCA Security Protocol & Airside Clearance Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
