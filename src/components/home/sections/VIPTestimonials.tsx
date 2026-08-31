import React, { useRef } from "react";
import { motion } from "framer-motion";
import { display, mono } from "../theme";

import sachinImg from "@/assets/testimonials/Sachin-Tendulkar.png";
import gambhirImg from "@/assets/testimonials/gambheer.png";
import azharImg from "@/assets/testimonials/azhar.png";
import shuklaImg from "@/assets/testimonials/Rjeevshukla.png";
import barunImg from "@/assets/testimonials/barun.png";
import hemantImg from "@/assets/testimonials/hemant.png";
import madhurImg from "@/assets/testimonials/madhur.png";
import prasadImg from "@/assets/testimonials/prasad.png";
import ramgopalImg from "@/assets/testimonials/ramgopal.png";

interface VIPItem {
  id: string;
  name: string;
  image: string;
  alt: string;
}

const TESTIMONIAL_CARDS: VIPItem[] = [
  {
    id: "sachin",
    name: "Sachin Tendulkar",
    image: sachinImg,
    alt: "Sachin Tendulkar Testimonial",
  },
  {
    id: "gambhir",
    name: "Gautam Gambhir",
    image: gambhirImg,
    alt: "Gautam Gambhir Testimonial",
  },
  {
    id: "azhar",
    name: "Mohammad Azharuddin",
    image: azharImg,
    alt: "Mohammad Azharuddin Testimonial",
  },
  {
    id: "shukla",
    name: "Rajeev Shukla",
    image: shuklaImg,
    alt: "Rajeev Shukla Testimonial",
  },
  {
    id: "prasad",
    name: "Venkatesh Prasad",
    image: prasadImg,
    alt: "Venkatesh Prasad Testimonial",
  },
  {
    id: "madhur",
    name: "Madhur Bhandarkar",
    image: madhurImg,
    alt: "Madhur Bhandarkar Testimonial",
  },
  {
    id: "barun",
    name: "Barun Sobti",
    image: barunImg,
    alt: "Barun Sobti Testimonial",
  },
  {
    id: "hemant",
    name: "Hemant Soren",
    image: hemantImg,
    alt: "Hemant Soren Testimonial",
  },
  {
    id: "ramgopal",
    name: "Ram Gopal Varma",
    image: ramgopalImg,
    alt: "Ram Gopal Varma Testimonial",
  },
];

export function VIPTestimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <section
      id="testimonials"
      className="relative px-4 py-14 sm:px-8 sm:py-20 md:px-12 md:py-24 bg-white text-slate-900 overflow-hidden border-b border-slate-200"
    >
      <div className="mx-auto max-w-[1560px]">
        {/* Centered Modern Premium Header */}
        <div className="relative flex flex-col items-center justify-center text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="group inline-flex flex-col items-center cursor-default select-none"
          >
            {/* Top Minimalist Eyebrow */}
            <div
              className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.45em] text-lime-700 font-bold"
              style={mono}
            >
              <span className="h-px w-8 bg-lime-500" />
              <span>WHAT OUR GUESTS SAY</span>
              <span className="h-px w-8 bg-lime-500" />
            </div>

            {/* Modern Premium Centered Title (Without Dot) with Ambient Text Glow */}
            <h2
              className="relative mt-3 text-[clamp(2.4rem,4.8vw,4.4rem)] leading-[1.04] text-slate-950 font-bold tracking-tight transition-all duration-500 group-hover:tracking-normal group-hover:text-lime-700"
              style={display}
            >
              Testimonials
            </h2>

            {/* Modern Premium Center Accents on Hover */}
            <div className="relative mt-3 flex items-center justify-center gap-1.5">
              <span className="h-1 w-2 rounded-full bg-lime-400 opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500" />
              <div className="h-1 w-12 bg-lime-500 rounded-full transition-all duration-500 ease-out group-hover:w-28 group-hover:bg-slate-950 shadow-sm" />
              <span className="h-1 w-2 rounded-full bg-lime-400 opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500" />
            </div>
          </motion.div>
        </div>

        {/* Clean Testimonial Cards Carousel Rail */}
        <div
          ref={scrollRef}
          className="flex gap-5 sm:gap-6 overflow-x-auto pb-6 pt-2 scrollbar-none snap-x snap-mandatory"
          style={{ scrollBehavior: "smooth" }}
        >
          {TESTIMONIAL_CARDS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.05 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative shrink-0 w-[270px] sm:w-[310px] md:w-[340px] snap-start rounded-3xl overflow-hidden border-2 border-slate-200 shadow-[0_10px_25px_-10px_rgba(0,0,0,0.1)] hover:border-lime-500 hover:shadow-[0_20px_45px_-10px_rgba(132,204,22,0.3)] transition-all duration-500 bg-slate-900 cursor-pointer"
            >
              {/* Full Crisp Uncropped Graphic */}
              <div className="relative w-full aspect-[4/5] overflow-hidden">
                <img
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 select-none"
                  loading="lazy"
                />
                {/* Subtle Hover Glow Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default VIPTestimonials;
