"use client";

import React, { useEffect, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getToken, setToken } from "@/lib/client";
import { useSession } from "@/lib/session";

function AuthGateContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, error } = useSession();

  const isLoginPage = pathname === "/login";

  const nextParam = searchParams.get("next");
  const fullCurrentPath = React.useMemo(() => {
    const sp = searchParams.toString();
    return pathname + (sp ? `?${sp}` : "");
  }, [pathname, searchParams]);

  useEffect(() => {
    const token = getToken();

    // 1. Signed-in visitor opening /login is sent to next, or /desk/form (if seen edition), or /
    // NOTE: this flag is per browser; a per-account version needs a backend field.
    if (isLoginPage) {
      if (token && user) {
        if (nextParam && nextParam !== "/login") {
          router.replace(nextParam);
        } else {
          const email = user.email?.toLowerCase().trim();
          let hasSeen = false;
          if (email && typeof window !== "undefined") {
            try {
              hasSeen = localStorage.getItem(`tam.seenEdition.${email}`) === "1";
            } catch {
              // ignore
            }
          }
          router.replace(hasSeen ? "/desk/form" : "/");
        }
      }
      return;
    }

    // 2. Not on /login: check token
    if (!token) {
      router.replace(`/login?next=${encodeURIComponent(fullCurrentPath)}`);
      return;
    }

    // 3. Token exists, wait for session resolution
    if (!loading && !user) {
      // api.me() returned 401, 403 or registered: false
      setToken(null);
      const msg = error || "Session expired or unregistered. Please sign in.";
      router.replace(`/login?error=${encodeURIComponent(msg)}&next=${encodeURIComponent(fullCurrentPath)}`);
    }
  }, [isLoginPage, user, loading, error, fullCurrentPath, nextParam, router]);

  // If on /login page
  if (isLoginPage) {
    if (getToken() && user) {
      return null;
    }
    return <>{children}</>;
  }

  // Guarded page: if no token, don't show content
  if (!getToken()) {
    return null;
  }

  // Token exists but session is loading
  if (loading) {
    return (
      <div
        className="paper"
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          background: "radial-gradient(ellipse at center, #241A14 0%, #120D0A 100%)",
        }}
      >
        <div
          className="font-masthead"
          style={{ fontSize: "2.4rem", color: "var(--paper)", marginBottom: "8px" }}
        >
          The TAM Times
        </div>
        <div
          className="font-label"
          style={{ fontSize: "0.75rem", letterSpacing: "0.18em", color: "var(--paper-dark)" }}
        >
          CONSULTING THE SUBSCRIBER ROLLS...
        </div>
      </div>
    );
  }

  // Token exists but verification failed
  if (!user) {
    return null;
  }

  // Authenticated: render guarded content with short fade-in
  return (
    <div className="anim-fade-in" style={{ width: "100%", height: "100%" }}>
      {children}
    </div>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div
          className="paper"
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div className="font-masthead" style={{ fontSize: "2rem" }}>
            The TAM Times
          </div>
        </div>
      }
    >
      <AuthGateContent>{children}</AuthGateContent>
    </Suspense>
  );
}
