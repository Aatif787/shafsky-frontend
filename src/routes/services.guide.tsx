import { createFileRoute, Link } from "@tanstack/react-router";
import { AIRPORTS } from "@/data/airports";
import {
  creamTheme,
  Eyebrow,
  PageContainer,
  pageDisplay,
  pageMono,
  Panel,
  PrimaryButton,
  RouteTopbar,
} from "@/components/site/PageShell";
import {
  Sparkles,
  Crown,
  Ticket,
  Car,
  Hotel,
  Package,
  HeartPulse,
  Award,
  MapPin,
  PlaneTakeoff,
  PlaneLanding,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";

export const Route = createFileRoute("/services/guide")({
  head: () => ({
    meta: [
      { title: "The Complete Guide to Airport Concierge Services — Shafsky Aviation" },
      {
        name: "description",
        content:
          "Learn how airport concierge services work: Meet & Greet, fast-track immigration, porter assistance, lounge access and chauffeur transfers — what's included and when to book.",
      },
      { property: "og:title", content: "The Complete Guide to Airport Concierge Services" },
      {
        property: "og:description",
        content:
          "Meet & Greet, fast-track, porter and lounge services explained — how premium airport concierge actually works.",
      },
      { property: "og:url", content: "https://aero-launch-sequence.lovable.app/services/guide" },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: "https://aero-launch-sequence.lovable.app/services/guide" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: "The Complete Guide to Airport Concierge Services",
          author: { "@type": "Organization", name: "Shafsky Aviation" },
          publisher: { "@type": "Organization", name: "Shafsky Aviation" },
          mainEntityOfPage: "https://aero-launch-sequence.lovable.app/services/guide",
        }),
      },
    ],
  }),
  errorComponent: ({ error }: { error: Error }) => (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center bg-[#06090f] text-white">
      <h2 className="text-xl font-bold font-mono text-red-400">Guide Unavailable</h2>
      <p className="mt-2 text-xs text-white/60 max-w-md">
        Unable to load the services guide: {error.message}
      </p>
      <Link to="/" className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-mono uppercase tracking-widest text-white transition">
        Return to Homepage
      </Link>
    </div>
  ),
  component: GuidePage,
});

const GUIDE_SECTIONS: { id: string; title: string; Icon: LucideIcon; body: string }[] = [
  {
    id: "meet-greet",
    title: "Meet & Greet",
    Icon: Sparkles,
    body: "The core of any concierge package. A uniformed officer waits at the kerb or arrivals hall holding a personalised welcome board, takes over your bags, and walks you to the appropriate counter. For departures, they handle check-in and boarding pass collection while you wait in a lounge.",
  },
  {
    id: "lounge-access",
    title: "Lounge Access",
    Icon: Crown,
    body: "Curated access to the finest domestic and international lounges across our 19-airport Indian network and 12+ global hubs. Premium F&B, private suites on request, showers and rest pods — all arranged before you land.",
  },
  {
    id: "fast-track",
    title: "Fast-Track Immigration & Security",
    Icon: Ticket,
    body: "Fast-track gives you priority lanes at immigration counters and security screening, coordinated in advance with the airport authority. On a busy evening at Delhi or Mumbai, this alone can save 45–90 minutes.",
  },
  {
    id: "premium-transport",
    title: "Premium Transport",
    Icon: Car,
    body: "BMW 7, Mercedes S-Class and Audi A8 with vetted chauffeurs — pre-staged at your aircraft door. Porters move your luggage from the kerb to check-in (or from carousel to car) so you never carry a bag.",
  },
  {
    id: "hotel-coordination",
    title: "Hotel Booking Services",
    Icon: Hotel,
    body: "Trusted partnerships with airport-precinct flagships and inner-city palaces — booked, briefed and arrival-ready. Late check-out holds, tarmac-to-suite handoff, and loyalty program matching included.",
  },
  {
    id: "cargo-assistance",
    title: "Cargo & Special Baggage",
    Icon: Package,
    body: "Musical instruments, sports equipment, art freight and oversize baggage — handled with insured, white-glove care. Customs liaison, end-to-end tracking, and secure storage arranged on demand.",
  },
  {
    id: "medical-assistance",
    title: "Medical Assistance",
    Icon: HeartPulse,
    body: "Wheelchair, ambulift, nursing escort and full medevac coordination across our network of 19 airports. For families, elderly travellers, and medical passengers — comfort and safety at every touchpoint.",
  },
  {
    id: "vip-concierge",
    title: "VIP Concierge",
    Icon: Award,
    body: "One point of accountability for every detail — from charter and crew to dinner, drivers and discretion. A single dedicated officer manages your entire journey, end-to-end.",
  },
];

