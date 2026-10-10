import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export type RevealDirection =
  | "left"
  | "right"
  | "up"
  | "down"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "scale";

export interface RevealProps {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  distance?: number;
  y?: number; // backwards compatibility
  once?: boolean;
  amount?: number;
}

export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  duration = 0.65,
  distance = 50,
  y,
  once = false,
  amount = 0.2,
}: RevealProps) {
  const reduce = useReducedMotion();

  // Backwards compatibility with existing y prop
  const effDistance = y !== undefined ? y : distance;

  const getInitial = () => {
    if (reduce) return { opacity: 0 };

    switch (direction) {
      case "left":
        return { opacity: 0, x: -effDistance, y: 0 };
      case "right":
        return { opacity: 0, x: effDistance, y: 0 };
      case "down":
        return { opacity: 0, x: 0, y: -effDistance };
      case "top-left":
        return { opacity: 0, x: -effDistance * 0.85, y: -effDistance * 0.65 };
      case "top-right":
        return { opacity: 0, x: effDistance * 0.85, y: -effDistance * 0.65 };
      case "bottom-left":
        return { opacity: 0, x: -effDistance * 0.85, y: effDistance * 0.65 };
      case "bottom-right":
        return { opacity: 0, x: effDistance * 0.85, y: effDistance * 0.65 };
      case "scale":
        return { opacity: 0, scale: 0.92, y: effDistance * 0.3 };
      case "up":
      default:
        return { opacity: 0, x: 0, y: effDistance };
    }
  };

  return (
    <motion.div
      className={className}
      initial={getInitial()}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once, amount }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// Named alias
export const ScrollReveal = Reveal;
