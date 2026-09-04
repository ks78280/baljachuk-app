import { apiFetch, USE_MOCK, mockDelay } from "./client";
import { Comment } from "../types/models";
import * as mock from "../mocks/db";

export async function likeRecord(recordId: string): Promise<void> {
  if (USE_MOCK) {
    mock.applyLike(recordId, true);
    return mockDelay(undefined, 150);
  }
  await apiFetch(`/records/${recordId}/likes`, { method: "POST" });
}

export async function unlikeRecord(recordId: string): Promise<void> {
  if (USE_MOCK) {
    mock.applyLike(recordId, false);
    return mockDelay(undefined, 150);
  }
  await apiFetch(`/records/${recordId}/likes`, { method: "DELETE" });
}

export async function getComments(recordId: string): Promise<Comment[]> {
  if (USE_MOCK) return mockDelay([...(mock.commentsByRecord[recordId] ?? [])]);
  return apiFetch(`/records/${recordId}/comments`);
}

export async function addComment(recordId: string, content: string): Promise<Comment> {
  if (USE_MOCK) {
    const created: Comment = {
      id: `c-${Date.now()}`,
      author: mock.me,
      content,
      createdAt: new Date().toISOString(),
    };
    mock.applyComment(recordId, created);
    return mockDelay(created, 200);
  }
  return apiFetch(`/records/${recordId}/comments`, { method: "POST", body: { content } });
}

export async function follow(userId: string): Promise<void> {
  if (USE_MOCK) {
    mock.applyFollow(userId, true);
    return mockDelay(undefined, 150);
  }
  await apiFetch(`/follows/${userId}`, { method: "POST" });
}

export async function unfollow(userId: string): Promise<void> {
  if (USE_MOCK) {
    mock.applyFollow(userId, false);
    return mockDelay(undefined, 150);
  }
  await apiFetch(`/follows/${userId}`, { method: "DELETE" });
}
