"use client";

import React, { useState, useEffect } from "react";
import { Figure } from "./Figure";
import { PaperFx } from "./PaperFx";
import { INSIDE_ENTRIES, pageNo } from "@/lib/pages";

interface FrontPageProps {
  onSelectPage: (pageIndex: number) => void;
}

export function FrontPage({ onSelectPage }: FrontPageProps) {
  // Format current date in Asia/Kolkata timezone on the client in useEffect
  const [currentDateString, setCurrentDateString] = useState("MONDAY, NOVEMBER 2, 2026");

  useEffect(() => {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      setCurrentDateString(formatter.format(now).toUpperCase());
    } catch {
      // fallback
    }
  }, []);

  return (
    <div
      className="flipbook-page-wrapper paper page-right"
      style={{
        padding: "3cqw",
        overflow: "hidden",
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        ["--ink" as any]: "rgba(28, 22, 19, 0.93)",
        ["--crinkle" as any]: 0.6,
      }}
    >
      {/* Reusable Crinkled Paper Effect */}
      <PaperFx seed={1} />

      <div className="gutter-shadow" />

      {/* SPECIAL EDITION diagonal ribbon across top-right corner, 45 deg */}
      <div className="fb-special-banner anim-banner-slide">
        SPECIAL EDITION
      </div>

      {/* TOP HEADER SECTION */}
      <div>
        {/* 1. Dateline bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "var(--font-label)",
            fontSize: "2.1cqw",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            paddingRight: "16cqw",
            height: "3.5cqw",
          }}
        >
          <span style={{ fontWeight: 700 }}>VOLUME I</span>
          <span style={{ fontWeight: 700 }}>{currentDateString}</span>
        </div>

        <hr className="fb-rule-double" style={{ margin: "0.3cqw 0 0.2cqw 0" }} />

        {/* 2. Masthead in Pirata One: single line, centered, filling ~88% of page width */}
        <header style={{ textAlign: "center", margin: "0.2cqw 0" }}>
          <h1
            className="font-masthead anim-ink-in"
            style={{
              fontFamily: "var(--font-masthead, 'Pirata One', serif)",
              fontSize: "17.6cqw",
              lineHeight: 0.92,
              letterSpacing: "0.015em",
              margin: 0,
              whiteSpace: "nowrap",
              display: "inline-block",
              textAlign: "center",
            }}
          >
            The TAM Times
          </h1>

          {/* 3. Club Motto */}
          <hr className="fb-rule-hairline" style={{ margin: "0.3cqw 0 0.2cqw 0" }} />
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontStyle: "italic",
              fontSize: "2.6cqw",
              color: "var(--ink)",
              margin: "0.1cqw 0",
              textAlign: "center",
              whiteSpace: "nowrap",
              lineHeight: 1.2,
            }}
          >
            It&apos;s a place for everyone to learn
          </p>
          <hr className="fb-rule-hairline" style={{ margin: "0.2cqw 0 0.4cqw 0" }} />
        </header>

        {/* 4. Three small boxes */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 0.8fr 1fr",
            gap: "1.2cqw",
            margin: "0.3cqw 0 0.5cqw 0",
            height: "6.5cqw",
          }}
        >
          <div
            style={{
              border: "0.4cqw solid var(--ink)",
              padding: "0.3cqw 0.5cqw",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontFamily: "var(--font-label)",
              fontSize: "1.8cqw",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              textWrap: "balance",
              backgroundColor: "rgba(217, 202, 166, 0.4)",
              lineHeight: 1.15,
            }}
          >
            NOW HIRING: 6 DIVISIONS OPEN
          </div>
          <div
            style={{
              border: "0.4cqw solid var(--ink)",
              padding: "0.3cqw 0.5cqw",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontFamily: "var(--font-label)",
              fontSize: "1.8cqw",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              textWrap: "balance",
              backgroundColor: "rgba(217, 202, 166, 0.4)",
              lineHeight: 1.15,
            }}
          >
            CLUB RECRUITMENT
          </div>
          <div
            style={{
              border: "0.4cqw solid var(--ink)",
              padding: "0.3cqw 0.5cqw",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontFamily: "var(--font-label)",
              fontSize: "1.8cqw",
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              textWrap: "balance",
              backgroundColor: "rgba(217, 202, 166, 0.4)",
              lineHeight: 1.15,
            }}
          >
            APPLICATIONS CLOSE SUNDAY, 11:59 PM
          </div>
        </div>

        {/* 5. Kicker */}
        <div
          className="kicker"
          style={{
            textAlign: "center",
            fontSize: "2.4cqw",
            letterSpacing: "0.14em",
            marginBottom: "0.1cqw",
          }}
        >
          OFFICIAL AUTUMN NOTIFICATION
        </div>

        {/* 5b. Headline: "TAM IS RECRUITING!" in Anton */}
        <div style={{ textAlign: "center", margin: "0.1cqw 0" }}>
          <h2
            className="font-headline anim-stamp-in"
            style={{
              fontSize: "16.5cqw",
              lineHeight: 0.9,
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            TAM IS<br />RECRUITING!
          </h2>

          {/* 6. Italic Deck */}
          <p
            className="deck"
            style={{
              fontSize: "2.5cqw",
              lineHeight: 1.18,
              marginTop: "0.4cqw",
              textAlign: "center",
              fontFamily: "var(--font-body)",
              fontStyle: "italic",
              maxWidth: "96%",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Positions open across tech, management, research, marketing, design, editorial. Prior project experience is valued, but curiosity and consistency matter most.
          </p>
        </div>

        <hr className="fb-rule-single" style={{ margin: "0.5cqw 0 0.4cqw 0" }} />
      </div>

      {/* 7 & 8. MIDDLE ROW: 3-part equal height (~28.5cqw) layout:
          Left: Figure (tech-1) square with tight frame
          Middle: 20cqw caption column with top rule and italic text aligned to bottom
          Right: INSIDE box taking remaining width with font size >= 1.8cqw */}
      <div
        style={{
          height: "28.5cqw",
          display: "flex",
          gap: "1.8cqw",
          alignItems: "stretch",
          margin: "0.3cqw 0 0.4cqw 0",
        }}
      >
        {/* Left: Figure tech-1 square ~28.5cqw */}
        <Figure
          src="/images/tech-1.png"
          alt="TAM Technical Workshop"
          maxW="28.5cqw"
          maxH="28.5cqw"
          priority
          style={{ width: "28.5cqw", height: "28.5cqw" }}
        />

        {/* Middle Column (~20cqw wide): short ink rule at top, caption aligned to bottom */}
        <div
          style={{
            width: "20cqw",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "0.2cqw 0",
            height: "100%",
            boxSizing: "border-box",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: "5cqw",
              borderTop: "0.3cqw solid var(--ink)",
              margin: 0,
            }}
          />
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontStyle: "italic",
              fontSize: "1.95cqw",
              lineHeight: 1.22,
              color: "var(--ink)",
              margin: 0,
              textAlign: "left",
            }}
          >
            TAM welcomes both builders and thinkers who want to understand machine intelligence from the ground up.
          </p>
        </div>

        {/* Right Column: Rebuilt INSIDE box taking remaining width, font size >= 1.8cqw */}
        <div
          style={{
            flex: 1,
            height: "100%",
            boxSizing: "border-box",
            minWidth: 0,
          }}
        >
          <div
            className="fb-index-box"
            style={{
              height: "100%",
              boxSizing: "border-box",
              overflow: "visible",
              padding: "1.0cqw 1.8cqw",
              border: "0.4cqw solid var(--ink)",
              backgroundColor: "rgba(217, 202, 166, 0.4)",
              display: "grid",
              gridTemplateRows: `auto repeat(${INSIDE_ENTRIES.length}, minmax(0, 1fr))`,
            }}
          >
            {/* Row 1: Header with single hairline rule and 0.4cqw margin below */}
            <div style={{ marginBottom: "0.4cqw" }}>
              <div
                style={{
                  fontFamily: "var(--font-headline)",
                  fontSize: "2.1cqw",
                  letterSpacing: "0.14em",
                  textAlign: "center",
                  lineHeight: 1,
                  margin: 0,
                }}
              >
                ✦ INSIDE ✦
              </div>
              <hr
                className="fb-rule-hairline"
                style={{
                  margin: "0.3cqw 0 0 0",
                  borderTop: "1px solid var(--ink)",
                }}
              />
            </div>

            {/* 9 Entries taking equal share, vertically centered, font size >= 1.8cqw */}
            {INSIDE_ENTRIES.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => onSelectPage(item.pageIndex)}
                className="fb-index-row-btn"
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr auto",
                  alignItems: "center",
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontFamily: "var(--font-label)",
                  fontSize: "1.82cqw",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  lineHeight: 1,
                  whiteSpace: "nowrap",
                  color: item.isOxblood ? "var(--stamp)" : "var(--ink)",
                  textAlign: "left",
                }}
              >
                <span className="fb-index-label-text">{item.label}</span>
                <span
                  style={{
                    height: "1px",
                    borderBottom: "1px dotted currentColor",
                    margin: "0 0.5cqw",
                    alignSelf: "center",
                  }}
                />
                <span
                  style={{
                    fontVariantNumeric: "tabular-nums",
                    fontWeight: 700,
                    minWidth: "2ch",
                    textAlign: "right",
                  }}
                >
                  {item.pageNumber}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 10. BOTTOM SECTION: Extended 4-paragraph article strictly in 2 columns with drop cap & footer bar */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          marginTop: "0.3cqw",
        }}
      >
        <hr className="fb-rule-single" style={{ margin: "0.3cqw 0 0.4cqw 0" }} />

        <div
          id="front-page-article"
          style={{
            flex: 1,
            minHeight: 0,
            columnCount: 2,
            columnFill: "balance",
            columnGap: "2.4cqw",
            columnRule: "0.2cqw solid var(--ink)",
            fontFamily: "var(--font-body)",
            fontSize: "2.18cqw",
            lineHeight: 1.18,
            textAlign: "justify",
            hyphens: "auto",
            color: "var(--ink)",
            overflow: "clip",
          }}
        >
          {/* Paragraph 1 */}
          <p style={{ margin: 0, marginBottom: "0.7cqw", textIndent: 0 }}>
            <span
              style={{
                float: "left",
                fontFamily: "var(--font-masthead, 'Pirata One', serif)",
                fontSize: "5.6cqw",
                lineHeight: 0.8,
                paddingRight: "0.5cqw",
                paddingTop: "0.15cqw",
                color: "var(--ink)",
              }}
            >
              F
            </span>
            or any student fascinated by where technology is heading, artificial intelligence is no longer just theory in a textbook—it is something you can build, test, and question yourself. The AI &amp; ML Club was founded on a straightforward idea: bring together people who genuinely enjoy working with intelligent systems, give them a team, and build projects that actually ship.
          </p>

          {/* Paragraph 2 */}
          <p style={{ margin: 0, marginBottom: "0.7cqw", textIndent: 0 }}>
            We do not expect you to have published papers or memorized every mathematical framework before walking through our doors. What we look for is genuine interest, regular effort, and the habit of asking why things work the way they do.
          </p>

          {/* Paragraph 3 */}
          <p style={{ margin: 0, marginBottom: "0.7cqw", textIndent: 0 }}>
            Whether you write PyTorch models at midnight, design clean user interfaces, organize large campus initiatives, or write clear explanations of complex ideas, there is a dedicated space for you here. Our work spans practical applied ML, open-source tools, workshops, and hackathons throughout the academic year.
          </p>

          {/* Paragraph 4 (approved shorter version guaranteeing no overflow or stray column) */}
          <p style={{ margin: 0, marginBottom: 0, textIndent: 0 }}>
            Turn the pages to review each domain, find the track that fits your strengths, fill out your dispatch sheet on Page {pageNo("coupon")}, and join the conversation at the Desk.
          </p>
        </div>

        {/* 11. Footer Bar */}
        <div>
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
              height: "3cqw",
              alignItems: "center",
            }}
          >
            <span>THE TAM TIMES</span>
            <span>THE AI &amp; ML CLUB · VIT VELLORE</span>
            <span>PAGE {pageNo("cover")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
