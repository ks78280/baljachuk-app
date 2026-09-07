import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Alert, Platform } from "react-native";
import Img from "../components/Img";
import { useUserProfile, useWishlist, useOpenConversation } from "../hooks/queries";
import { useNav } from "../lib/nav";
import { useAuth } from "../lib/auth";
import { BackIcon, CommentIcon, StarIcon } from "../components/icons";
import FollowButton from "../components/FollowButton";
import RecordCardView from "../components/RecordCardView";
import { ErrorView } from "../components/states";
import { ProfileSkeleton, RecordCardSkeleton } from "../components/skeletons";
import { ApiRequestError } from "../types/api";

type ProfileTab = "map" | "timeline" | "wishlist";

function Stat({ value, label, onPress }: { value: number; label: string; onPress?: () => void }) {
  return (
    <Pressable className="items-center" onPress={onPress} disabled={!onPress}>
      <Text className="text-base font-extrabold text-ink">{value}</Text>
      <Text className="text-[11px] text-ink-muted">{label}</Text>
    </Pressable>
  );
}

/** 다른 유저의 프로필 (내 프로필은 (tabs)/profile 이 따로 담당). */
export default function UserProfileScreen({
  userId,
  onBack,
}: {
  userId: string;
  onBack: () => void;
}) {
  const { user: sessionUser } = useAuth();
  const isMe = !!sessionUser && sessionUser.id === userId;
  const { data, isLoading, isError, error, refetch } = useUserProfile(isMe ? "" : userId);
  const nav = useNav();
  const [tab, setTab] = useState<ProfileTab>("timeline");
  const wishlist = useWishlist(tab === "wishlist" ? userId : "");
  const openConvo = useOpenConversation();

  // 자기 자신 프로필로 들어오면 편집·설정이 있는 본인 탭으로 보낸다.
  // (getUserProfile 응답을 기다리지 않고 세션 유저 id로 바로 판단 — API 응답 전에도 리다이렉트)
  useEffect(() => {
    if (isMe) nav.openProfile();
  }, [isMe]); // eslint-disable-line react-hooks/exhaustive-deps

  function message() {
    if (openConvo.isPending) return;
    openConvo.mutate(userId, {
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

  if (isMe || isLoading) {
    return (
      <View className="flex-1 bg-bg">
        <View className="flex-row items-center gap-3 px-5 pt-2">
          <Pressable onPress={onBack} hitSlop={10}>
            <BackIcon />
          </Pressable>
        </View>
        <ProfileSkeleton />
      </View>
    );
  }
  if (isError || !data) return <ErrorView error={error} onRetry={refetch} />;

  const { user, stats } = data;

  const tabs: { key: ProfileTab; label: string; star?: boolean }[] = [
    { key: "map", label: "TriPin 지도" },
    { key: "timeline", label: "타임라인" },
    { key: "wishlist", label: "위시리스트", star: true },
  ];

  const wishlistBlocked =
    wishlist.error instanceof ApiRequestError && wishlist.error.code === "NOT_FOLLOWING";

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center gap-3 px-5 pt-2">
        <Pressable onPress={onBack} hitSlop={10}>
          <BackIcon />
        </Pressable>
        <Text className="text-lg font-black text-ink flex-1" numberOfLines={1}>
          {user.nickname}
        </Text>
        <Pressable onPress={message} hitSlop={8}>
          <CommentIcon color="#2B1710" size={21} />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="px-5 pt-3.5 pb-4 items-center">
          {user.profileImageUrl ? (
            <Img
              source={{ uri: user.profileImageUrl }}
              className="w-[76px] h-[76px] rounded-full bg-coral-soft mb-3"
            />
          ) : (
            <View className="w-[76px] h-[76px] rounded-full bg-[#FF8A5C] mb-3" />
          )}
          <Text className="text-[17px] font-extrabold text-ink mb-1">{user.nickname}</Text>
          {user.bio && (
            <Text className="text-[13px] text-ink-muted mb-4 text-center">{user.bio}</Text>
          )}

          <View className="flex-row justify-center gap-7 mb-4">
            <Stat value={stats.visitedSpotCount} label="방문 지역" />
            <Stat value={stats.followerCount} label="팔로워" onPress={() => nav.openFollowers(userId)} />
            <Stat value={stats.followingCount} label="팔로잉" onPress={() => nav.openFollowing(userId)} />
          </View>

          <FollowButton userId={userId} initialFollowing={data.followedByMe} size="md" />
        </View>

        <View className="flex-row border-b border-border px-5">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                className="flex-1 flex-row items-center justify-center gap-1 pb-3"
                style={active ? { borderBottomWidth: 2, borderBottomColor: "#FF6B45" } : undefined}
              >
                <Text
                  className={`text-[13px] ${
                    active ? "font-bold text-coral" : "font-semibold text-ink-muted"
                  }`}
                >
                  {t.label}
                </Text>
                {t.star && <StarIcon filled="#E7B7A6" stroke="transparent" size={11} />}
              </Pressable>
            );
          })}
        </View>

        {tab === "wishlist" ? (
          <View className="pt-3">
            {wishlistBlocked ? (
              <Text className="text-[13px] text-ink-muted text-center py-12">
                팔로우한 사용자만 위시리스트를 볼 수 있어요
              </Text>
            ) : wishlist.isLoading ? (
              <>
                <RecordCardSkeleton />
                <RecordCardSkeleton />
              </>
            ) : (wishlist.data?.length ?? 0) === 0 ? (
              <Text className="text-[13px] text-ink-muted text-center py-12">
                가고 싶은 곳을 아직 담지 않았어요
              </Text>
            ) : (
              (wishlist.data ?? []).map((r) => (
                <RecordCardView key={r.id} record={r} onPress={nav.openRecord} />
              ))
            )}
          </View>
        ) : (
          // 지도/타임라인 전체 화면은 범위 밖 — 본인 프로필과 동일한 안내 자리표시자
          <View className="px-5 pt-4" style={{ height: 200 }}>
            <View className="flex-1 rounded-2xl bg-[#F6E3D8] items-center justify-center gap-1">
              <Text className="text-xs text-ink-muted">
                {tab === "map" ? "TriPin 지도" : `${user.nickname}님의 타임라인`}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
