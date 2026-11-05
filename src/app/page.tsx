"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flipbook } from "@/components/Flipbook";
import { useSession } from "@/lib/session";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useSession();
  const [showFlipbook, setShowFlipbook] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Explicit read request (e.g. from desk header "The TAM Times" link)
    if (searchParams.get("read") === "1" || searchParams.get("edition") === "1") {
      setShowFlipbook(true);
      return;
    }

    // First-time landing after signup
    let justSignedUp = false;
    let hasSeen = false;
    if (typeof window !== "undefined") {
      try {
        justSignedUp = sessionStorage.getItem("tam.justSignedUp") === "1";
        const email = user?.email?.toLowerCase().trim();
        if (email) {
          hasSeen = localStorage.getItem(`tam.seenEdition.${email}`) === "1";
        }
      } catch {}
    }

    if (justSignedUp) {
      // First-time users after signup: see the entire newspaper flipbook
      setShowFlipbook(true);
    } else if (hasSeen || user) {
      // From next time onwards: directly take them to the application forms
      router.replace("/desk/form");
    } else {
      setShowFlipbook(true);
    }
  }, [user, loading, router, searchParams]);

  if (!showFlipbook) {
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

  return (
    <main>
      <Flipbook />
    </main>
  );
}

export default function HomePage() {
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
            background: "radial-gradient(ellipse at center, #241A14 0%, #120D0A 100%)",
          }}
        >
          <div
            className="font-masthead"
            style={{ fontSize: "2.4rem", color: "var(--paper)", marginBottom: "8px" }}
          >
            The TAM Times
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
