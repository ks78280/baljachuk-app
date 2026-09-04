import { apiFetch, USE_MOCK, mockDelay } from "./client";
import { CursorPage } from "../types/api";
import { Conversation, Message } from "../types/models";
import * as mock from "../mocks/db";

export async function getConversations(): Promise<Conversation[]> {
  if (USE_MOCK) return mockDelay(mock.listConversations());
  return apiFetch("/conversations");
}

/** 상대와의 대화방 열기(맞팔 검증) 또는 기존 방 반환 */
export async function openConversation(userId: string): Promise<Conversation> {
  if (USE_MOCK) return mockDelay(mock.openMockConversation(userId));
  return apiFetch("/conversations", { method: "POST", body: { userId } });
}

export async function getMessages(
  conversationId: string,
  cursor?: string
): Promise<CursorPage<Message>> {
  if (USE_MOCK) {
    return mockDelay({ items: mock.listMessages(conversationId), nextCursor: null });
  }
  return apiFetch(`/conversations/${conversationId}/messages`, {
    query: { cursor },
  });
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<Message> {
  if (USE_MOCK) return mockDelay(mock.appendMockMessage(conversationId, content), 150);
  return apiFetch(`/conversations/${conversationId}/messages`, {
    method: "POST",
    body: { content },
  });
}

export async function markConversationRead(conversationId: string): Promise<void> {
  if (USE_MOCK) {
    mock.markMockConversationRead(conversationId);
    return mockDelay(undefined, 100);
  }
  await apiFetch(`/conversations/${conversationId}/read`, { method: "PATCH" });
}
