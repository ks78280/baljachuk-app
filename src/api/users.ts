import { apiFetch, USE_MOCK, mockDelay } from "./client";
import { User, UserStats } from "../types/models";
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
