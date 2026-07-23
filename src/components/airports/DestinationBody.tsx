import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Image as ImageIcon, X } from "lucide-react";
import type { Airport } from "@/data/airports";
import { DARK, display, mono, SectionLabel, GridCard, StatusDot } from "./Atoms";

export function DestinationBody({ a }: { a: Airport }) {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div style={{ background: DARK.bg, color: DARK.ink }}>
      {/* AI Guide */}
      <section id="guide" className="px-4 py-24 sm:px-8 md:px-16 md:py-28">
        <SectionLabel index="01" label="AI Destination Guide" />
        <h2
          className="mt-8 max-w-4xl text-[clamp(2rem,4.5vw,3.8rem)] leading-[1.05]"
          style={display}
        >
          Everything you need before you arrive in{" "}
          <span style={{ color: DARK.blue, fontStyle: "italic" }}>{a.city}</span>.
        </h2>
        <div className="mt-16 grid gap-5 md:grid-cols-3 xl:grid-cols-4">
          {[
            ["About", a.about],
            ["Best Time", a.bestTime],
            ["Languages", a.languages],
            ["Currency", a.currency],
            ["Time Zone", a.timezone],
            ["Business", a.business],
            ["Tourism", a.tourism],
            ["Climate", a.climate],
            ["Safety", a.safety],
            ["Emergency", a.emergency],
            ["Visa", a.visa],
          ].map(([t, v]) => (
            <GridCard key={`dest-grid-${t}`}>
              <div
                className="text-[10px] uppercase tracking-[0.35em]"
                style={{ ...mono, color: DARK.blue }}
              >
                {t}
              </div>
              <div className="mt-4 text-[15px] leading-relaxed" style={{ color: DARK.ink }}>
                {v}
              </div>
            </GridCard>
          ))}
        </div>
      </section>

      {/* Top Attractions */}
      <section className="px-4 py-24 sm:px-8 md:px-16 md:py-28" style={{ background: DARK.panel }}>
        <SectionLabel index="02" label="Top Attractions" />
        <h2 className="mt-8 text-[clamp(2rem,4.5vw,3.8rem)]" style={display}>
          The unmissable three.
        </h2>
        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {a.attractions.map((at, i) => (
            <motion.article
              key={`attraction-${at.name || i}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className="group relative overflow-hidden"
              style={{ background: DARK.panel2, border: `1px solid ${DARK.line}` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={at.img}
                  alt={at.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                  style={{
                    objectPosition: at.img?.includes("chaarminar")
                      ? "center 30%"
                      : at.img?.includes("golkunda")
                        ? "center 40%"
                        : "center",
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <h3
                  className="absolute bottom-5 left-5 right-5 text-white sm:left-6 sm:right-6"
                  style={{ ...display, fontSize: 30 }}
                >
                  {at.name}
                </h3>
              </div>
              <div className="p-5 sm:p-7">
                <p className="text-sm leading-relaxed" style={{ color: DARK.mute }}>
                  {at.desc}
                </p>
                <div className="mt-6 grid grid-cols-2 gap-y-4 text-[11px]" style={mono}>
                  <Meta k="Distance" v={at.distance} />
                  <Meta k="Travel" v={at.travel} />
                  <Meta k="Hours" v={at.hours} />
                  <Meta k="Entry" v={at.fee} />
                  <Meta k="Best Shot" v={at.photo} className="col-span-2" />
                </div>
                <a
                  href={at.maps}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] transition"
                  style={{ ...mono, color: DARK.blue }}
                >
                  Google Maps <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Airport Information */}
      <section className="px-4 py-24 sm:px-8 md:px-16 md:py-28">
        <SectionLabel index="03" label="Airport Information" />
        <h2 className="mt-8 text-[clamp(2rem,4.5vw,3.8rem)]" style={display}>
          {a.airport.name}.
        </h2>
        <div
          className="mt-16 grid gap-px overflow-hidden grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          style={{ background: DARK.lineStrong, border: `1px solid ${DARK.lineStrong}` }}
        >
          {[
            ["IATA", a.code],
            ["ICAO", a.icao],
            ["Elevation", a.airport.elevation],
            ["Runways", a.airport.runways],
            ["Operator", a.airport.operator],
            ["Type", a.airport.type],
            ["Terminals", a.airport.terminals],
            ["Capacity", a.airport.capacity],
            ["Domestic", a.airport.domestic],
            ["International", a.airport.intl],
            ["Annual Traffic", a.airport.annual],
            ["Cargo", a.airport.cargo],
            ["Website", a.airport.website],
            ["Emergency", a.airport.contact],
            ["Hub Of", a.city],
            ["Status", "Operational"],
          ].map(([k, v]) => (
            <div key={`airport-spec-${k}`} className="min-w-0 p-4 sm:p-7" style={{ background: DARK.bg }}>
              <div
                className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em]"
                style={{ ...mono, color: DARK.mute }}
              >
                {k}
              </div>
              <div
                className="mt-2.5 sm:mt-3 break-words text-[14px] sm:text-[18px]"
                style={display}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Facilities */}
      <section className="px-4 py-24 sm:px-8 md:px-16 md:py-28" style={{ background: DARK.panel }}>
        <SectionLabel index="04" label="Live Facilities" />
        <h2 className="mt-8 text-[clamp(2rem,4.5vw,3.8rem)]" style={display}>
          Concierge-grade ground services.
        </h2>
        <div className="mt-14 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
          {a.facilities.map((f) => (
            <motion.div
              key={f.name}
              whileHover={{ y: -4 }}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-5 transition-colors hover:bg-[#0f1925]"
              style={{ background: DARK.panel2, border: `1px solid ${DARK.line}` }}
            >
              <span className="min-w-0 truncate text-sm">{f.name}</span>
              <StatusDot status={f.status} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Weather + Transport */}
      <section className="px-4 py-24 sm:px-8 md:px-16 md:py-28">
        <div className="grid gap-8 lg:grid-cols-3">
          <div>
            <SectionLabel index="05" label="Live Weather" />
            <h3 className="mt-8 text-[clamp(1.6rem,3vw,2.4rem)]" style={display}>
              Flying conditions.
            </h3>
            <GridCard className="mt-10">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
                <div>
                  <div
                    className="text-[10px] uppercase tracking-[0.35em]"
                    style={{ ...mono, color: DARK.mute }}
                  >
                    Temperature
                  </div>
                  <div className="mt-2 text-6xl" style={display}>
                    {a.weather.temp}
                  </div>
                </div>
                <div
                  className="rounded-full px-3 py-2 text-[10px] uppercase tracking-[0.24em] sm:px-4 sm:tracking-[0.3em]"
                  style={{ ...mono, color: DARK.blue, border: `1px solid ${DARK.blue}` }}
                >
                  {a.weather.flying}
                </div>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-5 text-[12px]" style={mono}>
                <Meta k="Humidity" v={a.weather.humidity} />
                <Meta k="Visibility" v={a.weather.visibility} />
                <Meta k="Wind" v={a.weather.wind} />
                <Meta k="Air Quality" v={a.weather.aqi} />
                <Meta k="Sunrise" v={a.weather.sunrise} />
                <Meta k="Sunset" v={a.weather.sunset} />
              </div>
            </GridCard>
          </div>
          <div className="lg:col-span-2">
            <SectionLabel index="06" label="Transportation" />
            <h3 className="mt-8 text-[clamp(1.6rem,3vw,2.4rem)]" style={display}>
              Getting in and out.
            </h3>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {a.transport.map((t) => (
                <GridCard key={t.mode}>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 text-[20px]" style={display}>
                      {t.mode}
                    </div>
                    <span
                      className="shrink-0 text-[10px] uppercase tracking-[0.24em]"
                      style={{ ...mono, color: DARK.blue }}
                    >
                      {t.availability}
                    </span>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4 text-[12px]" style={mono}>
                    <Meta k="Approx Fare" v={t.fare} />
                    <Meta k="Travel" v={t.time} />
                  </div>
                </GridCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hotels */}
      <section className="px-4 py-24 sm:px-8 md:px-16 md:py-28" style={{ background: DARK.panel }}>
        <SectionLabel index="07" label="Luxury Hotels" />
        <h2 className="mt-8 text-[clamp(2rem,4.5vw,3.8rem)]" style={display}>
          Where to stay.
        </h2>
        <div className="mt-14 flex gap-5 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {a.hotels.map((h) => (
            <article
              key={h.name}
              className="group w-[320px] shrink-0 overflow-hidden"
              style={{ background: DARK.panel2, border: `1px solid ${DARK.line}` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={h.img}
                  alt={h.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div
                  className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1 text-[10px] tracking-[0.3em] text-[#5ed3ff] backdrop-blur"
                  style={mono}
                >
                  {"★".repeat(h.stars)}
                </div>
              </div>
              <div className="p-6">
                <h4 className="text-[22px]" style={display}>
                  {h.name}
                </h4>
                <div
                  className="mt-3 flex items-center justify-between text-[11px]"
                  style={{ ...mono, color: DARK.mute }}
                >
                  <span>{h.distance}</span>
                  <span style={{ color: DARK.blue }}>{h.price}</span>
                </div>
                <button
                  className="mt-5 w-full py-3 text-[10px] uppercase tracking-[0.3em] transition-colors hover:bg-[#0a84ff]"
                  style={{
                    ...mono,
                    color: DARK.ink,
                    border: `1px solid ${DARK.blue}`,
                    background: "transparent",
                  }}
                >
                  Book Suite
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Experiences */}
      <section className="px-4 py-24 sm:px-8 md:px-16 md:py-28">
        <SectionLabel index="08" label="Local Experiences" />
        <h2 className="mt-8 text-[clamp(2rem,4.5vw,3.8rem)]" style={display}>
          Beyond the runway.
        </h2>
        <div className="mt-14 flex gap-5 overflow-x-auto pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {a.experiences.map((e) => (
            <article
              key={e.title}
              className="group relative w-[300px] shrink-0 overflow-hidden"
              style={{ background: DARK.panel2, border: `1px solid ${DARK.line}` }}
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={e.img}
                  alt={e.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div
                  className="absolute left-4 top-4 text-[9px] uppercase tracking-[0.35em] text-[#5ed3ff]"
                  style={mono}
                >
                  {e.kind}
                </div>
                <h4
                  className="absolute bottom-4 left-4 right-4 text-white"
                  style={{ ...display, fontSize: 22 }}
                >
                  {e.title}
                </h4>
              </div>
              <div className="p-5 text-[12px]" style={{ ...mono, color: DARK.mute }}>
                {e.note}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-24 sm:px-8 md:px-16 md:py-28" style={{ background: DARK.panel }}>
        <SectionLabel index="09" label="Frequently Asked" />
        <h2 className="mt-8 text-[clamp(2rem,4.5vw,3.8rem)]" style={display}>
          Concierge answers.
        </h2>
        <div className="mt-12 max-w-4xl">
          {a.faqs.map(([q, ans], i) => (
            <FAQ key={`faq-${q}-${i}`} q={q} a={ans} />
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-8 backdrop-blur"
        >
          <button className="absolute right-6 top-6 text-white/70 hover:text-white">
            <X className="h-6 w-6" />
          </button>
          <img src={lightbox} alt="" className="max-h-[90vh] max-w-[90vw] object-contain" />
        </div>
      )}
    </div>
  );
}

function Meta({ k, v, className = "" }: { k: string; v: string; className?: string }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <div className="text-[9px] uppercase tracking-[0.3em]" style={{ color: DARK.mute }}>
        {k}
      </div>
      <div className="mt-1 break-words" style={{ color: DARK.ink }}>
        {v}
      </div>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="block w-full border-b py-7 text-left transition"
      style={{ borderColor: DARK.line }}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-6 md:gap-8">
        <h4 className="min-w-0 text-[20px] md:text-[24px]" style={display}>
          {q}
        </h4>
        <span
          className="shrink-0 text-2xl transition-transform"
          style={{ color: DARK.blue, transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </div>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden"
      >
        <p className="mt-5 max-w-3xl text-[15px] leading-relaxed" style={{ color: DARK.mute }}>
          {a}
        </p>
      </motion.div>
    </button>
  );
}
