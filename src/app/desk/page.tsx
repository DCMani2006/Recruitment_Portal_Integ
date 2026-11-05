"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import { CountdownTicker } from "@/components/CountdownTicker";
import {
  api,
  fmtDateTime,
  StatusResponse,
  Domain,
  Stage,
  STAGE_LABELS,
  errorText,
} from "@/lib/client";
import { useSession } from "@/lib/session";
import { FiveStepTracker, getStageDetails } from "@/components/FiveStepTracker";
import { getDomainLabel } from "@/lib/config";

export default function DispatchPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "40px" }}>
          <span className="font-label" style={{ fontSize: "0.85rem", letterSpacing: "0.15em" }}>
            OPENING CANDIDATE REGISTRY...
          </span>
        </div>
      }
    >
      <DispatchPageContent />
    </Suspense>
  );
}

function DispatchPageContent() {
  const searchParams = useSearchParams();
  const domainParam = searchParams.get("domain") as Domain | null;

  const { user, refresh: refreshSession } = useSession();
  const [statusData, setStatusData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [highlightedDomain, setHighlightedDomain] = useState<Domain | null>(null);

  const fetchStatus = useCallback(async () => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("tam.justSignedUp");
      } catch {}
    }
    try {
      const res = await api.status();
      setStatusData(res);
      setError(null);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Handle ?domain= query parameter: scroll to card and highlight
  useEffect(() => {
    if (!loading && statusData && domainParam) {
      const card = document.getElementById(`domain-card-${domainParam}`);
      if (card) {
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedDomain(domainParam);
        const timer = setTimeout(() => {
          setHighlightedDomain(null);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [loading, statusData, domainParam]);



  return (
    <AuthGuard>
      <div className="anim-paper-slide-up">
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div className="kicker">OFFICIAL CANDIDATE DOSSIER</div>
          <h1
            className="font-headline"
            style={{ fontSize: "clamp(2rem, 4.5vw, 2.8rem)", marginTop: "2px" }}
          >
            YOUR DISPATCH
          </h1>
          <p className="deck" style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.88rem)", marginTop: "2px" }}>
            Real-time status of your departmental applications, review stages, and interview summons.
          </p>
          <hr className="rule-double" style={{ margin: "10px 0" }} />
        </div>

        {/* Application Deadline Horizontal Banner */}
        <div
          className="paper"
          style={{
            border: "1.5px solid var(--ink)",
            padding: "14px 20px",
            boxShadow: "2px 2px 0 var(--ink)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
            width: "100%",
          }}
        >
          <div>
            <div
              className="font-label"
              style={{ fontSize: "0.72rem", color: "var(--stamp)", fontWeight: 700, letterSpacing: "0.1em" }}
            >
              APPLICATION DEADLINE
            </div>
            <div className="font-body" style={{ fontSize: "0.82rem", color: "var(--ink-soft)", marginTop: "2px" }}>
              All answers must be sealed before the ticker terminates.
            </div>
          </div>

          <CountdownTicker />
        </div>



        {/* Loading / Error states */}
        {loading && (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <span className="font-label" style={{ fontSize: "0.85rem", letterSpacing: "0.15em" }}>
              COMPILING DEPARTMENT DISPATCHES...
            </span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              border: "2px solid var(--stamp)",
              backgroundColor: "rgba(139, 30, 30, 0.1)",
              padding: "12px",
              color: "var(--stamp)",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        {/* No applications state */}
        {!loading && statusData && statusData.applications.length === 0 && (
          <div className="desk-card" style={{ textAlign: "center", padding: "32px 16px" }}>
            <h2 className="font-headline" style={{ fontSize: "1.4rem" }}>NO DISCIPLINES CURRENTLY ENROLLED</h2>
            <p className="font-body" style={{ color: "var(--ink-soft)", margin: "8px 0 16px 0" }}>
              Your profile has not yet selected any candidate branches. Please open the question form to select a division.
            </p>
            <Link href="/desk/form" className="btn-oxblood">
              Fill Out Application Form ➔
            </Link>
          </div>
        )}

        {/* Department Application Cards */}
        {statusData?.applications.map((app) => {
          const details = getStageDetails(app);
          const isHighlighted = highlightedDomain === app.domain;
          const isQualifiedForInterview = Boolean(
            app.canChooseSlots ||
            app.booking ||
            app.stage === "SHORTLISTED" ||
            app.stage === "SLOT_CHOOSING" ||
            app.stage === "INTERVIEW" ||
            app.stage === "SELECTED"
          );

          return (
            <div
              key={app.domain}
              id={`domain-card-${app.domain}`}
              className="desk-card"
              style={{
                transition: "all 0.3s ease",
                ...(isHighlighted
                  ? {
                      outline: "3px solid var(--stamp)",
                      boxShadow: "0 0 18px rgba(139, 30, 30, 0.35)",
                      transform: "scale(1.01)",
                    }
                  : {}),
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "10px",
                  borderBottom: "1.5px solid var(--ink)",
                  paddingBottom: "8px",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <div className="kicker" style={{ fontSize: "0.68rem" }}>
                    DEPARTMENT DOSSIER · REF {app.domain}
                  </div>
                  <h2 className="font-headline" style={{ fontSize: "1.6rem", marginTop: "1px" }}>
                    {getDomainLabel(app.domain)}
                  </h2>
                </div>

                <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    className="font-headline"
                    style={{
                      fontSize: "0.95rem",
                      color: details.isRejected ? "var(--ink-soft)" : "var(--stamp)",
                      letterSpacing: "0.03em",
                      textTransform: "uppercase",
                    }}
                  >
                    {details.headline}
                  </span>
                  {details.hasStamp && (
                    <span className="rubber-stamp" style={{ borderColor: "var(--stamp)", color: "var(--stamp)", transform: "rotate(-3deg)" }}>
                      SELECTED
                    </span>
                  )}
                </div>
              </div>

              {/* Typeset Five-Step Timeline Stage Tracker */}
              <div
                style={{
                  margin: "14px 0 18px 0",
                  padding: "10px 14px",
                  backgroundColor: "rgba(217, 202, 166, 0.25)",
                  border: "1px dashed var(--ink)",
                }}
              >
                <div
                  className="font-label"
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--ink-soft)",
                    marginBottom: "8px",
                    textAlign: "center",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  PROGRESSION OF CANDIDACY
                </div>

                <FiveStepTracker app={app} cqwUnits={false} />
              </div>

              {/* Round 1: Form Filling Options Section */}
              <div
                style={{
                  border: "1px solid var(--ink)",
                  backgroundColor: "rgba(217, 202, 166, 0.2)",
                  padding: "12px 16px",
                  margin: "14px 0 10px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <div
                    className="font-label"
                    style={{ fontSize: "0.68rem", color: "var(--ink)", fontWeight: 700, letterSpacing: "0.08em" }}
                  >
                    ROUND 1: APPLICATION QUESTIONNAIRE
                  </div>
                  {!app.submitted ? (
                    <div className="font-body" style={{ fontSize: "0.82rem", color: "var(--stamp)", marginTop: "2px" }}>
                      Answers are unsealed. Please complete required questions before deadline.
                    </div>
                  ) : (
                    <div className="font-body" style={{ fontSize: "0.82rem", color: "var(--ink-soft)", marginTop: "2px" }}>
                      Dispatch received and archived in Council registry.
                    </div>
                  )}
                </div>

                <div>
                  <Link
                    href={`/desk/form?domain=${app.domain}`}
                    className={!app.submitted ? "btn-oxblood" : "btn-outline"}
                    style={{ fontSize: "0.75rem", padding: "6px 14px" }}
                  >
                    {!app.submitted ? "Complete Application Form ➔" : "Review Questionnaire ➔"}
                  </Link>
                </div>
              </div>

              {/* Round 2: Online interview card (Only visible once qualified by admin, physically AFTER form options) */}
              {isQualifiedForInterview && (
                <div
                  style={{
                    border: "1.5px solid var(--ink)",
                    backgroundColor: app.booking ? "rgba(217, 202, 166, 0.45)" : "rgba(217, 202, 166, 0.2)",
                    padding: "12px 16px",
                    margin: "10px 0 4px 0",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  <div>
                    <div
                      className="font-label"
                      style={{ fontSize: "0.68rem", color: "var(--stamp)", fontWeight: 700, letterSpacing: "0.08em" }}
                    >
                      ROUND 2: ONLINE INTERVIEW
                    </div>
                    {app.booking ? (
                      <div>
                        <div className="font-body" style={{ fontSize: "0.88rem", color: "var(--ink)", marginTop: "2px" }}>
                          Confirmed appointment: <strong>{fmtDateTime(app.booking.slot.startTime)} IST</strong>
                        </div>
                        {app.booking.slot.meetingLink && (
                          <div style={{ marginTop: "4px" }}>
                            <a
                              href={app.booking.slot.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="font-label"
                              style={{ color: "var(--stamp)", textDecoration: "underline", fontSize: "0.74rem" }}
                            >
                              Access Google Meet Council Chambers ➔
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="font-body" style={{ fontSize: "0.82rem", color: "var(--ink-soft)", marginTop: "2px" }}>
                        You have qualified for interviews! Please reserve your 15-minute slot with the departmental council.
                      </div>
                    )}
                  </div>

                  <div>
                    <Link
                      href={`/desk/interview?domain=${app.domain}`}
                      className={app.booking ? "btn-outline" : "btn-oxblood"}
                      style={{ fontSize: "0.75rem", padding: "6px 14px" }}
                    >
                      {app.booking ? "Manage Slot ➔" : "Book Interview Slot ➔"}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AuthGuard>
  );
}
