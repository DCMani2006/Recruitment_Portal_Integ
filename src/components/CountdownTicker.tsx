"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/client";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  ended: boolean;
}

interface CountdownTickerProps {
  inFlipbook?: boolean;
}

export function CountdownTicker({ inFlipbook = false }: CountdownTickerProps) {
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    api.config()
      .then((cfg) => {
        if (!isMounted) return;
        const deadlineMs = new Date(cfg.formDeadline).getTime();
        const serverMs = new Date(cfg.serverTime).getTime();
        const localMs = Date.now();
        const offset = localMs - serverMs;
        setTargetTime(deadlineMs + offset);
      })
      .catch(() => {
        if (isMounted) setError(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!targetTime) return;

    const update = () => {
      const remaining = targetTime - Date.now();
      if (remaining <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: true });
        return;
      }

      const totalSec = Math.floor(remaining / 1000);
      const days = Math.floor(totalSec / 86400);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;

      setTimeLeft({ days, hours, minutes, seconds, ended: false });
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  if (error) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: inFlipbook ? "1cqw 0" : "8px 0",
          fontFamily: "var(--font-label)",
          fontSize: inFlipbook ? "2cqw" : "0.8rem",
          color: "var(--ink-soft)",
        }}
      >
        DATES TO BE ANNOUNCED
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: inFlipbook ? "1cqw 0" : "8px 0",
          fontFamily: "var(--font-label)",
          fontSize: inFlipbook ? "2cqw" : "0.8rem",
          color: "var(--ink-soft)",
        }}
      >
        SYNCHRONIZING GAZETTE TICKER...
      </div>
    );
  }

  if (timeLeft.ended) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: inFlipbook ? "1cqw 0" : "8px 0",
          fontFamily: "var(--font-headline)",
          fontSize: inFlipbook ? "3.2cqw" : "1.1rem",
          color: "var(--stamp)",
        }}
      >
        EDITION CLOSED — DISPATCHES SEALED
      </div>
    );
  }

  if (inFlipbook) {
    return (
      <div
        style={{
          display: "flex",
          gap: "1.2cqw",
          justifyContent: "center",
          margin: "0.8cqw 0",
        }}
        aria-label={`Countdown: ${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds remaining`}
      >
        {[
          { label: "DAYS", val: pad(timeLeft.days) },
          { label: "HOURS", val: pad(timeLeft.hours) },
          { label: "MINS", val: pad(timeLeft.minutes) },
          { label: "SECS", val: pad(timeLeft.seconds) },
        ].map((item, idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                backgroundColor: "var(--ink)",
                color: "var(--paper)",
                fontFamily: "var(--font-headline)",
                fontSize: "4.2cqw",
                padding: "0.4cqw 1cqw",
                minWidth: "7.5cqw",
                textAlign: "center",
                lineHeight: 1,
                borderRadius: "0.4cqw",
                boxShadow: "0 0.3cqw 0.6cqw rgba(0,0,0,0.3)",
              }}
            >
              {item.val}
            </div>
            <span
              style={{
                fontFamily: "var(--font-label)",
                fontSize: "1.6cqw",
                letterSpacing: "0.12em",
                color: "var(--ink-soft)",
                marginTop: "0.3cqw",
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="ticker-container"
      style={{
        display: "flex",
        gap: "10px",
        alignItems: "center",
        justifyContent: "center",
      }}
      aria-label={`Countdown: ${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds remaining`}
    >
      {[
        { label: "DAYS", val: pad(timeLeft.days) },
        { label: "HOURS", val: pad(timeLeft.hours) },
        { label: "MINS", val: pad(timeLeft.minutes) },
        { label: "SECS", val: pad(timeLeft.seconds) },
      ].map((item, idx) => (
        <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              backgroundColor: "var(--ink)",
              color: "var(--paper)",
              fontFamily: "var(--font-headline)",
              fontSize: "1.45rem",
              padding: "4px 8px",
              minWidth: "42px",
              textAlign: "center",
              lineHeight: 1,
              borderRadius: "3px",
              boxShadow: "1px 2px 4px rgba(0,0,0,0.25)",
            }}
          >
            {item.val}
          </div>
          <span
            style={{
              fontFamily: "var(--font-label)",
              fontSize: "0.62rem",
              letterSpacing: "0.1em",
              color: "var(--ink-soft)",
              marginTop: "3px",
              textTransform: "uppercase",
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
