import React from "react";
import { View, Text, Pressable, ScrollView, Image, Alert, Platform } from "react-native";
import { BackIcon, SmallPinIcon } from "../components/icons";
import { RecordCardSkeleton } from "../components/skeletons";
import { EmptyView, ErrorView } from "../components/states";
import { useMyRecords, useSetNotifySetting, useDeleteRecord } from "../hooks/queries";
import { RecordCard } from "../types/models";

function Toggle({ on }: { on: boolean }) {
  return (
    <View
      className="w-11 h-6 rounded-full justify-center px-0.5"
      style={{ backgroundColor: on ? "#FF6B45" : "#E4D3CA", alignItems: on ? "flex-end" : "flex-start" }}
    >
      <View className="w-5 h-5 rounded-full bg-white" />
    </View>
  );
}

function ManageRow({
  record,
  onToggleNotify,
  onEdit,
  onDelete,
}: {
  record: RecordCard;
  onToggleNotify: (next: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isWish = record.type === "WISH";
  const notify = record.nearbyNotifyEnabled ?? true;

  return (
    <View className="px-5 py-3.5 border-b border-border bg-white">
      <View className="flex-row gap-3">
        {record.photos[0] ? (
          <Image
            source={{ uri: record.photos[0].thumbnailUrl }}
            className="w-14 h-14 rounded-xl bg-coral-soft"
          />
        ) : (
          <View className="w-14 h-14 rounded-xl bg-coral-soft items-center justify-center">
            <SmallPinIcon size={18} />
          </View>
        )}
        <View className="flex-1">
          <View className="flex-row items-center gap-1.5">
            <Text
              className="text-[11px] font-bold px-1.5 py-0.5 rounded"
              style={{ backgroundColor: isWish ? "#FFE7DC" : "#E8F3EE", color: isWish ? "#E5502B" : "#3FAE8A" }}
            >
              {isWish ? "가고 싶어요" : "다녀왔어요"}
            </Text>
            {isWish && record.isCompleted && (
              <Text className="text-[11px] font-bold text-ink-muted">완료됨</Text>
            )}
          </View>
          <Text className="text-[13px] text-ink mt-1" numberOfLines={1}>
            {record.caption || "(캡션 없음)"}
          </Text>
          <Text className="text-[11px] text-ink-muted mt-0.5">{record.spot.name}</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-3">
        {!isWish ? (
          <Pressable
            onPress={() => onToggleNotify(!notify)}
            className="flex-row items-center gap-2"
          >
            <Toggle on={notify} />
            <Text className="text-[12px] text-ink-muted">인근 친구 알림</Text>
          </Pressable>
        ) : (
          <View />
        )}
        <View className="flex-row gap-4">
          <Pressable onPress={onEdit} hitSlop={8}>
            <Text className="text-[13px] font-semibold text-coral">수정</Text>
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={8}>
            <Text className="text-[13px] font-semibold text-coral-dark">삭제</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default function FeedManageScreen({
  onBack,
  onEditRecord,
}: {
  onBack: () => void;
  onEditRecord: (id: string) => void;
}) {
  const { data, isLoading, isError, error, refetch } = useMyRecords();
  const setNotify = useSetNotifySetting();
  const deleteRecord = useDeleteRecord();

  function confirmDelete(id: string) {
    const run = () => deleteRecord.mutate(id);
    if (Platform.OS === "web") return run();
    Alert.alert("기록 삭제", "이 기록을 삭제할까요? 되돌릴 수 없어요.", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: run },
    ]);
  }

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center gap-2 px-4 pt-2 pb-3">
        <Pressable onPress={onBack} hitSlop={10}>
          <BackIcon />
        </Pressable>
        <Text className="text-base font-bold text-ink">피드 관리</Text>
      </View>

      {isLoading ? (
        <View className="px-1">
          <RecordCardSkeleton />
          <RecordCardSkeleton />
        </View>
      ) : isError ? (
        <ErrorView error={error} onRetry={refetch} />
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyView message="올린 기록이 아직 없어요" />
      ) : (
        <ScrollView className="flex-1">
          {(data ?? []).map((r) => (
            <ManageRow
              key={r.id}
              record={r}
              onToggleNotify={(next) => setNotify.mutate({ id: r.id, enabled: next })}
              onEdit={() => onEditRecord(r.id)}
              onDelete={() => confirmDelete(r.id)}
            />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
