import { Link } from "@tanstack/react-router";
import { PhoneCall, Mail, MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";
import { useBranding } from "@/lib/branding/branding.context";
import { display, mono } from "../theme";

export function Footer() {
  const { branding } = useBranding();

  return (
    <footer className="relative px-6 sm:px-10 pb-12 pt-16 sm:pt-20 md:px-16 bg-[#0a0416] text-[#FDFBF7] overflow-hidden border-t border-violet-500/25">
      {/* Pure Violet & Lime Ambient Atmospheric Lighting */}
      <div
        className="absolute inset-0 pointer-events-none select-none overflow-hidden"
        aria-hidden="true"
      >
        {/* Pure Violet Celestial Glow Aura at Top Center */}
        <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[760px] h-[320px] bg-violet-600/20 rounded-full blur-[110px]" />
        
        {/* Subtle Pure Violet Corner Light */}
        <div className="absolute top-1/3 -right-24 w-[380px] h-[280px] bg-violet-700/15 rounded-full blur-[90px]" />

        {/* Subtle Lime Green Ambient Accent Glow at Bottom Left */}
        <div className="absolute -bottom-20 -left-20 w-[340px] h-[300px] bg-lime-400/10 rounded-full blur-[100px]" />

        {/* Luminous Gradient Accent Line on Top Border (Pure Violet to Lime to Pure Violet) */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
        <div className="absolute top-0 left-1/3 w-48 h-[1.5px] bg-gradient-to-r from-transparent via-lime-400/80 to-transparent blur-[0.5px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1380px]">
        {/* Main Grid: Streamlined Content */}
        <div className="grid gap-12 lg:gap-16 pb-14 md:grid-cols-12 border-b border-violet-500/20">
          {/* Brand & Mission (5 Cols) */}
          <div className="md:col-span-6 lg:col-span-5 flex flex-col justify-between">
            <div>
              {/* Brand Header */}
              <div className="flex items-center gap-3.5">
                <div className="flex items-center justify-center h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-950/90 to-[#120726] border border-violet-400/35 p-1.5 shadow-[0_4px_20px_rgba(124,58,237,0.3)]">
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
                  <div
                    className="text-2xl font-bold tracking-tight text-[#FDFBF7]"
                    style={display}
                  >
                    SHAFSKY
                  </div>
                  <div
                    className="text-[9.5px] uppercase tracking-[0.38em] text-lime-400 font-mono -mt-0.5 font-bold flex items-center gap-1.5"
                    style={mono}
                  >
                    <span>AVIATION SERVICES</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse shadow-[0_0_8px_#a3e635]" />
                  </div>
                </div>
              </div>

              {/* Refined Concise Tagline in Warm Luxury Cream */}
              <p className="mt-5 text-sm sm:text-[15px] text-[#EDE8DF]/90 leading-relaxed font-normal max-w-md">
                India’s premier airside hospitality and private charter concierge. Seamless protocol, VIP tarmac escorts, and bespoke flights across 20+ national hubs and global destinations.
              </p>
            </div>

            {/* Direct 24/7 Contact Strip */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="tel:+919599087959"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-violet-950/60 hover:bg-violet-900/70 border border-violet-400/30 text-xs font-mono font-medium text-[#FDFBF7] transition-all hover:border-lime-400 hover:shadow-[0_0_20px_rgba(163,230,53,0.25)] group"
                style={mono}
              >
                <div className="h-6 w-6 rounded-full bg-lime-400/20 flex items-center justify-center text-lime-400 group-hover:bg-lime-400 group-hover:text-black transition-colors">
                  <PhoneCall size={12} />
                </div>
                <span>+91 9599087959</span>
              </a>

              <a
                href="mailto:ops@shafsky.com"
                className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-violet-950/60 hover:bg-violet-900/70 border border-violet-400/30 text-xs font-mono font-medium text-[#FDFBF7] transition-all hover:border-violet-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.35)] group"
                style={mono}
              >
                <div className="h-6 w-6 rounded-full bg-violet-500/25 flex items-center justify-center text-violet-300 group-hover:bg-violet-400 group-hover:text-black transition-colors">
                  <Mail size={12} />
                </div>
                <span>ops@shafsky.com</span>
              </a>

              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-[#EDE8DF]/75">
                <MapPin size={12} className="text-lime-400 shrink-0" />
                <span>IGI T1, New Delhi</span>
              </div>
            </div>
          </div>

          {/* Streamlined Columns (7 Cols) */}
          <div className="md:col-span-6 lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-10 lg:pl-6">
            {/* Column 1: Core Solutions */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-violet-950/40 to-transparent border border-violet-500/20 backdrop-blur-xs">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 shadow-[0_0_6px_#a3e635]" />
                <span
                  className="text-[11px] uppercase tracking-[0.25em] text-lime-400 font-bold font-mono"
                  style={mono}
                >
                  Core Solutions
                </span>
              </div>

              <ul className="space-y-3.5 text-sm">
                <li>
                  <Link
                    to="/solutions/concierge"
                    className="flex items-center justify-between group text-[#EDE8DF]/90 hover:text-[#FDFBF7] transition-all"
                  >
                    <span className="group-hover:translate-x-1.5 transition-transform">
                      Meet & Greet Concierge
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="text-violet-400 opacity-60 group-hover:opacity-100 group-hover:text-lime-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/charter"
                    className="flex items-center justify-between group text-[#EDE8DF]/90 hover:text-[#FDFBF7] transition-all"
                  >
                    <span className="group-hover:translate-x-1.5 transition-transform">
                      Private Jet & Heli Charter
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="text-violet-400 opacity-60 group-hover:opacity-100 group-hover:text-lime-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/solutions/travel"
                    className="flex items-center justify-between group text-[#EDE8DF]/90 hover:text-[#FDFBF7] transition-all"
                  >
                    <span className="group-hover:translate-x-1.5 transition-transform">
                      VIP Lounge & Tarmac Sedans
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="text-violet-400 opacity-60 group-hover:opacity-100 group-hover:text-lime-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/airports"
                    className="flex items-center justify-between group text-lime-400 hover:text-lime-300 font-medium pt-1.5 transition-colors"
                  >
                    <span className="group-hover:translate-x-1.5 transition-transform font-mono text-xs tracking-wider uppercase" style={mono}>
                      All 20+ Airport Hubs →
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    />
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Quick Access & Verification */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-violet-950/40 to-transparent border border-violet-500/20 backdrop-blur-xs">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_6px_#a78bfa]" />
                <span
                  className="text-[11px] uppercase tracking-[0.25em] text-violet-300 font-bold font-mono"
                  style={mono}
                >
                  Quick Access
                </span>
              </div>

              <ul className="space-y-3.5 text-sm">
                <li>
                  <a
                    href="/#book"
                    onClick={(e) => {
                      const el = document.getElementById("book");
                      if (el) {
                        e.preventDefault();
                        el.scrollIntoView({ behavior: "smooth", block: "center" });
                      }
                    }}
                    className="flex items-center justify-between group text-[#EDE8DF]/90 hover:text-[#FDFBF7] transition-all cursor-pointer"
                  >
                    <span className="group-hover:translate-x-1.5 transition-transform">
                      Instant Booking Desk
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="text-violet-400 opacity-60 group-hover:opacity-100 group-hover:text-lime-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    />
                  </a>
                </li>
                <li>
                  <Link
                    to="/flight-verification"
                    className="flex items-center justify-between group text-[#EDE8DF]/90 hover:text-[#FDFBF7] transition-all"
                  >
                    <span className="group-hover:translate-x-1.5 transition-transform">
                      Flight & PNR Status
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="text-violet-400 opacity-60 group-hover:opacity-100 group-hover:text-lime-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="flex items-center justify-between group text-[#EDE8DF]/90 hover:text-[#FDFBF7] transition-all"
                  >
                    <span className="group-hover:translate-x-1.5 transition-transform">
                      Duty Manager Contact
                    </span>
                    <ArrowUpRight
                      size={14}
                      className="text-violet-400 opacity-60 group-hover:opacity-100 group-hover:text-lime-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                    />
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services/guide"
                    className="flex items-center justify-between group text-[#EDE8DF]/75 hover:text-white pt-1.5 transition-colors"
                  >
                    <span className="group-hover:translate-x-1.5 transition-transform text-xs font-mono" style={mono}>
                      Terms & Privacy Protocol
                    </span>
                    <ArrowUpRight
                      size={13}
                      className="text-violet-400 group-hover:text-white transition-all"
                    />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#EDE8DF]/70">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Shafsky Aviation Services Pvt. Ltd.</span>
            <span className="text-violet-500">·</span>
            <span className="text-[#EDE8DF]/80">All rights reserved.</span>
          </div>

          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-950/50 border border-violet-500/30 text-[11px] font-mono text-[#FDFBF7]"
            style={mono}
          >
            <ShieldCheck size={14} className="text-lime-400 shadow-[0_0_8px_#a3e635]" />
            <span>DGCA Security Protocol & Airside Clearance Compliant</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
