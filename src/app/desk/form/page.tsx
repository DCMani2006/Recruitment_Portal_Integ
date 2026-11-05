"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import {
  api,
  fmtTime,
  FormApplication,
  Question,
  Domain,
  ApiError,
  errorText,
} from "@/lib/client";
import { getDomainLabel } from "@/lib/config";

const ALL_DOMAINS_INFO: { code: Domain; label: string }[] = [
  { code: "DESIGN", label: getDomainLabel("DESIGN") },
  { code: "MARKETING", label: getDomainLabel("MARKETING") },
  { code: "R_AND_D", label: getDomainLabel("R_AND_D") },
  { code: "MANAGEMENT", label: getDomainLabel("MANAGEMENT") },
  { code: "TECHNICAL", label: getDomainLabel("TECHNICAL") },
];

function FormContent() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState<{
    isOpen: boolean;
    formDeadline: string;
    applications: FormApplication[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selected domain tab
  const [activeDomain, setActiveDomain] = useState<Domain | null>(null);

  // Initial checklist when user has no applications yet
  const [selectedInitialDomains, setSelectedInitialDomains] = useState<Domain[]>(["TECHNICAL"]);
  const [startingApp, setStartingApp] = useState(false);
  const [startAppError, setStartAppError] = useState<string | null>(null);

  // Local draft state: questionId -> current text
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  // Saved timestamps & status
  const [savedTimestamps, setSavedTimestamps] = useState<Record<string, string | null>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedFlashId, setSavedFlashId] = useState<string | null>(null);

  // Submit modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [missingQuestions, setMissingQuestions] = useState<string[]>([]);
  const [submittedStamp, setSubmittedStamp] = useState(false);

  // Auto-enrolling domain from ?domain=CODE
  const [addedNotice, setAddedNotice] = useState<string | null>(null);
  const [addDomainError, setAddDomainError] = useState<string | null>(null);
  const [addingDomain, setAddingDomain] = useState(false);

  const handleStartApplication = async () => {
    if (selectedInitialDomains.length === 0) {
      setStartAppError("Please select at least one division to begin.");
      return;
    }
    setStartingApp(true);
    setStartAppError(null);
    try {
      await api.updateMe({ domains: selectedInitialDomains });
      await fetchForm();
      if (selectedInitialDomains[0]) {
        setActiveDomain(selectedInitialDomains[0]);
      }
    } catch (err) {
      setStartAppError(errorText(err));
    } finally {
      setStartingApp(false);
    }
  };

  const enrollDomain = useCallback(async (dom: Domain, currentApps: FormApplication[]) => {
    setAddingDomain(true);
    setAddDomainError(null);
    try {
      const existingDomains = currentApps.map((a) => a.domain);
      await api.updateMe({ domains: [...existingDomains, dom] });
      const updated = await api.form();
      setFormData(updated);

      const initialDrafts: Record<string, string> = {};
      const initialSaved: Record<string, string | null> = {};
      updated.applications.forEach((app) => {
        app.questions.forEach((q) => {
          initialDrafts[q.id] = q.answer;
          initialSaved[q.id] = q.savedAt;
        });
      });
      setDrafts((prev) => ({ ...prev, ...initialDrafts }));
      setSavedTimestamps((prev) => ({ ...prev, ...initialSaved }));

      setActiveDomain(dom);
      const label = getDomainLabel(dom);
      setAddedNotice(`${label} added to your applications`);
    } catch (err) {
      setAddDomainError(errorText(err));
    } finally {
      setAddingDomain(false);
    }
  }, []);

  const fetchForm = useCallback(async () => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("tam.justSignedUp");
      } catch {}
    }
    try {
      const res = await api.form();
      setFormData(res);
      setError(null);

      // Populate drafts and saved timestamps
      const initialDrafts: Record<string, string> = {};
      const initialSaved: Record<string, string | null> = {};

      res.applications.forEach((app) => {
        app.questions.forEach((q) => {
          initialDrafts[q.id] = q.answer;
          initialSaved[q.id] = q.savedAt;
        });
      });

      setDrafts(initialDrafts);
      setSavedTimestamps(initialSaved);

      // Set active domain if not already set or from url
      const queryDom = searchParams.get("domain") as Domain | null;
      if (queryDom) {
        const hasDom = res.applications.some((a) => a.domain === queryDom);
        if (hasDom) {
          setActiveDomain(queryDom);
        } else {
          // Auto-enroll if candidate has no application for that domain
          await enrollDomain(queryDom, res.applications);
        }
      } else if (res.applications.length > 0) {
        setActiveDomain((prev) => prev ?? res.applications[0].domain);
      }
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [searchParams, enrollDomain]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  // Current active application
  const currentApp = useMemo(() => {
    if (!formData || !activeDomain) return null;
    return formData.applications.find((a) => a.domain === activeDomain) || null;
  }, [formData, activeDomain]);

  // Compute progress for current application based on local drafts
  const progress = useMemo(() => {
    if (!currentApp) return { answered: 0, total: 0, pct: 0 };
    let answered = 0;
    let total = 0;
    currentApp.questions.forEach((q) => {
      if (q.required) {
        total++;
        const text = drafts[q.id] ?? q.answer;
        if (text.trim().length > 0) answered++;
      }
    });
    const pct = total === 0 ? 100 : Math.round((answered / total) * 100);
    return { answered, total, pct };
  }, [currentApp, drafts]);

  // Group questions by subsection for active application
  const groupedQuestions = useMemo(() => {
    if (!currentApp) return [];

    const generalQuestions: Question[] = [];
    const subsectionMap: Record<string, { name: string; questions: Question[] }> = {};

    currentApp.subsections.forEach((sub) => {
      subsectionMap[sub.id] = { name: sub.name, questions: [] };
    });

    currentApp.questions.forEach((q) => {
      if (!q.subsectionId || !subsectionMap[q.subsectionId]) {
        generalQuestions.push(q);
      } else {
        subsectionMap[q.subsectionId].questions.push(q);
      }
    });

    const groups: { title: string; questions: Question[] }[] = [];
    if (generalQuestions.length > 0) {
      groups.push({ title: "General Inquiries", questions: generalQuestions });
    }
    Object.values(subsectionMap).forEach((sub) => {
      if (sub.questions.length > 0) {
        groups.push({ title: sub.name, questions: sub.questions });
      }
    });

    return groups;
  }, [currentApp]);

  // Save single question answer
  const handleSaveQuestion = async (qId: string) => {
    const text = drafts[qId] ?? "";
    setSavingId(qId);
    setError(null);

    try {
      const res = await api.saveAnswer(qId, text);
      setSavedTimestamps((prev) => ({ ...prev, [qId]: res.savedAt }));
      setSavedFlashId(qId);
      setTimeout(() => setSavedFlashId(null), 2000);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSavingId(null);
    }
  };

  // Check and open submit modal
  const handleOpenSubmit = () => {
    if (!currentApp) return;
    const missing: string[] = [];
    currentApp.questions.forEach((q) => {
      if (q.required) {
        const text = drafts[q.id] ?? q.answer;
        if (!text.trim()) {
          missing.push(q.text);
        }
      }
    });

    setMissingQuestions(missing);
    setConfirmModalOpen(true);
  };

  // Submit confirmed in modal
  const handleConfirmSubmit = async () => {
    if (!currentApp) return;
    setSubmitting(true);
    setError(null);

    try {
      await api.submit(currentApp.domain);
      setSubmittedStamp(true);
      setTimeout(() => {
        setConfirmModalOpen(false);
        setSubmittedStamp(false);
        fetchForm();
      }, 1400);
    } catch (err) {
      if (err instanceof ApiError && err.code === "INCOMPLETE_FORM") {
        setError(errorText(err));
      } else {
        setError(errorText(err));
      }
      setConfirmModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthGuard>
      <div className="anim-paper-slide-up">
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <div className="kicker">COUNCIL QUESTIONNAIRE</div>
          <h1
            className="font-headline"
            style={{ fontSize: "clamp(2rem, 4.5vw, 2.8rem)", marginTop: "2px" }}
          >
            APPLICATION FORM
          </h1>
          <p className="deck" style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.88rem)", marginTop: "2px" }}>
            Draft your written statements with care. Save incrementally; seal only when satisfied.
          </p>
          <hr className="rule-double" style={{ margin: "10px 0" }} />
        </div>

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

        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <span className="font-label" style={{ fontSize: "0.85rem", letterSpacing: "0.15em" }}>
              UNFOLDING DEPARTMENT QUESTION SHEETS...
            </span>
          </div>
        )}

        {!loading && formData && formData.applications.length === 0 && (
          <div className="desk-card" style={{ padding: "32px 24px", maxWidth: "680px", margin: "0 auto" }}>
            <div className="kicker" style={{ textAlign: "center" }}>DEPARTMENT INDUCTION REGISTRY</div>
            <h2 className="font-headline" style={{ fontSize: "1.8rem", textAlign: "center", margin: "4px 0 10px 0" }}>
              CHOOSE DIVISIONS TO BEGIN YOUR APPLICATION
            </h2>
            <p className="font-body" style={{ color: "var(--ink-soft)", textAlign: "center", marginBottom: "22px", fontSize: "0.86rem" }}>
              Select the branches you wish to evaluate for. You can apply to multiple divisions and complete each questionnaire:
            </p>

            {startAppError && (
              <div
                role="alert"
                style={{
                  border: "2px solid var(--stamp)",
                  backgroundColor: "rgba(139, 30, 30, 0.1)",
                  padding: "10px 14px",
                  color: "var(--stamp)",
                  marginBottom: "16px",
                  fontSize: "0.84rem",
                }}
              >
                {startAppError}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginBottom: "24px" }}>
              {ALL_DOMAINS_INFO.map((dom) => {
                const isChecked = selectedInitialDomains.includes(dom.code);
                return (
                  <label
                    key={dom.code}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "12px 14px",
                      border: isChecked ? "2px solid var(--stamp)" : "1.5px solid var(--ink)",
                      backgroundColor: isChecked ? "rgba(139, 30, 30, 0.08)" : "var(--paper)",
                      cursor: "pointer",
                      borderRadius: "2px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedInitialDomains((prev) => [...prev, dom.code]);
                        } else {
                          setSelectedInitialDomains((prev) => prev.filter((d) => d !== dom.code));
                        }
                      }}
                      style={{ accentColor: "var(--stamp)", width: "18px", height: "18px" }}
                    />
                    <span className="font-label" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                      {dom.label}
                    </span>
                  </label>
                );
              })}
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                type="button"
                onClick={handleStartApplication}
                disabled={startingApp || selectedInitialDomains.length === 0}
                className="btn-oxblood"
                style={{ fontSize: "0.95rem", padding: "10px 28px" }}
              >
                {startingApp ? "PREPARING DOSSIERS..." : "START MY APPLICATION ➔"}
              </button>
            </div>
          </div>
        )}

        {/* Added Domain Notice */}
        {addedNotice && (
          <div
            role="status"
            style={{
              border: "1px dashed var(--ink)",
              backgroundColor: "rgba(74, 63, 54, 0.08)",
              padding: "10px 14px",
              marginBottom: "16px",
              color: "var(--ink)",
              fontSize: "0.82rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span className="font-label" style={{ fontWeight: 700 }}>
              ✦ {addedNotice}
            </span>
            <button
              type="button"
              onClick={() => setAddedNotice(null)}
              style={{
                background: "none",
                border: "none",
                fontSize: "0.85rem",
                cursor: "pointer",
                color: "var(--ink)",
              }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Add Domain Error with Retry */}
        {addDomainError && (
          <div
            role="alert"
            style={{
              border: "2px solid var(--stamp)",
              backgroundColor: "rgba(139, 30, 30, 0.1)",
              padding: "12px 16px",
              color: "var(--stamp)",
              marginBottom: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <span style={{ fontSize: "0.85rem" }}>{addDomainError}</span>
            <button
              type="button"
              onClick={() => {
                const queryDom = searchParams.get("domain") as Domain | null;
                if (queryDom && formData) {
                  enrollDomain(queryDom, formData.applications);
                }
              }}
              className="btn-oxblood"
              style={{ fontSize: "0.72rem", padding: "4px 12px" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Adding domain in-progress spinner */}
        {addingDomain && (
          <div style={{ textAlign: "center", padding: "12px 0", marginBottom: "12px" }}>
            <span className="font-label" style={{ fontSize: "0.75rem", letterSpacing: "0.14em", color: "var(--stamp)" }}>
              ENROLLING DIVISION IN YOUR DISPATCH DOSSIER...
            </span>
          </div>
        )}

        {/* DOMAIN TABS */}
        {formData && formData.applications.length > 0 && (
          <div>
            {/* ADD A DIVISION CHIP ROW */}
            {(() => {
              const appliedCodes = formData.applications.map((a) => a.domain);
              const unapplied = ALL_DOMAINS_INFO.filter((d) => !appliedCodes.includes(d.code));
              const deadlinePassed = formData.applications[0]?.deadlinePassed || !formData.isOpen;

              if (unapplied.length === 0) return null;

              return (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                    marginBottom: "12px",
                    padding: "8px 14px",
                    backgroundColor: "rgba(217, 202, 166, 0.35)",
                    border: "1px dashed var(--ink)",
                  }}
                >
                  <span className="font-label" style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--stamp)", letterSpacing: "0.06em" }}>
                    ADD A DIVISION:
                  </span>
                  {unapplied.map((d) => (
                    <button
                      key={d.code}
                      type="button"
                      disabled={deadlinePassed || addingDomain}
                      onClick={() => enrollDomain(d.code, formData.applications)}
                      title={deadlinePassed ? "Applications are closed as the deadline has passed." : `Enroll in ${d.label}`}
                      className="font-label"
                      style={{
                        fontSize: "0.68rem",
                        padding: "3px 10px",
                        border: "1px solid var(--ink)",
                        backgroundColor: deadlinePassed ? "rgba(74, 63, 54, 0.15)" : "var(--paper)",
                        color: deadlinePassed ? "var(--ink-soft)" : "var(--ink)",
                        cursor: deadlinePassed ? "not-allowed" : "pointer",
                        opacity: deadlinePassed ? 0.6 : 1,
                        transition: "all 0.15s ease",
                      }}
                    >
                      + {d.label}
                    </button>
                  ))}
                  {deadlinePassed && (
                    <span className="font-body" style={{ fontSize: "0.68rem", color: "var(--stamp)", fontStyle: "italic" }}>
                      (Applications closed: deadline has passed)
                    </span>
                  )}
                </div>
              );
            })()}

            <nav
              aria-label="Department Domains"
              style={{
                display: "flex",
                gap: "4px",
                flexWrap: "wrap",
                borderBottom: "2px solid var(--ink)",
                marginBottom: "18px",
              }}
            >
              {formData.applications.map((app) => {
                const isActive = app.domain === activeDomain;
                return (
                  <button
                    key={app.domain}
                    type="button"
                    onClick={() => setActiveDomain(app.domain)}
                    className="font-label"
                    style={{
                      padding: "8px 16px",
                      border: "1.5px solid var(--ink)",
                      borderBottom: isActive ? "2px solid var(--paper)" : "1.5px solid var(--ink)",
                      marginBottom: "-2px",
                      backgroundColor: isActive ? "var(--paper)" : "rgba(217, 202, 166, 0.5)",
                      color: isActive ? "var(--stamp)" : "var(--ink)",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      zIndex: isActive ? 5 : 1,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {getDomainLabel(app.domain)} {app.submitted && "✓"}
                  </button>
                );
              })}
            </nav>

            {currentApp && (
              <div>
                {/* Status & Progress Bar Card */}
                <div
                  className="paper"
                  style={{
                    border: "1.5px solid var(--ink)",
                    padding: "14px 18px",
                    marginBottom: "20px",
                    boxShadow: "2px 2px 0 var(--ink)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <div>
                      <div className="font-label" style={{ fontSize: "0.68rem", color: "var(--ink-soft)" }}>
                        DISCIPLINE: {getDomainLabel(currentApp.domain)}
                      </div>
                      <div className="font-body" style={{ fontSize: "0.85rem", fontWeight: 700 }}>
                        Required Dispatches: {progress.answered} of {progress.total} Completed
                      </div>
                    </div>

                    <div>
                      {currentApp.submitted ? (
                        <span className="rubber-stamp" style={{ borderColor: "var(--ink)", color: "var(--ink)" }}>
                          APPLICATION SEALED (READ ONLY)
                        </span>
                      ) : currentApp.deadlinePassed ? (
                        <span className="rubber-stamp" style={{ borderColor: "var(--stamp)", color: "var(--stamp)" }}>
                          DEADLINE EXPIRED (CLOSED)
                        </span>
                      ) : (
                        <span className="rubber-stamp" style={{ borderColor: "var(--stamp)", color: "var(--stamp)" }}>
                          DRAFTING IN PROGRESS
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      width: "100%",
                      height: "10px",
                      border: "1px solid var(--ink)",
                      backgroundColor: "var(--paper-dark)",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${progress.pct}%`,
                        height: "100%",
                        backgroundColor: progress.pct === 100 ? "var(--ink)" : "var(--stamp)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>

                {/* Question Groups */}
                {groupedQuestions.map((group, gIdx) => (
                  <div key={gIdx} style={{ marginBottom: "28px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "10px",
                        borderBottom: "1.5px solid var(--ink)",
                        paddingBottom: "4px",
                        marginBottom: "14px",
                      }}
                    >
                      <h2
                        className="font-headline"
                        style={{ fontSize: "1.3rem", color: "var(--ink)", letterSpacing: "0.02em" }}
                      >
                        {group.title}
                      </h2>
                      <span className="font-label" style={{ fontSize: "0.62rem", color: "var(--ink-soft)" }}>
                        SECTION {gIdx + 1}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                      {group.questions.map((q, qIdx) => {
                        const currentDraft = drafts[q.id] ?? q.answer;
                        const lastSaved = savedTimestamps[q.id];
                        const isModified = currentDraft !== q.answer;
                        const isSavedFlash = savedFlashId === q.id;
                        const isSaving = savingId === q.id;
                        const isReadOnly = !currentApp.editable;

                        return (
                          <div
                            key={q.id}
                            className="desk-card"
                            style={{
                              margin: 0,
                              backgroundColor: "var(--paper)",
                              border: "1.5px solid var(--ink)",
                            }}
                          >
                            {/* Question Title & Requirement */}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: "8px",
                                marginBottom: "8px",
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <span
                                  className="font-label"
                                  style={{
                                    fontSize: "0.68rem",
                                    color: "var(--stamp)",
                                    fontWeight: 700,
                                    marginRight: "6px",
                                  }}
                                >
                                  DISPATCH #{qIdx + 1}
                                  {q.required && " * REQUIRED"}
                                </span>
                                <h3
                                  className="font-body"
                                  style={{
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    color: "var(--ink)",
                                    marginTop: "2px",
                                    lineHeight: 1.35,
                                  }}
                                >
                                  {q.text}
                                </h3>
                              </div>

                              {isSavedFlash && (
                                <span
                                  className="rubber-stamp stamp-saved-flash"
                                  style={{ fontSize: "0.85rem", padding: "2px 8px" }}
                                >
                                  SAVED ✓
                                </span>
                              )}
                            </div>

                            {/* Ruled Paper Textarea */}
                            <div style={{ position: "relative", margin: "10px 0" }}>
                              <textarea
                                rows={6}
                                value={currentDraft}
                                disabled={isReadOnly}
                                maxLength={q.maxLength}
                                name={`q_${q.id}`}
                                onChange={(e) =>
                                  setDrafts((prev) => ({ ...prev, [q.id]: e.target.value }))
                                }
                                className="ruled-textarea"
                                aria-label={q.text}
                              />
                            </div>

                            {/* Character Count & Save Bar */}
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: "8px",
                                borderTop: "1px dotted var(--ink)",
                                paddingTop: "8px",
                              }}
                            >
                              <div className="font-label" style={{ fontSize: "0.65rem", color: "var(--ink-soft)" }}>
                                Characters: {currentDraft.length} / {q.maxLength}
                                {lastSaved && (
                                  <span style={{ marginLeft: "10px" }}>
                                    · Saved at: {fmtTime(lastSaved)} IST
                                  </span>
                                )}
                              </div>

                              <div>
                                {!isReadOnly && (
                                  <button
                                    type="button"
                                    onClick={() => handleSaveQuestion(q.id)}
                                    disabled={!isModified || isSaving}
                                    className="btn-outline"
                                    style={{ fontSize: "0.68rem", padding: "4px 10px" }}
                                  >
                                    {isSaving ? "Inking..." : isModified ? "Save Dispatch" : "Saved"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* Final Submit Bar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                    borderTop: "2px solid var(--ink)",
                    paddingTop: "16px",
                    marginTop: "20px",
                  }}
                >
                  <div>
                    <span className="font-body" style={{ fontSize: "0.85rem", color: "var(--ink-soft)" }}>
                      {currentApp.submitted
                        ? "This department dispatch has already been sealed."
                        : "Verify all answers before sealing. Sealing transmits your dossier to the evaluators."}
                    </span>
                  </div>

                  <div>
                    {!currentApp.submitted && (
                      <button
                        type="button"
                        onClick={handleOpenSubmit}
                        disabled={!currentApp.editable}
                        className="btn-oxblood"
                      >
                        Seal &amp; Submit Application ➔
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STYLED CONFIRM / MISSING QUESTIONS MODAL */}
        {confirmModalOpen && currentApp && (
          <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-dialog">
              {submittedStamp ? (
                /* RECEIVED RUBBER STAMP SLAM */
                <div style={{ textAlign: "center", padding: "40px 0" }}>
                  <div className="rubber-stamp stamp-received">
                    ✦ RECEIVED ✦
                  </div>
                  <div
                    className="font-label"
                    style={{ fontSize: "0.75rem", letterSpacing: "0.15em", marginTop: "16px" }}
                  >
                    DISPATCH SEALED AND ARCHIVED IN REGISTRY
                  </div>
                </div>
              ) : missingQuestions.length > 0 ? (
                /* INCOMPLETE WARNING */
                <div>
                  <div className="kicker" style={{ fontSize: "0.68rem" }}>
                    INCOMPLETE CANDIDATE DISPATCH
                  </div>
                  <h3
                    id="modal-title"
                    className="font-headline"
                    style={{ fontSize: "1.4rem", color: "var(--stamp)", margin: "4px 0 8px 0" }}
                  >
                    MISSING REQUIRED STATEMENTS
                  </h3>
                  <p className="font-body" style={{ fontSize: "0.85rem", marginBottom: "12px" }}>
                    The following inquiries remain unanswered for <strong>{currentApp.label}</strong>. All required questions must be addressed prior to final sealing:
                  </p>

                  <ul
                    style={{
                      listStyle: "disc",
                      paddingLeft: "20px",
                      fontFamily: "var(--font-body)",
                      fontSize: "0.82rem",
                      color: "var(--ink)",
                      marginBottom: "16px",
                      lineHeight: 1.4,
                    }}
                  >
                    {missingQuestions.map((qText, i) => (
                      <li key={i} style={{ marginBottom: "4px" }}>
                        &ldquo;{qText}&rdquo;
                      </li>
                    ))}
                  </ul>

                  <div style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      onClick={() => setConfirmModalOpen(false)}
                      className="btn-oxblood"
                    >
                      Return to Inscribe Answers
                    </button>
                  </div>
                </div>
              ) : (
                /* READY TO SUBMIT CONFIRMATION */
                <div>
                  <div className="kicker" style={{ fontSize: "0.68rem" }}>
                    CONFIRMATION OF FINAL SUBMISSION
                  </div>
                  <h3
                    id="modal-title"
                    className="font-headline"
                    style={{ fontSize: "1.45rem", margin: "4px 0 8px 0" }}
                  >
                    SEAL APPLICATION FOR {currentApp.label.toUpperCase()}?
                  </h3>
                  <p
                    className="font-body"
                    style={{ fontSize: "0.85rem", lineHeight: 1.4, marginBottom: "16px" }}
                  >
                    All required questions have been completed. Once sealed, your dispatch becomes immutable and will be placed before the faculty and student interview council.
                  </p>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setConfirmModalOpen(false)}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={handleConfirmSubmit}
                      className="btn-oxblood"
                    >
                      {submitting ? "Sealing..." : "Yes, Seal & Submit ➔"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}

export default function FormPage() {
  return (
    <Suspense
      fallback={
        <div
          className="paper"
          style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          <div className="font-label" style={{ fontSize: "0.8rem", color: "var(--stamp)" }}>
            RETRIEVING DISPATCH QUESTIONS...
          </div>
        </div>
      }
    >
      <FormContent />
    </Suspense>
  );
}
