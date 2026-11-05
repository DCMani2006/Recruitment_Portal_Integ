"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, setToken, User, AppSummary, ApiError, errorText } from "./client";

interface SessionContextType {
  user: User | null;
  applications: AppSummary[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType>({
  user: null,
  applications: [],
  loading: true,
  error: null,
  refresh: async () => {},
  logout: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<AppSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setApplications([]);
      setLoading(false);
      return;
    }

    try {
      const res = await api.me();
      if (res.registered && res.user) {
        setUser(res.user);
        setApplications(res.applications ?? []);
        setError(null);
      } else {
        setToken(null);
        setUser(null);
        setApplications([]);
      }
    } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
        setToken(null);
        setUser(null);
        setApplications([]);
        const msg = errorText(e);
        router.push(`/login?error=${encodeURIComponent(msg)}`);
      } else {
        setError(errorText(e));
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setApplications([]);
    router.push("/login");
  }, [router]);

  return (
    <SessionContext.Provider value={{ user, applications, loading, error, refresh, logout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  return useContext(SessionContext);
}

export function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn();
      setData(res);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}
