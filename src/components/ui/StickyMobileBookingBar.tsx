import React, { useState, useEffect } from "react";
import { ArrowRight, MessageSquare } from "lucide-react";

interface StickyMobileBookingBarProps {
  title?: string;
  price?: string;
  buttonText?: string;
  onAction?: () => void;
  actionHref?: string;
  whatsappMessage?: string;
}

export function StickyMobileBookingBar({
  title = "VIP Airport Concierge",
  price,
  buttonText = "Book Now",
  onAction,
  actionHref = "#book",
  whatsappMessage = "Hi Shafsky Team, I would like to enquire about VIP airport concierge services.",
}: StickyMobileBookingBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Show only after scrolling down slightly (140px) to avoid clashing with the hero header
    const handleScroll = () => {
      const scrolled = window.scrollY > 140;
      setVisible(scrolled);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  const handleClick = (e: React.MouseEvent) => {
    if (onAction) {
      e.preventDefault();
      onAction();
    } else if (actionHref.startsWith("#")) {
      e.preventDefault();
      const targetId = actionHref.replace("#", "");
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const waLink = `https://wa.me/919599087959?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <aside
      aria-label="Quick mobile booking bar"
      className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-4 py-2.5 shadow-[0_-10px_30px_-5px_rgba(0,0,0,0.12)] transition-transform duration-300 pb-[max(0.625rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left Service Descriptor & Live Price */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 rounded-full bg-lime-500 animate-pulse" />
            <span className="font-mono text-[9px] uppercase tracking-wider text-slate-500 font-bold truncate block">
              {title}
            </span>
          </div>
          <div className="text-sm font-extrabold text-slate-950 font-mono truncate leading-tight">
            {price ? price : "From ₹5,500"}
          </div>
        </div>

        {/* Right Action Controls: WhatsApp 1-tap + Book CTA */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition shadow-2xs active:scale-95"
            aria-label="Chat with 24/7 aviation desk on WhatsApp"
          >
            <MessageSquare size={18} />
          </a>

          <a
            href={actionHref}
            onClick={handleClick}
            className="inline-flex h-11 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-lime-500 via-lime-400 to-lime-500 px-4 text-xs font-mono font-black uppercase tracking-wider text-slate-950 shadow-md shadow-lime-500/25 active:scale-95 transition"
          >
            <span>{buttonText}</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </aside>
  );
}

export default StickyMobileBookingBar;
