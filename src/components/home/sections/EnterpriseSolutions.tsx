import React, { useCallback, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  Crown,
  Globe2,
  Package,
  HeartPulse,
  Plane,
  Users,
  Hotel,
  Ticket,
  Car,
  Building2,
  Sparkles,
  Award,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { display, mono } from "../theme";

function SolutionPanel({
  sol,
  idx,
}: {
  sol: {
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    Icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties; color?: string }>;
    gradient: string;
    glowColor: string;
    iconColor: string;
    ctaLink: string;
    services: { name: string; icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties; color?: string }>; }[];
  };
  idx: number;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  /* ── GSAP scroll-triggered entrance ── */
  useEffect(() => {
    let ctx: ReturnType<typeof import("gsap").gsap.context> | null = null;

    (async () => {
      const gsapModule = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      const gsap = gsapModule.gsap;
      gsap.registerPlugin(ScrollTrigger);

      if (!panelRef.current) return;

      ctx = gsap.context(() => {
        gsap.fromTo(
          panelRef.current,
          { y: 80, opacity: 0, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: panelRef.current,
              start: "top 88%",
              toggleActions: "play none none none",
            },
            delay: idx * 0.12,
          }
        );
      }, panelRef);
    })();

    return () => { ctx?.revert(); };
  }, [idx]);

  /* ── Mouse-tracking parallax depth + glow follow ── */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = panelRef.current;
    const glow = glowRef.current;
    const content = contentRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 … 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    // Subtle 3D tilt
    el.style.transform = `perspective(1200px) rotateY(${x * 3}deg) rotateX(${-y * 3}deg) scale(1.015)`;

    // Content parallax shift
    if (content) {
      content.style.transform = `translate(${x * 8}px, ${y * 6}px)`;
    }

    // Glow follows cursor
    if (glow) {
      glow.style.opacity = "1";
      glow.style.left = `${e.clientX - rect.left}px`;
      glow.style.top = `${e.clientY - rect.top}px`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = panelRef.current;
    const glow = glowRef.current;
    const content = contentRef.current;
    if (el) el.style.transform = "perspective(1200px) rotateY(0deg) rotateX(0deg) scale(1)";
    if (content) content.style.transform = "translate(0,0)";
    if (glow) glow.style.opacity = "0";
  }, []);

  const SolIcon = sol.Icon;

  return (
    <div
      ref={panelRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative overflow-hidden rounded-[36px] border border-black/[0.08] will-change-transform shadow-[0_4px_32px_rgba(0,0,0,0.06)]"
      style={{
        transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease",
        background: sol.gradient,
        boxShadow: "0 8px 40px rgba(0,0,0,0.06)",
      }}
    >
      {/* ── Cursor-following glow orb ── */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 h-[320px] w-[320px] rounded-full blur-[100px] transition-opacity duration-500"
        style={{ background: sol.glowColor, opacity: 0 }}
      />

      {/* ── Animated ambient floating orb (always visible, slow drift) ── */}
      <div
        className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-700"
        style={{ background: sol.glowColor }}
      >
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 12, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="h-full w-full"
        />
      </div>

      {/* ── Animated diagonal shine sweep on hover ── */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 overflow-hidden">
        <motion.div
          animate={{ x: ["-120%", "120%"] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 3 }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent skew-x-12"
        />
      </div>

      {/* ── Content layer ── */}
      <div
        ref={contentRef}
        className="relative z-10 p-8 sm:p-12 lg:p-14 will-change-transform"
        style={{ transition: "transform 0.3s ease-out" }}
      >
        {/* Top row: icon + badge */}
        <div className="flex items-center justify-between mb-8">
          <div className="h-14 w-14 rounded-2xl bg-white/80 border border-black/[0.08] backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-white transition-all duration-400">
            {React.createElement(SolIcon as any, { size: 28, color: sol.iconColor })}
          </div>
          <span
            className="rounded-full bg-white/80 border border-black/[0.06] backdrop-blur-sm px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-800 shadow-sm transition-all duration-400"
            style={mono}
          >
            {sol.badge}
          </span>
        </div>

        {/* Title & subtitle */}
        <h3
          className="text-[clamp(1.8rem,4vw,3.2rem)] font-bold font-serif text-slate-900 leading-[1.08] tracking-tight"
          style={display}
        >
          {sol.title}<span style={{ color: sol.iconColor }}>.</span>
        </h3>
        <p className="mt-3 text-sm sm:text-[15px] text-slate-600 font-body-luxury leading-relaxed max-w-lg">
          {sol.subtitle}
        </p>

        {/* Included services chips */}
        <div className="mt-8 flex flex-wrap gap-2.5">
          {sol.services.map((svc) => {
            const SvcIcon = svc.icon;
            return (
              <span
                key={svc.name}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/70 border border-black/[0.06] px-3.5 py-1.5 text-[11px] font-medium text-slate-700 backdrop-blur-sm group-hover:bg-white group-hover:border-black/[0.12] transition-all duration-300"
              >
                {React.createElement(SvcIcon as any, { size: 12, className: "shrink-0", color: sol.iconColor })}
                {svc.name}
              </span>
            );
          })}
        </div>

        {/* Explore CTA */}
        <div className="mt-10 pt-6 border-t border-black/[0.06]">
          <Link
            to={sol.ctaLink}
            className="group/cta inline-flex items-center gap-3 rounded-2xl bg-slate-900 border border-slate-800 px-8 py-4 text-[11px] font-bold uppercase tracking-[0.25em] text-white transition-all duration-400 hover:bg-slate-800 hover:shadow-lg"
            style={mono}
          >
            <span>Explore</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-400 group-hover/cta:translate-x-2.5" />
          </Link>
        </div>
      </div>

      {/* ── Bottom border glow on hover ── */}
      <div
        className="absolute bottom-0 inset-x-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(to right, transparent, ${sol.iconColor}, transparent)` }}
      />
    </div>
  );
}

export function EnterpriseSolutions() {
  const solutions = [
    {
      id: "concierge",
      title: "Airport Services",
      subtitle: "Everything you need for a smooth airport journey.",
      badge: "Flagship",
      Icon: Crown,
      gradient: "linear-gradient(145deg, #fff7ed 0%, #fef3e2 40%, #fdf8f0 100%)",
      glowColor: "rgba(234,88,12,0.12)",
      iconColor: "#ea580c",
      ctaLink: "/solutions/concierge",
      services: [
        { name: "Meet & Greet", icon: Users },
        { name: "Airport Lounge", icon: Hotel },
        { name: "Fast Track", icon: Ticket },
        { name: "Airport Transfer", icon: Car },
      ],
    },
    {
      id: "travel",
      title: "Travel Services",
      subtitle: "Bespoke hotel curation, VIP flight ticketing, express visa desks & Michelin-grade onboard dining.",
      badge: "Travel",
      Icon: Globe2,
      gradient: "linear-gradient(145deg, #f0fdf4 0%, #ecfce8 40%, #f5fef2 100%)",
      glowColor: "rgba(101,163,13,0.12)",
      iconColor: "#65a30d",
      ctaLink: "/solutions/travel",
      services: [
        { name: "Air Ticketing", icon: Ticket },
        { name: "Hotel Booking", icon: Building2 },
        { name: "Visa Assist", icon: Sparkles },
        { name: "On-board Meals", icon: Award },
      ],
    },
    {
      id: "cargo",
      title: "Cargo & Logistics",
      subtitle: "White-glove customs clearance, insured freight handling & climate-controlled live animal transport.",
      badge: "Freight",
      Icon: Package,
      gradient: "linear-gradient(145deg, #faf5ff 0%, #f5f0ff 40%, #f8f4ff 100%)",
      glowColor: "rgba(139,92,246,0.12)",
      iconColor: "#7c3aed",
      ctaLink: "/solutions/cargo",
      services: [
        { name: "Cargo Assist", icon: Package },
        { name: "AVI (Pet Transport)", icon: HeartPulse },
      ],
    },
    {
      id: "medical",
      title: "Medical Assist",
      subtitle: "24/7 ICU-equipped air ambulance medevac, specialized rail ambulance & dignified repatriation.",
      badge: "24/7 Critical",
      Icon: HeartPulse,
      gradient: "linear-gradient(145deg, #fff1f2 0%, #ffe4e6 40%, #fff5f6 100%)",
      glowColor: "rgba(225,29,72,0.1)",
      iconColor: "#e11d48",
      ctaLink: "/solutions/medical",
      services: [
        { name: "Air Ambulance", icon: Plane },
        { name: "Train Ambulance", icon: Car },
        { name: "HUM (Repatriation)", icon: ShieldCheck },
      ],
    },
    {
      id: "aviation",
      title: "Private Aviation",
      subtitle: "On-demand private jet charter with exclusive FBO terminal access & bespoke cabin luxury worldwide.",
      badge: "Executive",
      Icon: Plane,
      gradient: "linear-gradient(145deg, #fffbeb 0%, #fef9c3 40%, #fefce8 100%)",
      glowColor: "rgba(202,138,4,0.12)",
      iconColor: "#ca8a04",
      ctaLink: "/solutions/aviation",
      services: [
        { name: "Private Charter", icon: Crown },
      ],
    },
  ];

  return (
    <section id="solutions" className="relative px-6 py-24 md:px-14 md:py-36 overflow-hidden" style={{ background: '#faf5ea' }}>
      {/* Background ambient grain texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

      <div className="relative z-10 mx-auto max-w-[1380px]">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div
            className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em]"
            style={{ ...mono, color: '#7c3aed' }}
          >
            <span className="h-px w-12" style={{ background: 'linear-gradient(to right, transparent, #7c3aed)' }} />
            ENTERPRISE SOLUTIONS
            <span className="h-px w-12" style={{ background: 'linear-gradient(to left, transparent, #7c3aed)' }} />
          </div>
          <h2
            className="mt-6 text-[clamp(2.6rem,6vw,5.2rem)] leading-[1.0] text-slate-900 tracking-tight"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 400 }}
          >
            Five pillars of{" "}
            <span className="italic text-[#7c3aed]" style={{ fontFamily: 'var(--font-heading)' }}>
              aviation excellence.
            </span>
          </h2>
          <p className="mt-5 text-sm md:text-[15px] text-slate-600 font-body-luxury max-w-xl mx-auto leading-relaxed">
            Our complete portfolio — organized into specialized enterprise domains — serves every dimension of premium flight and airport transit.
          </p>
        </div>

        {/* Showcase Panels */}
        <div className="flex flex-col gap-10">
          {solutions.map((sol, i) => (
            <SolutionPanel key={sol.id} sol={sol} idx={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

