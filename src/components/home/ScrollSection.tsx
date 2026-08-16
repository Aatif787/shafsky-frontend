import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function ScrollSection({
  children,
  isLast = false,
  id,
}: {
  children: React.ReactNode;
  isLast?: boolean;
  id?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: isLast ? ["start end", "end end"] : ["start end", "end start"],
  });

  const opacity = useTransform(
    scrollYProgress,
    isLast ? [0, 0.35, 1] : [0, 0.25, 0.75, 1],
    isLast ? [0, 1, 1] : [0, 1, 1, 0],
  );

  const y = useTransform(
    scrollYProgress,
    isLast ? [0, 0.35, 1] : [0, 0.25, 0.75, 1],
    isLast ? [60, 0, 0] : [60, 0, 0, -60],
  );

  const scale = useTransform(
    scrollYProgress,
    isLast ? [0, 0.35, 1] : [0, 0.25, 0.75, 1],
    isLast ? [0.97, 1, 1] : [0.97, 1, 1, 0.97],
  );

  return (
    <motion.div
      id={id}
      ref={containerRef}
      style={{ opacity, y, scale, position: "relative" }}
      className="cv-auto relative origin-center"
    >
      {children}
    </motion.div>
  );
}
