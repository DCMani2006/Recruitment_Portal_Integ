"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AuthGuard } from "@/components/AuthGuard";
import {
  api,
  fmtTime,
  CalendarDay,
  DaySlot,
  Booking,
  Domain,
  StatusResponse,
  ApiError,
  errorText,
} from "@/lib/client";
import { INTERVIEW_ALWAYS_UNLOCKED, getDomainLabel } from "@/lib/config";

const IST = "Asia/Kolkata";

function fmtDateNice(isoOrDateStr: string): string {
  const d = new Date(isoOrDateStr.includes("T") ? isoOrDateStr : `${isoOrDateStr}T12:00:00+05:30`);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

function fmtDateWeekday(dateStr: string): { weekday: string; date: string } {
  const d = new Date(`${dateStr}T12:00:00+05:30`);
  const weekday = new Intl.DateTimeFormat("en-IN", { timeZone: IST, weekday: "short" }).format(d);
  const date = new Intl.DateTimeFormat("en-IN", { timeZone: IST, day: "numeric", month: "short" }).format(d);
  return { weekday, date };
}

function getSlotDurationMinutes(startTime: string, endTime: string): number {
  const diffMs = new Date(endTime).getTime() - new Date(startTime).getTime();
  return Math.max(1, Math.round(diffMs / (60 * 1000)));
}

function getSlotIstHour(startTime: string): number {
  const d = new Date(startTime);
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST,
    hour: "numeric",
    hour12: false,
  }).formatToParts(d);
  const h = parts.find((p) => p.type === "hour")?.value ?? "12";
  return parseInt(h, 10);
}

