import { apiFetch, USE_MOCK, mockDelay } from "./client";
import { CursorPage } from "../types/api";
import { AdminUserDetail, AdminUserRow, Role, UserStatus } from "../types/models";

/** 관리자 전용 — 서버가 @Roles("ADMIN") 로 막으므로 목 모드에서는 사실상 안 쓰인다. */

export async function getAdminUsers(
  q: string,
  cursor?: string
): Promise<CursorPage<AdminUserRow>> {
  if (USE_MOCK) return mockDelay({ items: [], nextCursor: null });
  return apiFetch("/admin/users", { query: { q: q || undefined, cursor } });
}

export async function getAdminUser(id: string): Promise<AdminUserDetail> {
  if (USE_MOCK) return mockDelay({} as AdminUserDetail);
  return apiFetch(`/admin/users/${id}`);
}

export async function updateAdminUser(
  id: string,
  patch: { role?: Role; status?: UserStatus }
): Promise<AdminUserRow> {
  if (USE_MOCK) return mockDelay({} as AdminUserRow);
  return apiFetch(`/admin/users/${id}`, { method: "PATCH", body: patch });
}

export async function deleteAdminUser(id: string): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined);
  await apiFetch(`/admin/users/${id}`, { method: "DELETE" });
}

export async function forceLogoutUser(id: string): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined);
  await apiFetch(`/admin/users/${id}/logout`, { method: "POST" });
}
