import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

interface CardTilt3DProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  maxTilt?: number;
  glareOpacity?: number;
  onClick?: () => void;
}

/**
 * CardTilt3D provides a classical horology / luxury watch grade 3D perspective tilt
 * and interactive dynamic specular glare that follows cursor coordinates.
 * Touch-safe: disabled on mobile touch devices to ensure smooth scrolling.
 */
export function CardTilt3D({
  children,
  className = "",
  style,
  maxTilt = 5,
  glareOpacity = 0.18,
  onClick,
}: CardTilt3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Raw mouse coordinates normalized from -maxTilt to +maxTilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Glare position in percentages
  const [glareX, setGlareX] = useState(50);
  const [glareY, setGlareY] = useState(50);

  // Spring physics for natural, weighted inertial response
  const springRotateX = useSpring(mouseY, { stiffness: 280, damping: 26 });
  const springRotateY = useSpring(mouseX, { stiffness: 280, damping: 26 });

  useEffect(() => {
    setIsTouchDevice(
      typeof window !== "undefined" &&
        ("ontouchstart" in window || navigator.maxTouchPoints > 0)
    );
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Glare coordinates
    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;
    setGlareX(pctX);
    setGlareY(pctY);

    // Tilt angle
    const normX = (x / rect.width - 0.5) * (maxTilt * 2);
    const normY = (y / rect.height - 0.5) * (-maxTilt * 2);

    mouseX.set(normX);
    mouseY.set(normY);
  };

  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d",
        rotateX: isTouchDevice ? 0 : springRotateX,
        rotateY: isTouchDevice ? 0 : springRotateY,
        ...style,
      }}
      className={`relative will-change-transform ${className}`}
    >
      {children}

      {/* Dynamic Specular Sunlight Glare Reflection */}
      {!isTouchDevice && (
        <div
          className="pointer-events-none absolute inset-0 z-30 rounded-[inherit] transition-opacity duration-300"
          style={{
            opacity: isHovered ? glareOpacity : 0,
            background: `radial-gradient(circle 320px at ${glareX}% ${glareY}%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.08) 45%, transparent 80%)`,
          }}
        />
      )}
    </motion.div>
  );
}

export default CardTilt3D;
