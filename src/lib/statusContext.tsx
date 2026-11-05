"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { api, StatusResponse, StatusApplication, Domain, errorText } from "./client";
import { getToken } from "./api";

interface EditionStatusContextValue {
  statusData: StatusResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getAppForDomain: (domain: Domain) => StatusApplication | undefined;
}

const EditionStatusContext = createContext<EditionStatusContextValue | null>(null);

export function EditionStatusProvider({ children }: { children: React.ReactNode }) {
  const [statusData, setStatusData] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedRef = useRef<number>(0);

  const fetchStatus = useCallback(async (force = false) => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    const now = Date.now();
    // Cache for at most once a minute unless forced
    if (!force && now - lastFetchedRef.current < 60000 && statusData !== null) {
      return;
    }

    setLoading(true);
    try {
      const res = await api.status();
      setStatusData(res);
      lastFetchedRef.current = Date.now();
      setError(null);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  }, [statusData]);

  useEffect(() => {
    fetchStatus(true);
  }, []);

  // Refetch when tab regains focus or becomes visible, throttled to 1 minute
  useEffect(() => {
    const handleFocus = () => {
      if (Date.now() - lastFetchedRef.current >= 60000) {
        fetchStatus();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && Date.now() - lastFetchedRef.current >= 60000) {
        fetchStatus();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchStatus]);

  const getAppForDomain = useCallback(
    (domain: Domain): StatusApplication | undefined => {
      if (!statusData?.applications) return undefined;
      return statusData.applications.find((a) => a.domain === domain);
    },
    [statusData]
  );

  return (
    <EditionStatusContext.Provider
      value={{
        statusData,
        loading,
        error,
        refetch: () => fetchStatus(true),
        getAppForDomain,
      }}
    >
      {children}
    </EditionStatusContext.Provider>
  );
}

export function useEditionStatus() {
  const ctx = useContext(EditionStatusContext);
  if (!ctx) {
    throw new Error("useEditionStatus must be used within an EditionStatusProvider");
  }
  return ctx;
}
