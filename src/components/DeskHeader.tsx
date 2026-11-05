"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/session";

export function DeskHeader() {
  const pathname = usePathname();
  const { user, logout } = useSession();

  const navLinks = [
    { href: "/desk", label: "Your Dispatch" },
    { href: "/desk/form", label: "Application Form" },
    { href: "/desk/interview", label: "Interview" },
    { href: "/desk/profile", label: "Profile" },
  ];

  return (
    <header className="desk-masthead paper" style={{ position: "relative", zIndex: 50 }}>
      {/* Top Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px",
          borderBottom: "1px solid var(--ink)",
          paddingBottom: "8px",
        }}
      >
        <div>
          <Link href="/?read=1" style={{ textDecoration: "none", color: "var(--ink)" }}>
            <span
              className="font-masthead"
              style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", display: "block", lineHeight: 1 }}
            >
              The TAM Times
            </span>
          </Link>
          <span
            className="font-label"
            style={{
              fontSize: "0.62rem",
              letterSpacing: "0.14em",
              color: "var(--stamp)",
              display: "block",
              marginTop: "2px",
            }}
          >
            SUBSCRIBER&apos;S DESK · APPLICANT CORRESPONDENCE
          </span>
        </div>

        {user ? (
          <div style={{ textAlign: "right" }}>
            <div className="font-label" style={{ fontSize: "0.72rem", color: "var(--ink)", fontWeight: 700 }}>
              {user.name} ({user.regNumber})
            </div>
            <div className="font-body" style={{ fontSize: "0.65rem", color: "var(--ink-soft)" }}>
              {user.email}
            </div>
            <div style={{ marginTop: "4px" }}>
              <button
                type="button"
                onClick={logout}
                className="btn-outline"
                style={{ fontSize: "0.62rem", padding: "2px 8px" }}
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            <Link href="/desk/login" className="btn-ink" style={{ fontSize: "0.75rem", padding: "4px 10px" }}>
              Sign In
            </Link>
          </div>
        )}
      </div>

      {/* Navigation bar */}
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          paddingTop: "8px",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`desk-nav-link ${isActive ? "active" : ""}`}
                style={isActive ? { color: "var(--stamp)" } : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div>
          <Link
            href="/?read=1"
            className="btn-ink"
            style={{
              fontSize: "0.72rem",
              padding: "4px 12px",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            READ THE NEWSPAPER
          </Link>
        </div>
      </nav>
    </header>
  );
}
