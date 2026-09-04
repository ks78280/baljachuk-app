import { ApiEnvelope, ApiRequestError } from "../types/api";
import { getAccessToken } from "./authToken";

/**
 * 백엔드가 아직 없어서 기본값 true. 백엔드(NestJS)가 뜨면
 *   .env 에 EXPO_PUBLIC_API_BASE_URL 지정 + EXPO_PUBLIC_USE_MOCK=false
 * 로만 바꾸면 각 api 모듈이 mock 대신 실제 요청을 보낸다. 화면 코드는 그대로.
 */
export const USE_MOCK =
  (process.env.EXPO_PUBLIC_USE_MOCK ?? "true").toLowerCase() !== "false";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

type Query = Record<string, string | number | boolean | null | undefined>;

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
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

/** 공통 응답 포맷을 언래핑해서 호출부는 순수 T만 다룬다. 실패 시 ApiRequestError throw. */
export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(buildUrl(path, opts.query), {
    method: opts.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opts.body != null ? JSON.stringify(opts.body) : undefined,
  });

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
