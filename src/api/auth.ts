import { apiFetch, USE_MOCK, mockDelay } from "./client";
import { User } from "../types/models";
import { me as mockMe } from "../mocks/db";

/** 설계서 §10.2 인증 응답 — 액세스/리프레시 토큰 + 로그인 사용자 */
export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface SignupInput {
  email: string;
  password: string;
  nickname: string;
}

function mockToken(prefix: string): string {
  return `${prefix}.${Math.random().toString(36).slice(2)}.${Date.now()}`;
}

function mockAuth(nickname?: string): AuthResult {
  return {
    accessToken: mockToken("mock-access"),
    refreshToken: mockToken("mock-refresh"),
    user: nickname ? { ...mockMe, nickname } : mockMe,
  };
}

/** 이메일 로그인. 목: 형식만 맞으면 무조건 통과. */
export async function login(email: string, password: string): Promise<AuthResult> {
  if (USE_MOCK) return mockDelay(mockAuth(), 500);
  return apiFetch<AuthResult>("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

/** 이메일 회원가입. 목: 무조건 통과, 입력 닉네임으로 사용자 생성. */
export async function signup(input: SignupInput): Promise<AuthResult> {
  if (USE_MOCK) return mockDelay(mockAuth(input.nickname), 500);
  return apiFetch<AuthResult>("/auth/signup", {
    method: "POST",
    body: input,
  });
}

/** 액세스 토큰 재발급. AuthProvider 부팅 검증 및 client.ts 401 인터셉터가 사용. */
export async function refreshTokens(refreshToken: string): Promise<AuthResult> {
  if (USE_MOCK) return mockDelay(mockAuth(), 200);
  return apiFetch<AuthResult>("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  });
}
