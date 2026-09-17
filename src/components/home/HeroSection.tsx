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
      {/* Pure White Background with Crisp 3-Up Auto-scrolling Photography Stream */}
      <div className="relative z-10 mx-auto max-w-[1600px] w-full px-4 sm:px-6 md:px-10 lg:px-12">
        <HomepagePhotoCarousel />
      </div>
    </motion.section>
  );
}

export default HeroSection;
