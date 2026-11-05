"use client";

import React from "react";
import Image from "next/image";

export const IMAGE_DIMENSIONS: Record<string, { w: number; h: number; ratio: number }> = {
  "/images/tech-1.png": { w: 736, h: 736, ratio: 1.0 },
  "/images/tech-2.png": { w: 636, h: 900, ratio: 0.707 },
  "/images/tech-3.png": { w: 674, h: 900, ratio: 0.749 },
  "/images/tech-4.png": { w: 720, h: 900, ratio: 0.8 },
  "/images/design-1.png": { w: 507, h: 900, ratio: 0.563 },
  "/images/design-2.png": { w: 720, h: 900, ratio: 0.8 },
  "/images/design-3.png": { w: 504, h: 900, ratio: 0.56 },
  "/images/design-4.png": { w: 506, h: 900, ratio: 0.562 },
  "/images/editorial-1.png": { w: 630, h: 736, ratio: 0.856 },
  "/images/editorial-2.png": { w: 675, h: 900, ratio: 0.75 },
  "/images/management-1.png": { w: 599, h: 900, ratio: 0.666 },
  "/images/management-2.png": { w: 512, h: 512, ratio: 1.0 },
  "/images/marketing-1.png": { w: 711, h: 900, ratio: 0.79 },
  "/images/marketing-2.png": { w: 600, h: 900, ratio: 0.667 },
  "/images/marketing-3.png": { w: 675, h: 900, ratio: 0.75 },
  "/images/research-1.png": { w: 506, h: 900, ratio: 0.562 },
  "/images/research-2.png": { w: 645, h: 485, ratio: 1.33 },
  "/images/research-3.png": { w: 506, h: 900, ratio: 0.562 },
  "/images/research-4.png": { w: 675, h: 900, ratio: 0.75 },
};

export interface FigureProps {
  src: string;
  caption?: string;
  maxW?: string;
  maxH?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  imageStyle?: React.CSSProperties;
  captionStyle?: React.CSSProperties;
  priority?: boolean;
}

/**
 * Shared <Figure> component enforcing:
 * 1. Zero image cropping: full image displayed at its natural aspect ratio.
 * 2. Tight border frame hugging image without empty paper padding strips.
 * 3. Responsive cqw-based scaling.
 */
export function Figure({
  src,
  caption,
  maxW,
  maxH,
  alt,
  className,
  style,
  imageStyle,
  captionStyle,
  priority = false,
}: FigureProps) {
  const dim = IMAGE_DIMENSIONS[src] || { w: 600, h: 600, ratio: 1.0 };

  // Parse numeric cqw values if provided to compute exact hugging dimensions
  let calculatedWidthStyle: string | undefined = undefined;
  if (maxW && maxW.endsWith("cqw")) {
    calculatedWidthStyle = maxW;
  } else if (maxH && maxH.endsWith("cqw")) {
    const rawH = parseFloat(maxH);
    const availableImgH = caption ? Math.max(10, rawH - 4.5) : rawH;
    const huggingW = (availableImgH * dim.ratio).toFixed(2);
    calculatedWidthStyle = `${huggingW}cqw`;
  }

  return (
    <figure
      className={`fb-figure-frame ${className || ""}`}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        width: calculatedWidthStyle ? calculatedWidthStyle : "fit-content",
        maxWidth: maxW || "100%",
        maxHeight: maxH || "100%",
        border: "0.4cqw solid var(--ink)",
        boxSizing: "border-box",
        margin: 0,
        backgroundColor: "var(--paper)",
        flexShrink: 0,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          lineHeight: 0,
        }}
      >
        <Image
          src={src}
          alt={alt || caption || "TAM Times Illustration"}
          width={dim.w}
          height={dim.h}
          priority={priority}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: maxH ? (caption ? `calc(${maxH} - 4.5cqw)` : maxH) : "100%",
            objectFit: "contain",
            display: "block",
            mixBlendMode: "multiply",
            opacity: 0.9,
            ...imageStyle,
          }}
        />
      </div>

      {caption && (
        <figcaption
          className="fb-image-caption"
          style={{
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            fontSize: "1.72cqw",
            lineHeight: 1.15,
            padding: "0.3cqw 0.5cqw",
            borderTop: "0.2cqw solid var(--ink)",
            backgroundColor: "rgba(217, 202, 166, 0.3)",
            margin: 0,
            textTransform: "none",
            textAlign: "left",
            boxSizing: "border-box",
            width: "100%",
            ...captionStyle,
          }}
        >
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
