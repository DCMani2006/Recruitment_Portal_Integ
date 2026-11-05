"use client";

import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  api,
  setToken,
  errorText,
  isStudentEmail,
  STUDENT_EMAIL_DOMAIN,
  Domain,
  DomainInfo,
  ApiError,
} from "@/lib/client";
import { useSession } from "@/lib/session";
import { SIGNUP_NEEDS_DOMAIN, getDomainLabel } from "@/lib/config";

type TabMode = "login" | "signup" | "reset";

function LoginScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refresh } = useSession();

  const [mode, setMode] = useState<TabMode>("login");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Available domains for signup
  const [availableDomains, setAvailableDomains] = useState<DomainInfo[]>([]);

  // Log in form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Sign up form state
  const [signupStep, setSignupStep] = useState<1 | 2 | 3>(1);
  const [signupEmail, setSignupEmail] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>([]);

  // Forgot password form state
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtpToken, setResetOtpToken] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // Resend timer
  const [resendTimer, setResendTimer] = useState(0);

  const nextUrl = searchParams.get("next");
  const domainParam = searchParams.get("domain") as Domain | null;

  // Determine destination URL based on first-time vs returning visit
  const getDestinationUrl = useCallback((emailHint?: string) => {
    if (nextUrl && nextUrl !== "/login" && nextUrl !== "/") {
      if (domainParam && !nextUrl.includes("domain=")) {
        return `${nextUrl}${nextUrl.includes("?") ? "&" : "?"}domain=${domainParam}`;
      }
      return nextUrl;
    }
    return "/desk/form";
  }, [nextUrl, domainParam]);

  // Read URL error if present
  useEffect(() => {
    const urlErr = searchParams.get("error");
    if (urlErr) setError(decodeURIComponent(urlErr));
  }, [searchParams]);

  // If already logged in, redirect to next, /desk/form or /
  useEffect(() => {
    if (user) {
      router.replace(getDestinationUrl(user.email));
    }
  }, [user, router, getDestinationUrl]);

  // Pre-tick domain checklist if domain param is passed
  useEffect(() => {
    const validDomains = ["DESIGN", "MARKETING", "R_AND_D", "MANAGEMENT", "TECHNICAL"];
    if (domainParam && validDomains.includes(domainParam)) {
      setSelectedDomains((prev) => (prev.includes(domainParam) ? prev : [...prev, domainParam]));
    }
  }, [domainParam]);

  // Load available domains for signup
  useEffect(() => {
    api.domains()
      .then((res) => setAvailableDomains(res.domains))
      .catch(() => {});
  }, []);

  // Timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const toggleDomain = (dom: Domain) => {
    if (selectedDomains.includes(dom)) {
      setSelectedDomains(selectedDomains.filter((d) => d !== dom));
    } else {
      setSelectedDomains([...selectedDomains, dom]);
    }
  };

  // --- Handlers ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!loginEmail.trim() || !loginPassword) {
      setError("Please provide both email and subscriber password.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.login(loginEmail, loginPassword);
      setToken(res.token);
      await refresh();
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem("tam.justSignedUp");
        } catch {}
      }
      if (nextUrl && nextUrl !== "/login" && nextUrl !== "/") {
        router.push(nextUrl);
      } else {
        router.push("/desk/form");
      }
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const email = signupEmail.trim();
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!isStudentEmail(email)) {
      setError(`Notice: Registration requires an official @${STUDENT_EMAIL_DOMAIN} address.`);
      return;
    }

    setLoading(true);
    try {
      const res = await api.requestOtp(email, "signup");
      setOtpToken(res.otpToken);
      setSignupStep(2);
      setResendTimer(30);
      setSuccess("Verification code dispatched! Check your communications.");
    } catch (err) {
      if (err instanceof ApiError && err.code === "ALREADY_REGISTERED") {
        setError("This address is already on our subscriber rolls. Please log in.");
      } else {
        setError(errorText(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignupOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otpCode.trim().length !== 6) {
      setError("Please provide the full six-digit verification code.");
      return;
    }
    setSignupStep(3);
  };

  const handleCompleteSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Full name is required.");
    if (!phone.trim()) return setError("Contact phone number is required.");
    if (!regNumber.trim()) return setError("Student registration number is required.");
    if (password.length < 8 || password.length > 72) {
      return setError("Password must be between 8 and 72 characters.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    if (SIGNUP_NEEDS_DOMAIN && selectedDomains.length === 0) {
      return setError("Select at least one division you are curious about.");
    }

    setLoading(true);
    try {
      const domainsToSend = SIGNUP_NEEDS_DOMAIN ? selectedDomains : [];
      const res = await api.signup({
        email: signupEmail.trim(),
        otpToken,
        otp: otpCode.trim(),
        password,
        name: name.trim(),
        phone: phone.trim(),
        regNumber: regNumber.trim().toUpperCase(),
        domains: domainsToSend,
      });

      setToken(res.token);
      await refresh();
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("tam.justSignedUp", "1");
        } catch {}
      }
      router.push("/");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const email = resetEmail.trim();
    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.requestOtp(email, "reset");
      setResetOtpToken(res.otpToken);
      setResetStep(2);
      setResendTimer(30);
      setSuccess("Password reset cipher dispatched to your address.");
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (resetOtp.trim().length !== 6) {
      return setError("Please enter the six-digit verification code.");
    }
    if (newPassword.length < 8 || newPassword.length > 72) {
      return setError("Password must be between 8 and 72 characters.");
    }
    if (newPassword !== confirmNewPassword) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      await api.resetPassword(resetEmail.trim(), resetOtpToken, resetOtp.trim(), newPassword);
      setSuccess("Credentials updated! Please log in with your new password.");
      setMode("login");
      setLoginEmail(resetEmail.trim());
      setResetStep(1);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="paper"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        boxSizing: "border-box",
      }}
    >
      {/* Newspaper Header */}
      <div style={{ textAlign: "center", maxWidth: "600px", width: "100%", marginBottom: "20px" }}>
        <h1
          className="font-masthead"
          style={{ fontSize: "clamp(2.8rem, 6vw, 4.2rem)", lineHeight: 1, margin: 0, color: "var(--ink)" }}
        >
          The TAM Times
        </h1>
        <p
          className="font-label"
          style={{
            fontSize: "0.82rem",
            fontStyle: "italic",
            letterSpacing: "0.08em",
            color: "var(--ink-soft)",
            margin: "6px 0 2px 0",
          }}
        >
          &ldquo;It&apos;s a place for everyone to learn&rdquo;
        </p>
        <div
          className="font-label"
          style={{
            fontSize: "0.68rem",
            letterSpacing: "0.18em",
            color: "var(--stamp)",
            marginTop: "4px",
            textTransform: "uppercase",
          }}
        >
          SUBSCRIBER&apos;S DESK · CANDIDATE ENROLMENT
        </div>
        <hr className="rule-double" style={{ margin: "10px 0 0 0" }} />
      </div>

      {/* Classified-Ad Style Card */}
      <div
        className="desk-card"
        style={{
          maxWidth: "520px",
          width: "100%",
          padding: "24px 22px",
          backgroundColor: "var(--paper)",
          border: "2px solid var(--ink)",
          boxShadow: "3px 3px 0 var(--ink)",
          position: "relative",
        }}
      >
        {/* Classified Card Header Banner */}
        <div
          style={{
            borderBottom: "1px dashed var(--ink)",
            paddingBottom: "8px",
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          <span
            className="font-label"
            style={{
              fontSize: "0.66rem",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--ink-soft)",
            }}
          >
            ✦ OFFICIAL CLASSIFIED NOTICE · NO. 1442 ✦
          </span>
        </div>

        {/* Mode Tabs: Log in, Sign up, Forgot password */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1.2fr",
            borderBottom: "1.5px solid var(--ink)",
            marginBottom: "16px",
          }}
        >
          <button
            type="button"
            onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
            className="font-label"
            style={{
              background: mode === "login" ? "var(--ink)" : "transparent",
              color: mode === "login" ? "var(--paper)" : "var(--ink)",
              border: "none",
              padding: "8px 4px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              transition: "all 0.15s ease",
            }}
          >
            LOG IN
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(null); setSuccess(null); }}
            className="font-label"
            style={{
              background: mode === "signup" ? "var(--ink)" : "transparent",
              color: mode === "signup" ? "var(--paper)" : "var(--ink)",
              border: "none",
              padding: "8px 4px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              transition: "all 0.15s ease",
            }}
          >
            SIGN UP
          </button>
          <button
            type="button"
            onClick={() => { setMode("reset"); setError(null); setSuccess(null); }}
            className="font-label"
            style={{
              background: mode === "reset" ? "var(--ink)" : "transparent",
              color: mode === "reset" ? "var(--paper)" : "var(--ink)",
              border: "none",
              padding: "8px 4px",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.08em",
              transition: "all 0.15s ease",
            }}
          >
            FORGOT PASSWORD
          </button>
        </div>



        {/* Error / Alert */}
        {error && (
          <div
            role="alert"
            style={{
              border: "1.5px solid var(--stamp)",
              backgroundColor: "rgba(139, 30, 30, 0.1)",
              padding: "10px 12px",
              color: "var(--stamp)",
              fontSize: "0.82rem",
              marginBottom: "16px",
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div
            role="status"
            style={{
              border: "1.5px solid var(--ink)",
              backgroundColor: "rgba(74, 63, 54, 0.08)",
              padding: "10px 12px",
              color: "var(--ink)",
              fontSize: "0.82rem",
              marginBottom: "16px",
              lineHeight: 1.4,
            }}
          >
            {success}
          </div>
        )}

        {/* MODE 1: LOG IN */}
        {mode === "login" && (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "14px" }}>
              <label
                htmlFor="login-email"
                className="font-label"
                style={{ display: "block", fontSize: "0.72rem", marginBottom: "2px", fontWeight: 700 }}
              >
                EMAIL ADDRESS
              </label>
              <div className="font-body" style={{ fontSize: "0.68rem", color: "var(--ink-soft)", marginBottom: "4px" }}>
                Use your @vitstudent.ac.in email
              </div>
              <input
                id="login-email"
                name="email"
                autoComplete="email"
                aria-label="Email address"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="input-field"
                style={{ width: "100%", padding: "8px 10px", fontSize: "0.85rem" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                htmlFor="login-password"
                className="font-label"
                style={{ display: "block", fontSize: "0.72rem", marginBottom: "2px", fontWeight: 700 }}
              >
                PASSWORD
              </label>
              <div className="font-body" style={{ fontSize: "0.68rem", color: "var(--ink-soft)", marginBottom: "4px" }}>
                At least 8 characters
              </div>
              <input
                id="login-password"
                name="password"
                autoComplete="current-password"
                aria-label="Password"
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="input-field"
                style={{ width: "100%", padding: "8px 10px", fontSize: "0.85rem" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-oxblood"
              style={{ width: "100%", textAlign: "center", fontSize: "0.88rem", padding: "10px 0" }}
            >
              {loading ? "VERIFYING SUBSCRIPTION..." : "LOG IN TO THE DESK ➔"}
            </button>
          </form>
        )}

        {/* MODE 2: SIGN UP */}
        {mode === "signup" && (
          <div>
            {/* Step indicator */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "16px",
                borderBottom: "1px dotted var(--ink)",
                paddingBottom: "8px",
              }}
            >
              <span
                className="font-label"
                style={{
                  fontSize: "0.65rem",
                  color: signupStep >= 1 ? "var(--stamp)" : "var(--ink-soft)",
                  fontWeight: signupStep === 1 ? 700 : 400,
                }}
              >
                1. EMAIL
              </span>
              <span
                className="font-label"
                style={{
                  fontSize: "0.65rem",
                  color: signupStep >= 2 ? "var(--stamp)" : "var(--ink-soft)",
                  fontWeight: signupStep === 2 ? 700 : 400,
                }}
              >
                2. VERIFY CODE
              </span>
              <span
                className="font-label"
                style={{
                  fontSize: "0.65rem",
                  color: signupStep >= 3 ? "var(--stamp)" : "var(--ink-soft)",
                  fontWeight: signupStep === 3 ? 700 : 400,
                }}
              >
                3. DOSSIER DETAILS
              </span>
            </div>

            {/* Signup Step 1: Email */}
            {signupStep === 1 && (
              <form onSubmit={handleRequestSignupOtp}>
                <div style={{ marginBottom: "16px" }}>
                  <label
                    htmlFor="signup-email"
                    className="font-label"
                    style={{ display: "block", fontSize: "0.72rem", marginBottom: "2px", fontWeight: 700 }}
                  >
                    CANDIDATE EMAIL ADDRESS
                  </label>
                  <div className="font-body" style={{ fontSize: "0.68rem", color: "var(--ink-soft)", marginBottom: "4px" }}>
                    Use your @vitstudent.ac.in email
                  </div>
                  <input
                    id="signup-email"
                    name="email"
                    autoComplete="email"
                    aria-label="Candidate email address"
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    className="input-field"
                    style={{ width: "100%", padding: "8px 10px", fontSize: "0.85rem" }}
                  />
                  <div className="font-body" style={{ fontSize: "0.68rem", color: "var(--ink-soft)", marginTop: "4px" }}>
                    Official @{STUDENT_EMAIL_DOMAIN} required for authentication.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-oxblood"
                  style={{ width: "100%", textAlign: "center", fontSize: "0.88rem", padding: "10px 0" }}
                >
                  {loading ? "TRANSMITTING CODE..." : "DISPATCH 6-DIGIT CODE ➔"}
                </button>
              </form>
            )}

            {/* Signup Step 2: 6-Digit Code */}
            {signupStep === 2 && (
              <form onSubmit={handleVerifySignupOtp}>
                <div style={{ marginBottom: "16px" }}>
                  <label
                    htmlFor="signup-otp"
                    className="font-label"
                    style={{ display: "block", fontSize: "0.72rem", marginBottom: "4px", fontWeight: 700 }}
                  >
                    ENTER 6-DIGIT CODE
                  </label>
                  <input
                    id="signup-otp"
                    name="otp"
                    autoComplete="one-time-code"
                    aria-label="6-digit verification code"
                    type="text"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="input-field"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      fontSize: "1.1rem",
                      letterSpacing: "0.25em",
                      textAlign: "center",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px" }}>
                    <span className="font-body" style={{ fontSize: "0.68rem", color: "var(--ink-soft)" }}>
                      Sent to: {signupEmail}
                    </span>
                    <button
                      type="button"
                      disabled={resendTimer > 0 || loading}
                      onClick={handleRequestSignupOtp}
                      className="font-label"
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "0.68rem",
                        color: resendTimer > 0 ? "var(--ink-soft)" : "var(--stamp)",
                        cursor: resendTimer > 0 ? "default" : "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-oxblood"
                  style={{ width: "100%", textAlign: "center", fontSize: "0.88rem", padding: "10px 0" }}
                >
                  CONFIRM VERIFICATION ➔
                </button>
              </form>
            )}

            {/* Signup Step 3: Name, Phone, RegNumber, Password, Domains Checklist */}
            {signupStep === 3 && (
              <form onSubmit={handleCompleteSignup}>
                <div style={{ marginBottom: "12px" }}>
                  <label
                    htmlFor="signup-name"
                    className="font-label"
                    style={{ display: "block", fontSize: "0.72rem", marginBottom: "3px", fontWeight: 700 }}
                  >
                    FULL NAME
                  </label>
                  <input
                    id="signup-name"
                    name="name"
                    autoComplete="name"
                    aria-label="Full name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    style={{ width: "100%", padding: "7px 10px", fontSize: "0.82rem" }}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                  <div>
                    <label
                      htmlFor="signup-phone"
                      className="font-label"
                      style={{ display: "block", fontSize: "0.72rem", marginBottom: "2px", fontWeight: 700 }}
                    >
                      PHONE NUMBER
                    </label>
                    <div className="font-body" style={{ fontSize: "0.68rem", color: "var(--ink-soft)", marginBottom: "3px" }}>
                      10-digit mobile number
                    </div>
                    <input
                      id="signup-phone"
                      name="phone"
                      autoComplete="tel"
                      aria-label="Phone number"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input-field"
                      style={{ width: "100%", padding: "7px 10px", fontSize: "0.82rem" }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="signup-reg"
                      className="font-label"
                      style={{ display: "block", fontSize: "0.72rem", marginBottom: "2px", fontWeight: 700 }}
                    >
                      REGISTRATION NO.
                    </label>
                    <div className="font-body" style={{ fontSize: "0.68rem", color: "var(--ink-soft)", marginBottom: "3px" }}>
                      As written on your college ID
                    </div>
                    <input
                      id="signup-reg"
                      name="regNumber"
                      autoComplete="off"
                      aria-label="Registration number"
                      type="text"
                      required
                      value={regNumber}
                      onChange={(e) => setRegNumber(e.target.value)}
                      className="input-field"
                      style={{ width: "100%", padding: "7px 10px", fontSize: "0.82rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
                  <div>
                    <label
                      htmlFor="signup-pw"
                      className="font-label"
                      style={{ display: "block", fontSize: "0.72rem", marginBottom: "2px", fontWeight: 700 }}
                    >
                      PASSWORD
                    </label>
                    <div className="font-body" style={{ fontSize: "0.68rem", color: "var(--ink-soft)", marginBottom: "3px" }}>
                      At least 8 characters
                    </div>
                    <input
                      id="signup-pw"
                      name="password"
                      autoComplete="new-password"
                      aria-label="Password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field"
                      style={{ width: "100%", padding: "7px 10px", fontSize: "0.82rem" }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="signup-cpw"
                      className="font-label"
                      style={{ display: "block", fontSize: "0.72rem", marginBottom: "2px", fontWeight: 700 }}
                    >
                      CONFIRM PASSWORD
                    </label>
                    <div className="font-body" style={{ fontSize: "0.68rem", color: "var(--ink-soft)", marginBottom: "3px" }}>
                      At least 8 characters
                    </div>
                    <input
                      id="signup-cpw"
                      name="confirmPassword"
                      autoComplete="new-password"
                      aria-label="Confirm password"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="input-field"
                      style={{ width: "100%", padding: "7px 10px", fontSize: "0.82rem" }}
                    />
                  </div>
                </div>

                {/* Checklist: Divisions you are curious about (you can add more later) */}
                {SIGNUP_NEEDS_DOMAIN && (
                  <div
                    style={{
                      borderTop: "1px dashed var(--ink)",
                      paddingTop: "12px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      className="font-label"
                      style={{ fontSize: "0.72rem", fontWeight: 700, marginBottom: "2px", color: "var(--ink)" }}
                    >
                      Divisions you are curious about (you can add more later)
                    </div>
                    <div
                      className="font-body"
                      style={{ fontSize: "0.68rem", color: "var(--ink-soft)", marginBottom: "8px" }}
                    >
                      Select at least one department to initialize your candidate dossier:
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                      {availableDomains.map((d) => {
                        const checked = selectedDomains.includes(d.domain);
                        return (
                          <label
                            key={d.domain}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              padding: "4px 6px",
                              backgroundColor: checked ? "rgba(139, 30, 30, 0.08)" : "transparent",
                              border: checked ? "1px solid var(--stamp)" : "1px solid rgba(28, 22, 19, 0.2)",
                            }}
                          >
                            <input
                              id={`signup-domain-${d.domain}`}
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleDomain(d.domain)}
                            />
                            <span className="font-label" style={{ fontWeight: checked ? 700 : 400 }}>
                              {getDomainLabel(d.domain)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-oxblood"
                  style={{ width: "100%", textAlign: "center", fontSize: "0.88rem", padding: "10px 0" }}
                >
                  {loading ? "SEALING CANDIDACY..." : "COMPLETE REGISTRATION ➔"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* MODE 3: FORGOT PASSWORD */}
        {mode === "reset" && (
          <div>
            {resetStep === 1 && (
              <form onSubmit={handleRequestResetOtp}>
                <div style={{ marginBottom: "16px" }}>
                  <label
                    htmlFor="reset-email"
                    className="font-label"
                    style={{ display: "block", fontSize: "0.72rem", marginBottom: "2px", fontWeight: 700 }}
                  >
                    REGISTERED EMAIL ADDRESS
                  </label>
                  <div className="font-body" style={{ fontSize: "0.68rem", color: "var(--ink-soft)", marginBottom: "4px" }}>
                    Use your @vitstudent.ac.in email
                  </div>
                  <input
                    id="reset-email"
                    name="email"
                    autoComplete="email"
                    aria-label="Registered email address"
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="input-field"
                    style={{ width: "100%", padding: "8px 10px", fontSize: "0.85rem" }}
                  />
                  <div className="font-body" style={{ fontSize: "0.68rem", color: "var(--ink-soft)", marginTop: "4px" }}>
                    We will send a 6-digit recovery code to your registered dispatch.
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-oxblood"
                  style={{ width: "100%", textAlign: "center", fontSize: "0.88rem", padding: "10px 0" }}
                >
                  {loading ? "TRANSMITTING..." : "SEND RECOVERY CODE ➔"}
                </button>
              </form>
            )}

            {resetStep === 2 && (
              <form onSubmit={handleCompleteReset}>
                <div style={{ marginBottom: "14px" }}>
                  <label
                    htmlFor="reset-otp"
                    className="font-label"
                    style={{ display: "block", fontSize: "0.72rem", marginBottom: "4px", fontWeight: 700 }}
                  >
                    6-DIGIT RECOVERY CODE
                  </label>
                  <input
                    id="reset-otp"
                    name="otp"
                    autoComplete="one-time-code"
                    aria-label="6-digit recovery code"
                    type="text"
                    maxLength={6}
                    required
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    className="input-field"
                    style={{
                      width: "100%",
                      padding: "8px 10px",
                      fontSize: "1.1rem",
                      letterSpacing: "0.25em",
                      textAlign: "center",
                    }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "4px" }}>
                    <span className="font-body" style={{ fontSize: "0.68rem", color: "var(--ink-soft)" }}>
                      Code sent to {resetEmail}
                    </span>
                    <button
                      type="button"
                      disabled={resendTimer > 0 || loading}
                      onClick={handleRequestResetOtp}
                      className="font-label"
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: "0.68rem",
                        color: resendTimer > 0 ? "var(--ink-soft)" : "var(--stamp)",
                        cursor: resendTimer > 0 ? "default" : "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      {resendTimer > 0 ? `Resend (${resendTimer}s)` : "Resend"}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label
                    htmlFor="reset-pw"
                    className="font-label"
                    style={{ display: "block", fontSize: "0.72rem", marginBottom: "2px", fontWeight: 700 }}
                  >
                    NEW PASSWORD
                  </label>
                  <div className="font-body" style={{ fontSize: "0.68rem", color: "var(--ink-soft)", marginBottom: "4px" }}>
                    At least 8 characters
                  </div>
                  <input
                    id="reset-pw"
                    name="newPassword"
                    autoComplete="new-password"
                    aria-label="New password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field"
                    style={{ width: "100%", padding: "8px 10px", fontSize: "0.85rem" }}
                  />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label
                    htmlFor="reset-cpw"
                    className="font-label"
                    style={{ display: "block", fontSize: "0.72rem", marginBottom: "2px", fontWeight: 700 }}
                  >
                    CONFIRM NEW PASSWORD
                  </label>
                  <div className="font-body" style={{ fontSize: "0.68rem", color: "var(--ink-soft)", marginBottom: "4px" }}>
                    At least 8 characters
                  </div>
                  <input
                    id="reset-cpw"
                    name="confirmNewPassword"
                    autoComplete="new-password"
                    aria-label="Confirm new password"
                    type="password"
                    required
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="input-field"
                    style={{ width: "100%", padding: "8px 10px", fontSize: "0.85rem" }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-oxblood"
                  style={{ width: "100%", textAlign: "center", fontSize: "0.88rem", padding: "10px 0" }}
                >
                  {loading ? "UPDATING..." : "RESET PASSWORD & LOG IN ➔"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Card Footer Note */}
        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px dashed var(--ink)", textAlign: "center" }}>
          <span className="font-body" style={{ fontSize: "0.7rem", color: "var(--ink-soft)" }}>
            Need help with your enrollment? Inquiries may be addressed to{" "}
            <span style={{ textDecoration: "underline" }}>tam@vitstudent.ac.in</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="paper"
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="font-masthead" style={{ fontSize: "2rem" }}>
            The TAM Times
          </div>
        </div>
      }
    >
      <LoginScreen />
    </Suspense>
  );
}
