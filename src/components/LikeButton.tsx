import React from "react";
import { Pressable, Text } from "react-native";
import { HeartIcon } from "./icons";
import { useToggleLike } from "../hooks/queries";

/**
 * 하트 + 카운트. 탭하면 낙관적 토글 (`useToggleLike`가 상세·타임라인·스팟 캐시를 함께 갱신).
 */
export default function LikeButton({
  recordId,
  liked,
  count,
  size = 16,
}: {
  recordId: string;
  liked: boolean;
  count: number;
  size?: number;
}) {
  const toggle = useToggleLike(recordId);
  return (
    <Pressable
      onPress={() => toggle.mutate(!liked)}
      hitSlop={8}
      className="flex-row items-center gap-1"
    >
      <HeartIcon size={size} color={liked ? "#FF6B45" : "#B4694F"} />
      <Text className="text-xs text-ink-muted">{count}</Text>
    </Pressable>
  );
}
