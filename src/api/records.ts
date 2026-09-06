import { apiFetch, USE_MOCK, mockDelay } from "./client";
import { CursorPage, TimelineTab } from "../types/api";
import { RecordCard, RecordType, Visibility } from "../types/models";
import * as mock from "../mocks/db";

export async function getTimeline(
  tab: TimelineTab,
  cursor?: string
): Promise<CursorPage<RecordCard>> {
  if (USE_MOCK) {
    const src = tab === "mine" ? mock.timelineMine : mock.timelineFriends;
    return mockDelay({ items: [...src], nextCursor: null });
  }
  return apiFetch("/records/timeline", { query: { tab, cursor } });
}

export async function getRecordDetail(id: string): Promise<RecordCard> {
  if (USE_MOCK) {
    const found = mock.findRecord(id);
    if (!found) throw new Error("기록을 찾을 수 없습니다");
    // 캐시가 목 객체를 직접 참조하지 않도록 복사본 반환
    return mockDelay({ ...found, photos: [...found.photos] });
  }
  return apiFetch(`/records/${id}`);
}

export async function getMyRecords(): Promise<RecordCard[]> {
  if (USE_MOCK) return mockDelay([...mock.timelineMine]);
  return apiFetch("/users/me/records");
}

/** 위시리스트 (설계서 §10.2). userId="me" 는 본인. */
export async function getWishlist(userId: string): Promise<RecordCard[]> {
  if (USE_MOCK) return mockDelay(mock.mockWishlist());
  return apiFetch(`/users/${userId}/wishlist`);
}

export interface NewSpotInput {
  name: string;
  latitude: number;
  longitude: number;
  address?: string | null;
}

export interface CreateRecordInput {
  type: RecordType;
  /** 둘 중 하나: 기존 스팟 id, 또는 지도에서 고른 새 좌표 */
  spotId?: string;
  spot?: NewSpotInput;
  caption: string;
  photoUrls: string[];
  visibility: Visibility;
  visitedAt: string | null;
}

export interface UpdateRecordInput {
  caption?: string;
  visibility?: Visibility;
}

/** 캡션 / 공개범위 수정 (작성자만). */
export async function updateRecord(
  id: string,
  patch: UpdateRecordInput
): Promise<RecordCard> {
  if (USE_MOCK) {
    const updated = mock.updateRecordFields(id, patch);
    if (!updated) throw new Error("기록을 찾을 수 없습니다");
    return mockDelay(updated, 200);
  }
  return apiFetch(`/records/${id}`, { method: "PATCH", body: patch });
}

/** 기록 삭제 (작성자만). */
export async function deleteRecord(id: string): Promise<void> {
  if (USE_MOCK) {
    mock.removeRecord(id);
    return mockDelay(undefined, 200);
  }
  await apiFetch(`/records/${id}`, { method: "DELETE" });
}

/** 위시 → 방문 완료 처리. */
export async function completeWish(id: string): Promise<RecordCard> {
  if (USE_MOCK) {
    const updated = mock.updateRecordFields(id, { isCompleted: true });
    if (!updated) throw new Error("기록을 찾을 수 없습니다");
    return mockDelay(updated, 200);
  }
  return apiFetch(`/records/${id}/complete`, { method: "PATCH" });
}

/** 피드 관리 — 기록별 인근 친구 알림 on/off (VISITED). */
export async function setNotifySetting(
  id: string,
  enabled: boolean
): Promise<RecordCard> {
  if (USE_MOCK) {
    const updated = mock.updateRecordFields(id, { nearbyNotifyEnabled: enabled });
    if (!updated) throw new Error("기록을 찾을 수 없습니다");
    return mockDelay(updated, 150);
  }
  return apiFetch(`/records/${id}/notify-setting`, {
    method: "PATCH",
    body: { enabled },
  });
}

export async function createRecord(input: CreateRecordInput): Promise<RecordCard> {
  if (USE_MOCK) {
    const draft: RecordCard = {
      id: `r-${Date.now()}`,
      type: input.type,
      author: mock.me,
      spot: input.spot
        ? {
            id: `s-${Date.now()}`,
            name: input.spot.name,
            latitude: input.spot.latitude,
            longitude: input.spot.longitude,
            address: input.spot.address ?? null,
            recordCount: 1,
          }
        : mock.spots.find((s) => s.id === input.spotId) ?? mock.spots[0],
      caption: input.caption,
      photos: input.photoUrls.map((url, i) => ({
        id: `p-${Date.now()}-${i}`,
        originalUrl: url,
        thumbnailUrl: url,
        width: 0,
        height: 0,
        orderIndex: i,
      })),
      visibility: input.visibility,
      visitedAt: input.visitedAt,
      likeCount: 0,
      commentCount: 0,
      likedByMe: false,
      locked: false,
      createdAt: new Date().toISOString(),
    };
    mock.prependRecord(draft);
    return mockDelay(draft);
  }
  return apiFetch("/records", { method: "POST", body: input });
}
