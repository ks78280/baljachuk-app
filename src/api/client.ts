import { ApiEnvelope, ApiRequestError } from "../types/api";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./authToken";

/**
 * 백엔드가 아직 없어서 기본값 true. 백엔드(NestJS)가 뜨면
 *   .env 에 EXPO_PUBLIC_API_BASE_URL 지정 + EXPO_PUBLIC_USE_MOCK=false
 * 로만 바꾸면 각 api 모듈이 mock 대신 실제 요청을 보낸다. 화면 코드는 그대로.
 */
export const USE_MOCK =
  (process.env.EXPO_PUBLIC_USE_MOCK ?? "true").toLowerCase() !== "false";

export const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api";

type Query = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
  /** 내부용: 401 → refresh 후 재시도 루프를 1회로 제한 */
  _retry?: boolean;
}

function buildUrl(path: string, query?: Query): string {
  const url = new URL(path.replace(/^\//, ""), BASE_URL.replace(/\/?$/, "/"));
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

// --- 세션 만료 콜백 -------------------------------------------------------
// client 는 auth 상태를 직접 모른다. refresh 까지 실패하면 이 콜백으로
// AuthProvider 에 "로그아웃 처리해라" 를 알린다.
type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler = () => {};
export function setSessionExpiredHandler(fn: SessionExpiredHandler): void {
  onSessionExpired = fn;
}

// 동시에 여러 요청이 401 을 받아도 refresh 는 한 번만 실행한다.
let refreshPromise: Promise<boolean> | null = null;

async function runRefresh(): Promise<boolean> {
  const rt = getRefreshToken();
  if (!rt) return false;
  try {
    const res = await fetch(buildUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    const json = (await res.json()) as ApiEnvelope<{
      accessToken: string;
      refreshToken: string;
    }>;
    if (!res.ok || json.error || !json.data) return false;
    setTokens({
      accessToken: json.data.accessToken,
      refreshToken: json.data.refreshToken,
    });
    return true;
  } catch {
    return false;
  }
}

function rawFetch(path: string, opts: RequestOptions): Promise<Response> {
  const token = getAccessToken();
  return fetch(buildUrl(path, opts.query), {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opts.body != null ? JSON.stringify(opts.body) : undefined,
  });
}

/** 공통 응답 포맷을 언래핑해서 호출부는 순수 T만 다룬다. 실패 시 ApiRequestError throw. */
export async function apiFetch<T>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  let res = await rawFetch(path, opts);

  // 401 → refresh 후 1회 재시도 (단, /auth/* 요청 자체는 인터셉터 제외)
  if (res.status === 401 && !opts._retry && !path.startsWith("/auth/")) {
    if (!refreshPromise) {
      refreshPromise = runRefresh().finally(() => {
        refreshPromise = null;
      });
    }
    const refreshed = await refreshPromise;
    if (!refreshed) {
      clearTokens();
      onSessionExpired();
      throw new ApiRequestError({
        code: "SESSION_EXPIRED",
        message: "세션이 만료되었어요. 다시 로그인해주세요.",
      });
    }
    res = await rawFetch(path, { ...opts, _retry: true });
  }

  let json: ApiEnvelope<T>;
  try {
    json = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new ApiRequestError({
      code: "NETWORK_ERROR",
      message: "서버 응답을 해석할 수 없습니다",
    });
  }

  if (!res.ok || json.error) {
    throw new ApiRequestError(
      json.error ?? { code: "HTTP_" + res.status, message: "요청에 실패했습니다" }
    );
  }
  return json.data as T;
}

/** mock 모듈이 로딩 상태를 실제처럼 노출하도록 하는 인위적 지연 */
export function mockDelay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}
