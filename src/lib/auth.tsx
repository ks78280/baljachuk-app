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

  // 부팅: 저장된 토큰 복원. 리프레시 토큰이 있으면 앱 실행당 1회 refresh 로
  // 세션을 검증·연장하고 user 를 채운다(부팅 1회뿐이라 로테이션 churn 아님).
  // refresh 실패 시에도 액세스 토큰이 남아 있으면 일단 신뢰하고, 만료면
  // 첫 요청에서 client.ts 의 401 인터셉터가 다시 시도한다.
  useEffect(() => {
    let alive = true;
    (async () => {
      const { accessToken, refreshToken } = await loadTokens();
      if (!alive) return;
      if (refreshToken) {
        try {
          const res = await apiRefresh(refreshToken);
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
          if (!accessToken) {
            clearTokens();
            setStatus("guest");
            return;
          }
          // refresh 는 실패했지만 액세스 토큰이 있으니 일단 진입
        }
      }
      setStatus(accessToken ? "authed" : "guest");
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
