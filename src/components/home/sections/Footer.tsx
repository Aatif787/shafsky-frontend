import React from "react";
import { Link } from "@tanstack/react-router";
import { Plane } from "lucide-react";
import { useBranding } from "@/lib/branding/branding.context";
import { C, display, mono } from "../theme";

export function Footer() {
  const { branding } = useBranding();

  const nameParts = branding.company_name.split(" ");
  const firstPart = nameParts[0]?.toUpperCase() || "SHAFSKY";
  const restPart = nameParts.slice(1).join(" ")?.toUpperCase() || "AVIATION";

  return (
    <footer
      className="relative px-4 sm:px-8 pb-12 pt-14 sm:pt-16 md:px-14"
      style={{ background: C.tealDeep, color: "#fff" }}
    >
      <div className="relative mx-auto max-w-[1480px]">
        <div
          className="grid gap-8 sm:gap-10 md:gap-16 pb-10 sm:pb-12 md:grid-cols-12"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="md:col-span-5">
            <div className="flex items-center gap-3">
              {branding.logo_url ? (
                <img
                  src={branding.logo_light_url || branding.logo_url}
                  alt={branding.company_name}
                  className="h-10 sm:h-12 md:h-15 max-h-[64px] w-auto max-w-[min(280px,50vw)] object-contain scale-[1.5] sm:scale-[2.0] md:scale-[2.6] origin-left transition-all duration-300 transform-gpu hover:scale-[2.75]"
                />
              ) : (
                <>
                  <div
                    className="grid h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 place-items-center rounded-2xl shadow-md"
                    style={{ background: C.mint }}
                  >
                    <Plane className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 -rotate-45" style={{ color: C.tealDeep }} />
                  </div>
                  <div style={mono}>
                    <div className="text-base sm:text-xl md:text-2xl font-bold tracking-[0.28em]">{firstPart}</div>
                    <div className="mt-0.5 text-[8.5px] sm:text-[10px] tracking-[0.45em] text-white/60">
                      {restPart} · SUSWAGATAM
                    </div>
                  </div>
                </>
              )}
            </div>
            <h3 className="mt-6 sm:mt-8 text-[clamp(1.65rem,3vw,2.6rem)] leading-[1.08]" style={display}>
              {branding.company_tagline || "Welcome Begins Before You Land."}
            </h3>
            <p className="mt-4 sm:mt-5 max-w-md text-xs sm:text-[14px] leading-relaxed text-white/70">
              {branding.business_address}, {branding.city}, {branding.state}, {branding.country} -{" "}
              {branding.postal_code}
            </p>
            <p className="mt-2.5 sm:mt-3 text-xs sm:text-[14px] text-white/70" style={mono}>
              {branding.support_phone}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10 md:col-span-7">
            <div>
              <div className="text-[9.5px] sm:text-[10px] uppercase tracking-[0.35em] text-white/50" style={mono}>
                Services
              </div>

              <ul className="mt-5 space-y-3 text-[14px] text-white/80">
                <li>
                  <Link to="/services/guide" className="transition hover:text-white">
                    Meet & Greet
                  </Link>
                </li>
                <li>
                  <Link to="/services/guide" className="transition hover:text-white">
                    Lounge Access
                  </Link>
                </li>
                <li>
                  <Link to="/services/guide" className="transition hover:text-white">
                    Transport
                  </Link>
                </li>
                <li>
                  <Link to="/services/guide" className="transition hover:text-white">
                    Hotels
                  </Link>
                </li>
                <li>
                  <Link to="/services/guide" className="transition hover:text-white">
                    Concierge
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-white/50" style={mono}>
                Company
              </div>
              <ul className="mt-5 space-y-3 text-[14px] text-white/80">
                <li>
                  <Link to="/" className="transition hover:text-white">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/" className="transition hover:text-white">
                    Our Team
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="transition hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-white/50" style={mono}>
                Legal
              </div>
              <ul className="mt-5 space-y-3 text-[14px] text-white/80">
                <li>
                  <Link to="/" className="transition hover:text-white">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/" className="transition hover:text-white">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="transition hover:text-white">
                    Admin Console
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div
          className="mt-8 flex flex-wrap items-center justify-between gap-4 text-[11px] text-white/50"
          style={mono}
        >
          <div>{branding.copyright_text}</div>
          <div className="flex gap-5">
            {branding.facebook_url && (
              <a
                href={branding.facebook_url}
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
            )}
            {branding.twitter_url && (
              <a
                href={branding.twitter_url}
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitter
              </a>
            )}
            {branding.instagram_url && (
              <a
                href={branding.instagram_url}
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            )}
            {branding.linkedin_url && (
              <a
                href={branding.linkedin_url}
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            )}
            {branding.youtube_url && (
              <a
                href={branding.youtube_url}
                className="hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                YouTube
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
