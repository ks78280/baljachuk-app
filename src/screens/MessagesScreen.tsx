import React from "react";
import { View, Text, Pressable, ScrollView, Image } from "react-native";
import { BackIcon } from "../components/icons";
import { SearchRowsSkeleton } from "../components/skeletons";
import { EmptyView, ErrorView } from "../components/states";
import { useConversations } from "../hooks/queries";
import { formatRelative } from "../lib/time";
import { Conversation } from "../types/models";

function Row({
  convo,
  onPress,
}: {
  convo: Conversation;
  onPress: () => void;
}) {
  const preview = convo.lastMessage
    ? (convo.lastMessage.mine ? "나: " : "") + convo.lastMessage.content
    : "새 대화를 시작해보세요";
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-5 py-3.5 border-b border-border bg-white"
    >
      {convo.other.profileImageUrl ? (
        <Image
          source={{ uri: convo.other.profileImageUrl }}
          className="w-12 h-12 rounded-full bg-coral-soft"
        />
      ) : (
        <View className="w-12 h-12 rounded-full bg-[#FFCBB4]" />
      )}
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text className="text-[14px] font-bold text-ink">{convo.other.nickname}</Text>
          {convo.lastMessage && (
            <Text className="text-[11px] text-ink-muted">
              {formatRelative(convo.lastMessage.createdAt)}
            </Text>
          )}
        </View>
        <View className="flex-row items-center justify-between mt-0.5">
          <Text
            className={`text-[13px] flex-1 ${convo.unreadCount > 0 ? "font-semibold text-ink" : "text-ink-muted"}`}
            numberOfLines={1}
          >
            {preview}
          </Text>
          {convo.unreadCount > 0 && (
            <View className="ml-2 min-w-[18px] h-[18px] px-1 rounded-full bg-coral items-center justify-center">
              <Text className="text-[10px] font-bold text-white">{convo.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function MessagesScreen({
  onBack,
  onOpenChat,
}: {
  onBack: () => void;
  onOpenChat: (conversationId: string, otherName: string) => void;
}) {
  const { data, isLoading, isError, error, refetch } = useConversations();

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center gap-2 px-4 pt-2 pb-3">
        <Pressable onPress={onBack} hitSlop={10}>
          <BackIcon />
        </Pressable>
        <Text className="text-base font-bold text-ink">메시지</Text>
      </View>

      {isLoading ? (
        <SearchRowsSkeleton count={5} />
      ) : isError ? (
        <ErrorView error={error} onRetry={refetch} />
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyView message="아직 대화가 없어요. 맞팔로우한 친구와 대화를 시작해보세요" />
      ) : (
        <ScrollView className="flex-1">
          {(data ?? []).map((c) => (
            <Row
              key={c.id}
              convo={c}
              onPress={() => onOpenChat(c.id, c.other.nickname)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
