import React, { useState } from "react";
import { View, Text, ScrollView, Image, Pressable, RefreshControl } from "react-native";
import { useMe, useWishlist, useUnreadDmCount } from "../hooks/queries";
import { useNav } from "../lib/nav";
import { CommentIcon, GearIcon, StarIcon } from "../components/icons";
import RecordCardView from "../components/RecordCardView";
import { ErrorView } from "../components/states";
import { ProfileSkeleton, RecordCardSkeleton } from "../components/skeletons";

type ProfileTab = "map" | "timeline" | "wishlist";

function Stat({ value, label, onPress }: { value: number; label: string; onPress?: () => void }) {
  return (
    <Pressable className="items-center" onPress={onPress} disabled={!onPress}>
      <Text className="text-base font-extrabold text-ink">{value}</Text>
      <Text className="text-[11px] text-ink-muted">{label}</Text>
    </Pressable>
  );
}

export default function ProfileScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useMe();
  const nav = useNav();
  const [tab, setTab] = useState<ProfileTab>("map");
  const unreadDm = useUnreadDmCount();
  const wishlist = useWishlist(tab === "wishlist" ? "me" : "");

  const onRefresh = () => {
    refetch();
    if (tab === "wishlist") wishlist.refetch();
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg">
        <View className="flex-row items-center justify-between px-5 pt-2">
          <Text className="text-lg font-black text-ink">프로필</Text>
          <View className="flex-row gap-3.5">
            <CommentIcon color="#2B1710" size={21} />
            <GearIcon />
          </View>
        </View>
        <ProfileSkeleton />
      </View>
    );
  }
  if (isError || !data) return <ErrorView error={error} onRetry={refetch} />;

  const { user, stats } = data;

  const tabs: { key: ProfileTab; label: string; star?: boolean }[] = [
    { key: "map", label: "발자국 지도" },
    { key: "timeline", label: "타임라인" },
    { key: "wishlist", label: "위시리스트", star: true },
  ];

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-5 pt-2">
        <Text className="text-lg font-black text-ink">프로필</Text>
        <View className="flex-row items-center gap-3.5">
          <Pressable onPress={nav.openMessages} hitSlop={8}>
            <CommentIcon color="#2B1710" size={21} />
            {unreadDm > 0 && (
              <View className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 rounded-full bg-coral items-center justify-center">
                <Text className="text-[9px] font-bold text-white">{unreadDm}</Text>
              </View>
            )}
          </Pressable>
          <Pressable onPress={nav.openSettings} hitSlop={8}>
            <GearIcon />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} tintColor="#FF6B45" colors={["#FF6B45"]} />
        }
      >
        <View className="px-5 pt-3.5 pb-4 items-center">
          {user.profileImageUrl ? (
            <Image
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
            <Stat value={stats.followerCount} label="팔로워" onPress={() => nav.openFollowers(user.id)} />
            <Stat value={stats.followingCount} label="팔로잉" onPress={() => nav.openFollowing(user.id)} />
          </View>

          <View className="w-full flex-row gap-2">
            <Pressable
              onPress={nav.openProfileEdit}
              className="flex-1 items-center py-2.5 border border-border rounded-xl"
            >
              <Text className="text-[13px] font-bold text-ink">프로필 편집</Text>
            </Pressable>
            <Pressable
              onPress={nav.openFeedManage}
              className="flex-1 items-center py-2.5 border border-border rounded-xl"
            >
              <Text className="text-[13px] font-bold text-ink">피드 관리</Text>
            </Pressable>
          </View>
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
            {wishlist.isLoading ? (
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
          // 지도/타임라인은 하단 탭에서 전체 화면으로. 여기선 미니 안내.
          <View className="px-5 pt-4" style={{ height: 200 }}>
            <View className="flex-1 rounded-2xl bg-[#F6E3D8] items-center justify-center gap-1">
              <Text className="text-xs text-ink-muted">
                {tab === "map" ? "발자국 지도" : "내 타임라인"}
              </Text>
              <Text className="text-[11px] text-ink-muted">
                하단 탭에서 전체 화면으로 볼 수 있어요
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
