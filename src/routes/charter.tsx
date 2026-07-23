import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  User,
  Mail,
  Phone,
  Building2,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Globe2,
  Clock,
  Headset,
  Crown,
  Sparkles,
  MapPin,
  Users,
  Calendar,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { createBooking } from "@/lib/bookings.functions";
import { toast } from "sonner";
import {
  creamTheme,
  PageContainer,
  RouteTopbar,
  pageDisplay,
  pageMono,
  Eyebrow,
} from "@/components/site/PageShell";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { format, isValid } from "date-fns";

import heroJet from "@/assets/hero-jet.png";

/* ───────────────────── Route Definition ───────────────────── */

export const Route = createFileRoute("/charter")({
  head: () => ({
    meta: [
      { title: "Private Charter — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Experience the pinnacle of private aviation. Request a bespoke charter consultation with Shafsky Aviation.",
      },
    ],
  }),
  errorComponent: ({ error }: { error: Error }) => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center bg-[#06090f] text-white">
      <h2 className="text-xl font-bold font-mono text-red-400">Charter Desk Unavailable</h2>
      <p className="mt-2 text-xs text-white/60 max-w-md">
        Unable to load private charter booking engine: {error.message}
      </p>
      <Link to="/" className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-mono uppercase tracking-widest text-white transition">
        Return to Homepage
      </Link>
    </div>
  ),
  component: CharterPage,
});

/* ───────────────────── Popular Routes ───────────────────── */

const POPULAR_ROUTES = [
  { from: "Mumbai", fromCode: "BOM", to: "Delhi", toCode: "DEL", time: "~2h 10m" },
  { from: "Dubai", fromCode: "DXB", to: "Singapore", toCode: "SIN", time: "~7h 25m" },
  { from: "London", fromCode: "LHR", to: "New York", toCode: "JFK", time: "~8h 15m" },
  { from: "Paris", fromCode: "CDG", to: "Dubai", toCode: "DXB", time: "~6h 45m" },
  { from: "San Francisco", fromCode: "SFO", to: "Chicago", toCode: "ORD", time: "~4h 15m" },
  { from: "Delhi", fromCode: "DEL", to: "London", toCode: "LHR", time: "~9h 30m" },
];

const CHARTER_BENEFITS = [
  {
    Icon: ShieldCheck,
    title: "Dedicated Operations Officer",
    desc: "A single point of contact manages your entire journey — aircraft, crew, customs, and ground handling.",
  },
  {
    Icon: Globe2,
    title: "Global Network",
    desc: "Access to 19 Indian hubs and 12+ international destinations with pre-negotiated slots and handling.",
  },
  {
    Icon: Clock,
    title: "24/7 Availability",
    desc: "Our operations desk is staffed around the clock for last-minute bookings, changes, and urgent departures.",
  },
  {
    Icon: Crown,
    title: "Bespoke Itineraries",
    desc: "Fully customizable routes, catering, cabin configuration, and ground transport to match your needs.",
  },
];

const AIRCRAFT_OPTIONS = [
  "No Preference",
  "Light Jet (4–6 pax)",
  "Midsize Jet (7–9 pax)",
  "Heavy Jet (10–16 pax)",
  "Ultra Long Range (12–18 pax)",
  "Helicopter",
  "Turboprop",
];

const FAQ_ITEMS = [
  {
    q: "How far in advance should I book a charter?",
    a: "Ideally 48–72 hours, but we operate an express desk for urgent departures with as little as 4 hours notice, subject to aircraft and crew availability.",
  },
  {
    q: "What is included in the charter price?",
    a: "Aircraft, crew, fuel, landing fees, handling charges, and basic catering. Premium catering, ground transport, and special requests are quoted separately.",
  },
  {
    q: "Can I choose a specific aircraft type?",
    a: "Yes. We'll match your route, passenger count, and preferences to the ideal aircraft from our network. You can also request a specific tail number.",
  },
  {
    q: "Do you handle customs and immigration?",
    a: "Absolutely. Our operations team coordinates all customs, immigration, and overflight permits as part of the charter service.",
  },
  {
    q: "Is there a minimum booking requirement?",
    a: "No minimum. We accommodate everything from short 30-minute helicopter transfers to ultra-long-range intercontinental missions.",
  },
];

/* ───────────────────── Main Component ───────────────────── */

function CharterPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const submit = useServerFn(createBooking);

  const authed = false;
  const [busy, setBusy] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [dateOpen, setDateOpen] = useState(false);

  const [form, setForm] = useState({
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    company: "",
    origin: "",
    destination: "",
    depart_date: "",
    pax_adults: 1,
    aircraft_preference: "",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.contact_name || !form.contact_email || !form.contact_phone) {
      toast.error("Please fill in all contact details.");
      return;
    }
    if (!form.origin || !form.destination) {
      toast.error("Please specify departure and arrival cities.");
      return;
    }
    setBusy(true);
    try {
      const notesArray: string[] = [];
      if (form.aircraft_preference && form.aircraft_preference !== "No Preference") {
        notesArray.push(`Aircraft Preference: ${form.aircraft_preference}`);
      }
      if (form.notes.trim()) {
        notesArray.push(`Requirements: ${form.notes}`);
      }

      const r = await submit({
        data: {
          contact_name: form.contact_name,
          contact_email: form.contact_email,
          contact_phone: form.contact_phone,
          company: form.company,
          trip_type: "one_way" as const,
          origin: form.origin,
          destination: form.destination,
          depart_date: form.depart_date || format(new Date(), "yyyy-MM-dd"),
          return_date: "",
          pax_adults: form.pax_adults,
          pax_children: 0,
          pax_infants: 0,
          aircraft_preference: form.aircraft_preference,
          service_type: "Private Charter",
          notes: notesArray.join("\n"),
        },
      });

      toast.success(`Charter inquiry submitted · Ref: ${r.booking_ref}`);
      router.navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }

  const selectedDate = form.depart_date
    ? (() => {
        try {
          const d = new Date(form.depart_date + "T00:00:00");
          return isValid(d) ? d : undefined;
        } catch {
          return undefined;
        }
      })()
    : undefined;

  return (
    <PageContainer>
      <RouteTopbar>
        <Link
          to="/"
          className="text-[10px] uppercase tracking-[0.32em] transition hover:opacity-70 flex items-center gap-2"
          style={{ ...pageMono, color: creamTheme.muted }}
        >
          ← Shafsky Aviation
        </Link>
        <Link
          to="/book"
          className="text-[10px] uppercase tracking-[0.32em] transition hover:opacity-70 flex items-center gap-1.5"
          style={{ ...pageMono, color: creamTheme.teal }}
        >
          Airport Services <ArrowRight size={10} />
        </Link>
      </RouteTopbar>

      {/* ═══════════════ Hero Section ═══════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mt-14 relative"
      >
        <Eyebrow>Private Aviation</Eyebrow>
        <h1
          className="mt-8 max-w-5xl text-[clamp(2.5rem,7vw,7rem)] leading-[0.92]"
          style={pageDisplay}
        >
          Private Charter, <em style={{ color: creamTheme.teal }}>Elevated.</em>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-relaxed" style={{ color: creamTheme.muted }}>
          Fly on your terms. Shafsky Aviation coordinates bespoke private charter operations —
          aircraft, crew, customs, and ground handling — through a single dedicated operations
          officer.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#inquiry"
            className="inline-flex items-center gap-2 rounded-xl py-3 px-6 text-[10px] font-bold uppercase tracking-[0.24em] text-white transition-all hover:brightness-110 active:scale-95 shadow-lg"
            style={{
              backgroundColor: creamTheme.teal,
              boxShadow: "0 8px 30px -4px rgba(13,90,110,0.3)",
            }}
          >
            <MessageSquare size={13} />
            Request Consultation
          </a>
          <Link
            to="/book"
            className="inline-flex items-center gap-2 rounded-xl py-3 px-6 text-[10px] font-bold uppercase tracking-[0.24em] border transition-all hover:bg-black/[0.03]"
            style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
          >
            <Plane size={13} />
            Book Airport Services
          </Link>
        </div>
      </motion.section>

      {/* ═══════════════ Benefits Section ═══════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="mt-24"
      >
        <Eyebrow>Why Shafsky Charter</Eyebrow>
        <h2
          className="mt-6 text-[clamp(1.5rem,4vw,3rem)] leading-tight max-w-3xl"
          style={pageDisplay}
        >
          A single point of accountability for every detail.
        </h2>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CHARTER_BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border p-5 bg-white/45 backdrop-blur-md transition-all hover:shadow-md hover:border-teal-800/15"
              style={{ borderColor: creamTheme.line }}
            >
              <div
                className="h-10 w-10 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: "rgba(13,90,110,0.06)", color: creamTheme.teal }}
              >
                <b.Icon size={18} />
              </div>
              <h3 className="text-sm font-bold mb-1.5" style={{ color: creamTheme.ink }}>
                {b.title}
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: creamTheme.muted }}>
                {b.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════ Popular Routes ═══════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="mt-24"
      >
        <Eyebrow>Popular Charter Routes</Eyebrow>
        <h2
          className="mt-6 text-[clamp(1.5rem,4vw,3rem)] leading-tight max-w-3xl"
          style={pageDisplay}
        >
          Fly anywhere. On your schedule.
        </h2>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_ROUTES.map((route, i) => (
            <motion.div
              key={`${route.fromCode}-${route.toCode}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="rounded-2xl border p-4 bg-white/45 backdrop-blur-md flex items-center gap-4 group hover:shadow-md hover:border-teal-800/15 transition-all"
              style={{ borderColor: creamTheme.line }}
            >
              <div className="flex-1 min-w-0">
                <div
                  className="flex items-center gap-2 text-sm font-bold"
                  style={{ color: creamTheme.ink }}
                >
                  <span className="truncate">{route.from}</span>
                  <ArrowRight size={12} className="shrink-0 opacity-40" />
                  <span className="truncate">{route.to}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ ...pageMono, color: creamTheme.teal }}
                  >
                    {route.fromCode}
                  </span>
                  <span className="text-[9px] text-gray-300">→</span>
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider"
                    style={{ ...pageMono, color: creamTheme.teal }}
                  >
                    {route.toCode}
                  </span>
                  <span className="text-[10px] text-gray-400 ml-auto" style={pageMono}>
                    {route.time}
                  </span>
                </div>
              </div>
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 opacity-60 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: "rgba(13,90,110,0.06)", color: creamTheme.teal }}
              >
                <Plane size={14} className="rotate-45" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════ Charter Inquiry Form ═══════════════ */}
      <motion.section
        id="inquiry"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="mt-24 scroll-mt-24"
      >
        <Eyebrow>Request a Charter</Eyebrow>
        <h2
          className="mt-6 text-[clamp(1.5rem,4vw,3rem)] leading-tight max-w-3xl"
          style={pageDisplay}
        >
          Tell us about your mission.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed" style={{ color: creamTheme.muted }}>
          Fill in the details below and our charter operations team will respond within 60 minutes
          with a tailored quote.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 max-w-3xl space-y-5">
          {/* Contact Details */}
          <div
            className="rounded-3xl border p-5 sm:p-7 bg-white/55 shadow-[0_8px_30px_-6px_rgba(13,42,54,0.08)] backdrop-blur-md"
            style={{ borderColor: creamTheme.line }}
          >
            <SectionHeader Icon={User} title="Contact Details" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <CharterInput
                label="Full Name"
                required
                value={form.contact_name}
                onChange={(v) => setForm({ ...form, contact_name: v })}
                placeholder="e.g. John Doe"
              />
              <CharterInput
                label="Email Address"
                type="email"
                required
                value={form.contact_email}
                onChange={(v) => setForm({ ...form, contact_email: v })}
                placeholder="e.g. john@example.com"
              />
              <CharterInput
                label="Phone Number"
                type="tel"
                required
                value={form.contact_phone}
                onChange={(v) => setForm({ ...form, contact_phone: v })}
                placeholder="e.g. +1 555 0199"
              />
              <CharterInput
                label="Company (Optional)"
                value={form.company}
                onChange={(v) => setForm({ ...form, company: v })}
                placeholder="e.g. Acme Corp"
              />
            </div>
          </div>

          {/* Flight Details */}
          <div
            className="rounded-3xl border p-5 sm:p-7 bg-white/55 shadow-[0_8px_30px_-6px_rgba(13,42,54,0.08)] backdrop-blur-md"
            style={{ borderColor: creamTheme.line }}
          >
            <SectionHeader Icon={Plane} title="Charter Details" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <CharterInput
                label="Departure City"
                required
                value={form.origin}
                onChange={(v) => setForm({ ...form, origin: v })}
                placeholder="e.g. Mumbai, Dubai, London"
              />
              <CharterInput
                label="Arrival City"
                required
                value={form.destination}
                onChange={(v) => setForm({ ...form, destination: v })}
                placeholder="e.g. Delhi, Singapore, New York"
              />

              {/* Date Picker */}
              <div className="flex flex-col gap-1 w-full">
                <span
                  className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                  style={pageMono}
                >
                  Preferred Date
                </span>
                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="mt-1 w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none transition-all text-left flex items-center justify-between"
                      style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
                    >
                      <span className={form.depart_date ? "" : "text-gray-400"}>
                        {form.depart_date
                          ? format(new Date(form.depart_date + "T00:00:00"), "MMM d, yyyy")
                          : "Select date"}
                      </span>
                      <Calendar size={13} className="text-gray-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarPicker
                      mode="single"
                      selected={selectedDate}
                      onSelect={(day) => {
                        if (day) {
                          setForm({ ...form, depart_date: format(day, "yyyy-MM-dd") });
                        }
                        setDateOpen(false);
                      }}
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Passengers */}
              <div className="flex flex-col gap-1 w-full">
                <span
                  className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                  style={pageMono}
                >
                  Number of Passengers
                </span>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={form.pax_adults}
                  onChange={(e) =>
                    setForm({ ...form, pax_adults: Math.max(1, parseInt(e.target.value) || 1) })
                  }
                  className="mt-1 w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none transition-all focus:border-teal/50"
                  style={{ borderColor: creamTheme.line }}
                />
              </div>
            </div>

            {/* Aircraft Preference */}
            <div className="mt-4 flex flex-col gap-1 w-full max-w-sm">
              <span
                className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                style={pageMono}
              >
                Aircraft Preference
              </span>
              <select
                value={form.aircraft_preference}
                onChange={(e) => setForm({ ...form, aircraft_preference: e.target.value })}
                className="mt-1 w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none transition-all focus:border-teal/50"
                style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
              >
                {AIRCRAFT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Special Requirements */}
            <div className="mt-4 flex flex-col gap-1 w-full">
              <span
                className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
                style={pageMono}
              >
                Special Requirements (Optional)
              </span>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Specific catering requirements, cabin configuration, ground transport needs..."
                className="mt-1 w-full resize-none rounded-xl border bg-white/60 p-3.5 text-xs leading-relaxed outline-none transition-all focus:border-teal/50"
                style={{ borderColor: creamTheme.line }}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-3.5 text-white text-[11px] font-bold uppercase tracking-[0.26em] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer shadow-lg"
            style={{
              backgroundColor: creamTheme.teal,
              boxShadow: "0 8px 30px -4px rgba(13,90,110,0.3)",
            }}
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting Inquiry...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Submit Charter Inquiry
              </>
            )}
          </button>
        </form>
      </motion.section>

      {/* ═══════════════ FAQ Section ═══════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="mt-24 max-w-3xl"
      >
        <Eyebrow>Frequently Asked Questions</Eyebrow>
        <h2 className="mt-6 text-[clamp(1.5rem,4vw,3rem)] leading-tight" style={pageDisplay}>
          Common questions about private charter.
        </h2>

        <div className="mt-8 space-y-2">
          {FAQ_ITEMS.map((faq, i) => (
            <motion.div
              key={`charter-faq-${faq.q}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="rounded-2xl border overflow-hidden transition-all"
              style={{
                borderColor: openFaq === i ? creamTheme.teal : creamTheme.line,
                background: openFaq === i ? "rgba(13,90,110,0.02)" : "rgba(255,255,255,0.4)",
              }}
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left"
              >
                <span className="text-sm font-semibold" style={{ color: creamTheme.ink }}>
                  {faq.q}
                </span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 text-gray-400 transition-transform ${openFaq === i ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <p
                      className="px-4 pb-4 text-xs leading-relaxed"
                      style={{ color: creamTheme.muted }}
                    >
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════ CTA Footer ═══════════════ */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6 }}
        className="mt-24 mb-12 rounded-3xl border p-8 sm:p-12 text-center bg-white/45 backdrop-blur-md"
        style={{ borderColor: creamTheme.line }}
      >
        <h2 className="text-[clamp(1.5rem,4vw,3rem)] leading-tight" style={pageDisplay}>
          Ready to fly <em style={{ color: creamTheme.teal }}>private?</em>
        </h2>
        <p className="mt-4 text-sm max-w-lg mx-auto" style={{ color: creamTheme.muted }}>
          Our operations desk is available 24/7 for immediate consultations.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#inquiry"
            className="inline-flex items-center gap-2 rounded-xl py-3 px-6 text-[10px] font-bold uppercase tracking-[0.24em] text-white transition-all hover:brightness-110 shadow-lg"
            style={{ backgroundColor: creamTheme.teal }}
          >
            <MessageSquare size={13} />
            Request Consultation
          </a>
          <a
            href="tel:+919599087959"
            className="inline-flex items-center gap-2 rounded-xl py-3 px-6 text-[10px] font-bold uppercase tracking-[0.24em] border transition-all hover:bg-black/[0.03]"
            style={{ borderColor: creamTheme.line, color: creamTheme.ink }}
          >
            <Phone size={13} />
            +91 95990 87959
          </a>
        </div>
      </motion.section>
    </PageContainer>
  );
}

/* ───────────────────── Sub-Components ───────────────────── */

function SectionHeader({ Icon, title }: { Icon: typeof User; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-9 w-9 rounded-xl flex items-center justify-center"
        style={{ color: creamTheme.teal, backgroundColor: "rgba(13,90,110,0.05)" }}
      >
        <Icon size={16} />
      </div>
      <h3
        className="text-sm font-semibold uppercase tracking-wider"
        style={{ color: creamTheme.ink }}
      >
        {title}
      </h3>
    </div>
  );
}

function CharterInput({
  label,
  type = "text",
  required,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <span
        className="text-[9px] uppercase tracking-[0.24em] font-bold text-gray-400"
        style={pageMono}
      >
        {label}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full h-11 rounded-xl border bg-white/60 px-4 text-xs font-semibold outline-none transition-all focus:border-teal/50"
        style={{ borderColor: creamTheme.line }}
      />
    </div>
  );
}
