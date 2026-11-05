"use client";

import React from "react";
import Image from "next/image";
import { LOGO_STYLE } from "@/lib/config";

interface TopStripLogoProps {
  className?: string;
}

export function TopStripLogo({ className = "" }: TopStripLogoProps) {
  const isInk = LOGO_STYLE === "ink";

  return (
    <div className={`fb-top-strip-logo ${className}`} style={{ width: "100%", flexShrink: 0 }}>
      {/* THE TAM LOGO IS LOCKED: do not move, resize, restyle or change the height of the top strip that holds it on any page */}
      {/* Top double rule */}
      <hr className="fb-rule-double" style={{ margin: "0 0 0.35cqw 0" }} />

      {/* Centred Logo alone in strip, height 8.5cqw (about 8 to 9cqw), whole and uncropped */}
      {/* THE TAM LOGO IS LOCKED: fixed 8.5cqw height container */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "8.5cqw",
          margin: "0.2cqw 0",
          lineHeight: 0,
        }}
      >
        {/* THE TAM LOGO IS LOCKED: logo image styling and dimensions locked */}
        <Image
          src="/images/logo.png"
          alt="The AI & ML Club Logo"
          width={135}
          height={131}
          priority
          style={{
            height: "8.5cqw",
            width: "auto",
            maxHeight: "8.5cqw",
            objectFit: "contain",
            display: "block",
            mixBlendMode: "multiply",
            filter: isInk ? "grayscale(100%) contrast(150%) brightness(95%)" : "none",
            opacity: 0.95,
          }}
        />
      </div>

      {/* Bottom double rule */}
      <hr className="fb-rule-double" style={{ margin: "0.35cqw 0 0.7cqw 0" }} />
    </div>
  );
}
