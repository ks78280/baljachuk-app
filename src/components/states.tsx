import React from "react";
import { View, Text, Pressable } from "react-native";
import { ApiRequestError } from "../types/api";

export function ErrorView({
  message,
  error,
  onRetry,
}: {
  message?: string;
  error?: unknown;
  onRetry?: () => void;
}) {
  // 네트워크/서버 에러는 종류별로 다른 안내
  let text = message ?? "불러오지 못했어요";
  if (!message && error instanceof ApiRequestError) {
    if (error.code === "NETWORK_ERROR")
      text = "서버에 연결할 수 없어요. 네트워크를 확인해주세요.";
    else if (error.code === "SESSION_EXPIRED") text = "다시 로그인해주세요.";
    else if (error.message) text = error.message;
  }
  return (
    <View className="flex-1 items-center justify-center gap-3 py-16 px-8">
      <Text className="text-sm text-ink-muted text-center">{text}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} className="rounded-full border border-coral px-4 py-1.5">
          <Text className="text-xs font-bold text-coral">다시 시도</Text>
        </Pressable>
      )}
    </View>
  );
}

export function EmptyView({ message }: { message: string }) {
  return (
    <View className="items-center justify-center py-16">
      <Text className="text-sm text-ink-muted">{message}</Text>
    </View>
  );
}
