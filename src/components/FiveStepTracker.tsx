"use client";

import React from "react";
import { StatusApplication, fmtDateTime } from "@/lib/client";

export const FIVE_STEPS = [
  { key: "FORM_FILLING", label: "Form filling", index: 0 },
  { key: "SHORTLISTED", label: "Shortlisted", index: 1 },
  { key: "SLOT_CHOOSING", label: "Slot choosing", index: 2 },
  { key: "INTERVIEW", label: "Interview", index: 3 },
  { key: "SELECTED", label: "Selected", index: 4 },
] as const;

export interface StageDetails {
  headline: string;
  bookingTime: string | null;
  hasStamp: boolean;
  buttonLabel: string;
  buttonHref: string;
  isRejected: boolean;
  stepStates: ("completed" | "current" | "future")[];
}

export function getStageDetails(app: StatusApplication): StageDetails {
  const isRejected = app.stage === "REJECTED";
  const isSelected = app.stage === "SELECTED";
  const isInterview = app.stage === "INTERVIEW";
  const isSlotChoosing = app.stage === "SLOT_CHOOSING";
  const isShortlisted = app.stage === "SHORTLISTED";
  const isFormFilling = app.stage === "FORM_FILLING";

  let headline = "";
  let bookingTime: string | null = null;
  let hasStamp = false;

  if (isFormFilling) {
    headline = app.submitted ? "FORM SUBMITTED · UNDER REVIEW" : "FORM FILLING · IN PROGRESS";
  } else if (isShortlisted) {
    headline = "SHORTLISTED";
  } else if (isSlotChoosing) {
    headline = "CHOOSE YOUR INTERVIEW SLOT";
  } else if (isInterview) {
    if (app.booking?.slot) {
      headline = "INTERVIEW BOOKED";
      bookingTime = `${fmtDateTime(app.booking.slot.startTime)} IST`;
    } else {
      headline = "INTERVIEW STAGE";
    }
  } else if (isSelected) {
    headline = "SELECTED";
    hasStamp = true;
  } else if (isRejected) {
    headline = "NOT SELECTED THIS TIME";
  }

  // Button mapping
  let buttonLabel = "VIEW STATUS →";
  let buttonHref = `/desk?domain=${app.domain}`;

  if (isShortlisted || isSlotChoosing) {
    buttonLabel = "PICK INTERVIEW SLOT →";
    buttonHref = `/desk/interview?domain=${app.domain}`;
  } else if (isInterview && app.booking?.slot) {
    buttonLabel = "VIEW INTERVIEW →";
    buttonHref = `/desk/interview?domain=${app.domain}`;
  }

  // Step state calculations
  // 0: Form filling, 1: Shortlisted, 2: Slot choosing, 3: Interview, 4: Selected
  let activeIndex = -1;
  if (isFormFilling) {
    activeIndex = app.submitted ? 0 : 0;
  } else if (isShortlisted) {
    activeIndex = 1;
  } else if (isSlotChoosing) {
    activeIndex = 2;
  } else if (isInterview) {
    activeIndex = 3;
  } else if (isSelected) {
    activeIndex = 4;
  }

  const stepStates: ("completed" | "current" | "future")[] = FIVE_STEPS.map((step) => {
    if (isRejected) return "future";
    if (isFormFilling && app.submitted && step.index === 0) {
      return "completed";
    }
    if (step.index < activeIndex) return "completed";
    if (step.index === activeIndex) return "current";
    return "future";
  });

  return {
    headline,
    bookingTime,
    hasStamp,
    buttonLabel,
    buttonHref,
    isRejected,
    stepStates,
  };
}

interface FiveStepTrackerProps {
  app: StatusApplication;
  cqwUnits?: boolean;
}

export function FiveStepTracker({ app, cqwUnits = false }: FiveStepTrackerProps) {
  const details = getStageDetails(app);

  const fontSize = cqwUnits ? "1.4cqw" : "0.72rem";
  const dotSize = cqwUnits ? "1.8cqw" : "1.05rem";
  const gap = cqwUnits ? "1.2cqw" : "8px";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: gap,
        flexWrap: "nowrap",
        opacity: details.isRejected ? 0.45 : 1,
        filter: details.isRejected ? "grayscale(100%)" : "none",
      }}
    >
      {FIVE_STEPS.map((step, idx) => {
        const state = details.stepStates[idx];
        const isCompleted = state === "completed";
        const isCurrent = state === "current";

        return (
          <div
            key={step.key}
            style={{
              display: "flex",
              alignItems: "center",
              gap: cqwUnits ? "0.4cqw" : "4px",
            }}
          >
            {/* Step marker */}
            <span
              style={{
                fontFamily: isCompleted ? "var(--font-headline)" : "sans-serif",
                fontSize: dotSize,
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

            {/* Step label */}
            <span
              style={{
                fontFamily: "var(--font-label)",
                fontSize: fontSize,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                fontWeight: isCurrent ? 800 : isCompleted ? 700 : 500,
                color: isCurrent
                  ? "var(--stamp)"
                  : isCompleted
                  ? "var(--ink)"
                  : "var(--ink-soft)",
                whiteSpace: "nowrap",
              }}
            >
              {step.label}
            </span>

            {/* Separator rule between steps (except last) */}
            {idx < FIVE_STEPS.length - 1 && (
              <span
                style={{
                  color: "var(--ink-soft)",
                  opacity: 0.4,
                  fontSize: fontSize,
                  marginLeft: cqwUnits ? "0.4cqw" : "4px",
                }}
              >
                ·
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
