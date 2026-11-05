"use client";

import React from "react";
import Link from "next/link";
import { Figure } from "./Figure";
import { TopStripLogo } from "./TopStripLogo";
import { DomainPageData } from "@/content/domainPagesData";
import { useEditionStatus } from "@/lib/statusContext";
import { FIVE_STEPS, getStageDetails } from "./FiveStepTracker";

interface DomainPageProps {
  data?: DomainPageData;
  content?: DomainPageData;
  isVisible?: boolean;
}

export function DomainPage({ data, content, isVisible = true }: DomainPageProps) {
  const pageData = data || content;
  const { getAppForDomain } = useEditionStatus();

  if (!pageData) return null;

  const isLeftPage = pageData.pageNumber % 2 === 0;
  const app = getAppForDomain(pageData.domainCode);
  const isApplied = !!app;
  const stageDetails = app ? getStageDetails(app) : null;
  const showStatusBlock = isApplied;

  const bodyFontSize = "2.05cqw";

  return (
    <div
      className={`flipbook-page-wrapper paper ${isLeftPage ? "page-left" : "page-right"}`}
      style={{
        padding: "2.4cqw 3.6cqw",
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

      {/* 1. HEADER SECTION (Rows a to c) */}
      <div style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}>
        {/* Row a: Top strip with locked club logo alone between double rules */}
        <TopStripLogo />

        {/* Row b: Masthead row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            height: "4.4cqw",
            boxSizing: "border-box",
            margin: "0.1cqw 0",
          }}
        >
          <span
            className="font-masthead"
            style={{
              fontFamily: "var(--font-masthead, 'Pirata One', serif)",
              fontSize: "4.4cqw",
              lineHeight: 1,
            }}
          >
            The TAM Times
          </span>
          <span
            className="kicker"
            style={{
              fontSize: "1.9cqw",
              letterSpacing: "0.12em",
              color: "var(--stamp)",
              fontWeight: 700,
              fontFamily: "var(--font-label)",
              textTransform: "uppercase",
            }}
          >
            {pageData.mastheadLabel}
          </span>
        </div>

        <hr className="fb-rule-hairline" style={{ margin: "0.2cqw 0 0.5cqw 0" }} />

        {/* Row c: Headline in Anton, uppercase, centered */}
        <h2
          className="font-headline"
          style={{
            fontSize: "7.5cqw",
            lineHeight: 0.95,
            letterSpacing: "-0.01em",
            margin: "0 0 0.35cqw 0",
            textAlign: "center",
            textTransform: "uppercase",
            textWrap: "balance",
          }}
        >
          {pageData.headline}
        </h2>

        {/* Row c: Deck, centred italic, balanced */}
        <p
          className="deck"
          style={{
            fontFamily: "var(--font-body)",
            fontStyle: "italic",
            fontSize: "2.1cqw",
            lineHeight: 1.18,
            textAlign: "center",
            margin: "0 auto 0.35cqw auto",
            textWrap: "balance",
            maxWidth: "94%",
            color: "var(--ink)",
          }}
        >
          {pageData.deck}
        </p>

        <hr className="fb-rule-hairline" style={{ margin: "0.2cqw 0 0.4cqw 0" }} />
      </div>

      {/* 2. ROW d: PICTURE ON LEFT & SKILLS BOX ON RIGHT (BOTH SAME HEIGHT) */}
      <div
        style={{
          display: "flex",
          gap: "2.2cqw",
          alignItems: "stretch",
          margin: "0.2cqw 0",
          flexShrink: 0,
        }}
      >
        {/* Left: Picture uncropped via Figure with caption */}
        <div
          style={{
            width: pageData.imageWidth || "28cqw",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Figure
            src={pageData.image}
            alt={pageData.headline}
            maxW="100%"
            caption=""
            style={{ width: "100%", margin: 0 }}
          />
          <div style={{ marginTop: "0.3cqw" }}>
            <div
              style={{
                width: "50%",
                height: "0.15cqw",
                backgroundColor: "var(--ink)",
                margin: "0 auto 0.25cqw auto",
              }}
            />
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontStyle: "italic",
                fontSize: "1.6cqw",
                lineHeight: 1.15,
                textAlign: "center",
                color: "var(--ink-soft)",
                margin: 0,
              }}
            >
              {pageData.caption}
            </p>
          </div>
        </div>

        {/* Right: Skills Box filling the rest of the row, matching height */}
        <div
          style={{
            flex: 1,
            border: "0.35cqw solid var(--ink)",
            padding: "0.8cqw 1.2cqw",
            backgroundColor: "rgba(217, 202, 166, 0.35)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxSizing: "border-box",
          }}
        >
          <div
            className="font-headline"
            style={{
              fontSize: "2.1cqw",
              letterSpacing: "0.08em",
              color: "var(--stamp)",
              textAlign: "center",
              borderBottom: "0.15cqw solid var(--ink)",
              paddingBottom: "0.2cqw",
              marginBottom: "0.3cqw",
              lineHeight: 1.1,
            }}
          >
            {pageData.skillsBoxHeader}
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
              flex: 1,
              gap: "0.3cqw",
            }}
          >
            {pageData.skills.map((skill, idx) => {
              const colonIndex = skill.indexOf(":");
              const hasColon = colonIndex !== -1;
              const title = hasColon ? skill.slice(0, colonIndex) : null;
              const desc = hasColon ? skill.slice(colonIndex + 1) : skill;
              const itemFontSize = pageData.skills.length > 5 ? "2.05cqw" : "2.2cqw";

              return (
                <div
                  key={idx}
                  className="fb-skill-item"
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.4cqw",
                    fontSize: itemFontSize,
                    lineHeight: 1.3,
                    color: "#1C1613",
                  }}
                >
                  <span style={{ color: "var(--stamp)", fontWeight: 700, flexShrink: 0 }}>—</span>
                  <span style={{ color: "#1C1613" }}>
                    {hasColon ? (
                      <>
                        <strong
                          style={{
                            fontVariant: "small-caps",
                            textTransform: "uppercase",
                            fontWeight: 700,
                            letterSpacing: "0.03em",
                            color: "#1C1613",
                          }}
                        >
                          {title}:
                        </strong>
                        <span style={{ fontWeight: 400, color: "#1C1613" }}>{desc}</span>
                      </>
                    ) : (
                      <span style={{ fontWeight: 400, color: "#1C1613" }}>{desc}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. ROW e: THE ARTICLE AS TWO EXPLICIT COLUMNS WITH A COLUMN RULE */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2.4cqw",
          margin: "0.2cqw 0",
          flexShrink: 0,
        }}
      >
        {/* Column 1 */}
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: bodyFontSize,
            lineHeight: 1.26,
            textAlign: "justify",
            hyphens: "auto",
            color: "var(--ink)",
            paddingRight: "1.2cqw",
            borderRight: "0.15cqw solid var(--ink)",
          }}
        >
          <p style={{ margin: pageData.col1_p2 ? "0 0 0.5cqw 0" : 0, textIndent: 0 }}>
            <span className="dropcap">{pageData.dropcap}</span>
            {pageData.col1_p1}
          </p>
          {pageData.col1_p2 && (
            <p style={{ margin: 0, textIndent: 0 }}>
              {pageData.col1_p2}
            </p>
          )}
        </div>

        {/* Column 2 */}
        <div
          style={{
            fontFamily: "var(--font-body)",
            fontSize: bodyFontSize,
            lineHeight: 1.26,
            textAlign: "justify",
            hyphens: "auto",
            color: "var(--ink)",
            paddingLeft: "1.2cqw",
          }}
        >
          <p style={{ margin: pageData.col2_p2 ? "0 0 0.5cqw 0" : 0, textIndent: 0 }}>
            {pageData.col2_p1}
          </p>
          {pageData.col2_p2 && (
            <p style={{ margin: 0, textIndent: 0 }}>
              {pageData.col2_p2}
            </p>
          )}
        </div>
      </div>

      {/* 4. ROW f: QUOTE STRIP */}
      <div style={{ margin: "0.2cqw 0", flexShrink: 0 }}>
        <hr className="fb-rule-hairline" style={{ margin: 0 }} />
        <div
          className="font-headline"
          style={{
            fontSize: "2.2cqw",
            fontStyle: "italic",
            letterSpacing: "0.04em",
            textAlign: "center",
            padding: "0.3cqw 0",
            color: "var(--ink)",
            lineHeight: 1.1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {pageData.quoteStrip}
        </div>
        <hr className="fb-rule-hairline" style={{ margin: 0 }} />
      </div>

      {/* 5. ROW g: BOTTOM BAND = "WANTED" NOTICE + STATUS */}
      <div
        style={{
          height: "12.8cqw",
          margin: "0.2cqw 0",
          flexShrink: 0,
          display: "flex",
          gap: "1.5cqw",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {!showStatusBlock ? (
          /* Plain bordered notice taking full 100% width, NO link, NO button */
          <div
            style={{
              width: "100%",
              height: "100%",
              border: "0.35cqw solid var(--ink)",
              backgroundColor: "rgba(217, 202, 166, 0.4)",
              padding: "0.8cqw 1.5cqw",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            <div
              className="font-headline"
              style={{
                fontSize: "3.2cqw",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "var(--ink)",
                lineHeight: 1.05,
                margin: "0 0 0.3cqw 0",
              }}
            >
              {pageData.wantedHeadline}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontStyle: "italic",
                fontSize: "1.95cqw",
                lineHeight: 1.18,
                color: "var(--ink-soft)",
                maxWidth: "92%",
              }}
            >
              {pageData.wantedTagline}
            </div>
          </div>
        ) : (
          /* Split band: 58% Wanted notice on left, 40% Status block on right */
          <>
            <div
              style={{
                flex: "0 0 58%",
                border: "0.35cqw solid var(--ink)",
                backgroundColor: "rgba(217, 202, 166, 0.4)",
                padding: "0.7cqw 1.2cqw",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                textAlign: "left",
                boxSizing: "border-box",
              }}
            >
              <div
                className="font-headline"
                style={{
                  fontSize: "2.4cqw",
                  letterSpacing: "0.03em",
                  textTransform: "uppercase",
                  color: "var(--ink)",
                  lineHeight: 1.05,
                  margin: "0 0 0.2cqw 0",
                }}
              >
                {pageData.wantedHeadline}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontStyle: "italic",
                  fontSize: "1.65cqw",
                  lineHeight: 1.15,
                  color: "var(--ink-soft)",
                }}
              >
                {pageData.wantedTagline}
              </div>
            </div>

            <div
              style={{
                flex: "0 0 40%",
                border: "0.35cqw solid var(--ink)",
                backgroundColor: "rgba(217, 202, 166, 0.45)",
                padding: "0.6cqw 1.0cqw",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxSizing: "border-box",
              }}
            >
              <div>
                <div
                  className="font-label"
                  style={{
                    fontSize: "1.25cqw",
                    color: "var(--stamp)",
                    letterSpacing: "0.12em",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  YOUR STATUS
                </div>
                <div
                  className="font-headline"
                  style={{
                    fontSize: "2.0cqw",
                    color: "var(--ink)",
                    lineHeight: 1.05,
                    textTransform: "uppercase",
                    marginTop: "0.1cqw",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {stageDetails?.headline || "IN PROGRESS"}
                </div>
              </div>

              {/* 5-step tracker */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.4cqw",
                }}
              >
                {FIVE_STEPS.map((step, idx) => {
                  const state = stageDetails?.stepStates[idx];
                  const isCompleted = state === "completed";
                  const isCurrent = state === "current";

                  return (
                    <div
                      key={step.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.2cqw",
                      }}
                      title={step.label}
                    >
                      <span
                        style={{
                          fontSize: "1.4cqw",
                          lineHeight: 1,
                          fontWeight: isCompleted || isCurrent ? 800 : 400,
                          color: isCompleted
                            ? "var(--ink)"
                            : isCurrent
                            ? "var(--stamp)"
                            : "var(--ink-soft)",
                        }}
                      >
                        {isCompleted ? "✓" : isCurrent ? "●" : "○"}
                      </span>
                      <span
                        className="font-label"
                        style={{
                          fontSize: "0.95cqw",
                          textTransform: "uppercase",
                          color: isCurrent
                            ? "var(--stamp)"
                            : isCompleted
                            ? "var(--ink)"
                            : "var(--ink-soft)",
                          fontWeight: isCurrent ? 700 : 500,
                        }}
                      >
                        {step.label.split(" ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Link
                  href={`/desk?domain=${pageData.domainCode}`}
                  className="font-label"
                  style={{
                    fontSize: "1.15cqw",
                    color: "var(--stamp)",
                    textDecoration: "underline",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  VIEW YOUR DESK →
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 6. ROW h: FOOTER BAR */}
      <div style={{ flexShrink: 0 }}>
        <hr className="fb-rule-single" style={{ margin: "0.2cqw 0 0.2cqw 0" }} />
        <div
          className="fb-footer-bar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "var(--font-label)",
            fontSize: "1.8cqw",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            height: "2.4cqw",
            alignItems: "center",
          }}
        >
          <span>THE TAM TIMES</span>
          <span>{pageData.footerCentre}</span>
          <span>PAGE {pageData.pageNumber}</span>
        </div>
      </div>
    </div>
  );
}
