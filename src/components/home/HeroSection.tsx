import { motion } from "framer-motion";
import { HomepagePhotoCarousel } from "./HomepagePhotoCarousel";

export function HeroSection({}: { visible: boolean }) {
  return (
    <motion.section
      className="relative w-full bg-white border-b border-slate-200/80 pt-20 sm:pt-24 md:pt-28 pb-6 sm:pb-8 overflow-hidden"
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Ambient Apple-grade Subtle Spatial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-64 -z-10 pointer-events-none overflow-hidden blur-[100px] opacity-40">
        <div className="apple-aurora-glow absolute top-0 left-1/3 w-[450px] h-[200px] rounded-full bg-gradient-to-r from-lime-300/30 via-emerald-200/20 to-transparent" />
      </div>

      {/* Responsive Auto-scrolling Photography Stream with Classical Desktop Framing */}
      <div className="relative z-10 w-full max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-2 sm:px-6 md:px-8 overflow-hidden">
        <HomepagePhotoCarousel />
      </div>
    </motion.section>
  );
}

export default HeroSection;