function GuidePage() {
  const delhiAirport = AIRPORTS.find((a) => a.code === "DEL");
  const delhiName = delhiAirport?.airport.name || "Indira Gandhi International Airport";
  const delhiCity = delhiAirport?.city || "New Delhi";

  const mumbaiAirport = AIRPORTS.find((a) => a.code === "BOM");
  const mumbaiName = mumbaiAirport?.airport.name || "Chhatrapati Shivaji Maharaj Airport";
  const mumbaiCity = mumbaiAirport?.city || "Mumbai";

  return (
    <PageContainer>
      <RouteTopbar>
        <Link
          to="/"
          className="text-[10px] uppercase tracking-[0.32em] transition hover:opacity-70"
          style={{ ...pageMono, color: creamTheme.muted }}
        >
          ← Shafsky Aviation
        </Link>
      </RouteTopbar>

      <section className="mt-14">
        <Eyebrow>Suswagatam Services Guide</Eyebrow>
        <h1
          className="mt-8 max-w-4xl text-[clamp(3rem,8vw,7rem)] leading-[0.95]"
          style={pageDisplay}
        >
          The complete guide to airport <em style={{ color: creamTheme.teal }}>concierge.</em>
        </h1>
        <p
          className="mt-6 max-w-xl text-[16px] leading-relaxed"
          style={{ color: creamTheme.muted }}
        >
          Airport concierge — sometimes called Meet &amp; Greet or fast-track — is a personal
          assistance service that escorts travellers through every airport touchpoint, from kerbside
          to cabin and back. Here's what it actually includes and how to choose the right tier.
        </p>
      </section>

      <section className="mt-20 space-y-12">
        <Panel>
          <h2 className="text-2xl" style={pageDisplay}>
            What is airport concierge service?
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed" style={{ color: creamTheme.muted }}>
            An airport concierge is a trained guest relations officer who meets you the moment you
            arrive at the terminal — or as your aircraft door opens — and personally guides you
            through check-in, immigration, security, baggage and onward transport. The aim is to
            remove every queue, every form and every uncertainty from the airport journey.
          </p>
        </Panel>

        {/* Signature Hub Showcases Section */}
        <div className="space-y-8 pt-4">
          <div className="text-center md:text-left">
            <Eyebrow>Signature Airport Showcases</Eyebrow>
            <h2 className="mt-4 text-3xl sm:text-4xl" style={pageDisplay}>
              Exclusive hub <em style={{ color: creamTheme.teal }}>spotlights.</em>
            </h2>
            <p
              className="mt-3 max-w-xl text-xs uppercase tracking-widest"
              style={{ ...pageMono, color: creamTheme.muted }}
            >
              Our most requested bespoke services at India's primary international gateways.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Delhi Departure Card */}
            <div
              className="group relative rounded-3xl p-8 border backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{
                borderColor: "rgba(13,90,110,0.2)",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(95,181,173,0.12) 100%)",
              }}
            >
              {/* Tag / Badge */}
              <div className="flex items-center justify-between gap-4">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-[0.2em] font-bold text-white bg-[#0d5a6e]"
                  style={pageMono}
                >
                  <MapPin className="h-3 w-3" /> {delhiCity} ({delhiAirport?.code || "DEL"})
                </span>
                <span
                  className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#0d5a6e]/85 border border-[#0d5a6e]/30 px-2.5 py-0.5 rounded-md"
                  style={pageMono}
                >
                  Departure Service
                </span>
              </div>

              <div className="mt-6 flex items-start gap-4">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-sm border"
                  style={{ borderColor: "rgba(13,90,110,0.15)" }}
                >
                  <PlaneTakeoff className="h-6 w-6 text-[#0d5a6e]" />
                </div>
                <div>
                  <h3
                    className="text-xl font-medium leading-tight text-[#0d2a36]"
                    style={pageDisplay}
                  >
                    {delhiName}
                  </h3>
                  <p className="text-[11px] font-mono tracking-wide text-[#0d5a6e]/70 mt-0.5">
                    Gate-to-Gate VVIP Departure Assistance
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  {
                    title: "VIP Curbside Welcome",
                    desc: "Greeted by a dedicated concierge and professional porter at your exact drop-off zone.",
                  },
                  {
                    title: "Fast-Track Counter & Clearance",
                    desc: "Bypass standard queues for airline check-in, premium security, and government immigration counters.",
                  },
                  {
                    title: "Encalm Lounge Sanctuary",
                    desc: "Guided escort to India's premier departure lounge with complimentary dining, high-speed Wi-Fi, and quiet zones.",
                  },
                  {
                    title: "Priority Boarding Assist",
                    desc: "Dedicated buggy transport from the lounge directly to your boarding gate for priority boarding.",
                  },
                ].map((item) => (
                  <div key={`dep-feature-${item.title}`} className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[#5fb5ad] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="font-semibold text-[#0d2a36] block mb-0.5">
                        {item.title}
                      </strong>
                      <span style={{ color: creamTheme.muted }}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mumbai Arrival Card */}
            <div
              className="group relative rounded-3xl p-8 border backdrop-blur-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{
                borderColor: "rgba(95,181,173,0.3)",
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(13,90,110,0.06) 100%)",
              }}
            >
              {/* Tag / Badge */}
              <div className="flex items-center justify-between gap-4">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] uppercase tracking-[0.2em] font-bold text-white"
                  style={{ ...pageMono, backgroundColor: "#3a958d" }}
                >
                  <MapPin className="h-3 w-3" /> {mumbaiCity} ({mumbaiAirport?.code || "BOM"})
                </span>
                <span
                  className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#3a958d]/85 border border-[#3a958d]/30 px-2.5 py-0.5 rounded-md"
                  style={pageMono}
                >
                  Arrival Service
                </span>
              </div>

              <div className="mt-6 flex items-start gap-4">
                <div
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-sm border"
                  style={{ borderColor: "rgba(95,181,173,0.25)" }}
                >
                  <PlaneLanding className="h-6 w-6 text-[#3a958d]" />
                </div>
                <div>
                  <h3
                    className="text-xl font-medium leading-tight text-[#0d2a36]"
                    style={pageDisplay}
                  >
                    {mumbaiName}
                  </h3>
                  <p className="text-[11px] font-mono tracking-wide text-[#3a958d]/70 mt-0.5">
                    Tarmac-to-Car Elite Arrival Escort
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {[
                  {
                    title: "Aerobridge Greeting",
                    desc: "Your personal concierge meets you immediately at the aircraft door with a customized name placard.",
                  },
                  {
                    title: "Express Customs & Immigration",
                    desc: "Expedited hand-held navigation through diplomatic or fast-track passport control queues.",
                  },
                  {
                    title: "Luggage Priority Care",
                    desc: "Insured porters retrieve your baggage from the carousel while you relax at the arrivals lounge.",
                  },
                  {
                    title: "Chauffeur Pre-Staging",
                    desc: "Seamless handoff to your private luxury vehicle waiting in the VIP lane directly outside.",
                  },
                ].map((item) => (
                  <div key={`arr-feature-${item.title}`} className="flex gap-3">
                    <CheckCircle2 className="h-4 w-4 text-[#5fb5ad] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <strong className="font-semibold text-[#0d2a36] block mb-0.5">
                        {item.title}
                      </strong>
                      <span style={{ color: creamTheme.muted }}>{item.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {GUIDE_SECTIONS.map((s) => {
          const Icon = s.Icon;
          return (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <div className="flex items-start gap-5">
                <div
                  className="mt-1 grid h-12 w-12 shrink-0 place-items-center rounded-full"
                  style={{ background: creamTheme.mint, color: creamTheme.ink }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-[clamp(1.4rem,2.5vw,2rem)]" style={pageDisplay}>
                    {s.title}
                  </h2>
                  <p
                    className="mt-3 max-w-2xl text-[15px] leading-relaxed"
                    style={{ color: creamTheme.muted }}
                  >
                    {s.body}
                  </p>
                </div>
              </div>
              <div className="mt-6 h-px w-full" style={{ background: creamTheme.line }} />
            </section>
          );
        })}
      </section>

      <section className="mt-20 space-y-6">
        <Panel>
          <h2 className="text-2xl" style={pageDisplay}>
            When is concierge worth it?
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed" style={{ color: creamTheme.muted }}>
            Book concierge when the airport journey itself is the bottleneck — tight connections,
            first-time travellers, VIPs, medical passengers, unaccompanied minors or large family
            groups with substantial baggage. For business travellers, the time saved typically pays
            back the fee on the first trip.
          </p>
        </Panel>
      </section>

      <Panel className="mt-16">
        <Eyebrow>Next Step</Eyebrow>
        <h3 className="mt-4 text-[clamp(1.6rem,3vw,2.4rem)]" style={pageDisplay}>
          Book Suswagatam concierge with <em style={{ color: creamTheme.teal }}>Shafsky.</em>
        </h3>
        <p className="mt-3 text-[14px] leading-relaxed" style={{ color: creamTheme.muted }}>
          One guest relations officer, coordinated end-to-end across 19 Indian hubs and 12+
          international airports.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link to="/airports">
            <PrimaryButton>Browse Destinations</PrimaryButton>
          </Link>
          <Link
            to="/contact"
            className="inline-flex min-h-12 items-center justify-center border px-7 py-3 text-[10px] uppercase tracking-[0.28em] transition hover:brightness-95"
            style={{ ...pageMono, borderColor: creamTheme.line, color: creamTheme.ink }}
          >
            Talk to concierge
          </Link>
        </div>
      </Panel>
    </PageContainer>
  );
}
