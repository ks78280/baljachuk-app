import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert, Platform, ActivityIndicator } from "react-native";
import { BackIcon } from "../components/icons";
import PickerSheet, { PickerOption } from "../components/PickerSheet";
import { useMe, useUpdateMe, useDeleteMe } from "../hooks/queries";
import { useAuth } from "../lib/auth";
import { Visibility } from "../types/models";

const VIS_LABEL: Record<Visibility, string> = {
  PUBLIC: "전체 공개",
  FRIENDS: "친구 공개",
  PRIVATE: "비공개",
};

function Row({
  label,
  value,
  onPress,
  danger,
}: {
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-border"
    >
      <Text className={`text-sm ${danger ? "font-bold text-coral-dark" : "font-semibold text-ink"}`}>
        {label}
      </Text>
      {value != null && (
        <Text className="text-[13px] text-ink-muted">{value} {onPress ? "›" : ""}</Text>
      )}
    </Pressable>
  );
}

export default function SettingsScreen({ onBack }: { onBack: () => void }) {
  const { data } = useMe();
  const updateMe = useUpdateMe();
  const deleteMe = useDeleteMe();
  const { signOut } = useAuth();
  const [sheet, setSheet] = useState<null | "visibility">(null);
  const [notifyPush, setNotifyPush] = useState(true); // UI 전용 — 실연동 Phase 6

  const visibility = data?.user.defaultVisibility ?? "FRIENDS";

  const visOptions: PickerOption<Visibility>[] = [
    { label: VIS_LABEL.PUBLIC, value: "PUBLIC" },
    { label: VIS_LABEL.FRIENDS, value: "FRIENDS" },
    { label: VIS_LABEL.PRIVATE, value: "PRIVATE" },
  ];

  function confirmDelete() {
    const run = () => {
      deleteMe.mutate(undefined, {
        onSuccess: () => signOut(),
        onError: () =>
          Alert.alert("탈퇴 실패", "잠시 후 다시 시도해주세요."),
      });
    };
    if (Platform.OS === "web") {
      run();
      return;
    }
    Alert.alert(
      "회원 탈퇴",
      "모든 기록·위치 데이터가 삭제되며 되돌릴 수 없어요. 정말 탈퇴할까요?",
      [
        { text: "취소", style: "cancel" },
        { text: "탈퇴", style: "destructive", onPress: run },
      ]
    );
  }

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center gap-2 px-4 pt-2 pb-3">
        <Pressable onPress={onBack} hitSlop={10}>
          <BackIcon />
        </Pressable>
        <Text className="text-base font-bold text-ink">설정</Text>
      </View>

      <ScrollView className="flex-1">
        <Text className="px-5 pt-4 pb-2 text-[11px] font-bold text-ink-muted">계정</Text>
        <Row label="닉네임" value={data?.user.nickname} />
        <Row
          label="기본 공개 범위"
          value={VIS_LABEL[visibility]}
          onPress={() => setSheet("visibility")}
        />

        <Text className="px-5 pt-6 pb-2 text-[11px] font-bold text-ink-muted">알림</Text>
        <Pressable
          onPress={() => setNotifyPush((v) => !v)}
          className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-border"
        >
          <View>
            <Text className="text-sm font-semibold text-ink">푸시 알림</Text>
            <Text className="text-[11px] text-ink-muted mt-0.5">실연동은 준비 중 (Phase 6)</Text>
          </View>
          <View
            className="w-11 h-6 rounded-full justify-center px-0.5"
            style={{ backgroundColor: notifyPush ? "#FF6B45" : "#E4D3CA", alignItems: notifyPush ? "flex-end" : "flex-start" }}
          >
            <View className="w-5 h-5 rounded-full bg-white" />
          </View>
        </Pressable>

        <Text className="px-5 pt-6 pb-2 text-[11px] font-bold text-ink-muted">기타</Text>
        <Row label="로그아웃" onPress={signOut} />
        <Pressable
          onPress={confirmDelete}
          disabled={deleteMe.isPending}
          className="flex-row items-center justify-between px-5 py-4 bg-white border-b border-border"
        >
          <Text className="text-sm font-bold text-coral-dark">회원 탈퇴</Text>
          {deleteMe.isPending && <ActivityIndicator size="small" color="#E5502B" />}
        </Pressable>

        <Text className="px-5 py-6 text-[11px] text-ink-muted">발자국 v1.0.0</Text>
      </ScrollView>

      <PickerSheet
        visible={sheet === "visibility"}
        title="기본 공개 범위"
        options={visOptions}
        selected={visibility}
        onSelect={(v) => updateMe.mutate({ defaultVisibility: v })}
        onClose={() => setSheet(null)}
      />
    </View>
  );
}
