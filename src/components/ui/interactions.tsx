import React, {
  useState,
  useRef,
  useEffect,
  type ReactNode,
  type MouseEvent,
  type ElementType,
} from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
 * 1. MAGNETIC WRAPPER
 * ─────────────────────────────────────────────────────────────────────────── */
interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export function Magnetic({ children, strength = 0.3, className = "" }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const distanceX = (e.clientX - centerX) * strength;
    const distanceY = (e.clientY - centerY) * strength;
    setPosition({ x: distanceX, y: distanceY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 250, damping: 15, mass: 0.2 }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 2. 3D TILT CARD
 * ─────────────────────────────────────────────────────────────────────────── */
interface TiltCardProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  scale?: number;
}

export function TiltCard({
  children,
  className = "",
  maxTilt = 10,
  scale = 1.02,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    const rY = (x - 0.5) * (maxTilt * 2);
    const rX = (0.5 - y) * (maxTilt * 2);

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: isHovered ? rotateX : 0,
        rotateY: isHovered ? rotateY : 0,
        scale: isHovered ? scale : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className={`relative overflow-hidden transition-shadow duration-300 ${
        isHovered
          ? "shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5),0_0_30px_rgba(197,160,89,0.2)] border-[#c5a059]/40"
          : ""
      } ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 3. RIPPLE BUTTON
 * ─────────────────────────────────────────────────────────────────────────── */
interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "gold" | "outline";
  glow?: boolean;
}

export function RippleButton({
  children,
  variant = "gold",
  glow = true,
  className = "",
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { x, y, id: Date.now() };

    setRipples((prev) => [...prev, newRipple]);

    if (onClick) onClick(e);
  };

  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  const baseStyles =
    "relative overflow-hidden inline-flex items-center justify-center font-mono text-xs font-bold uppercase tracking-[0.25em] transition-all duration-300 rounded-2xl active:scale-[0.97]";

  const variantStyles = {
    gold: "bg-gradient-to-r from-[#c5a059] to-[#d4c09d] text-[#081119] shadow-lg hover:shadow-[#c5a059]/30 hover:brightness-105",
    primary: "bg-[#0d3b46] text-white hover:bg-[#082830] shadow-md",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/15",
    outline: "border border-[#c5a059]/40 text-[#c5a059] hover:border-[#c5a059] hover:bg-[#c5a059]/10",
  };

  const glowStyles = glow
    ? "hover:shadow-[0_0_25px_rgba(197,160,89,0.35)]"
    : "";

  return (
    <button
      onClick={handleClick}
      className={`${baseStyles} ${variantStyles[variant]} ${glowStyles} ${className}`}
      {...props}
    >
      {/* RIPPLE CIRCLES */}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple-effect"
          style={{
            left: r.x - 20,
            top: r.y - 20,
            width: 40,
            height: 40,
          }}
        />
      ))}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 4. ANIMATED HEADING (WORD REVEAL)
 * ─────────────────────────────────────────────────────────────────────────── */
interface AnimatedHeadingProps {
  text: string;
  className?: string;
  as?: ElementType;
  delay?: number;
}

export function AnimatedHeading({
  text,
  className = "",
  as: Component = "h2",
  delay = 0,
}: AnimatedHeadingProps) {
  const words = text.split(" ");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: delay,
      },
    },
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 20, rotateX: -45 },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <Component className={className}>
      <motion.span
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={containerVariants}
        className="inline-flex flex-wrap gap-[0.25em]"
      >
        {words.map((word, idx) => (
          <motion.span key={idx} variants={wordVariants} className="inline-block">
            {word}
          </motion.span>
        ))}
      </motion.span>
    </Component>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 5. PARALLAX IMAGE
 * ─────────────────────────────────────────────────────────────────────────── */
interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
  hoverZoom?: boolean;
}

export function ParallaxImage({
  src,
  alt,
  className = "",
  speed = 0.15,
  hoverZoom = true,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-40 * speed, 40 * speed]);

  return (
    <div ref={ref} style={{ position: "relative" }} className={`relative overflow-hidden ${className}`}>
      <motion.img
        style={{ y }}
        src={src}
        alt={alt}
        className={`h-full w-full object-cover transition-transform duration-700 ${
          hoverZoom ? "hover:scale-110" : ""
        }`}
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 6. FADE IN VIEW / SECTION REVEAL
 * ─────────────────────────────────────────────────────────────────────────── */
interface FadeInViewProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function FadeInView({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: FadeInViewProps) {
  const getInitial = () => {
    switch (direction) {
      case "up":
        return { opacity: 0, y: 30 };
      case "down":
        return { opacity: 0, y: -30 };
      case "left":
        return { opacity: 0, x: 30 };
      case "right":
        return { opacity: 0, x: -30 };
      default:
        return { opacity: 0, y: 30 };
    }
  };

  return (
    <motion.div
      initial={getInitial()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 7. STAGGER CONTAINER & ITEM
 * ─────────────────────────────────────────────────────────────────────────── */
export function StaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: staggerDelay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 25 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 8. SHIMMER SKELETON
 * ─────────────────────────────────────────────────────────────────────────── */
export function ShimmerSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer bg-white/10 rounded-2xl border border-white/5 ${className}`}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 9. FLOATING INPUT & TEXTAREA FORMS
 * ─────────────────────────────────────────────────────────────────────────── */
interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
}

export function FloatingInput({
  label,
  error,
  success,
  value,
  id,
  className = "",
  ...props
}: FloatingInputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="floating-group">
      <input
        id={inputId}
        placeholder=" "
        value={value}
        className={`floating-input ${
          error
            ? "border-red-500/70 focus:border-red-500 focus:ring-1 focus:ring-red-500"
            : success
            ? "border-emerald-500/70 focus:border-emerald-500"
            : ""
        } ${className}`}
        {...props}
      />
      <label htmlFor={inputId} className="floating-label">
        {label}
      </label>

      {/* ERROR FEEDBACK */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono text-red-400"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SUCCESS CHECK */}
      {success && !error && (
        <div className="absolute right-3 top-4 text-emerald-400 pointer-events-none">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

interface FloatingTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function FloatingTextArea({
  label,
  error,
  value,
  id,
  className = "",
  rows = 4,
  ...props
}: FloatingTextAreaProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="floating-group">
      <textarea
        id={inputId}
        rows={rows}
        placeholder=" "
        value={value}
        className={`floating-input resize-none ${
          error ? "border-red-500/70 focus:border-red-500" : ""
        } ${className}`}
        {...props}
      />
      <label htmlFor={inputId} className="floating-label">
        {label}
      </label>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-1.5 flex items-center gap-1.5 text-[11px] font-mono text-red-400"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * 10. SYSTEM CURSOR ENFORCEMENT
 * ─────────────────────────────────────────────────────────────────────────── */
export function CustomCursor() {
  // Use native system cursor for maximum clarity, accessibility & lightweight experience
  return null;
}
