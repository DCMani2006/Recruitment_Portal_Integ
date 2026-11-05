"use client";

import React from "react";
import Link from "next/link";
import { Domain } from "@/lib/client";
import { useEditionStatus } from "@/lib/statusContext";
import { FiveStepTracker, getStageDetails } from "./FiveStepTracker";

interface DivisionStatusBarProps {
  domain: Domain;
  isVisible?: boolean;
}

export function DivisionStatusBar({ domain, isVisible = true }: DivisionStatusBarProps) {
  const { loading, error, refetch, getAppForDomain } = useEditionStatus();
  const app = getAppForDomain(domain);

  // If loading, show compact newspaper-styled skeleton
  if (loading) {
    return (
      <div
        className="fb-status-bar-skeleton"
        style={{
          height: "12.8cqw",
          width: "100%",
          boxSizing: "border-box",
          border: "0.4cqw solid var(--ink)",
          backgroundColor: "rgba(217, 202, 166, 0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          className="font-label"
          style={{
            fontSize: "1.6cqw",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--ink-soft)",
          }}
        >
          CHECKING APPOINTMENT RECORD...
        </span>
      </div>
    );
  }

  // If error, show quiet "Status unavailable" with Retry
  if (error) {
    return (
      <div
        style={{
          height: "12.8cqw",
          width: "100%",
          boxSizing: "border-box",
          border: "0.3cqw dashed var(--ink-soft)",
          backgroundColor: "rgba(217, 202, 166, 0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 2cqw",
          flexShrink: 0,
        }}
      >
        <span
          className="font-label"
          style={{
            fontSize: "1.5cqw",
            color: "var(--ink-soft)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          STATUS UNAVAILABLE
        </span>
        <button
          type="button"
          onClick={() => refetch()}
          tabIndex={isVisible ? 0 : -1}
          className="btn-outline"
          style={{
            fontSize: "1.4cqw",
            padding: "0.3cqw 1cqw",
            cursor: "pointer",
          }}
        >
          RETRY
        </button>
      </div>
    );
  }

  // If candidate has NOT applied to this division, render nothing (gives space to text & picture)
  if (!app) {
    return null;
  }

  const details = getStageDetails(app);

  return (
    <div
      className="fb-status-bar"
      style={{
        height: "13.2cqw",
        width: "100%",
        boxSizing: "border-box",
        border: "0.4cqw solid var(--ink)",
        backgroundColor: "rgba(232, 220, 192, 0.95)",
        boxShadow: "0.25cqw 0.25cqw 0 var(--ink)",
        padding: "0.8cqw 1.8cqw",
        display: "grid",
        gridTemplateColumns: "14cqw 1fr auto",
        alignItems: "center",
        gap: "1.6cqw",
        flexShrink: 0,
        position: "relative",
      }}
    >
      {/* LEFT: small-caps label "YOUR STATUS" */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          borderRight: "0.15cqw solid var(--ink)",
          paddingRight: "1cqw",
          height: "80%",
        }}
      >
        <span
          className="font-label"
          style={{
            fontSize: "1.45cqw",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            color: "var(--stamp)",
            lineHeight: 1.1,
          }}
        >
          YOUR STATUS
        </span>
        <span
          className="font-label"
          style={{
            fontSize: "1.1cqw",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "var(--ink-soft)",
            textTransform: "uppercase",
            marginTop: "0.3cqw",
          }}
        >
          REF · {domain}
        </span>
      </div>

      {/* CENTRE: Current stage in Anton with 5-step tracker beneath */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "0.35cqw",
          minWidth: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.8cqw",
          }}
        >
          <h4
            className="font-headline"
            style={{
              fontSize: "2.85cqw",
              letterSpacing: "0.02em",
              lineHeight: 1,
              margin: 0,
              textTransform: "uppercase",
              color: details.isRejected ? "var(--ink)" : "var(--ink)",
              whiteSpace: "nowrap",
            }}
          >
            {details.headline}
          </h4>

          {/* Small oxblood rubber stamp if SELECTED */}
          {details.hasStamp && (
            <span
              className="fb-apply-stamp"
              style={{
                display: "inline-block",
                border: "0.2cqw solid var(--stamp)",
                color: "var(--stamp)",
                fontFamily: "var(--font-headline)",
                fontSize: "1.2cqw",
                padding: "0.1cqw 0.4cqw",
                letterSpacing: "0.08em",
                transform: "rotate(-5deg)",
                lineHeight: 1,
                userSelect: "none",
              }}
            >
              SELECTED
            </span>
          )}
        </div>

        {/* If booking exists, show date and time in IST */}
        {details.bookingTime && (
          <div
            style={{
              fontSize: "1.5cqw",
              fontFamily: "var(--font-body)",
              fontStyle: "italic",
              color: "var(--stamp)",
              lineHeight: 1,
            }}
          >
            Summoned: {details.bookingTime}
          </div>
        )}

        {/* 5-step tracker */}
        <FiveStepTracker app={app} cqwUnits={true} />
      </div>

      {/* RIGHT: Action Button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <Link
          href={details.buttonHref}
          tabIndex={isVisible ? 0 : -1}
          aria-label={`${details.buttonLabel} for ${domain}`}
          className="fb-apply-btn"
          style={{
            fontFamily: "var(--font-headline)",
            fontSize: "1.8cqw",
            letterSpacing: "0.04em",
            padding: "0.7cqw 1.4cqw",
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
            transition: "transform 140ms ease, box-shadow 140ms ease, background-color 140ms ease",
          }}
        >
          {details.buttonLabel}
        </Link>
      </div>
    </div>
  );
}
