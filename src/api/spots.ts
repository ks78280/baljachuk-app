import { apiFetch, USE_MOCK, mockDelay } from "./client";
import { Spot } from "../types/models";
import * as mock from "../mocks/db";

/** 위치 선택용 스팟 목록. 실서버에서는 최근 방문/주변 스팟을 내려준다. */
export async function getSpots(): Promise<Spot[]> {
  if (USE_MOCK) return mockDelay(mock.spots, 200);
  return apiFetch("/spots");
}

/** 지역/스팟 검색 (이름·주소 매칭). */
export async function searchSpots(q: string): Promise<Spot[]> {
  const term = q.trim().toLowerCase();
  if (USE_MOCK) {
    if (!term) return mockDelay([]);
    return mockDelay(
      mock.spots.filter(
        (s) =>
          s.name.toLowerCase().includes(term) ||
          (s.address ?? "").toLowerCase().includes(term)
      ),
      250
    );
  }
  return apiFetch("/spots/search", { query: { q } });
}
