import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  PhoneCall,
  Mail,
  MessageSquare,
  Building2,
  HeartPulse,
  MapPin,
  Clock,
  Zap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Headphones,
  Compass,
} from "lucide-react";
import { PageJourneyWrapper } from "@/components/site/PageJourneyWrapper";
import { TiltCard, FadeInView, StaggerContainer, StaggerItem, FloatingInput, RippleButton } from "@/components/ui/interactions";
import { EnterpriseFAQ } from "@/components/faq/EnterpriseFAQ";
import { RelatedServices } from "@/components/navigation/RelatedServices";
import { AssistanceCTA } from "@/components/navigation/AssistanceCTA";
import { submitContact } from "@/lib/contact.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { BUSINESS } from "@/lib/constants";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "24/7 Concierge Assistance Hub — Shafsky Aviation Services" },
      {
        name: "description",
        content:
          "Connect with Shafsky Aviation Services's 24/7 command desk for immediate airport Meet & Greet, VIP lounge access, emergency air ICU ambulance dispatch, and private jet charters.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "24/7 Concierge Assistance Hub — Shafsky Aviation Services" },
      { property: "og:description", content: "Connect with our 24/7 command desk for airport Meet & Greet, VIP lounge, emergency air ambulance, and private jet charters." },
      { property: "og:url", content: `${BUSINESS.BASE_URL}/contact` },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${BUSINESS.BASE_URL}/og-image.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "24/7 Concierge Assistance Hub — Shafsky Aviation Services" },
      { name: "twitter:description", content: "Connect with our 24/7 command desk for airport Meet & Greet, VIP lounge, emergency air ambulance, and private jet charters." },
      { name: "twitter:image", content: `${BUSINESS.BASE_URL}/og-image.jpg` },
    ],
    links: [{ rel: "canonical", href: `${BUSINESS.BASE_URL}/contact` }],
  }),
  component: AssistanceHubPage,
});

