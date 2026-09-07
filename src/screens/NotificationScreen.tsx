import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import Img from "../components/Img";
import { BackIcon } from "../components/icons";
import { ErrorView, EmptyView } from "../components/states";
import { SearchRowsSkeleton } from "../components/skeletons";
import { formatRelative } from "../lib/time";
import { AppNotification } from "../types/models";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../hooks/queries";

function notifSuffix(type: AppNotification["type"]): string {
  switch (type) {
    case "LIKE":
      return "님이 회원님의 기록을 좋아합니다";
    case "COMMENT":
      return "님이 회원님의 기록에 댓글을 남겼습니다";
    case "FOLLOW":
      return "님이 회원님을 팔로우하기 시작했습니다";
    case "NEW_RECORD":
      return "님이 새 기록을 남겼습니다";
    case "NEARBY_FRIEND_RECORD":
      return "님이 내가 기록한 스팟 근처에 새 기록을 남겼습니다";
  }
}

function Row({
  n,
  onPress,
}: {
  n: AppNotification;
  onPress: (n: AppNotification) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(n)}
      className="flex-row items-center gap-3 px-5 py-3"
      style={n.isRead ? undefined : { backgroundColor: "#FFF3EC" }}
    >
      {n.actor.profileImageUrl ? (
        <Img source={{ uri: n.actor.profileImageUrl }} className="w-10 h-10 rounded-full bg-coral-soft" />
      ) : (
        <View className="w-10 h-10 rounded-full bg-[#FFCBB4]" />
      )}
      <View className="flex-1">
        <Text className="text-[13px] text-ink leading-5">
          <Text className="font-bold">{n.actor.nickname}</Text>
          {notifSuffix(n.type)}
        </Text>
        <Text className="text-[11px] text-ink-muted mt-0.5">
          {formatRelative(n.createdAt)}
        </Text>
      </View>
      {!n.isRead && <View className="w-2 h-2 rounded-full bg-coral" />}
    </Pressable>
  );
}

export default function NotificationScreen({
  onBack,
  onOpenRecord,
}: {
  onBack: () => void;
  onOpenRecord: (recordId: string) => void;
}) {
  const { data, isLoading, isError, error, refetch } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const unread = (data ?? []).filter((n) => !n.isRead).length;

  function handlePress(n: AppNotification) {
    if (!n.isRead) markRead.mutate(n.id);
    if (n.targetId) onOpenRecord(n.targetId);
  }

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <View className="flex-row items-center gap-2">
          <Pressable onPress={onBack} hitSlop={10}>
            <BackIcon />
          </Pressable>
          <Text className="text-base font-bold text-ink">알림</Text>
        </View>
        {unread > 0 && (
          <Pressable onPress={() => markAll.mutate()} hitSlop={8}>
            <Text className="text-xs font-semibold text-coral">모두 읽음</Text>
          </Pressable>
        )}
      </View>

      {isLoading ? (
        <SearchRowsSkeleton count={6} />
      ) : isError ? (
        <ErrorView error={error} onRetry={refetch} />
      ) : !data || data.length === 0 ? (
        <EmptyView message="아직 알림이 없어요" />
      ) : (
        <ScrollView className="flex-1">
          {data.map((n) => (
            <Row key={n.id} n={n} onPress={handlePress} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
