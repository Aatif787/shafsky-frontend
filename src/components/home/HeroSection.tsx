import { motion } from "framer-motion";
import { HomepagePhotoCarousel } from "./HomepagePhotoCarousel";

export function HeroSection({}: { visible: boolean }) {
  return (
    <motion.section
      className="relative w-full bg-[#ffffff] border-b border-slate-200/80 pt-20 sm:pt-24 md:pt-28 pb-6 sm:pb-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Responsive Auto-scrolling Photography Stream with Classical Desktop Framing */}
      <div className="relative z-10 w-full max-w-[1440px] 2xl:max-w-[1560px] mx-auto px-2 sm:px-6 md:px-8 overflow-hidden">
        <HomepagePhotoCarousel />
      </div>
    </motion.section>
  );
}

export default HeroSection;
