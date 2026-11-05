"use client";

import React from "react";
import Link from "next/link";
import { Figure } from "./Figure";
import { TopStripLogo } from "./TopStripLogo";
import { THANK_YOU_DATA } from "@/content/domainPagesData";
import { pageNo } from "@/lib/pages";

interface ThankYouPageProps {
  onFlipToStart?: () => void;
  isVisible?: boolean;
}

export function ThankYouPage({ onFlipToStart, isVisible = true }: ThankYouPageProps) {
  const isLeftPage = pageNo("thankyou") % 2 === 0;

  return (
    <div
      className={`flipbook-page-wrapper paper ${isLeftPage ? "page-left" : "page-right"}`}
      style={{
        padding: "2.6cqw 3.6cqw",
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

        {/* HEADER AREA */}
        <div style={{ textAlign: "center", position: "relative", margin: "0.1cqw 0" }}>
          {/* Round Oxblood Rubber Stamp "THANK YOU" */}
          <div
            className="fb-apply-stamp anim-stamp-in"
            aria-hidden="true"
            style={{
              position: "absolute",
              top: "-0.6cqw",
              right: "0.5cqw",
              width: "10.2cqw",
              height: "10.2cqw",
              borderRadius: "50%",
              border: "0.3cqw solid var(--stamp)",
              outline: "0.12cqw solid var(--stamp)",
              outlineOffset: "-0.4cqw",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--stamp)",
              transform: "rotate(-8deg)",
              textTransform: "uppercase",
              lineHeight: 0.95,
              opacity: 0.92,
              backgroundColor: "rgba(139, 30, 30, 0.04)",
              userSelect: "none",
              pointerEvents: "none",
              zIndex: 5,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-headline)",
                fontSize: "2.1cqw",
                letterSpacing: "0.06em",
                textAlign: "center",
              }}
            >
              THANK
              <br />
              YOU
            </span>
            <span
              style={{
                fontSize: "0.95cqw",
                fontFamily: "var(--font-label)",
                letterSpacing: "0.16em",
                marginTop: "0.2cqw",
                fontWeight: 700,
              }}
            >
              ★ TAM ★
            </span>
          </div>

          <div
            className="kicker"
            style={{
              fontSize: "2.1cqw",
              letterSpacing: "0.14em",
              color: "var(--stamp)",
              fontWeight: 700,
              fontFamily: "var(--font-label)",
              textTransform: "uppercase",
            }}
          >
            {THANK_YOU_DATA.kicker}
          </div>

          <h2
            className="font-headline anim-ink-in"
            style={{
              fontSize: "8.6cqw",
              lineHeight: 0.95,
              letterSpacing: "-0.01em",
              margin: "0.2cqw 0 0.4cqw 0",
              textTransform: "uppercase",
            }}
          >
            {THANK_YOU_DATA.headline}
          </h2>

          <p
            className="deck"
            style={{
              fontFamily: "var(--font-body)",
              fontStyle: "italic",
              fontSize: "2.35cqw",
              lineHeight: 1.2,
              margin: "0 auto",
              maxWidth: "88%",
              textWrap: "balance",
              color: "var(--ink)",
            }}
          >
            {THANK_YOU_DATA.deck}
          </p>
        </div>

        <hr className="fb-rule-hairline" style={{ margin: "0.5cqw 0 0.6cqw 0" }} />
      </div>

      {/* CENTRED PICTURE */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "0.3cqw 0",
          flexShrink: 0,
        }}
      >
        <Figure
          src={THANK_YOU_DATA.image}
          alt="The TAM Times Editorial Gathering"
          maxW="34cqw"
          caption={THANK_YOU_DATA.caption}
          captionStyle={{
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            fontSize: "2.05cqw",
            lineHeight: 1.18,
            padding: "0.4cqw 0.6cqw",
            textAlign: "center",
          }}
        />
      </div>

      {/* ARTICLE: 2 COLUMNS WITH DROP CAP & SIGNOFF */}
      <div style={{ margin: "0.3cqw 0", flexShrink: 0 }}>
        <div
          style={{
            columnCount: 2,
            columnGap: "3.2cqw",
            fontFamily: "var(--font-body)",
            fontSize: "2.38cqw",
            lineHeight: 1.3,
            textAlign: "justify",
            hyphens: "auto",
            color: "var(--ink)",
          }}
        >
          {/* Paragraph 1 with Drop Cap W */}
          <p style={{ margin: "0 0 0.8cqw 0", textIndent: 0 }}>
            <span className="dropcap">{THANK_YOU_DATA.dropcap}</span>
            {THANK_YOU_DATA.p1}
          </p>

          {/* Paragraph 2 */}
          <p style={{ margin: 0, textIndent: 0 }}>
            {THANK_YOU_DATA.p2}
          </p>
        </div>

        {/* Sign-off line, right aligned, italic */}
        <p
          style={{
            fontStyle: "italic",
            textAlign: "right",
            fontSize: "2.25cqw",
            margin: "0.5cqw 0 0 0",
            color: "var(--ink-soft)",
          }}
        >
          {THANK_YOU_DATA.signOff}
        </p>
      </div>

      {/* QUOTE STRIP */}
      <div style={{ margin: "0.3cqw 0", flexShrink: 0 }}>
        <hr className="fb-rule-hairline" style={{ margin: 0 }} />
        <div
          className="font-headline"
          style={{
            fontSize: "2.55cqw",
            letterSpacing: "0.06em",
            textAlign: "center",
            padding: "0.5cqw 0",
            color: "var(--ink)",
            lineHeight: 1.1,
            whiteSpace: "nowrap",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.2cqw",
          }}
        >
          <span className="star-twinkle">✦</span>
          <span>IT&apos;S A PLACE FOR EVERYONE TO LEARN</span>
          <span className="star-twinkle">✦</span>
        </div>
        <hr className="fb-rule-hairline" style={{ margin: 0 }} />
      </div>

      {/* TWO ACTION BUTTONS SIDE BY SIDE */}
      <div
        style={{
          display: "flex",
          gap: "1.6cqw",
          justifyContent: "center",
          alignItems: "center",
          margin: "0.4cqw 0",
          flexShrink: 0,
        }}
      >
        <button
          type="button"
          onClick={onFlipToStart}
          tabIndex={isVisible ? 0 : -1}
          aria-label="Read again from the front page"
          className="fb-apply-btn"
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "2.05cqw",
            letterSpacing: "0.04em",
            padding: "0.75cqw 1.6cqw",
            border: "0.25cqw solid var(--ink)",
            backgroundColor: "var(--paper)",
            color: "var(--ink)",
            cursor: "pointer",
            boxShadow: "0.25cqw 0.25cqw 0 var(--ink)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1.1,
            whiteSpace: "nowrap",
            textTransform: "uppercase",
            transition: "transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease",
          }}
        >
          ↺ READ AGAIN FROM THE FRONT PAGE
        </button>

        <Link
          href="/desk/form"
          tabIndex={isVisible ? 0 : -1}
          aria-label="Fill out the application form"
          className="fb-apply-btn"
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "2.05cqw",
            letterSpacing: "0.04em",
            padding: "0.75cqw 1.6cqw",
            border: "0.25cqw solid var(--ink)",
            backgroundColor: "var(--stamp)",
            color: "var(--paper)",
            boxShadow: "0.25cqw 0.25cqw 0 var(--ink)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1.1,
            whiteSpace: "nowrap",
            textDecoration: "none",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease",
          }}
        >
          FILL OUT THE FORM →
        </Link>
      </div>

      {/* FOOTER BAR */}
      <div style={{ flexShrink: 0 }}>
        <hr className="fb-rule-single" style={{ margin: "0.4cqw 0 0.3cqw 0" }} />
        <div
          className="fb-footer-bar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-label)",
            fontSize: "1.9cqw",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            height: "2.5cqw",
            alignItems: "center",
          }}
        >
          <span>THE TAM TIMES</span>
          <span>{THANK_YOU_DATA.footerCentre}</span>
          <span>PAGE {pageNo("thankyou")}</span>
        </div>
      </div>
    </div>
  );
}
