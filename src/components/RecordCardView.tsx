import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { RecordCard } from "../types/models";
import { formatRelative } from "../lib/time";
import { useNav } from "../lib/nav";
import { CommentIcon, StarIcon, LockIcon } from "./icons";
import LikeButton from "./LikeButton";

function Avatar({ uri }: { uri: string | null }) {
  return uri ? (
    <Image source={{ uri }} className="w-8 h-8 rounded-full bg-coral-soft" />
  ) : (
    <View className="w-8 h-8 rounded-full bg-[#FFB199]" />
  );
}

export default function RecordCardView({
  record,
  onPress,
}: {
  record: RecordCard;
  onPress?: (id: string) => void;
}) {
  const nav = useNav();
  // 위시(가고 싶은 곳) — 점선 카드
  if (record.type === "WISH") {
    return (
      <Pressable
        onPress={() => onPress?.(record.id)}
        className="bg-[#FFFBF8] rounded-2xl p-3.5"
        style={{ borderWidth: 1.5, borderColor: "#E7B7A6", borderStyle: "dashed" }}
      >
        <View className="flex-row items-center gap-2 mb-2.5">
          <StarIcon />
          <Text className="text-xs font-bold text-coral-dark">가고 싶은 곳</Text>
        </View>
        <Text className="text-sm font-bold text-ink mb-1.5">{record.spot.name}</Text>
        <Text className="text-[13px] text-ink-muted leading-5">{record.caption}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => onPress?.(record.id)}
      className="bg-white border border-border rounded-2xl overflow-hidden"
    >
      <Pressable
        onPress={() => nav.openUserProfile(record.author.id)}
        className="flex-row items-center gap-2.5 p-3.5"
      >
        <Avatar uri={record.author.profileImageUrl} />
        <View className="flex-1">
          <Text className="text-[13px] font-bold text-ink">{record.author.nickname}</Text>
          <Text className="text-[11px] text-ink-muted">
            {record.spot.name} · {formatRelative(record.createdAt)}
          </Text>
        </View>
      </Pressable>

      {record.locked ? (
        <View className="w-full h-[150px] bg-[#D8C3BA] items-center justify-center">
          <View className="w-11 h-11 rounded-full bg-black/35 items-center justify-center">
            <LockIcon />
          </View>
        </View>
      ) : record.photos.length > 0 ? (
        <Image
          source={{ uri: record.photos[0].thumbnailUrl }}
          className="w-full h-[180px] bg-coral-soft"
          resizeMode="cover"
        />
      ) : null}

      <View className="p-3.5">
        {record.locked ? (
          <Text className="text-xs font-semibold text-[#B4694F]">
            {record.spot.name} 근처에서 잠금 해제됩니다
          </Text>
        ) : (
          <>
            <Text className="text-[13px] text-ink leading-5 mb-2.5">{record.caption}</Text>
            <View className="flex-row gap-3.5">
              <LikeButton
                recordId={record.id}
                liked={record.likedByMe}
                count={record.likeCount}
              />
              <View className="flex-row items-center gap-1">
                <CommentIcon />
                <Text className="text-xs text-ink-muted">{record.commentCount}</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </Pressable>
  );
}
