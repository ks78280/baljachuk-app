import { apiFetch, USE_MOCK, mockDelay } from "./client";
import { AppNotification } from "../types/models";
import * as mock from "../mocks/db";

export async function getNotifications(): Promise<AppNotification[]> {
  if (USE_MOCK) {
    const sorted = [...mock.notifications].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );
    return mockDelay(sorted);
  }
  return apiFetch("/notifications");
}

export async function markNotificationRead(id: string): Promise<void> {
  if (USE_MOCK) {
    mock.markNotificationRead(id);
    return mockDelay(undefined, 100);
  }
  await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead(): Promise<void> {
  if (USE_MOCK) {
    mock.markAllNotificationsRead();
    return mockDelay(undefined, 100);
  }
  await apiFetch(`/notifications/read-all`, { method: "PATCH" });
}