function generateIcsCalendar(booking: {
  domainLabel: string;
  startTime: string;
  endTime: string;
  meetingLink: string | null;
}) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const toIcsDate = (d: Date) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(
      d.getUTCMinutes()
    )}${pad(d.getUTCSeconds())}Z`;

  const startUtc = toIcsDate(new Date(booking.startTime));
  const endUtc = toIcsDate(new Date(booking.endTime));
  const nowUtc = toIcsDate(new Date());

  const link = booking.meetingLink || "https://meet.google.com";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//The TAM Times//Recruitment Interview//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:tam-interview-${Date.now()}@tamtimes`,
    `DTSTAMP:${nowUtc}`,
    `DTSTART:${startUtc}`,
    `DTEND:${endUtc}`,
    `SUMMARY:TAM Recruitment Interview - ${booking.domainLabel}`,
    `DESCRIPTION:Round 2 online interview for ${booking.domainLabel} division.\\nOnline meeting: ${link}`,
    `LOCATION:${link}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `tam-interview-${booking.domainLabel.toLowerCase().replace(/\s+/g, "-")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function InterviewContent() {
  const searchParams = useSearchParams();

  const [statusData, setStatusData] = useState<StatusResponse | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  // Calendar dates
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [firstDateStr, setFirstDateStr] = useState<string | null>(null);
  const [lastDateStr, setLastDateStr] = useState<string | null>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [daySlots, setDaySlots] = useState<DaySlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<DaySlot | null>(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successStamp, setSuccessStamp] = useState(false);

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  // Friendly error translation
  const getFriendlyError = (err: unknown): string => {
    if (err instanceof ApiError) {
      if (err.code === "SLOT_FULL") {
        return "This interview slot has already reached capacity. Please select another slot.";
      }
      if (err.code === "SLOT_PAST") {
        return "This interview slot has already passed. Please choose an upcoming time.";
      }
      if (err.code === "ALREADY_BOOKED") {
        return "You have already reserved an interview slot for this department.";
      }
      if (err.code === "CONTENTION") {
        return "Another candidate just booked this slot. Please select another available time.";
      }
      if (err.code === "NOT_SHORTLISTED") {
        return "Round 2 opens after your application is shortlisted.";
      }
      if (err.code === "CANCEL_TOO_LATE") {
        return "Cancellations close 12 hours before your slot.";
      }
    }
    return errorText(err);
  };

  // 1. Initial Load: status & bookings
  const loadInitial = useCallback(async () => {
    try {
      const [stat, bkRes] = await Promise.all([api.status(), api.bookings()]);
      setStatusData(stat);
      setBookings(bkRes.bookings);

      const queryDom = searchParams.get("domain") as Domain | null;
      if (queryDom && stat.applications.some((a) => a.domain === queryDom)) {
        setSelectedDomain(queryDom);
      } else if (stat.applications.length > 0) {
        setSelectedDomain((prev) => prev ?? stat.applications[0].domain);
      }
    } catch (err) {
      setError(getFriendlyError(err));
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Current domain's application
  const activeApp = useMemo(() => {
    if (!statusData || !selectedDomain) return null;
    return statusData.applications.find((a) => a.domain === selectedDomain) || null;
  }, [statusData, selectedDomain]);

  // Determine if unlocked for current application
  const isUnlocked = useMemo(() => {
    if (INTERVIEW_ALWAYS_UNLOCKED) return true;
    return activeApp ? activeApp.canChooseSlots : false;
  }, [activeApp]);

  // Current booking for this domain if any
  const currentBooking = useMemo(() => {
    if (!selectedDomain) return null;
    return bookings.find((b) => b.slot.domain === selectedDomain) || null;
  }, [bookings, selectedDomain]);

  // 2. Load Calendar for current & next month to determine run range
  const loadCalendar = useCallback(async () => {
    if (!selectedDomain) return;
    try {
      const now = new Date();
      const curMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      const nextDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const nextMonth = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, "0")}`;

      const [curRes, nextRes] = await Promise.all([
        api.calendar(selectedDomain, curMonth),
        api.calendar(selectedDomain, nextMonth),
      ]);

      const allDays = [...curRes.days, ...nextRes.days].filter((d) => d.totalSlots > 0);
      setCalendarDays(allDays);

      if (allDays.length > 0) {
        setFirstDateStr(allDays[0].date);
        setLastDateStr(allDays[allDays.length - 1].date);
        setSelectedDate((prev) => {
          if (prev && allDays.some((d) => d.date === prev)) return prev;
          return allDays[0].date;
        });
      }
    } catch (err) {
      setError(getFriendlyError(err));
    }
  }, [selectedDomain]);

  useEffect(() => {
    if (isUnlocked) {
      loadCalendar();
    }
  }, [isUnlocked, loadCalendar]);

  // 3. Load Day Slots for selectedDate & domain
  const loadDaySlots = useCallback(async () => {
    if (!selectedDomain || !selectedDate || !isUnlocked) return;
    try {
      const res = await api.daySlots(selectedDomain, selectedDate);
      setDaySlots(res.slots);
      setSelectedSlot(null);
    } catch (err) {
      setError(getFriendlyError(err));
    }
  }, [selectedDomain, selectedDate, isUnlocked]);

  useEffect(() => {
    loadDaySlots();
  }, [loadDaySlots]);

  // 4. Book Slot
  const handleConfirmBooking = async () => {
    if (!selectedSlot) return;
    setActionLoading(true);
    setError(null);
    try {
      await api.book(selectedSlot.id);
      setSuccessStamp(true);
      // Reload initial data
      const [stat, bkRes] = await Promise.all([api.status(), api.bookings()]);
      setStatusData(stat);
      setBookings(bkRes.bookings);
      await loadDaySlots();
      await loadCalendar();
    } catch (err) {
      setError(getFriendlyError(err));
      // Refresh slots on error
      await loadDaySlots();
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Cancel Booking
  const handleCancelBooking = async () => {
    if (!currentBooking) return;
    setActionLoading(true);
    setError(null);
    try {
      await api.cancel(currentBooking.id);
      setCancelModalOpen(false);
      setSuccessStamp(false);
      const [stat, bkRes] = await Promise.all([api.status(), api.bookings()]);
      setStatusData(stat);
      setBookings(bkRes.bookings);
      await loadDaySlots();
      await loadCalendar();
    } catch (err) {
      setError(getFriendlyError(err));
      await loadDaySlots();
    } finally {
      setActionLoading(false);
    }
  };

  // Compute 12-hour cancel rule for current booking
  const cancelRuleCheck = useMemo(() => {
    if (!currentBooking) return { canCancel: true, reason: "" };
    const slotStartMs = new Date(currentBooking.slot.startTime).getTime();
    const nowMs = Date.now();
    const diffHours = (slotStartMs - nowMs) / (1000 * 60 * 60);
    if (diffHours < 12) {
      return {
        canCancel: false,
        reason: "Cancellations close 12 hours before your slot",
      };
    }
    return { canCancel: true, reason: "" };
  }, [currentBooking]);

  // Group slots into Morning, Afternoon, Evening
  const groupedSlots = useMemo(() => {
    const morning: DaySlot[] = [];
    const afternoon: DaySlot[] = [];
    const evening: DaySlot[] = [];

    daySlots.forEach((slot) => {
      const h = getSlotIstHour(slot.startTime);
      if (h < 12) {
        morning.push(slot);
      } else if (h < 17) {
        afternoon.push(slot);
      } else {
        evening.push(slot);
      }
    });

    return { morning, afternoon, evening };
  }, [daySlots]);

  return (
    <AuthGuard>
      <div className="anim-paper-slide-up" style={{ paddingBottom: "60px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div className="kicker">ROUND TWO</div>
          <h1
            className="font-headline"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)", margin: "2px 0 4px 0", letterSpacing: "0.02em" }}
          >
            BOOK YOUR INTERVIEW
          </h1>
          <p
            className="font-label"
            style={{
              fontSize: "0.82rem",
              letterSpacing: "0.12em",
              color: "var(--stamp)",
              textTransform: "uppercase",
              fontWeight: 700,
            }}
          >
            Online · 15 minutes · India Standard Time (IST)
          </p>
          <hr className="rule-double" style={{ margin: "12px 0 16px 0" }} />
        </div>

        {/* Global Error Banner */}
        {error && (
          <div
            role="alert"
            style={{
              border: "2px solid var(--stamp)",
              backgroundColor: "rgba(139, 30, 30, 0.1)",
              padding: "12px 16px",
              color: "var(--stamp)",
              marginBottom: "16px",
              fontSize: "0.85rem",
              lineHeight: 1.4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError(null)}
              style={{ background: "none", border: "none", color: "var(--stamp)", cursor: "pointer", fontSize: "0.85rem" }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <span className="font-label" style={{ fontSize: "0.85rem", letterSpacing: "0.15em" }}>
              FETCHING INTERVIEW SCHEDULE ROLLS...
            </span>
          </div>
        )}

        {!loading && statusData && statusData.applications.length === 0 && (
          <div className="desk-card" style={{ textAlign: "center", padding: "32px 16px" }}>
            <h2 className="font-headline" style={{ fontSize: "1.4rem" }}>NO APPLICATIONS FOUND</h2>
            <p className="font-body" style={{ color: "var(--ink-soft)", margin: "8px 0 16px 0" }}>
              You have not enrolled in any divisions yet. Please enroll in a department before booking an interview.
            </p>
            <Link href="/desk/form" className="btn-oxblood">
              Open Application Form ➔
            </Link>
          </div>
        )}

        {/* Domain Tabs (one slot per division) */}
        {!loading && statusData && statusData.applications.length > 0 && (
          <div>
            <nav
              aria-label="Applied Domains"
              style={{
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                borderBottom: "2px solid var(--ink)",
                marginBottom: "20px",
              }}
            >
              {statusData.applications.map((app) => {
                const isActive = app.domain === selectedDomain;
                const hasBooking = bookings.some((b) => b.slot.domain === app.domain);

                return (
                  <button
                    key={app.domain}
                    type="button"
                    onClick={() => {
                      setSelectedDomain(app.domain);
                      setSelectedSlot(null);
                      setError(null);
                    }}
                    className="font-label"
                    style={{
                      padding: "8px 16px",
                      border: "1.5px solid var(--ink)",
                      borderBottom: isActive ? "2px solid var(--paper)" : "1.5px solid var(--ink)",
                      marginBottom: "-2px",
                      backgroundColor: isActive ? "var(--paper)" : "rgba(217, 202, 166, 0.4)",
                      color: isActive ? "var(--stamp)" : "var(--ink)",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      zIndex: isActive ? 5 : 1,
                      transition: "all 0.15s ease",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>{getDomainLabel(app.domain)}</span>
                    {hasBooking && (
                      <span
                        style={{
                          backgroundColor: "var(--stamp)",
                          color: "var(--paper)",
                          fontSize: "0.6rem",
                          padding: "1px 5px",
                          borderRadius: "2px",
                        }}
                      >
                        BOOKED
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* LOCKED STATE: When INTERVIEW_ALWAYS_UNLOCKED is false and stage is not shortlisted */}
            {!isUnlocked && (
              <div
                className="desk-card"
                style={{
                  textAlign: "center",
                  padding: "40px 20px",
                  border: "2px dashed var(--ink)",
                  backgroundColor: "rgba(217, 202, 166, 0.3)",
                  margin: "20px 0",
                }}
              >
                <div className="kicker" style={{ fontSize: "0.75rem" }}>
                  DISPATCH REVIEW IN PROGRESS
                </div>
                <h2
                  className="font-headline"
                  style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)", margin: "8px 0" }}
                >
                  Round 2 opens after your application is shortlisted
                </h2>
                <div
                  className="rubber-stamp"
                  style={{
                    borderColor: "var(--stamp)",
                    color: "var(--stamp)",
                    display: "inline-block",
                    margin: "12px auto",
                    padding: "6px 14px",
                    fontSize: "0.85rem",
                    transform: "rotate(-2deg)",
                  }}
                >
                  AWAITING COUNCIL REVIEW
                </div>
                <p
                  className="font-body"
                  style={{
                    maxWidth: "540px",
                    margin: "12px auto 20px auto",
                    fontSize: "0.88rem",
                    color: "var(--ink-soft)",
                    lineHeight: 1.5,
                  }}
                >
                  The selection bureau is currently evaluating candidate question sheets for the{" "}
                  <strong>{activeApp?.label}</strong> department. When your candidature progresses to the shortlist
                  cadre, the 15-minute council interview calendar will unlock on this desk.
                </p>
                <div>
                  <Link href="/desk" className="btn-outline" style={{ fontSize: "0.75rem", padding: "6px 16px" }}>
                    ◂ Return to Your Dispatch Status
                  </Link>
                </div>
              </div>
            )}

            {/* UNLOCKED STATE */}
            {isUnlocked && (
              <div>
                {/* 1. Interview Run Range Banner */}
                {firstDateStr && lastDateStr && (
                  <div
                    style={{
                      border: "1.5px solid var(--ink)",
                      backgroundColor: "rgba(217, 202, 166, 0.5)",
                      padding: "10px 14px",
                      marginBottom: "18px",
                      textAlign: "center",
                      boxShadow: "2px 2px 0 var(--ink)",
                    }}
                  >
                    <span
                      className="font-label"
                      style={{ fontSize: "0.78rem", letterSpacing: "0.08em", fontWeight: 700, color: "var(--ink)" }}
                    >
                      ✦ Interviews run from {fmtDateNice(firstDateStr)} to {fmtDateNice(lastDateStr)} ✦
                    </span>
                  </div>
                )}

                {/* 2. Rules Box */}
                <div
                  style={{
                    border: "1px dashed var(--stamp)",
                    backgroundColor: "rgba(139, 30, 30, 0.05)",
                    padding: "10px 14px",
                    marginBottom: "20px",
                    fontSize: "0.78rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span style={{ fontSize: "1.1rem" }}>⚖</span>
                  <div className="font-label" style={{ color: "var(--stamp)", fontWeight: 700, letterSpacing: "0.04em" }}>
                    RULES OF SUMMONS: One slot per division. Times are in IST. You can cancel up to 12 hours before.
                  </div>
                </div>

                {/* 3. YOUR INTERVIEW CARD (if booked) */}
                {currentBooking && (
                  <div
                    className="desk-card"
                    style={{
                      border: "2px solid var(--ink)",
                      backgroundColor: "var(--paper)",
                      padding: "20px",
                      marginBottom: "24px",
                      boxShadow: "3px 3px 0 var(--ink)",
                      position: "relative",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <div className="kicker" style={{ fontSize: "0.72rem" }}>
                          COUNCIL APPOINTMENT RECORD · {activeApp?.label}
                        </div>
                        <h2 className="font-headline" style={{ fontSize: "1.8rem", marginTop: "2px" }}>
                          YOUR INTERVIEW
                        </h2>
                      </div>

                      {/* BOOKED Rubber stamp */}
                      <div
                        className={`rubber-stamp ${successStamp ? "anim-stamp-in" : ""}`}
                        style={{
                          borderColor: "var(--stamp)",
                          color: "var(--stamp)",
                          fontSize: "1.1rem",
                          padding: "6px 16px",
                          transform: "rotate(-3deg)",
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                        }}
                      >
                        BOOKED
                      </div>
                    </div>

                    <hr className="rule-single" style={{ margin: "12px 0 16px 0" }} />

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "14px",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <div className="font-label" style={{ fontSize: "0.68rem", color: "var(--ink-soft)" }}>
                          SCHEDULED DATE
                        </div>
                        <div className="font-headline" style={{ fontSize: "1.15rem", marginTop: "2px" }}>
                          {fmtDateNice(currentBooking.slot.startTime)}
                        </div>
                      </div>

                      <div>
                        <div className="font-label" style={{ fontSize: "0.68rem", color: "var(--ink-soft)" }}>
                          TIME &amp; DURATION
                        </div>
                        <div className="font-headline" style={{ fontSize: "1.15rem", marginTop: "2px" }}>
                          {fmtTime(currentBooking.slot.startTime)} – {fmtTime(currentBooking.slot.endTime)} IST
                        </div>
                        <div className="font-body" style={{ fontSize: "0.75rem", color: "var(--stamp)" }}>
                          Duration: {getSlotDurationMinutes(currentBooking.slot.startTime, currentBooking.slot.endTime)} minutes
                        </div>
                      </div>

                      <div>
                        <div className="font-label" style={{ fontSize: "0.68rem", color: "var(--ink-soft)" }}>
                          FORMAT &amp; VENUE
                        </div>
                        <div style={{ marginTop: "4px" }}>
                          <span
                            className="font-label"
                            style={{
                              backgroundColor: "var(--ink)",
                              color: "var(--paper)",
                              padding: "2px 8px",
                              fontSize: "0.72rem",
                              fontWeight: 700,
                            }}
                          >
                            Online
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: Meeting Link, Add to Calendar, Cancel */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10px",
                        borderTop: "1px dashed var(--ink)",
                        paddingTop: "14px",
                      }}
                    >
                      {currentBooking.slot.meetingLink && (
                        <a
                          href={currentBooking.slot.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-oxblood"
                          style={{ fontSize: "0.78rem", padding: "7px 14px", textDecoration: "none" }}
                        >
                          Join Council Chambers (Google Meet) ➔
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          generateIcsCalendar({
                            domainLabel: getDomainLabel(selectedDomain || activeApp?.domain || "TECHNICAL"),
                            startTime: currentBooking.slot.startTime,
                            endTime: currentBooking.slot.endTime,
                            meetingLink: currentBooking.slot.meetingLink,
                          })
                        }
                        className="btn-outline"
                        style={{ fontSize: "0.78rem", padding: "7px 14px", cursor: "pointer" }}
                      >
                        📅 Add to Calendar (.ics)
                      </button>

                      <div style={{ display: "inline-flex", flexDirection: "column" }}>
                        <button
                          type="button"
                          disabled={!cancelRuleCheck.canCancel || actionLoading}
                          onClick={() => setCancelModalOpen(true)}
                          className="btn-outline"
                          style={{
                            fontSize: "0.78rem",
                            padding: "7px 14px",
                            color: cancelRuleCheck.canCancel ? "var(--stamp)" : "var(--ink-soft)",
                            borderColor: cancelRuleCheck.canCancel ? "var(--stamp)" : "rgba(28, 22, 19, 0.3)",
                            opacity: cancelRuleCheck.canCancel ? 1 : 0.6,
                            cursor: cancelRuleCheck.canCancel ? "pointer" : "not-allowed",
                          }}
                        >
                          Cancel Booking
                        </button>
                        {!cancelRuleCheck.canCancel && (
                          <span
                            className="font-body"
                            style={{ fontSize: "0.65rem", color: "var(--stamp)", marginTop: "3px" }}
                          >
                            {cancelRuleCheck.reason}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. DAY STRIP: Horizontally scrollable day picker */}
                <div style={{ marginBottom: "20px" }}>
                  <div
                    className="font-label"
                    style={{ fontSize: "0.72rem", fontWeight: 700, marginBottom: "8px", color: "var(--ink)" }}
                  >
                    SELECT INTERVIEW DATE:
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      overflowX: "auto",
                      paddingBottom: "10px",
                    }}
                  >
                    {calendarDays.map((cd) => {
                      const { weekday, date } = fmtDateWeekday(cd.date);
                      const isSelected = cd.date === selectedDate;
                      const isFull = cd.availableSlots <= 0;

                      return (
                        <button
                          key={cd.date}
                          type="button"
                          disabled={isFull}
                          onClick={() => {
                            setSelectedDate(cd.date);
                            setSelectedSlot(null);
                          }}
                          className="desk-card"
                          style={{
                            minWidth: "104px",
                            padding: "10px 8px",
                            textAlign: "center",
                            cursor: isFull ? "not-allowed" : "pointer",
                            opacity: isFull ? 0.45 : 1,
                            backgroundColor: isSelected ? "var(--ink)" : "var(--paper)",
                            color: isSelected ? "var(--paper)" : "var(--ink)",
                            border: isSelected ? "2px solid var(--stamp)" : "1.5px solid var(--ink)",
                            boxShadow: isSelected ? "2px 2px 0 var(--stamp)" : "1.5px 1.5px 0 var(--ink)",
                            transition: "all 0.15s ease",
                            flexShrink: 0,
                          }}
                        >
                          <div
                            className="font-label"
                            style={{
                              fontSize: "0.68rem",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              color: isSelected ? "var(--paper-dark)" : "var(--ink-soft)",
                            }}
                          >
                            {weekday}
                          </div>
                          <div
                            className="font-headline"
                            style={{
                              fontSize: "1.1rem",
                              margin: "2px 0",
                              color: isSelected ? "var(--paper)" : "var(--ink)",
                            }}
                          >
                            {date}
                          </div>
                          <div
                            className="font-label"
                            style={{
                              fontSize: "0.62rem",
                              fontWeight: 700,
                              color: isFull
                                ? "var(--stamp)"
                                : isSelected
                                ? "var(--paper)"
                                : "var(--stamp)",
                            }}
                          >
                            {isFull ? "Full" : `${cd.availableSlots} left`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. SLOTS FOR SELECTED DAY */}
                {selectedDate && (
                  <div
                    className="desk-card"
                    style={{
                      padding: "20px",
                      border: "1.5px solid var(--ink)",
                      backgroundColor: "var(--paper)",
                      boxShadow: "2px 2px 0 var(--ink)",
                      marginBottom: "24px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1.5px solid var(--ink)",
                        paddingBottom: "8px",
                        marginBottom: "16px",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      <h3 className="font-headline" style={{ fontSize: "1.3rem", margin: 0 }}>
                        AVAILABLE SLOTS FOR {fmtDateNice(selectedDate).toUpperCase()}
                      </h3>
                      <span className="font-label" style={{ fontSize: "0.68rem", color: "var(--ink-soft)" }}>
                        TIMES CONVERTED TO INDIA STANDARD TIME (IST)
                      </span>
                    </div>

                    {/* Section: Morning */}
                    <div style={{ marginBottom: "18px" }}>
                      <div
                        className="font-label"
                        style={{
                          fontSize: "0.72rem",
                          letterSpacing: "0.1em",
                          color: "var(--stamp)",
                          fontWeight: 700,
                          marginBottom: "8px",
                          borderBottom: "1px dotted rgba(28, 22, 19, 0.3)",
                          paddingBottom: "2px",
                        }}
                      >
                        MORNING (10:00 – 12:00)
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))", gap: "8px" }}>
                        {groupedSlots.morning.map((slot) => renderSlotTicket(slot))}
                      </div>
                    </div>

                    {/* Section: Afternoon */}
                    <div style={{ marginBottom: "18px" }}>
                      <div
                        className="font-label"
                        style={{
                          fontSize: "0.72rem",
                          letterSpacing: "0.1em",
                          color: "var(--stamp)",
                          fontWeight: 700,
                          marginBottom: "8px",
                          borderBottom: "1px dotted rgba(28, 22, 19, 0.3)",
                          paddingBottom: "2px",
                        }}
                      >
                        AFTERNOON (12:00 – 17:00)
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))", gap: "8px" }}>
                        {groupedSlots.afternoon.map((slot) => renderSlotTicket(slot))}
                      </div>
                    </div>

                    {/* Section: Evening */}
                    {groupedSlots.evening.length > 0 && (
                      <div style={{ marginBottom: "10px" }}>
                        <div
                          className="font-label"
                          style={{
                            fontSize: "0.72rem",
                            letterSpacing: "0.1em",
                            color: "var(--stamp)",
                            fontWeight: 700,
                            marginBottom: "8px",
                            borderBottom: "1px dotted rgba(28, 22, 19, 0.3)",
                            paddingBottom: "2px",
                          }}
                        >
                          EVENING (17:00 – 18:00)
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(135px, 1fr))", gap: "8px" }}>
                          {groupedSlots.evening.map((slot) => renderSlotTicket(slot))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 6. STICKY CONFIRM PANEL: Opens when slot is selected */}
                {selectedSlot && (
                  <div
                    className="anim-fade-in"
                    style={{
                      position: "sticky",
                      bottom: "16px",
                      zIndex: 40,
                      backgroundColor: "var(--ink)",
                      color: "var(--paper)",
                      padding: "16px 20px",
                      border: "2px solid var(--paper)",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.4)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <div
                        className="font-label"
                        style={{ fontSize: "0.68rem", color: "var(--paper-dark)", letterSpacing: "0.1em" }}
                      >
                        CONFIRM APPOINTMENT SELECTION:
                      </div>
                      <div className="font-headline" style={{ fontSize: "1.15rem", marginTop: "2px" }}>
                        You picked {fmtDateNice(selectedSlot.startTime)}, {fmtTime(selectedSlot.startTime)} –{" "}
                        {fmtTime(selectedSlot.endTime)} IST
                      </div>
                      <div className="font-body" style={{ fontSize: "0.75rem", color: "var(--paper-dark)" }}>
                        Duration: {getSlotDurationMinutes(selectedSlot.startTime, selectedSlot.endTime)} minutes · Online
                        Interview via Google Meet
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => setSelectedSlot(null)}
                        className="btn-outline"
                        style={{
                          color: "var(--paper)",
                          borderColor: "var(--paper-dark)",
                          fontSize: "0.75rem",
                          padding: "6px 12px",
                        }}
                      >
                        Clear
                      </button>

                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleConfirmBooking}
                        className="btn-oxblood"
                        style={{
                          fontSize: "0.82rem",
                          padding: "8px 18px",
                          letterSpacing: "0.06em",
                          backgroundColor: "var(--stamp)",
                          color: "var(--paper)",
                          cursor: "pointer",
                        }}
                      >
                        {actionLoading ? "SEALING APPOINTMENT..." : "CONFIRM MY SLOT ➔"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 7. CANCEL BOOKING CONFIRM MODAL */}
        {cancelModalOpen && currentBooking && (
          <div
            role="dialog"
            aria-modal="true"
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(20, 16, 14, 0.75)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
              zIndex: 100,
            }}
          >
            <div
              className="desk-card"
              style={{
                maxWidth: "460px",
                width: "100%",
                backgroundColor: "var(--paper)",
                border: "2px solid var(--ink)",
                boxShadow: "4px 4px 0 var(--ink)",
                padding: "24px",
              }}
            >
              <div className="kicker" style={{ fontSize: "0.7rem" }}>
                COUNCIL APPOINTMENT REVOCATION
              </div>
              <h3 className="font-headline" style={{ fontSize: "1.4rem", margin: "4px 0 10px 0" }}>
                CANCEL INTERVIEW BOOKING?
              </h3>
              <p className="font-body" style={{ fontSize: "0.85rem", color: "var(--ink-soft)", lineHeight: 1.4, marginBottom: "16px" }}>
                Are you sure you wish to cancel your scheduled appointment for{" "}
                <strong>{fmtDateNice(currentBooking.slot.startTime)}</strong> at{" "}
                <strong>{fmtTime(currentBooking.slot.startTime)} IST</strong>? The slot will immediately be released to
                other candidates.
              </p>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(false)}
                  className="btn-outline"
                  style={{ fontSize: "0.78rem", padding: "6px 14px" }}
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleCancelBooking}
                  className="btn-oxblood"
                  style={{ fontSize: "0.78rem", padding: "6px 14px" }}
                >
                  {actionLoading ? "CANCELLING..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );

  // Helper to render ticket-style slot button
  function renderSlotTicket(slot: DaySlot) {
    const isSelected = selectedSlot?.id === slot.id;
    const isTaken = slot.remaining <= 0 && !slot.bookedByMe;
    const isMine = slot.bookedByMe;
    const timeLabel = `${fmtTime(slot.startTime)} – ${fmtTime(slot.endTime)}`;

    return (
      <button
        key={slot.id}
        type="button"
        disabled={isTaken}
        onClick={() => {
          if (!isTaken) {
            setSelectedSlot(slot);
          }
        }}
        className="slot-ticket-btn"
        style={{
          border: isMine
            ? "2px solid var(--stamp)"
            : isSelected
            ? "2px solid var(--ink)"
            : "1px dashed var(--ink)",
          backgroundColor: isMine
            ? "rgba(139, 30, 30, 0.12)"
            : isSelected
            ? "var(--ink)"
            : isTaken
            ? "rgba(217, 202, 166, 0.3)"
            : "rgba(232, 220, 192, 0.8)",
          color: isSelected ? "var(--paper)" : isTaken ? "var(--ink-soft)" : "var(--ink)",
          textDecoration: isTaken ? "line-through" : "none",
          cursor: isTaken ? "not-allowed" : "pointer",
          padding: "8px 6px",
          textAlign: "center",
          borderRadius: "0px",
          position: "relative",
          transition: "all 0.12s ease",
          boxShadow: isSelected ? "2px 2px 0 var(--stamp)" : "none",
        }}
      >
        <div
          className="font-headline"
          style={{
            fontSize: "0.88rem",
            letterSpacing: "0.02em",
            color: isSelected ? "var(--paper)" : isTaken ? "var(--ink-soft)" : "var(--ink)",
          }}
        >
          {timeLabel}
        </div>
        <div
          className="font-label"
          style={{
            fontSize: "0.6rem",
            marginTop: "2px",
            fontWeight: 700,
            color: isMine
              ? "var(--stamp)"
              : isSelected
              ? "var(--paper-dark)"
              : isTaken
              ? "var(--ink-soft)"
              : "var(--stamp)",
          }}
        >
          {isMine ? "★ YOUR SLOT" : isTaken ? "TAKEN" : "AVAILABLE"}
        </div>
      </button>
    );
  }
}

export default function InterviewPage() {
  return (
    <Suspense
      fallback={
        <div className="paper" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="font-masthead" style={{ fontSize: "2rem" }}>
            The TAM Times
          </div>
        </div>
      }
    >
      <InterviewContent />
    </Suspense>
  );
}
