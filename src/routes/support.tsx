import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Phone, Mail, PhoneCall, ArrowLeft } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/home/sections/Footer";
import { SUPPORT_DEPARTMENTS, SupportDepartment } from "@/components/navigation/supportData";
import { pageHead, breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/support")({
  head: () =>
    pageHead({
      title: "Support & Contact Directory | Shafsky Aviation Services",
      description:
        "Connect directly with the right Shafsky Aviation team for reservations, travel assistance, guest relations, escalations, and finance enquiries.",
      path: "/support",
      jsonLd: [
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Support", path: "/support" },
        ]),
      ],
    }),
  component: SupportPage,
});

export function SupportPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 flex flex-col justify-between selection:bg-lime-200 selection:text-slate-950">
      {/* Top Navigation */}
      <Navigation visible={true} />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-16 sm:pb-24">
        {/* Page Introduction */}
        <div className="mb-10 sm:mb-14">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block text-[11px] sm:text-xs font-mono font-bold uppercase tracking-[0.22em] text-[#0a196f] bg-[#0a196f]/5 border border-[#0a196f]/15 px-3 py-1 rounded-full">
              SUPPORT &amp; CONTACT
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-slate-950 tracking-tight leading-[1.15] mb-4">
            How can we help you?
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
            Connect directly with the right Shafsky Aviation team for reservations, travel assistance, guest relations, escalations, and finance enquiries.
          </p>
        </div>

        {/* Department Contact Directory (Restrained Editorial 2-Column Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-7 items-stretch">
          {SUPPORT_DEPARTMENTS.map((dept: SupportDepartment) => {
            const isFullSpan = dept.departmentNumber === 5;

            return (
              <section
                key={dept.id}
                aria-labelledby={`dept-heading-${dept.departmentNumber}`}
                className={`rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-[0_2px_8px_rgba(15,23,42,0.03)] hover:border-slate-300 transition-all flex flex-col justify-between ${
                  isFullSpan ? "lg:col-span-2" : ""
                }`}
              >
                <div>
                  {/* Department Card Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-100/90 border border-slate-200/80 px-2.5 py-0.5 rounded-md">
                      Department 0{dept.departmentNumber}
                    </span>
                    <span className="text-xs font-semibold text-[#0a196f] bg-[#0a196f]/5 border border-[#0a196f]/15 px-2.5 py-0.5 rounded-md">
                      {dept.categoryBadge}
                    </span>
                  </div>

                  {/* Department Title */}
                  <h2
                    id={`dept-heading-${dept.departmentNumber}`}
                    className="text-lg sm:text-[19px] font-bold text-slate-900 tracking-tight leading-snug mb-5"
                  >
                    {dept.title}
                  </h2>

                  <div className="h-px bg-slate-100 w-full mb-5" />

                  {/* Contacts Grid: Stacks on mobile, splits on full-span desktop */}
                  <div className={isFullSpan ? "grid grid-cols-1 md:grid-cols-2 gap-5" : "space-y-4"}>
                    {/* Phone Assistance */}
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                        <Phone size={13} className="text-slate-400" />
                        <span>{dept.phones.length > 1 ? "Phone Numbers" : "Phone Assistance"}</span>
                      </div>

                      <div className="space-y-2">
                        {dept.phones.map((phone, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-50/90 border border-slate-200/70"
                          >
                            <div className="flex items-center gap-2">
                              <PhoneCall size={14} className="text-lime-700 shrink-0" />
                              <a
                                href={phone.tel}
                                className="font-mono text-sm sm:text-[14.5px] font-semibold text-slate-900 hover:text-lime-800 transition-colors select-all"
                              >
                                {phone.display}
                              </a>
                            </div>
                            <a
                              href={phone.tel}
                              aria-label={`Call ${dept.title} at ${phone.display}`}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-300 shadow-xs transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-600 cursor-pointer"
                            >
                              <PhoneCall size={12} className="text-lime-700" />
                              <span>Call Now</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Email Enquiries */}
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                        <Mail size={13} className="text-slate-400" />
                        <span>{dept.emails.length > 1 ? "Email Addresses" : "Official Email"}</span>
                      </div>

                      <div className="space-y-2">
                        {dept.emails.map((email, idx) => (
                          <div
                            key={idx}
                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-50/90 border border-slate-200/70"
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <Mail size={14} className="text-slate-600 shrink-0" />
                              <a
                                href={email.email}
                                className="font-mono text-xs sm:text-[13.5px] font-semibold text-slate-800 hover:text-[#0a196f] transition-colors select-all break-all"
                              >
                                {email.display}
                              </a>
                            </div>
                            <a
                              href={email.email}
                              aria-label={`Send email to ${dept.title} at ${email.display}`}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 active:bg-slate-200 border border-slate-300 shadow-xs transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a196f] cursor-pointer"
                            >
                              <Mail size={12} className="text-slate-600" />
                              <span>Send Email</span>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </main>

      {/* Complete Website Footer */}
      <Footer />
    </div>
  );
}

export default SupportPage;
