import { motion } from "framer-motion";
import { ASSETS } from "@/lib/assets";

const depWheelchair = ASSETS.depWheelchair;
const depLounge = ASSETS.depLounge;
const depSpa = ASSETS.depSpa;
const depBuggy = ASSETS.depBuggy;
const arrWelcome = ASSETS.arrWelcome;
const arrFamily = ASSETS.arrFamily;
const arrWheelchair = ASSETS.arrWheelchair || ASSETS.arrBaggage;
const arrChauffeur = ASSETS.arrChauffeur;

interface ServicesGalleryProps {
  airportCity?: string;
  airportCode?: string;
}

const DEPARTURE_IMAGES = [
  {
    src: depWheelchair,
    title: "Curbside Greeting & VVIP Terminal Welcome",
    alt: "VVIP Terminal curbside greeting with luxury chauffeur, luggage porter, and red carpet reception",
  },
  {
    src: depLounge,
    title: "VVIP Lounge Sanctuary & Runway Apron Views",
    alt: "Exclusive VVIP lounge reception with flight display board and apron runway views",
  },
  {
    src: depSpa,
    title: "Dedicated Check-in & Baggage Assistance",
    alt: "Airport priority check-in and dedicated luggage drop assistance",
  },
  {
    src: depBuggy,
    title: "Airside Buggy & Electric Cart",
    alt: "Dedicated airside electric buggy transfer",
  },
];

const ARRIVAL_IMAGES = [
  {
    src: arrWelcome,
    srcSet: "/images/services-gallery/aerobridge-welcome-400.webp 400w, /images/services-gallery/aerobridge-welcome-800.webp 800w, /images/services-gallery/aerobridge-welcome.webp 1200w",
    title: "Aerobridge Placard Greeting & Welcome",
    alt: "Dedicated guest relations officer welcoming arriving family at aerobridge exit with personalized name placard",
  },
  {
    src: arrFamily,
    srcSet: "/images/services-gallery/family-arrival-400.webp 400w, /images/services-gallery/family-arrival-800.webp 800w, /images/services-gallery/family-arrival.webp 1200w",
    title: "Family & VIP Arrival Meet & Escort",
    alt: "Family airport arrival concierge escort with luggage assistance",
  },
  {
    src: arrWheelchair,
    title: "Special Care & Wheelchair Assistance Escort",
    alt: "Personal concierge hostess providing wheelchair assistance and dedicated escort through arrival concourse",
  },
  {
    src: arrChauffeur,
    title: "Chauffeur Baggage Loading & Curbside Transfer",
    alt: "Shafsky hostess in saree and uniformed chauffeur loading luggage trolley into vehicle trunk for arriving family outside terminal",
  },
];

export function ServicesGallery({}: ServicesGalleryProps) {
  return (
    <section className="px-4 py-12 sm:px-8 md:px-16 md:py-16 max-w-[1600px] mx-auto space-y-14">
      {/* ── 1. DEPARTURE SERVICES GALLERY ── */}
      <div>
        <div className="mb-6 sm:mb-8">
          <h3
            className="text-2xl sm:text-3xl font-serif font-bold text-[#1e293b] tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Departure Services Gallery
          </h3>
          <div className="mt-2.5 h-[3px] w-20 rounded-full bg-[#1e293b]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {DEPARTURE_IMAGES.map((img, idx) => (
            <motion.div
              key={`dep-gal-${idx}`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="group overflow-hidden rounded-2xl bg-slate-100 shadow-none border border-slate-200/80 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200 shadow-none">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 shadow-none"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.includes("arrival%20departure%20services") || target.src.includes("arrival departure services")) {
                      target.src = target.src.replace(/arrival(%20|\s)departure(%20|\s)services/, "images/services-gallery");
                    }
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── 2. ARRIVAL SERVICES GALLERY ── */}
      <div>
        <div className="mb-6 sm:mb-8">
          <h3
            className="text-2xl sm:text-3xl font-serif font-bold text-[#1e293b] tracking-tight"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Arrival Services Gallery
          </h3>
          <div className="mt-2.5 h-[3px] w-20 rounded-full bg-[#1e293b]" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {ARRIVAL_IMAGES.map((img, idx) => (
            <motion.div
              key={`arr-gal-${idx}`}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="group overflow-hidden rounded-2xl bg-slate-100 shadow-none border border-slate-200/80 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-200 shadow-none">
                <img
                  src={img.src}
                  srcSet={(img as any).srcSet}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  alt={img.alt}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 shadow-none"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.includes("arrival%20departure%20services") || target.src.includes("arrival departure services")) {
                      target.src = target.src.replace(/arrival(%20|\s)departure(%20|\s)services/, "images/services-gallery");
                    }
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
