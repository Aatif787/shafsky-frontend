import React from "react";
import { Link } from "@tanstack/react-router";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";
import { ICICI_REVIEW_MODE } from "../../../lib/config/reviewMode";

export function Footer() {
  const allQuickLinks = [
    { label: "About us", href: "/services/guide" },
    { label: "Contact us", href: "/contact" },
    { label: "My account", href: "/auth" },
    { label: "Our services", href: "/solutions/concierge" },
    { label: "Hotels", href: "/hotels/airport-hotel" },
    { label: "Blog", href: "/services/guide" },
    { label: "Wishlist", href: "/book" },
    { label: "Privacy policy", href: "/privacy-policy" },
    { label: "Terms and conditions", href: "/services/guide" },
    { label: "Cancellation and refund", href: "/cancellation-and-refund" },
    { label: "Our Team", href: "/services/guide" },
    { label: "Career", href: "/contact" },
  ];

  const quickLinks = ICICI_REVIEW_MODE
    ? allQuickLinks.filter((link) => link.label !== "Hotels" && !link.href.startsWith("/hotels"))
    : allQuickLinks;

  const socialLinks = [
    {
      label: "Facebook",
      href: "https://www.facebook.com/shafskyaviation/",
      icon: Facebook,
    },
    {
      label: "Twitter",
      href: "https://x.com/ShafskyAviation",
      icon: Twitter,
    },
    {
      label: "Instagram",
      href: "https://www.instagram.com/aviationshafsky/",
      icon: Instagram,
    },
    {
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/mohammad-shahood-shafsky",
      icon: Linkedin,
    },
    {
      label: "YouTube",
      href: "https://www.youtube.com/@shafskyaviation",
      icon: Youtube,
    },
  ];

  return (
    <footer className="relative w-full text-white font-serif overflow-hidden select-none">
      {/* Background Airplane Image & Atmospheric Dark Vignette */}
      <div
        className="relative w-full bg-[#11161d] bg-cover bg-center bg-no-repeat pt-14 pb-16 sm:pt-16 sm:pb-20 px-6 sm:px-10 lg:px-16"
        style={{
          backgroundImage: `url('/images/footer-plane-bg.webp')`,
        }}
      >
        {/* Soft Vignette Overlay matching reference image depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e131b]/80 via-[#0e131b]/65 to-[#090d13]/85 pointer-events-none" />

        {/* Content Container (3 Columns) */}
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* Column 1: About Us (md:col-span-5) */}
            <div className="md:col-span-5 space-y-5">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                About Us
              </h3>
              <p className="text-sm sm:text-[15px] text-white/95 leading-relaxed">
                We would like to introduce ourselves as Shafsky Aviation Services
                Pvt. Ltd. with brand name{" "}
                <span className="text-[#cca028] font-bold">
                  &ldquo;SUSWAGATAM&rdquo;
                </span>
                . &ldquo;Welcome &amp; Assist Services&rdquo; providing Meet
                &amp; Greet and Lounge Service to domestic and international
                passengers.
              </p>
            </div>

            {/* Column 2: Quick Links (md:col-span-3) */}
            <div className="md:col-span-3 space-y-5">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Quick Links
              </h3>
              <ul className="space-y-1.5 text-sm sm:text-[14.5px]">
                {quickLinks.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      to={link.href}
                      className="text-white/95 hover:text-[#cca028] transition-colors duration-150 inline-block py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Contact Us (md:col-span-4) */}
            <div className="md:col-span-4 space-y-5">
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Contact Us
              </h3>

              {/* 5 Social Media Rounded Square Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {socialLinks.map((social, idx) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={idx}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="w-8 h-8 rounded-md bg-[#cca028] hover:bg-[#b88e1e] text-white flex items-center justify-center shadow-xs transition-transform hover:scale-105"
                    >
                      <Icon size={15} className="text-white fill-white stroke-[0]" />
                    </a>
                  );
                })}
              </div>

              {/* Golden Company Brand Title */}
              <div>
                <h4 className="text-base sm:text-[17px] font-bold text-[#cca028] tracking-tight">
                  Shafsky Aviation Services Pvt. Ltd.
                </h4>
              </div>

              {/* Contact Details */}
              <div className="space-y-3.5 text-xs sm:text-[14px] text-white/95 leading-snug">
                <div>
                  <span className="font-bold">Mobile: </span>
                  <a
                    href="tel:+919599087959"
                    className="hover:text-[#cca028] transition-colors font-medium font-sans"
                  >
                    +919599087959
                  </a>
                </div>

                <div className="space-y-1">
                  <span className="font-bold block">Operational Office:</span>
                  <p className="text-white/90 leading-relaxed">
                    8/5, Ground Floor, West Mehram Nagar Gate No.1, Opp. IGI
                    Airport Terminal 1, New Delhi -110010
                  </p>
                </div>

                <div className="space-y-1 pt-1">
                  <span className="font-bold block">Registered Office:</span>
                  <p className="text-white/90 leading-relaxed">
                    C-1/118, Lajpat Nagar-1, Near Defence Colony Flyover, New
                    Delhi, Delhi &ndash; 110024
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solid Black Copyright Bar */}
      <div className="w-full bg-black py-4 px-4 sm:px-6 text-center border-t border-black">
        <p className="text-xs sm:text-[13px] text-white/90 tracking-wide font-normal">
          &copy; Copyright 2024 Shafsky Aviation Services Pvt. Ltd. All Rights
          Reserved
        </p>
      </div>
    </footer>
  );
}

export default Footer;
