"use client";

import React, { useState, useEffect } from "react";
import { AuthGuard } from "@/components/AuthGuard";
import { api, Domain, DomainInfo, errorText } from "@/lib/client";
import { useSession } from "@/lib/session";
import { getDomainLabel } from "@/lib/config";

export default function ProfilePage() {
  const { user, applications, refresh } = useSession();

  const [availableDomains, setAvailableDomains] = useState<DomainInfo[]>([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize form from current session
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setRegNumber(user.regNumber);
    }
    if (applications) {
      setSelectedDomains(applications.map((a) => a.domain));
    }
  }, [user, applications]);

  // Load all available domains
  useEffect(() => {
    api.domains()
      .then((res) => setAvailableDomains(res.domains))
      .catch(() => {});
  }, []);

  const isDomainLocked = (dom: Domain) => {
    const app = applications.find((a) => a.domain === dom);
    return app?.submitted ?? false;
  };

  const toggleDomain = (dom: Domain) => {
    if (isDomainLocked(dom)) return; // locked
    if (selectedDomains.includes(dom)) {
      setSelectedDomains(selectedDomains.filter((d) => d !== dom));
    } else {
      setSelectedDomains([...selectedDomains, dom]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) return setError("Name cannot be empty.");
    if (!phone.trim()) return setError("Phone number is required.");
    if (!regNumber.trim()) return setError("Registration number is required.");
    if (selectedDomains.length === 0) return setError("You must remain enrolled in at least one domain.");

    setLoading(true);
    try {
      await api.updateMe({
        name: name.trim(),
        phone: phone.trim(),
        regNumber: regNumber.trim().toUpperCase(),
        domains: selectedDomains,
      });
      await refresh();
      setSuccess("Candidate credentials and department rolls updated successfully!");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="anim-paper-slide-up" style={{ maxWidth: "640px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div className="kicker">MEMBER REGISTRY</div>
          <h1
            className="font-headline"
            style={{ fontSize: "clamp(2rem, 4.5vw, 2.8rem)", marginTop: "2px" }}
          >
            SUBSCRIBER PROFILE
          </h1>
          <p className="deck" style={{ fontSize: "clamp(0.75rem, 1.4vw, 0.88rem)", marginTop: "2px" }}>
            Maintain your official communication credentials and registered department disciplines.
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

        {success && (
          <div
            role="status"
            style={{
              border: "1.5px solid var(--ink)",
              backgroundColor: "rgba(217, 202, 166, 0.6)",
              padding: "12px",
              color: "var(--ink)",
              marginBottom: "16px",
            }}
          >
            {success}
          </div>
        )}

        {/* Profile Card Form */}
        <div className="desk-card" style={{ padding: "24px 20px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label htmlFor="prof-email" className="font-label" style={{ display: "block", marginBottom: "2px" }}>
                Candidate Email (Locked)
              </label>
              <div className="font-body" style={{ fontSize: "0.72rem", color: "var(--ink-soft)", marginBottom: "4px" }}>
                Use your @vitstudent.ac.in email
              </div>
              <input
                id="prof-email"
                name="email"
                autoComplete="email"
                aria-label="Candidate email"
                type="email"
                disabled
                value={user?.email || ""}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1.5px solid var(--ink)",
                  backgroundColor: "rgba(217, 202, 166, 0.4)",
                  color: "var(--ink-soft)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.95rem",
                  cursor: "not-allowed",
                }}
              />
            </div>

            <div>
              <label htmlFor="prof-name" className="font-label" style={{ display: "block", marginBottom: "4px" }}>
                Full Name
              </label>
              <input
                id="prof-name"
                name="name"
                autoComplete="name"
                aria-label="Full name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  border: "1.5px solid var(--ink)",
                  backgroundColor: "var(--paper)",
                  color: "var(--ink)",
                  fontFamily: "var(--font-body)",
                  fontSize: "0.95rem",
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <div>
                <label htmlFor="prof-reg" className="font-label" style={{ display: "block", marginBottom: "2px" }}>
                  Registration Number
                </label>
                <div className="font-body" style={{ fontSize: "0.72rem", color: "var(--ink-soft)", marginBottom: "4px" }}>
                  As written on your college ID
                </div>
                <input
                  id="prof-reg"
                  name="regNumber"
                  autoComplete="off"
                  aria-label="Registration number"
                  type="text"
                  required
                  value={regNumber}
                  onChange={(e) => setRegNumber(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1.5px solid var(--ink)",
                    backgroundColor: "var(--paper)",
                    color: "var(--ink)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              <div>
                <label htmlFor="prof-phone" className="font-label" style={{ display: "block", marginBottom: "2px" }}>
                  Contact Mobile
                </label>
                <div className="font-body" style={{ fontSize: "0.72rem", color: "var(--ink-soft)", marginBottom: "4px" }}>
                  10-digit mobile number
                </div>
                <input
                  id="prof-phone"
                  name="phone"
                  autoComplete="tel"
                  aria-label="Contact mobile"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1.5px solid var(--ink)",
                    backgroundColor: "var(--paper)",
                    color: "var(--ink)",
                    fontFamily: "var(--font-body)",
                    fontSize: "0.95rem",
                  }}
                />
              </div>
            </div>

            {/* Department Disciplines */}
            <div>
              <label className="font-label" style={{ display: "block", margin: "6px 0 4px 0" }}>
                Enrolled Department Disciplines:
              </label>
              <div
                style={{
                  border: "1px solid var(--ink)",
                  backgroundColor: "rgba(217, 202, 166, 0.3)",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                {availableDomains.map((d) => {
                  const locked = isDomainLocked(d.domain);
                  const isChecked = selectedDomains.includes(d.domain);
                  return (
                    <label
                      key={d.domain}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontFamily: "var(--font-body)",
                        fontSize: "0.9rem",
                        cursor: locked ? "not-allowed" : "pointer",
                        opacity: locked ? 0.75 : 1,
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="checkbox"
                          disabled={locked}
                          checked={isChecked}
                          onChange={() => toggleDomain(d.domain)}
                          style={{ accentColor: "var(--stamp)", width: "16px", height: "16px" }}
                        />
                        <span>{getDomainLabel(d.domain)}</span>
                      </div>
                      {locked && (
                        <span className="font-label" style={{ fontSize: "0.62rem", color: "var(--stamp)" }}>
                          (SUBMITTED · LOCKED)
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
              <small className="font-body" style={{ color: "var(--ink-soft)", fontSize: "0.75rem", display: "block", marginTop: "4px" }}>
                Disciplines with sealed submissions cannot be removed from your dossier.
              </small>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-oxblood"
              style={{ width: "100%", marginTop: "10px" }}
            >
              {loading ? "Recording Changes..." : "Save Profile Updates ➔"}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}
