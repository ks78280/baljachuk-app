import React from "react";
import { View, Text, Pressable, ScrollView, Alert, Platform } from "react-native";
import { useFollowers, useFollowing, useOpenConversation } from "../hooks/queries";
import { useNav } from "../lib/nav";
import { BackIcon } from "../components/icons";
import UserRow from "../components/UserRow";
import { EmptyView, ErrorView } from "../components/states";
import { SearchRowsSkeleton } from "../components/skeletons";
import { ApiRequestError } from "../types/api";
import { UserSearchResult } from "../types/models";

export type FollowListKind = "followers" | "following";

export default function FollowListScreen({
  userId,
  kind,
  onBack,
}: {
  userId: string;
  kind: FollowListKind;
  onBack: () => void;
}) {
  const followers = useFollowers(kind === "followers" ? userId : "");
  const following = useFollowing(kind === "following" ? userId : "");
  const { data, isLoading, isError, error, refetch } =
    kind === "followers" ? followers : following;
  const nav = useNav();
  const openConvo = useOpenConversation();

  function messageUser(u: UserSearchResult) {
    if (openConvo.isPending) return;
    openConvo.mutate(u.id, {
      onSuccess: (conv) => nav.openChat(conv.id, conv.other.nickname),
      onError: (e) => {
        const msg =
          e instanceof ApiRequestError && e.code === "NOT_MUTUAL"
            ? "서로 팔로우한 사이에서만 대화할 수 있어요"
            : "대화방을 열지 못했어요";
        if (Platform.OS === "web") Alert.alert(msg);
        else Alert.alert("메시지", msg);
      },
    });
  }

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center gap-3 px-5 pt-2 pb-3">
        <Pressable onPress={onBack} hitSlop={10}>
          <BackIcon />
        </Pressable>
        <Text className="text-lg font-black text-ink">
          {kind === "followers" ? "팔로워" : "팔로잉"}
        </Text>
      </View>

      {isLoading ? (
        <SearchRowsSkeleton />
      ) : isError ? (
        <ErrorView error={error} onRetry={refetch} />
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyView
          message={kind === "followers" ? "아직 팔로워가 없어요" : "아직 팔로우한 사람이 없어요"}
        />
      ) : (
        <ScrollView className="flex-1">
          {(data ?? []).map((u) => (
            <UserRow key={u.id} user={u} onMessage={messageUser} onOpenProfile={nav.openUserProfile} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
