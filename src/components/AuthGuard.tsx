"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/client";
import { useSession } from "@/lib/session";
import { DeskHeader } from "./DeskHeader";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useSession();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

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
        }}
      >
        <div className="font-masthead" style={{ fontSize: "2rem", marginBottom: "8px" }}>
          The TAM Times
        </div>
        <div className="font-label" style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "var(--stamp)" }}>
          CONSULTING THE SUBSCRIBER ROLLS...
        </div>
      </div>
    );
  }

  if (!user && !getToken()) {
    return null;
  }

  return (
    <div className="paper" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <DeskHeader />
      <main style={{ flex: 1, padding: "24px 16px", maxWidth: "1040px", margin: "0 auto", width: "100%" }}>
        {children}
      </main>
    </div>
  );
}
