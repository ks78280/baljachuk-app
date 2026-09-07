import React from "react";
import { View, Text, Pressable } from "react-native";
import Img from "../components/Img";
import { UserSearchResult } from "../types/models";
import { CommentIcon } from "./icons";
import FollowButton from "./FollowButton";

/** 검색 결과·팔로워·팔로잉 목록 공용 유저 행. */
export default function UserRow({
  user,
  onMessage,
  onOpenProfile,
}: {
  user: UserSearchResult;
  onMessage: (u: UserSearchResult) => void;
  onOpenProfile: (id: string) => void;
}) {
  return (
    <View className="flex-row items-center gap-2.5 px-5 py-2.5">
      <Pressable
        onPress={() => onOpenProfile(user.id)}
        className="flex-1 flex-row items-center gap-2.5"
      >
        {user.profileImageUrl ? (
          <Img source={{ uri: user.profileImageUrl }} className="w-11 h-11 rounded-full bg-coral-soft" />
        ) : (
          <View className="w-11 h-11 rounded-full bg-[#FFCBB4]" />
        )}
        <View className="flex-1">
          <Text className="text-sm font-bold text-ink">{user.nickname}</Text>
          {user.bio ? (
            <Text className="text-xs text-ink-muted" numberOfLines={1}>
              {user.bio}
            </Text>
          ) : null}
        </View>
      </Pressable>
      <Pressable onPress={() => onMessage(user)} hitSlop={8} className="p-1.5">
        <CommentIcon color="#8C6F63" size={18} />
      </Pressable>
      <FollowButton userId={user.id} initialFollowing={user.followedByMe} />
    </View>
  );
}
