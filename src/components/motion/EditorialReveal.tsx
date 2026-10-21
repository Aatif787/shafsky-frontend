import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface EditorialRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  style?: React.CSSProperties;
}

/**
 * EditorialReveal wraps text, eyebrows, or headings in an overflow-hidden mask
 * and slides the typography up with a decelerated exponential curve,
 * reminiscent of classical luxury magazine editorial title cards.
 */
export function EditorialReveal({
  children,
  className = "",
  delay = 0,
  style,
}: EditorialRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.25 });

  return (
    <div ref={containerRef} className={`overflow-hidden block ${className}`} style={style}>
      <motion.div
        initial={{ y: "115%", opacity: 0 }}
        animate={isInView ? { y: "0%", opacity: 1 } : { y: "115%", opacity: 0 }}
        transition={{
          duration: 0.85,
          delay,
          ease: [0.16, 1, 0.3, 1], // Classical luxury deceleration
        }}
        className="block will-change-transform"
      >
        {children}
      </motion.div>
    </div>
  );
}

export default EditorialReveal;
