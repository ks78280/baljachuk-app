import React, { useState } from "react";
import { View, Text, ScrollView, Image, Pressable, Alert, Platform } from "react-native";
import { useMe } from "../hooks/queries";
import { useAuth } from "../lib/auth";
import { useNav } from "../lib/nav";
import { CommentIcon, GearIcon, StarIcon } from "../components/icons";
import { ErrorView } from "../components/states";
import { ProfileSkeleton } from "../components/skeletons";

function confirmSignOut(onConfirm: () => void) {
  if (Platform.OS === "web") {
    // web Alert 은 버튼이 없어 즉시 실행
    onConfirm();
    return;
  }
  Alert.alert("로그아웃", "정말 로그아웃할까요?", [
    { text: "취소", style: "cancel" },
    { text: "로그아웃", style: "destructive", onPress: onConfirm },
  ]);
}

type ProfileTab = "map" | "timeline" | "wishlist";

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <View className="items-center">
      <Text className="text-base font-extrabold text-ink">{value}</Text>
      <Text className="text-[11px] text-ink-muted">{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { data, isLoading, isError, refetch } = useMe();
  const { signOut } = useAuth();
  const nav = useNav();
  const [tab, setTab] = useState<ProfileTab>("map");

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
  if (isError || !data) return <ErrorView onRetry={refetch} />;

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
          <CommentIcon color="#2B1710" size={21} />
          <Pressable onPress={nav.openSettings} hitSlop={8}>
            <GearIcon />
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
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
            <Stat value={stats.followerCount} label="팔로워" />
            <Stat value={stats.followingCount} label="팔로잉" />
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

          <Pressable
            onPress={() => confirmSignOut(signOut)}
            className="w-full items-center py-2.5 mt-2"
          >
            <Text className="text-[13px] font-bold text-ink-muted">로그아웃</Text>
          </Pressable>
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

        {/* 지도/목록 영역 — 실제 지도 SDK 연동은 별도 작업. 지금은 자리표시 */}
        <View className="px-5 pt-4" style={{ height: 260 }}>
          <View className="flex-1 rounded-2xl bg-[#F6E3D8] relative overflow-hidden items-center justify-center">
            <Text className="text-xs text-ink-muted">
              {tab === "map" && "발자국 지도"}
              {tab === "timeline" && "내 타임라인"}
              {tab === "wishlist" && "위시리스트"}
            </Text>
            <View className="absolute right-3.5 bottom-3.5 bg-white px-3.5 py-2 rounded-full shadow">
              <Text className="text-xs font-bold text-coral">전체 지도 보기 →</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
