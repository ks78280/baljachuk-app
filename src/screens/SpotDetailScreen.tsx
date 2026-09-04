import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { BackIcon, SmallPinIcon } from "../components/icons";
import { ErrorView, EmptyView } from "../components/states";
import { RecordCardSkeleton } from "../components/skeletons";
import RecordCardView from "../components/RecordCardView";
import { useSpots, useSpotRecords } from "../hooks/queries";

export default function SpotDetailScreen({
  spotId,
  onBack,
  onOpenRecord,
}: {
  spotId: string;
  onBack: () => void;
  onOpenRecord: (recordId: string) => void;
}) {
  const { data: spots } = useSpots();
  const { data: records, isLoading, isError, refetch } = useSpotRecords(spotId);
  const spot = spots?.find((s) => s.id === spotId) ?? null;

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center gap-2 px-4 pt-2 pb-3">
        <Pressable onPress={onBack} hitSlop={10}>
          <BackIcon />
        </Pressable>
        <Text className="text-base font-bold text-ink" numberOfLines={1}>
          {spot?.name ?? "스팟"}
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        {/* 스팟 정보 */}
        <View className="px-5 pb-4">
          <View className="w-full h-[140px] rounded-2xl bg-[#F6E3D8] items-center justify-center mb-3">
            <SmallPinIcon size={30} />
          </View>
          <Text className="text-[17px] font-extrabold text-ink">{spot?.name ?? ""}</Text>
          {spot?.address && (
            <Text className="text-[13px] text-ink-muted mt-0.5">{spot.address}</Text>
          )}
          {spot && (
            <Text className="text-[12px] text-coral font-semibold mt-1.5">
              이곳의 기록 {spot.recordCount}개
            </Text>
          )}
        </View>

        <View className="h-px bg-border mx-5 mb-3" />

        {isLoading ? (
          <View className="px-5" style={{ gap: 14 }}>
            <RecordCardSkeleton />
            <RecordCardSkeleton />
          </View>
        ) : isError ? (
          <ErrorView onRetry={refetch} />
        ) : !records || records.length === 0 ? (
          <EmptyView message="아직 이곳의 기록이 없어요" />
        ) : (
          <View className="px-5" style={{ gap: 14 }}>
            {records.map((r) => (
              <RecordCardView key={r.id} record={r} onPress={onOpenRecord} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
