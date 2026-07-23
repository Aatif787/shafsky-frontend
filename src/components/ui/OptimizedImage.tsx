import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  priority?: boolean;
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  blurDataURL,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showBlur, setShowBlur] = useState(true);

  useEffect(() => {
    // If the image is already cached by the browser, mark it loaded immediately
    const img = new Image();
    img.src = src;
    if (img.complete) {
      setIsLoaded(true);
      setShowBlur(false);
    }
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    // Add a tiny delay for smooth animation transition
    const timer = setTimeout(() => setShowBlur(false), 200);
    return () => clearTimeout(timer);
  };

  // Base64 SVGs of a low-res neutral layout placeholder or custom user-supplied placeholder
  const placeholder =
    blurDataURL ||
    "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'%3E%3Crect width='800' height='600' fill='%230b101a' opacity='0.55'/%3E%3C/svg%3E";

  return (
    <div
      className={cn("relative overflow-hidden bg-black/10", className)}
      style={{
        width: width ? (typeof width === "number" ? `${width}px` : width) : "100%",
        height: height ? (typeof height === "number" ? `${height}px` : height) : "100%",
      }}
    >
      {/* Blur/Shimmer Placeholder */}
      {showBlur && (
        <div className="absolute inset-0 z-10 w-full h-full overflow-hidden">
          <img
            src={placeholder}
            alt=""
            className="w-full h-full object-cover filter blur-xl scale-110"
            style={{ pointerEvents: "none" }}
          />
          {/* Shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        </div>
      )}

      {/* Main Image */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={handleLoad}
        className={cn(
          "w-full h-full transition-all duration-700 ease-out",
          isLoaded ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-95 blur-md"
        )}
        {...props}
      />
    </div>
  );
}
