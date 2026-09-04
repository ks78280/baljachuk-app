import React from "react";
import { Pressable, Text } from "react-native";
import { useFollowState, useToggleFollow } from "../hooks/queries";

/**
 * 팔로우 토글 버튼. 상태는 React Query 캐시(qk.follow)에 보관되어
 * 목록 새로고침·화면 이동과 무관하게 유지된다.
 */
export default function FollowButton({
  userId,
  initialFollowing = false,
  size = "sm",
}: {
  userId: string;
  initialFollowing?: boolean;
  size?: "sm" | "md";
}) {
  const following = useFollowState(userId, initialFollowing);
  const toggle = useToggleFollow(userId);

  const pad = size === "md" ? "py-2 px-5" : "py-1.5 px-4";
  return (
    <Pressable
      onPress={() => toggle.mutate(!following)}
      disabled={toggle.isPending}
      className={`${pad} rounded-full border ${
        following ? "border-border bg-white" : "border-coral bg-coral"
      } ${toggle.isPending ? "opacity-60" : ""}`}
    >
      <Text
        className={`text-xs font-bold ${following ? "text-ink-muted" : "text-white"}`}
      >
        {following ? "팔로잉" : "팔로우"}
      </Text>
    </Pressable>
  );
}