function AssistanceHubPage() {
  const submit = useServerFn(submitContact);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    website: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await submit({ data: form });
      setDone(true);
      toast.success("Assistance Request Transmitted. Our command desk is assigning an aviation specialist.");
    } catch (err: any) {
      toast.error(err?.message || "Transmission failed. Please call our 24/7 hotline directly.");
    } finally {
      setBusy(false);
    }
  }

  const supportOptions = [
    {
      title: "24/7 Command Hotline",
      detail: "+91 9599087959",
      subDetail: "Immediate phone dispatch & flight telemetry",
      actionLabel: "Call Hotline Now",
      actionHref: "tel:+919599087959",
      icon: PhoneCall,
      badge: "24/7 Priority",
    },
    {
      title: "Concierge Email Desk",
      detail: "concierge@shafskyaviation.com",
      subDetail: "Itinerary filing, Air Waybills & quotes",
      actionLabel: "Send Email",
      actionHref: "mailto:concierge@shafskyaviation.com",
      icon: Mail,
      badge: "< 15 Min SLA",
    },
    {
      title: "WhatsApp Instant Desk",
      detail: "Direct Chat Support",
      subDetail: "Real-time updates & aerobridge host contact",
      actionLabel: "Open WhatsApp",
      actionHref: "https://wa.me/919599087959?text=Hello%20Shafsky%20Aviation,%20I%20need%20concierge%20assistance.",
      icon: MessageSquare,
      badge: "Instant Chat",
    },
    {
      title: "Corporate & Embassies",
      detail: "corporate@shafskyaviation.com",
      subDetail: "Diplomatic protocol & executive fleet holding",
      actionLabel: "Corporate Inquiry",
      actionHref: "mailto:corporate@shafskyaviation.com",
      icon: Building2,
      badge: "Diplomatic",
    },
    {
      title: "Emergency Medical ICU",
      detail: "2–4 Hr Air ICU Dispatch",
      subDetail: "Airborne ICU ambulance & flight doctor team",
      actionLabel: "Dispatch Emergency ICU",
      actionHref: "tel:+919599087959",
      icon: HeartPulse,
      badge: "Critical Care",
    },
  ];

  const assistanceTimeline = [
    { step: "01", title: "Request Transmitted", desc: "Submit your flight number, date, and specific airside requirements." },
    { step: "02", title: "Specialist Assigned", desc: "Our 24/7 command desk assigns a dedicated Guest Relations Officer." },
    { step: "03", title: "Telemetry & Ramp Staging", desc: "Flight radar monitors your aircraft schedule to stage hosts at the gate." },
    { step: "04", title: "Airside Execution", desc: "Aerobridge placard greeting, fast-track clearance, and tarmac limousine." },
  ];

  return (
    <PageJourneyWrapper
      category="Support & Assistance"
      categoryHref="/contact"
      current="24/7 Assistance Hub"
      showCTA={false}
      showRelated={false}
    >
      {/* ──────────────────────────────────────────────────────────────────────
       * 1. CINEMATIC HERO HEADER
       * ───────────────────────────────────────────────────────────────────── */}
      <section className="my-10 relative overflow-hidden rounded-[36px] bg-gradient-to-br from-[#0c1422] via-[#080d16] to-[#04070e] border border-[#c5a059]/40 p-8 sm:p-16 shadow-2xl text-center">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />

        <FadeInView>
          <span className="px-4 py-1.5 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 text-[#c5a059] text-[10px] font-mono uppercase tracking-[0.3em] font-bold">
            24/7 Airside Command Desk
          </span>

          <h1
            className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-serif text-white font-light tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Need Assistance?
          </h1>

          <p className="mt-4 text-sm sm:text-base text-white/75 font-sans max-w-2xl mx-auto leading-relaxed">
            Our senior aviation specialists, flight telemetry controllers, and airside guest hosts are staged 24/7 to assist with your journey.
          </p>

          {/* QUICK HERO STAT STRIP */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-left">
            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
              <Clock className="w-5 h-5 text-[#c5a059]" />
              <div>
                <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Coverage</div>
                <div className="text-xs font-serif font-bold text-white">24/7 / 365 Continuous</div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
              <Zap className="w-5 h-5 text-[#c5a059]" />
              <div>
                <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest">SLA Response</div>
                <div className="text-xs font-serif font-bold text-white">&lt; 15 Minutes Guaranteed</div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
              <ShieldCheck className="w-5 h-5 text-[#c5a059]" />
              <div>
                <div className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Discretion</div>
                <div className="text-xs font-serif font-bold text-white">100% Diplomatic Privacy</div>
              </div>
            </div>
          </div>
        </FadeInView>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
       * 2. PREMIUM SUPPORT OPTION CARDS GRID
       * ───────────────────────────────────────────────────────────────────── */}
      <section className="my-16">
        <FadeInView>
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#c5a059] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Channels</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl font-serif font-light text-white mb-8"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Select Your Dedicated Assistance Channel
          </h2>
        </FadeInView>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {supportOptions.map((opt, idx) => {
            const Icon = opt.icon;
            return (
              <StaggerItem key={idx}>
                <TiltCard maxTilt={8} scale={1.02} className="rounded-3xl h-full">
                  <div className="p-7 rounded-3xl bg-[#0e131d]/90 border border-white/10 hover:border-[#c5a059]/60 transition-all duration-300 shadow-xl relative overflow-hidden h-full flex flex-col justify-between group backdrop-blur-md">
                    <div className="absolute top-0 right-0 w-28 h-28 bg-[#c5a059]/5 rounded-full blur-xl group-hover:bg-[#c5a059]/20 transition-all pointer-events-none" />

                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/15 border border-[#c5a059]/40 flex items-center justify-center text-[#c5a059] group-hover:scale-110 transition-transform">
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[9px] font-mono uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-[#c5a059] border border-[#c5a059]/20">
                          {opt.badge}
                        </span>
                      </div>

                      <h3
                        className="text-xl font-serif text-white font-medium group-hover:text-[#c5a059] transition-colors"
                        style={{ fontFamily: "'Fraunces', serif" }}
                      >
                        {opt.title}
                      </h3>

                      <div className="mt-2 text-sm font-mono font-bold text-white/90 truncate">
                        {opt.detail}
                      </div>

                      <p className="mt-1.5 text-xs text-white/60 leading-relaxed font-sans">
                        {opt.subDetail}
                      </p>
                    </div>

                    <div className="mt-7 pt-4 border-t border-white/10">
                      <a
                        href={opt.actionHref}
                        target={opt.actionHref.startsWith("http") ? "_blank" : undefined}
                        rel={opt.actionHref.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#c5a059]/15 border border-[#c5a059]/40 hover:bg-[#c5a059] hover:text-[#081119] text-[#c5a059] font-mono text-xs font-bold uppercase tracking-wider transition-all duration-300"
                      >
                        <span>{opt.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </TiltCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
       * 3. INTERACTIVE OFFICE LOCATION & ASSISTANCE TRANSMISSION FORM
       * ───────────────────────────────────────────────────────────────────── */}
      <section className="my-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* OFFICE LOCATION & OPERATIONAL DETAILS */}
          <FadeInView>
            <div className="p-8 sm:p-10 rounded-[32px] bg-[#0e131d] border border-white/10 shadow-2xl h-full flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#c5a059]/5 rounded-full blur-2xl pointer-events-none" />

              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#c5a059] mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Global Headquarters & Hub</span>
                </div>
                <h3
                  className="text-3xl font-serif font-light text-white mb-4"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  Delhi International Command Suite
                </h3>

                <p className="text-xs sm:text-sm text-white/70 leading-relaxed font-sans mb-8">
                  Our operational headquarters coordinates airside host staging, flight telemetry radar tracking, and diplomatic clearances across 19+ Indian airports and strategic global destinations.
                </p>

                <div className="space-y-4 font-mono text-xs text-white/80">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <MapPin className="w-5 h-5 text-[#c5a059] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Airport Office Address</div>
                      <div className="text-white/60 mt-0.5">
                        Terminal 3 Airside Concierge Suite & Aerocity Aviation Complex, Indira Gandhi International Airport, New Delhi 110037, India.
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <Clock className="w-5 h-5 text-[#c5a059] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Operational Desk Hours</div>
                      <div className="text-white/60 mt-0.5">
                        24 Hours a Day / 7 Days a Week / 365 Days a Year (Continuous Staging)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <Zap className="w-5 h-5 text-[#c5a059] shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-white">Guaranteed Response SLA</div>
                      <div className="text-white/60 mt-0.5">
                        Under 15 minutes for digital filings; instant phone response.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeInView>

          {/* LUXURY ASSISTANCE TRANSMISSION FORM */}
          <FadeInView>
            <div className="p-8 sm:p-10 rounded-[32px] bg-[#0a0f18] border border-[#c5a059]/30 shadow-2xl relative overflow-hidden">
              <h3
                className="text-2xl sm:text-3xl font-serif text-white font-light mb-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                Transmit Assistance Request
              </h3>
              <p className="text-xs text-white/60 font-sans mb-6">
                Fill out your flight or service query. An assigned aviation specialist will review your request immediately.
              </p>

              {done ? (
                <div className="p-8 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/40 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-[#c5a059] mx-auto" />
                  <h4 className="text-xl font-serif text-white">Request Transmitted Successfully</h4>
                  <p className="text-xs text-white/70 max-w-sm mx-auto font-sans">
                    Our 24/7 command desk has logged your itinerary. An aviation specialist is reviewing your request and will contact you via phone/email shortly.
                  </p>
                  <button
                    onClick={() => setDone(false)}
                    type="button"
                    className="px-6 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono text-xs uppercase font-bold hover:bg-white/20 transition-all"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <FloatingInput
                    id="contact_name"
                    label="Full Name *"
                    value={form.name}
                    onChange={(e: any) => setForm({ ...form, name: e.target ? e.target.value : e })}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FloatingInput
                      id="contact_email"
                      label="Email *"
                      type="email"
                      value={form.email}
                      onChange={(e: any) => setForm({ ...form, email: e.target ? e.target.value : e })}
                      required
                    />

                    <FloatingInput
                      id="contact_phone"
                      label="Phone / WhatsApp Number *"
                      type="tel"
                      value={form.phone}
                      onChange={(e: any) => setForm({ ...form, phone: e.target ? e.target.value : e })}
                      required
                    />
                  </div>

                  <FloatingInput
                    id="contact_subject"
                    label="Flight Number / Subject (e.g. AI 102 / Meet & Greet)"
                    value={form.subject}
                    onChange={(e: any) => setForm({ ...form, subject: e.target ? e.target.value : e })}
                  />

                  <div className="relative">
                    <textarea
                      id="contact_message"
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Describe your specific airside requirements or travel dates..."
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-white/5 border border-white/15 focus:border-[#c5a059] text-xs text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-all font-sans"
                    />
                  </div>

                  <RippleButton
                    type="submit"
                    disabled={busy}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#c5a059] to-[#d4c09d] text-[#081119] font-mono text-xs font-bold uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] transition-all"
                  >
                    {busy ? "Transmitting Request..." : "Transmit Request to Command Desk"}
                  </RippleButton>
                </form>
              )}
            </div>
          </FadeInView>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
       * 4. SUPPORT PROCESS TIMELINE ("HOW WE ASSIST")
       * ───────────────────────────────────────────────────────────────────── */}
      <section className="my-20">
        <FadeInView>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.3em] text-[#c5a059]">
                <Compass className="w-3.5 h-3.5" />
                <span>Assistance Workflow</span>
              </div>
              <h2
                className="mt-2 text-3xl sm:text-4xl font-serif font-light text-white"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                What Happens After You Contact Us
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-white/60 font-sans max-w-xl">
              From instant request logging to airside execution, our protocol guarantees seamless handling at every step.
            </p>
          </div>
        </FadeInView>

        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {assistanceTimeline.map((item, idx) => (
            <StaggerItem key={idx}>
              <TiltCard maxTilt={8} scale={1.02} className="rounded-3xl h-full">
                <div className="p-7 rounded-3xl bg-[#0e131d]/90 border border-white/10 hover:border-[#c5a059]/50 transition-all duration-300 shadow-xl relative overflow-hidden h-full flex flex-col justify-between group">
                  <div>
                    <span
                      className="text-3xl font-serif font-bold text-[#c5a059] block mb-4"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {item.step}
                    </span>

                    <h3
                      className="text-lg font-serif text-white font-medium group-hover:text-[#c5a059] transition-colors"
                      style={{ fontFamily: "'Fraunces', serif" }}
                    >
                      {item.title}
                    </h3>

                    <p className="mt-2 text-xs text-white/65 leading-relaxed font-sans">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 text-[10px] font-mono text-white/40">
                    SLA Verified
                  </div>
                </div>
              </TiltCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ──────────────────────────────────────────────────────────────────────
       * 5. FAQ PREVIEW, RELATED SERVICES & BOOK NOW CTA
       * ───────────────────────────────────────────────────────────────────── */}
      <EnterpriseFAQ />
      <RelatedServices />
      <AssistanceCTA heading="Ready to Reserve Your Service?" subheading="Book Your Concierge Service Now." />
    </PageJourneyWrapper>
  );
}
