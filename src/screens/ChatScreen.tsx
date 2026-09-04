import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackIcon } from "../components/icons";
import { RecordDetailSkeleton } from "../components/skeletons";
import { ErrorView } from "../components/states";
import { useKeyboardHeight } from "../lib/useKeyboard";
import { formatRelative } from "../lib/time";
import {
  useMessages,
  useSendMessage,
  useMarkConversationRead,
} from "../hooks/queries";
import { Message } from "../types/models";

function Bubble({ msg }: { msg: Message }) {
  return (
    <View className={`px-4 my-1 ${msg.mine ? "items-end" : "items-start"}`}>
      <View
        className={`max-w-[78%] px-3.5 py-2 rounded-2xl ${
          msg.mine ? "bg-coral" : "bg-white border border-border"
        }`}
      >
        <Text className={`text-[14px] leading-5 ${msg.mine ? "text-white" : "text-ink"}`}>
          {msg.content}
        </Text>
      </View>
      <Text className="text-[10px] text-ink-muted mt-0.5 px-1">
        {formatRelative(msg.createdAt)}
        {msg.mine && msg.readAt ? " · 읽음" : ""}
      </Text>
    </View>
  );
}

export default function ChatScreen({
  conversationId,
  title,
  onBack,
}: {
  conversationId: string;
  title: string;
  onBack: () => void;
}) {
  const insets = useSafeAreaInsets();
  const kb = useKeyboardHeight();
  const scrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState("");

  const { data, isLoading, isError, error, refetch } = useMessages(conversationId);
  const send = useSendMessage(conversationId);
  const markRead = useMarkConversationRead(conversationId);

  const messages = data?.items ?? [];
  const lastIncomingId = [...messages].reverse().find((m) => !m.mine)?.id;

  // 대화 열 때 + 상대 새 메시지 도착 시 읽음 처리
  useEffect(() => {
    if (conversationId) markRead.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, lastIncomingId]);

  // 새 메시지 / 키보드 → 맨 아래로
  useEffect(() => {
    const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(t);
  }, [messages.length, kb]);

  function submit() {
    const text = draft.trim();
    if (!text || send.isPending) return;
    setDraft("");
    send.mutate(text);
  }

  return (
    <View className="flex-1 bg-bg" style={{ paddingBottom: kb }}>
      <View className="flex-row items-center gap-2 px-4 pt-2 pb-3 border-b border-border">
        <Pressable onPress={onBack} hitSlop={10}>
          <BackIcon />
        </Pressable>
        <Text className="text-base font-bold text-ink">{title}</Text>
      </View>

      {isLoading ? (
        <RecordDetailSkeleton />
      ) : isError ? (
        <ErrorView error={error} onRetry={refetch} />
      ) : (
        <>
          <ScrollView
            ref={scrollRef}
            className="flex-1"
            contentContainerStyle={{ paddingVertical: 10 }}
            keyboardShouldPersistTaps="handled"
          >
            {messages.length === 0 && (
              <Text className="text-[13px] text-ink-muted text-center py-10">
                첫 메시지를 보내보세요
              </Text>
            )}
            {messages.map((m) => (
              <Bubble key={m.id} msg={m} />
            ))}
          </ScrollView>

          <View
            className="flex-row items-center gap-2 border-t border-border bg-bg px-4 pt-2.5"
            style={{ paddingBottom: kb > 0 ? 8 : Math.max(insets.bottom, 12) }}
          >
            <TextInput
              value={draft}
              onChangeText={setDraft}
              placeholder="메시지 입력..."
              placeholderTextColor="#8C6F63"
              className="flex-1 bg-white border border-border rounded-full px-4 py-2 text-sm text-ink"
              maxLength={2000}
              onSubmitEditing={submit}
              returnKeyType="send"
            />
            <Pressable
              onPress={submit}
              disabled={!draft.trim() || send.isPending}
              className={`px-3.5 py-2 rounded-full bg-coral ${
                !draft.trim() || send.isPending ? "opacity-40" : ""
              }`}
            >
              <Text className="text-[13px] font-bold text-white">전송</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}
