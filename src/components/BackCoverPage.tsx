"use client";

import React from "react";
import Link from "next/link";
import { CountdownTicker } from "./CountdownTicker";
import { TopStripLogo } from "./TopStripLogo";
import { pageNo } from "@/lib/pages";

interface BackCoverPageProps {
  isVisible?: boolean;
}

export function BackCoverPage({ isVisible = true }: BackCoverPageProps) {
  const isLeftPage = pageNo("coupon") % 2 === 0;

  return (
    <div
      className={`flipbook-page-wrapper paper ${isLeftPage ? "page-left" : "page-right"}`}
      style={{
        padding: "3.2cqw 3.6cqw",
        overflow: "hidden",
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
      }}
    >
      <div className="gutter-shadow" />

      {/* TOP STRIP: Club logo alone between double rules */}
      <div style={{ flexShrink: 0 }}>
        <TopStripLogo />

        <div style={{ textAlign: "center", margin: "0.2cqw 0 0.4cqw 0" }}>
          <div className="kicker" style={{ fontSize: "2.2cqw", letterSpacing: "0.14em" }}>
            OFFICIAL CLOSING NOTICE
          </div>
          <h2
            className="font-headline"
            style={{
              fontSize: "10.2cqw",
              lineHeight: 0.92,
              letterSpacing: "-0.01em",
              margin: "0.2cqw 0",
              textTransform: "uppercase",
            }}
          >
            CLIP &amp; SUBSCRIBE
          </h2>
          <p className="deck" style={{ fontSize: "2.4cqw", margin: 0, textWrap: "balance" }}>
            Cut along the perforation, enter the Subscriber&apos;s Desk, and lodge your dispatch with TAM.
          </p>
        </div>

        <hr className="fb-rule-hairline" style={{ margin: "0.4cqw 0 0.6cqw 0" }} />
      </div>

      {/* TOP HALF: Short article "LAST CALL FOR APPLICANTS" */}
      <div style={{ margin: "0.2cqw 0", flexShrink: 0 }}>
        <h3
          className="font-headline"
          style={{
            fontSize: "4.2cqw",
            letterSpacing: "0.04em",
            color: "var(--stamp)",
            margin: "0 0 0.3cqw 0",
            textAlign: "center",
          }}
        >
          ✦ LAST CALL FOR APPLICANTS ✦
        </h3>
        <div
          className="fb-two-columns fb-dropcap"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "2.3cqw",
            lineHeight: 1.25,
            textAlign: "justify",
            hyphens: "auto",
          }}
        >
          <p style={{ margin: 0 }}>
            The executive council hereby reminds all scholars that induction rolls operate under rigorous timelines. Candidates must establish candidate credentials, select desired disciplines, and furnish reasoned responses. Unsealed drafts are purged when the countdown concludes. Verified dispatches are immediately assigned to departmental interview panels.
          </p>
        </div>
      </div>

      {/* BOTTOM HALF: Large dashed-border coupon with ticker & button */}
      <div
        style={{
          border: "0.4cqw dashed var(--ink)",
          padding: "1.2cqw 1.8cqw",
          backgroundColor: "rgba(217, 202, 166, 0.4)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          margin: "0.4cqw 0",
          flexShrink: 0,
        }}
      >
        {/* Scissors glyph note */}
        <div
          style={{
            position: "absolute",
            top: "-1.1cqw",
            left: "2cqw",
            backgroundColor: "var(--paper)",
            padding: "0 1cqw",
            fontFamily: "var(--font-label)",
            fontSize: "1.7cqw",
            color: "var(--stamp)",
            fontWeight: 700,
          }}
        >
          ✂ CUT ALONG THE RULE
        </div>

        <div style={{ textAlign: "center" }}>
          <h4
            className="font-headline"
            style={{
              fontSize: "4.2cqw",
              letterSpacing: "0.06em",
              margin: 0,
              color: "var(--ink)",
            }}
          >
            APPLICATION DEADLINE TICKER
          </h4>
          <p
            className="font-body"
            style={{
              fontSize: "2.0cqw",
              color: "var(--ink-soft)",
              margin: "0.2cqw 0 0.5cqw 0",
            }}
          >
            The gazette presses cease when this clock reaches zero.
          </p>
        </div>

        {/* Live Countdown in cqw */}
        <CountdownTicker inFlipbook />

        <div style={{ textAlign: "center", marginTop: "0.8cqw" }}>
          <Link
            href="/desk/form"
            tabIndex={isVisible ? 0 : -1}
            className="btn-oxblood"
            style={{
              width: "100%",
              textAlign: "center",
              fontSize: "2.8cqw",
              padding: "1cqw 2cqw",
              border: "0.3cqw solid var(--ink)",
              boxShadow: "0.35cqw 0.35cqw 0 var(--ink)",
              display: "block",
              textDecoration: "none",
              boxSizing: "border-box",
            }}
          >
            FILL OUT THE FORM →
          </Link>
        </div>
      </div>

      {/* FOOTER BAR */}
      <div style={{ flexShrink: 0 }}>
        <hr className="fb-rule-single" style={{ margin: "0.4cqw 0 0.3cqw 0" }} />
        <div className="fb-footer-bar">
          <span>THE TAM TIMES</span>
          <span>FINAL REGISTRATION NOTICE</span>
          <span>PAGE {pageNo("coupon")}</span>
        </div>
      </div>
    </div>
  );
}
