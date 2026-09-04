// 설계서 10.1: 공통 응답 포맷 { data, error, meta } + 커서 페이지네이션

export interface ApiError {
  code: string;
  message: string;
}

export type ApiEnvelope<T> =
  | { data: T; error: null; meta?: Record<string, unknown> }
  | { data: null; error: ApiError; meta?: Record<string, unknown> };

export interface CursorPage<T> {
  items: T[];
  nextCursor: string | null;
}

/** 지도 뷰포트 bounding box */
export interface BBox {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

export type MapScope = "me" | "friends" | "all";
export type TimelineTab = "mine" | "friends";

export class ApiRequestError extends Error {
  code: string;
  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiRequestError";
    this.code = error.code;
  }
}
