import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  PhoneCall,
  Mail,
  MessageSquare,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/home/sections/Footer";
import { submitContact } from "@/lib/contact.functions";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { BUSINESS } from "@/lib/constants";
import { display, mono } from "@/components/home/theme";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Shafsky Aviation Services" },
      {
        name: "description",
        content:
          "Contact Shafsky Aviation Services 24/7 for airport Meet & Greet assistance, private jet charters, and general inquiries.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Contact Us — Shafsky Aviation Services" },
      {
        property: "og:description",
        content: "Get in touch with our 24/7 team for airport assistance and charter requests.",
      },
      { property: "og:url", content: `${BUSINESS.BASE_URL}/contact` },
      { property: "og:type", content: "website" },
      { property: "og:image", content: `${BUSINESS.BASE_URL}/og-image.jpg` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Contact Us — Shafsky Aviation Services" },
      {
        name: "twitter:description",
        content: "Get in touch with our 24/7 team for airport assistance and charter requests.",
      },
    ],
    links: [{ rel: "canonical", href: `${BUSINESS.BASE_URL}/contact` }],
  }),
  component: ContactPage,
});

function ContactPage() {
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
      toast.success("Message sent successfully! Our team will contact you shortly.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send message. Please call our 24/7 helpline directly.");
    } finally {
      setBusy(false);
    }
  }

  const contactMethods = [
    {
      title: "24/7 Helpline",
      value: "+91 9599087959",
      desc: "Instant phone assistance anytime",
      actionText: "Call Now",
      actionHref: "tel:+919599087959",
      icon: PhoneCall,
      highlight: true,
    },
    {
      title: "WhatsApp Support",
      value: "Direct Chat",
      desc: "Fast responses on WhatsApp",
      actionText: "Chat on WhatsApp",
      actionHref: "https://wa.me/919599087959?text=Hello%20Shafsky%20Aviation,%20I%20have%20an%20inquiry.",
      icon: MessageSquare,
      highlight: false,
    },
    {
      title: "Email Us",
      value: "contact@shafskyaviation.com",
      desc: "General inquiries and booking quotes",
      actionText: "Send Email",
      actionHref: "mailto:contact@shafskyaviation.com",
      icon: Mail,
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-slate-900 flex flex-col justify-between">
      <Navigation visible={true} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 space-y-12">
        {/* 1. CLEAN HEADER */}
        <section className="text-center max-w-2xl mx-auto space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-lime-100/80 border border-lime-300 text-lime-900 text-xs font-mono font-bold tracking-wider uppercase">
            <Sparkles size={13} className="text-lime-700" />
            <span>24/7 Support Desk</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-tight"
            style={display}
          >
            Contact <span className="text-lime-600">Us</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Have questions or need help with a reservation? Our team is available 24/7 to assist you.
          </p>
        </section>

        {/* 2. DIRECT CONTACT METHODS (3 CLEAN CARDS) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {contactMethods.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-5 ${
                  m.highlight
                    ? "bg-white border-lime-500/50 shadow-sm"
                    : "bg-white border-slate-200 shadow-xs hover:border-lime-400"
                }`}
              >
                <div className="space-y-3">
                  <div className="h-11 w-11 rounded-2xl bg-lime-50 border border-lime-200 flex items-center justify-center text-lime-700">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-950">{m.title}</h3>
                    <p className="text-sm font-mono font-bold text-slate-800 mt-1 truncate">{m.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{m.desc}</p>
                  </div>
                </div>

                <a
                  href={m.actionHref}
                  target={m.actionHref.startsWith("http") ? "_blank" : undefined}
                  rel={m.actionHref.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`w-full text-center py-2.5 rounded-xl font-mono text-xs font-bold transition block ${
                    m.highlight
                      ? "bg-lime-500 hover:bg-lime-400 text-slate-950 shadow-xs"
                      : "bg-slate-100 hover:bg-lime-50 text-slate-800 hover:text-lime-900 border border-slate-200 hover:border-lime-300"
                  }`}
                >
                  {m.actionText}
                </a>
              </div>
            );
          })}
        </section>

        {/* 3. SIMPLE 2-COLUMN CONTACT FORM & OFFICE INFO */}
        <section className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Office Details */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-950" style={display}>
                  Get in Touch
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Send us a message and our team will get back to you within a few minutes.
                </p>

                <div className="mt-6 space-y-4 text-xs text-slate-700">
                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <MapPin size={18} className="text-lime-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Office Address</span>
                      <span className="text-slate-600 mt-0.5 block leading-relaxed">
                        8/5 Ground Floor, West Mehram Nagar Gate No. 1, Opp. IGI Airport Terminal 1, New Delhi 110010, India.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <Clock size={18} className="text-lime-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 block">Operating Hours</span>
                      <span className="text-slate-600 mt-0.5 block">
                        24 Hours / 7 Days a Week (All 365 Days)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-lime-50/70 border border-lime-200 text-xs text-lime-900 font-mono">
                <strong>Need Immediate Assistance?</strong>
                <p className="mt-1 text-slate-700 font-sans">
                  Call our 24/7 hotline directly at <a href="tel:+919599087959" className="font-bold text-lime-800 underline">+91 9599087959</a> for urgent flight bookings.
                </p>
              </div>
            </div>

            {/* Right: Clean Form */}
            <div className="lg:col-span-7">
              {done ? (
                <div className="p-8 rounded-2xl bg-lime-50 border border-lime-200 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-lime-600 mx-auto" />
                  <h4 className="text-xl font-bold text-slate-950" style={display}>Message Sent!</h4>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto">
                    Thank you for reaching out. Our team has received your message and will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setDone(false)}
                    type="button"
                    className="px-6 py-2.5 rounded-full bg-slate-900 text-white font-mono text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="Phone"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="Email"
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                      Subject (Optional)
                    </label>
                    <input
                      type="text"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      placeholder="e.g. Flight inquiry or Meet & Greet question"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-700 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="How can we help you?"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-lime-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-lime-500 hover:bg-lime-400 text-slate-950 font-mono text-xs font-extrabold uppercase tracking-wider shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    <Send size={14} />
                    <span>{busy ? "Sending Message..." : "Send Message"}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
