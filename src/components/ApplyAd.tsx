"use client";

/**
 * UNUSED COMPONENT:
 * Application posters (<ApplyAd>) have been removed from pages 2 to 7 per requirement.
 * Form filling is now exclusively initiated from the coupon page and thank-you page.
 * This component file is retained in the project for reference and compatibility.
 */

import React from "react";
import Link from "next/link";
import { Domain } from "@/lib/client";
import { useSession } from "@/lib/session";

export const APPLICATION_DEADLINE_NOTICE =
  "Applications close Sunday, 11:59 PM. Questions are revealed to registered applicants.";

export const DOMAIN_AD_DATA: Record<
  Domain,
  {
    headline: string;
    subline: string;
    name: string;
  }
> = {
  DESIGN: {
    headline: "WANTED: DESIGNERS",
    subline: "The Design Bureau needs people who think in grids and pixels.",
    name: "Design",
  },
  MARKETING: {
    headline: "WANTED: MARKETERS",
    subline: "Help the club's story travel across campus.",
    name: "Marketing",
  },
  R_AND_D: {
    headline: "WANTED: RESEARCHERS",
    subline: "Read papers, test ideas, question every result.",
    name: "Research",
  },
  MANAGEMENT: {
    headline: "WANTED: ORGANISERS",
    subline: "Run events, lead teams, keep the club moving.",
    name: "Management",
  },
  TECHNICAL: {
    headline: "WANTED: BUILDERS",
    subline: "Ship real projects with real teams.",
    name: "Tech",
  },
};

export interface ApplyAdProps {
  domain: Domain;
  isVisible?: boolean;
  compact?: boolean;
  headline?: string;
  subline?: string;
}

