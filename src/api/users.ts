import { apiFetch, USE_MOCK, mockDelay } from "./client";
import { User, UserStats, Visibility } from "../types/models";
import * as mock from "../mocks/db";

export interface Profile {
  user: User;
  stats: UserStats;
  isMe: boolean;
  followedByMe: boolean;
}

export async function getMe(): Promise<Profile> {
  if (USE_MOCK) {
    return mockDelay({ user: mock.me, stats: mock.meStats, isMe: true, followedByMe: false });
  }
  const [user, stats] = await Promise.all([
    apiFetch<User>("/users/me"),
    apiFetch<UserStats>("/users/me/stats"),
  ]);
  return { user, stats, isMe: true, followedByMe: false };
}

export async function getUserProfile(id: string): Promise<Profile> {
  if (USE_MOCK) {
    return mockDelay({ user: mock.me, stats: mock.meStats, isMe: id === mock.me.id, followedByMe: false });
  }
  const [user, stats] = await Promise.all([
    apiFetch<User>(`/users/${id}`),
    apiFetch<UserStats>(`/users/${id}/stats`),
  ]);
  return { user, stats, isMe: false, followedByMe: false };
}

export interface UpdateMeInput {
  nickname?: string;
  bio?: string;
  profileImageUrl?: string;
  defaultVisibility?: Visibility;
}

/** 프로필/설정 수정. 넘긴 필드만 갱신. */
export async function updateMe(patch: UpdateMeInput): Promise<User> {
  if (USE_MOCK) return mockDelay(mock.updateMe(patch as Partial<User>), 250);
  return apiFetch("/users/me", { method: "PATCH", body: patch });
}

/** 회원 탈퇴 (설계서 §11.3). 성공 후 호출부에서 signOut. */
export async function deleteMe(): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined, 300);
  await apiFetch("/users/me", { method: "DELETE" });
}

/** expo-notifications 푸시 토큰 등록/해제 (Phase 6). */
export async function setPushToken(token: string | null): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined, 50);
  await apiFetch("/users/me/push-token", { method: "PATCH", body: { token } });
}

export async function searchUsers(q: string): Promise<User[]> {
  const term = q.trim().toLowerCase();
  if (USE_MOCK) {
    if (!term) return mockDelay([]);
    return mockDelay(
      mock.allUsers.filter((u) => u.nickname.toLowerCase().includes(term)),
      250
    );
  }
  return apiFetch("/users/search", { query: { q } });
}
