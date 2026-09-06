import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { BackIcon, SearchIcon } from "../components/icons";
import { EmptyView, ErrorView } from "../components/states";
import { useDebounced } from "../lib/useDebounced";
import { useAdminUsers } from "../hooks/queries";
import { AdminUserRow } from "../types/models";

function RoleBadge({ role }: { role: AdminUserRow["role"] }) {
  const admin = role === "ADMIN";
  return (
    <View className={`px-1.5 py-0.5 rounded ${admin ? "bg-coral" : "bg-coral-soft"}`}>
      <Text className={`text-[10px] font-bold ${admin ? "text-white" : "text-coral-dark"}`}>
        {admin ? "ADMIN" : "USER"}
      </Text>
    </View>
  );
}

function StatusBadge({ status }: { status: AdminUserRow["status"] }) {
  const suspended = status === "SUSPENDED";
  return (
    <View className={`px-1.5 py-0.5 rounded ${suspended ? "bg-[#F2C1B4]" : "bg-[#E8F3EE]"}`}>
      <Text className={`text-[10px] font-bold ${suspended ? "text-[#B4352A]" : "text-[#3FAE8A]"}`}>
        {suspended ? "정지" : "활성"}
      </Text>
    </View>
  );
}

function Row({ u, onPress }: { u: AdminUserRow; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-2 px-5 py-3 border-b border-border"
    >
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-[13px] font-bold text-ink" numberOfLines={1}>
            {u.nickname}
          </Text>
          <RoleBadge role={u.role} />
          <StatusBadge status={u.status} />
        </View>
        <Text className="text-[11px] text-ink-muted" numberOfLines={1}>
          {u.email}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-[11px] text-ink-muted">
          기록 {u.recordCount} · 팔로워 {u.followerCount}
        </Text>
        <Text className="text-[10px] text-ink-muted">{u.createdAt.slice(0, 10)}</Text>
      </View>
    </Pressable>
  );
}

export default function AdminUsersScreen({
  onBack,
  onOpenUser,
}: {
  onBack: () => void;
  onOpenUser: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const q = useDebounced(query.trim(), 300);
  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useAdminUsers(q);

  const rows = data?.pages.flatMap((p) => p.items) ?? [];

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center gap-3 px-5 pt-2 pb-3">
        <Pressable onPress={onBack} hitSlop={10}>
          <BackIcon />
        </Pressable>
        <Text className="text-lg font-black text-ink">유저 관리</Text>
      </View>

      <View className="px-5 pb-3">
        <View className="flex-row items-center gap-2 bg-white border border-border rounded-full px-3.5 py-2">
          <SearchIcon color="#B99287" size={16} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="닉네임 또는 이메일"
            placeholderTextColor="#8C6F63"
            className="flex-1 text-sm text-ink"
            autoCapitalize="none"
          />
        </View>
      </View>

      {isLoading ? (
        <View className="pt-16 items-center">
          <ActivityIndicator color="#FF6B45" />
        </View>
      ) : isError ? (
        <ErrorView error={error} onRetry={refetch} />
      ) : rows.length === 0 ? (
        <EmptyView message="유저가 없어요" />
      ) : (
        <ScrollView className="flex-1">
          {rows.map((u) => (
            <Row key={u.id} u={u} onPress={() => onOpenUser(u.id)} />
          ))}
          {hasNextPage && (
            <Pressable
              onPress={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="items-center py-4"
            >
              <Text className="text-[13px] font-bold text-coral">
                {isFetchingNextPage ? "불러오는 중..." : "더 보기"}
              </Text>
            </Pressable>
          )}
        </ScrollView>
      )}
    </View>
  );
}
