import React from "react";

export interface EditorialPhotoProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  objectFit?: "contain" | "cover" | "scale-down" | "fill" | "none";
  objectPosition?: string;
  sizes?: string;
  containerBg?: string;
}

/**
 * EditorialPhoto Component — Shafsky Aviation Official Photo Fit Layer
 * 
 * STRICT ZERO-CROP & INTEGRITY RULES:
 * 1. NEVER crops the source photograph to fill a UI container.
 * 2. Uses `object-fit: contain` by default to guarantee the COMPLETE image remains visible.
 * 3. Preserves original intrinsic aspect ratios at all breakpoints (320px to 2560px).
 * 4. Zero text, headlines, badges, or overlays on top of the photograph.
 */
export function EditorialPhoto({
  src,
  alt,
  width,
  height,
  aspectRatio,
  className = "",
  imageClassName = "",
  priority = false,
  objectFit = "contain",
  objectPosition = "center center",
  sizes = "(max-width: 768px) 100vw, (max-width: 1440px) 80vw, 1600px",
  containerBg = "bg-transparent",
}: EditorialPhotoProps) {
  const calculatedAspectRatio = aspectRatio || (width && height ? `${width} / ${height}` : undefined);

  return (
    <div
      className={`relative w-full flex items-center justify-center overflow-hidden ${containerBg} ${className}`}
      style={{
        aspectRatio: calculatedAspectRatio,
      }}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding={priority ? "sync" : "async"}
        sizes={sizes}
        className={`w-full h-full block max-w-full max-h-full ${imageClassName}`}
        style={{
          objectFit,
          objectPosition,
          imageRendering: "auto",
        }}
      />
    </div>
  );
}

export default EditorialPhoto;
