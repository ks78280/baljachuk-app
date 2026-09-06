import { apiFetch, USE_MOCK, mockDelay } from "./client";

/** 좌표 → 짧은 주소 (기록 작성 시 위치 선택 보조). 서버가 Nominatim 을 프록시. */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<{ address: string | null }> {
  if (USE_MOCK) return mockDelay({ address: null });
  return apiFetch("/geocode/reverse", { query: { lat, lng } });
}
