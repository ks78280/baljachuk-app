import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Image, Alert, Platform } from "react-native";
import { BackIcon, SearchIcon, SmallPinIcon, CommentIcon } from "../components/icons";
import { EmptyView } from "../components/states";
import { SearchRowsSkeleton } from "../components/skeletons";
import FollowButton from "../components/FollowButton";
import { useDebounced } from "../lib/useDebounced";
import { useUserSearch, useSpotSearch, useOpenConversation } from "../hooks/queries";
import { useNav } from "../lib/nav";
import { ApiRequestError } from "../types/api";
import { UserSearchResult, Spot } from "../types/models";

type Tab = "users" | "spots";

function UserRow({
  user,
  onMessage,
}: {
  user: UserSearchResult;
  onMessage: (u: UserSearchResult) => void;
}) {
  return (
    <View className="flex-row items-center gap-2.5 px-5 py-2.5">
      {user.profileImageUrl ? (
        <Image source={{ uri: user.profileImageUrl }} className="w-11 h-11 rounded-full bg-coral-soft" />
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
      <Pressable onPress={() => onMessage(user)} hitSlop={8} className="p-1.5">
        <CommentIcon color="#8C6F63" size={18} />
      </Pressable>
      <FollowButton userId={user.id} initialFollowing={user.followedByMe} />
    </View>
  );
}

function SpotRow({ spot, onPress }: { spot: Spot; onPress: (id: string) => void }) {
  return (
    <Pressable
      onPress={() => onPress(spot.id)}
      className="flex-row items-center gap-3 px-5 py-3"
    >
      <View className="w-10 h-10 rounded-full bg-coral-soft items-center justify-center">
        <SmallPinIcon size={16} />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-bold text-ink">{spot.name}</Text>
        {spot.address ? (
          <Text className="text-xs text-ink-muted">{spot.address}</Text>
        ) : null}
      </View>
      <Text className="text-[11px] text-ink-muted">기록 {spot.recordCount}</Text>
    </Pressable>
  );
}

export default function SearchScreen({
  onBack,
  onOpenSpot,
}: {
  onBack: () => void;
  onOpenSpot: (spotId: string) => void;
}) {
  const [tab, setTab] = useState<Tab>("users");
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query.trim(), 300);
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

  const userQ = useUserSearch(tab === "users" ? debounced : "");
  const spotQ = useSpotSearch(tab === "spots" ? debounced : "");
  const active = tab === "users" ? userQ : spotQ;

  const hasQuery = debounced.length > 0;

  return (
    <View className="flex-1 bg-bg">
      {/* 검색 입력 */}
      <View className="flex-row items-center gap-2 px-4 pt-2 pb-3">
        <Pressable onPress={onBack} hitSlop={10}>
          <BackIcon />
        </Pressable>
        <View className="flex-1 flex-row items-center gap-2 bg-white border border-border rounded-full px-3.5 py-2">
          <SearchIcon color="#B99287" size={16} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            autoFocus
            placeholder="닉네임, 지역으로 검색"
            placeholderTextColor="#8C6F63"
            className="flex-1 text-sm text-ink"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Text className="text-ink-muted text-base">×</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* 탭 */}
      <View className="flex-row gap-5 px-5 border-b border-border">
        {(
          [
            { key: "users", label: "사용자" },
            { key: "spots", label: "지역" },
          ] as const
        ).map((t) => {
          const on = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              className="pb-2.5"
              style={on ? { borderBottomWidth: 2, borderBottomColor: "#FF6B45" } : undefined}
            >
              <Text
                className={`text-sm ${on ? "font-bold text-coral" : "font-medium text-ink-muted"}`}
              >
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!hasQuery ? (
        <EmptyView message="닉네임이나 지역을 검색해보세요" />
      ) : active.isLoading ? (
        <SearchRowsSkeleton />
      ) : (active.data?.length ?? 0) === 0 ? (
        <EmptyView message="검색 결과가 없어요" />
      ) : (
        <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
          {tab === "users"
            ? (userQ.data ?? []).map((u) => (
                <UserRow key={u.id} user={u} onMessage={messageUser} />
              ))
            : (spotQ.data ?? []).map((s) => (
                <SpotRow key={s.id} spot={s} onPress={onOpenSpot} />
              ))}
        </ScrollView>
      )}
    </View>
  );
}
