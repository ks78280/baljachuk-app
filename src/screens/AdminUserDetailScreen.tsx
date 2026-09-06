import React from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, Alert } from "react-native";
import { BackIcon } from "../components/icons";
import { ErrorView } from "../components/states";
import { useAuth } from "../lib/auth";
import {
  useAdminUser,
  useUpdateAdminUser,
  useDeleteAdminUser,
  useForceLogoutUser,
} from "../hooks/queries";
import { ApiRequestError } from "../types/api";

function confirmWeb(message: string): boolean {
  // 관리자 페이지는 web 전용이라 window.confirm 사용 가능
  return typeof window !== "undefined" ? window.confirm(message) : false;
}

function toast(msg: string) {
  Alert.alert(msg);
}

function ActionButton({
  label,
  onPress,
  tone = "default",
  disabled,
}: {
  label: string;
  onPress: () => void;
  tone?: "default" | "danger" | "primary";
  disabled?: boolean;
}) {
  const cls =
    tone === "danger"
      ? "border-[#E0806E] bg-[#FDECE7]"
      : tone === "primary"
        ? "border-coral bg-coral"
        : "border-border bg-white";
  const textCls = tone === "primary" ? "text-white" : tone === "danger" ? "text-[#B4352A]" : "text-ink";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={`px-3.5 py-2.5 rounded-xl border ${cls} ${disabled ? "opacity-50" : ""}`}
    >
      <Text className={`text-[13px] font-bold ${textCls}`}>{label}</Text>
    </Pressable>
  );
}

export default function AdminUserDetailScreen({
  userId,
  onBack,
}: {
  userId: string;
  onBack: () => void;
}) {
  const { user: me } = useAuth();
  const { data, isLoading, isError, error, refetch } = useAdminUser(userId);
  const update = useUpdateAdminUser(userId);
  const del = useDeleteAdminUser();
  const forceLogout = useForceLogoutUser(userId);

  const isSelf = me?.id === userId;
  const busy = update.isPending || del.isPending || forceLogout.isPending;

  function onError(e: unknown) {
    toast(e instanceof ApiRequestError ? e.message : "처리하지 못했어요");
  }

  function toggleRole() {
    const next = data?.role === "ADMIN" ? "USER" : "ADMIN";
    update.mutate({ role: next }, { onError });
  }
  function toggleStatus() {
    const next = data?.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    if (next === "SUSPENDED" && !confirmWeb(`${data?.nickname} 님을 정지할까요? 로그인이 차단됩니다.`)) return;
    update.mutate({ status: next }, { onError });
  }
  function doForceLogout() {
    if (!confirmWeb(`${data?.nickname} 님을 강제 로그아웃할까요?`)) return;
    forceLogout.mutate(undefined, {
      onSuccess: () => toast("강제 로그아웃했어요"),
      onError,
    });
  }
  function doDelete() {
    if (!confirmWeb(`${data?.nickname} 님을 영구 삭제할까요? 되돌릴 수 없어요.`)) return;
    del.mutate(userId, { onSuccess: onBack, onError });
  }

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg">
        <View className="flex-row items-center gap-3 px-5 pt-2 pb-3">
          <Pressable onPress={onBack} hitSlop={10}>
            <BackIcon />
          </Pressable>
        </View>
        <View className="pt-16 items-center">
          <ActivityIndicator color="#FF6B45" />
        </View>
      </View>
    );
  }
  if (isError || !data) return <ErrorView error={error} onRetry={refetch} />;

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center gap-3 px-5 pt-2 pb-3">
        <Pressable onPress={onBack} hitSlop={10}>
          <BackIcon />
        </Pressable>
        <Text className="text-lg font-black text-ink flex-1" numberOfLines={1}>
          {data.nickname}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-5 pt-2">
          <Text className="text-[13px] text-ink-muted">{data.email}</Text>
          <Text className="text-[12px] text-ink-muted mt-1">
            role {data.role} · {data.status === "SUSPENDED" ? "정지됨" : "활성"} · 가입{" "}
            {data.createdAt.slice(0, 10)}
          </Text>
          {data.bio ? (
            <Text className="text-[13px] text-ink mt-2">{data.bio}</Text>
          ) : null}
          <Text className="text-[12px] text-ink-muted mt-3">
            기록 {data.recordCount} · 팔로워 {data.followerCount} · 팔로잉 {data.followingCount} ·
            좋아요 {data.likeCount} · 댓글 {data.commentCount}
          </Text>
        </View>

        <View className="px-5 pt-5">
          <Text className="text-[12px] font-bold text-ink-muted mb-2">관리</Text>
          {isSelf ? (
            <Text className="text-[13px] text-ink-muted">본인 계정은 여기서 변경할 수 없어요</Text>
          ) : (
            <View className="gap-2">
              <ActionButton
                label={data.role === "ADMIN" ? "관리자 → 일반 유저로 강등" : "일반 유저 → 관리자로 승격"}
                onPress={toggleRole}
                disabled={busy}
              />
              <ActionButton
                label={data.status === "SUSPENDED" ? "정지 해제" : "계정 정지"}
                onPress={toggleStatus}
                tone={data.status === "SUSPENDED" ? "default" : "danger"}
                disabled={busy}
              />
              <ActionButton label="강제 로그아웃" onPress={doForceLogout} disabled={busy} />
              {data.role !== "ADMIN" && (
                <ActionButton label="계정 영구 삭제" onPress={doDelete} tone="danger" disabled={busy} />
              )}
            </View>
          )}
        </View>

        <View className="px-5 pt-6">
          <Text className="text-[12px] font-bold text-ink-muted mb-2">최근 기록 {data.recentRecords.length}건</Text>
          {data.recentRecords.length === 0 ? (
            <Text className="text-[13px] text-ink-muted">기록 없음</Text>
          ) : (
            data.recentRecords.map((r) => (
              <View key={r.id} className="py-2 border-b border-border">
                <Text className="text-[12px] text-ink-muted">
                  {r.type} · {r.visibility} · {r.spotName} · {r.createdAt.slice(0, 10)}
                </Text>
                {r.caption ? (
                  <Text className="text-[13px] text-ink" numberOfLines={2}>
                    {r.caption}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}
