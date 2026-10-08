import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { mono } from "../theme";

// Single cinematic background video for the closing CTA.
const CTA_VIDEO_URL =
  "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260629_030107_874273ea-684a-4e90-bb96-8fdfde48d53d.mp4";

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[620px] md:min-h-[720px] w-full overflow-hidden flex flex-col justify-end bg-black text-white border-b border-slate-800"
    >
      {/* Cinematic background video */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        <video
          src={CTA_VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: "contrast(1.05) saturate(1.12) brightness(1.04)",
            transform: "scale(1.01) translate3d(0, 0, 0)",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        />
      </div>

      {/* Closing actions */}
      <div className="relative z-30 mx-auto w-full max-w-5xl px-4 pb-12 sm:pb-16 md:pb-20 text-center flex flex-col items-center">
        {/* Primary action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
          <a
            href="/#book"
            onClick={(e) => {
              const el = document.getElementById("book");
              if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: "smooth", block: "center" });
              }
            }}
            className="group/btn relative overflow-hidden w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#84cc16] to-[#a3e635] px-7 py-3 text-xs font-bold uppercase tracking-[0.22em] text-slate-950 transition-all duration-300 hover:brightness-110 hover:-translate-y-0.5 cursor-pointer font-mono shadow-[0_0_30px_rgba(163,230,53,0.35),0_10px_25px_rgba(0,0,0,0.6)] hover:shadow-[0_0_45px_rgba(163,230,53,0.6),0_14px_30px_rgba(0,0,0,0.8)]"
            style={mono}
          >
            <span className="relative z-10">Book Now</span>
            <ArrowRight size={15} className="relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