export function ApplyAd({
  domain,
  isVisible = true,
  compact = false,
  headline: customHeadline,
  subline: customSubline,
}: ApplyAdProps) {
  const { user } = useSession();
  const defaultInfo = DOMAIN_AD_DATA[domain] || {
    headline: `WANTED: ${domain.replace("_", " ")}`,
    subline: "Join the guild and advance machine intelligence at TAM.",
    name: domain,
  };
  const info = {
    headline: customHeadline || defaultInfo.headline,
    subline: customSubline || defaultInfo.subline,
    name: defaultInfo.name,
  };

  const targetHref = `/desk/form?domain=${domain}`;

  return (
    <Link
      href={targetHref}
      className={`fb-apply-poster ${compact ? "fb-apply-poster-compact" : ""}`}
      tabIndex={isVisible ? 0 : -1}
      aria-label={`Apply to the ${info.name} division. Opens the application form.`}
      style={{
        display: "block",
        height: compact ? "16.8cqw" : "23.5cqw",
        width: "100%",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Inner Dashed Cut-line Coupon Border */}
      <div
        style={{
          width: "100%",
          height: "100%",
          boxSizing: "border-box",
          border: compact ? "0.15cqw dashed var(--ink)" : "0.2cqw dashed var(--ink)",
          padding: compact ? "0.5cqw 1cqw" : "0.8cqw 1.4cqw",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: compact ? "0.8cqw" : "1.2cqw",
          overflow: "hidden",
        }}
      >
        {/* Scissors Cut Glyph in Top-Left */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: compact ? "0.05cqw" : "0.1cqw",
            left: "1.2cqw",
            fontSize: compact ? "1.3cqw" : "1.6cqw",
            lineHeight: 1,
            color: "var(--ink)",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          ✂ ╴╴╴
        </div>

        {/* Tiny Newspaper "ADVT." in Top-Right */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: compact ? "0.2cqw" : "0.4cqw",
            right: "1.2cqw",
            fontFamily: "var(--font-label)",
            fontSize: compact ? "1.0cqw" : "1.15cqw",
            fontWeight: 700,
            letterSpacing: "0.14em",
            color: "var(--ink)",
            opacity: 0.7,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          ADVT.
        </div>

        {/* LEFT: Round Oxblood Rubber Stamp "APPLY HERE" */}
        <div
          className="fb-apply-stamp"
          aria-hidden="true"
          style={{
            width: compact ? "10.5cqw" : "13.2cqw",
            height: compact ? "10.5cqw" : "13.2cqw",
            borderRadius: "50%",
            border: compact ? "0.25cqw solid var(--stamp)" : "0.35cqw solid var(--stamp)",
            outline: compact ? "0.1cqw solid var(--stamp)" : "0.15cqw solid var(--stamp)",
            outlineOffset: compact ? "-0.35cqw" : "-0.5cqw",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--stamp)",
            transform: "rotate(-8deg)",
            flexShrink: 0,
            textTransform: "uppercase",
            lineHeight: 0.95,
            opacity: 0.92,
            boxSizing: "border-box",
            backgroundColor: "rgba(139, 30, 30, 0.04)",
            userSelect: "none",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-headline)",
              fontSize: compact ? "1.9cqw" : "2.4cqw",
              letterSpacing: "0.06em",
              textAlign: "center",
            }}
          >
            APPLY
            <br />
            HERE
          </span>
          <span
            style={{
              fontSize: compact ? "0.9cqw" : "1.1cqw",
              fontFamily: "var(--font-label)",
              letterSpacing: "0.18em",
              marginTop: "0.2cqw",
              fontWeight: 700,
            }}
          >
            ★ TAM ★
          </span>
        </div>

        {/* CENTRE: Headline, Subline, and Small Print Notice */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: compact ? "0 0.5cqw" : "0 0.8cqw",
            userSelect: "none",
          }}
        >
          <h3
            className="font-headline"
            style={{
              fontSize: compact ? "2.7cqw" : "3.5cqw",
              lineHeight: 0.95,
              letterSpacing: "-0.01em",
              margin: compact ? "0 0 0.15cqw 0" : "0 0 0.3cqw 0",
              color: "var(--ink)",
              whiteSpace: "nowrap",
            }}
          >
            {info.headline}
          </h3>

          <p
            style={{
              fontFamily: "var(--font-body)",
              fontStyle: "italic",
              fontSize: compact ? "1.7cqw" : "2.05cqw",
              lineHeight: 1.15,
              color: "var(--ink)",
              margin: compact ? "0 0 0.3cqw 0" : "0 0 0.5cqw 0",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {info.subline}
          </p>

          <p
            style={{
              fontFamily: "var(--font-label)",
              fontSize: compact ? "1.25cqw" : "1.45cqw",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--stamp)",
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            {APPLICATION_DEADLINE_NOTICE}
          </p>
        </div>

        {/* RIGHT: Manicule Pointing Hand + Oxblood Button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: compact ? "0.5cqw" : "0.8cqw",
            flexShrink: 0,
            userSelect: "none",
          }}
        >
          {/* Authentic Ink Pointing Hand SVG */}
          <svg
            viewBox="0 0 100 50"
            className="fb-pointing-hand"
            aria-hidden="true"
            style={{
              width: compact ? "3.8cqw" : "4.8cqw",
              height: compact ? "1.9cqw" : "2.4cqw",
              flexShrink: 0,
              fill: "var(--ink)",
              color: "var(--ink)",
            }}
          >
            {/* Cuff */}
            <rect x="2" y="16" width="16" height="20" rx="1" fill="none" stroke="currentColor" strokeWidth="2.5" />
            <line x1="8" y1="16" x2="8" y2="36" stroke="currentColor" strokeWidth="2" strokeDasharray="2 2" />
            <rect x="18" y="18" width="5" height="16" fill="currentColor" />
            {/* Palm & Fingers */}
            <path
              d="M23 20 C27 17, 34 16, 42 16 L48 16 C50 16, 52 18, 52 20 C52 22, 50 24, 48 24 L44 24 C50 24, 54 26, 54 28 C54 30, 50 32, 45 32 C50 32, 53 34, 53 36 C53 38, 48 40, 42 40 L30 40 C26 40, 23 36, 23 30 Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            {/* Pointing Finger */}
            <path
              d="M42 16 L88 16 C92 16, 95 18.5, 95 21 C95 23.5, 92 26, 88 26 L52 26"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path d="M27 20 C31 23, 35 26, 39 28 C37 31, 33 32, 29 30" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>

          {/* Button Box */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.2cqw",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-label)",
                fontSize: compact ? "1.05cqw" : "1.25cqw",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--ink-soft)",
              }}
            >
              CLICK HERE TO OPEN THE FORM
            </span>

            <div
              className="fb-apply-btn font-headline"
              style={{
                backgroundColor: "var(--stamp)",
                color: "var(--paper)",
                fontSize: compact ? "1.95cqw" : "2.35cqw",
                letterSpacing: "0.04em",
                padding: compact ? "0.45cqw 1.2cqw" : "0.7cqw 1.8cqw",
                border: "0.25cqw solid var(--ink)",
                whiteSpace: "nowrap",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0.2cqw 0.2cqw 0 var(--ink)",
                lineHeight: 1.1,
                cursor: "pointer",
                transition: "background-color 150ms ease, color 150ms ease",
              }}
            >
              APPLY NOW →
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
