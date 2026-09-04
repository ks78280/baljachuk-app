import React from "react";
import { View, Text, ActivityIndicator, Pressable } from "react-native";

export function LoadingView({ label = "불러오는 중..." }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <ActivityIndicator color="#FF6B45" />
      <Text className="mt-2 text-xs text-ink-muted">{label}</Text>
    </View>
  );
}

export function ErrorView({
  message = "불러오지 못했어요",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center gap-3 py-16 px-8">
      <Text className="text-sm text-ink-muted text-center">{message}</Text>
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
