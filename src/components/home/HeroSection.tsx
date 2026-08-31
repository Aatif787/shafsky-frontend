import React from "react";
import { HomepagePhotoCarousel } from "./HomepagePhotoCarousel";

export function HeroSection({ visible }: { visible: boolean }) {
  return (
    <section className="relative w-full bg-[#ffffff] border-b border-slate-200/80 pt-20 sm:pt-24 md:pt-28 pb-6 sm:pb-8">
      {/* Pure White Background with Crisp 3-Up Auto-scrolling Photography Stream */}
      <div className="relative z-10 mx-auto max-w-[1600px] w-full px-4 sm:px-6 md:px-10 lg:px-12">
        <HomepagePhotoCarousel />
      </div>
    </section>
  );
}

export default HeroSection;
