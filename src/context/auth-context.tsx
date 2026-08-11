"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchMe, login as loginRequest, register as registerRequest, updateMe as updateMeRequest } from "@/lib/api/auth";
import { ApiError, UNAUTHORIZED_EVENT } from "@/lib/api/client";
import { clearToken, getToken, setToken } from "@/lib/token-store";
import type { UpdateMeInput, User } from "@/types/api";

export type AuthStatus = "loading" | "authed" | "anon";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  completeOAuth: (oauthToken: string) => Promise<User>;
  updateProfile: (data: UpdateMeInput) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const router = useRouter();
  const pathname = usePathname();

  const applyAnon = useCallback(() => {
    setUser(null);
    setTokenState(null);
    setStatus("anon");
  }, []);

  const applySession = useCallback((value: string, me: User) => {
    setTokenState(value);
    setUser(me);
    setStatus("authed");
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = getToken();
      if (cancelled) return;
      if (!stored) {
        await Promise.resolve();
        if (cancelled) return;
        applyAnon();
        return;
      }
      try {
        const me = await fetchMe();
        if (cancelled) return;
        applySession(stored, me);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) clearToken();
        applyAnon();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applyAnon, applySession]);

  useEffect(() => {
    function onUnauthorized() {
      applyAnon();
      const current = pathname ?? "/";
      if (current !== "/login") {
        router.replace(`/login?next=${encodeURIComponent(current)}`);
      }
    }
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [applyAnon, pathname, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await loginRequest(email, password);
      setToken(res.token);
      applySession(res.token, res.user);
      return res.user;
    },
    [applySession],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await registerRequest(name, email, password);
      setToken(res.token);
      applySession(res.token, res.user);
      return res.user;
    },
    [applySession],
  );

  const completeOAuth = useCallback(
    async (oauthToken: string) => {
      setToken(oauthToken);
      const me = await fetchMe();
      applySession(oauthToken, me);
      return me;
    },
    [applySession],
  );

  const updateProfile = useCallback(
    async (data: UpdateMeInput) => {
      const updated = await updateMeRequest(data);
      setUser(updated);
      return updated;
    },
    [],
  );

  const logout = useCallback(() => {
    clearToken();
    applyAnon();
  }, [applyAnon]);

  const value = useMemo(
    () => ({ user, token, status, login, register, completeOAuth, updateProfile, logout }),
    [user, token, status, login, register, completeOAuth, updateProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}