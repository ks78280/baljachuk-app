import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "../types/models";
import {
  clearTokens,
  getRefreshToken,
  loadTokens,
  setTokens,
} from "../api/authToken";
import {
  login as apiLogin,
  signup as apiSignup,
  refreshTokens as apiRefresh,
  SignupInput,
} from "../api/auth";
import { setSessionExpiredHandler } from "../api/client";

type AuthStatus = "loading" | "authed" | "guest";

interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: SignupInput) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);

  // 부팅: 저장된 토큰을 복원하고, 있으면 리프레시로 유효성 확인
  useEffect(() => {
    let alive = true;
    (async () => {
      const { accessToken } = await loadTokens();
      if (!alive) return;
      if (!accessToken) {
        setStatus("guest");
        return;
      }
      // 저장된 세션이 아직 살아있는지 refresh 로 검증 (목: 항상 성공)
      const rt = getRefreshToken();
      if (rt) {
        try {
          const res = await apiRefresh(rt);
          if (!alive) return;
          setTokens({
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
          });
          setUser(res.user);
          setStatus("authed");
          return;
        } catch {
          if (!alive) return;
          clearTokens();
          setStatus("guest");
          return;
        }
      }
      setStatus("authed");
    })();
    return () => {
      alive = false;
    };
  }, []);

  // client.ts 의 401 인터셉터가 refresh 까지 실패하면 호출된다
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      setStatus("guest");
      qc.clear();
    });
    return () => setSessionExpiredHandler(() => {});
  }, [qc]);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    setUser(res.user);
    setStatus("authed");
  }, []);

  const signUp = useCallback(async (input: SignupInput) => {
    const res = await apiSignup(input);
    setTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    setUser(res.user);
    setStatus("authed");
  }, []);

  const signOut = useCallback(() => {
    clearTokens();
    setUser(null);
    setStatus("guest");
    qc.clear();
  }, [qc]);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, signIn, signUp, signOut }),
    [status, user, signIn, signUp, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth 는 AuthProvider 안에서만 쓸 수 있습니다");
  return ctx;
}
