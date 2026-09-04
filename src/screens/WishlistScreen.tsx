import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { BackIcon } from "../components/icons";
import RecordCardView from "../components/RecordCardView";
import { RecordCardSkeleton } from "../components/skeletons";
import { EmptyView, ErrorView } from "../components/states";
import { useWishlist } from "../hooks/queries";

export default function WishlistScreen({
  userId,
  title = "위시리스트",
  onBack,
  onOpenRecord,
}: {
  userId: string;
  title?: string;
  onBack: () => void;
  onOpenRecord: (id: string) => void;
}) {
  const { data, isLoading, isError, error, refetch } = useWishlist(userId);

  return (
    <View className="flex-1 bg-bg">
      <View className="flex-row items-center gap-2 px-4 pt-2 pb-3">
        <Pressable onPress={onBack} hitSlop={10}>
          <BackIcon />
        </Pressable>
        <Text className="text-base font-bold text-ink">{title}</Text>
      </View>

      {isLoading ? (
        <View className="px-1">
          <RecordCardSkeleton />
          <RecordCardSkeleton />
        </View>
      ) : isError ? (
        <ErrorView error={error} onRetry={refetch} />
      ) : (data?.length ?? 0) === 0 ? (
        <EmptyView message="가고 싶은 곳을 아직 담지 않았어요" />
      ) : (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingVertical: 6 }}>
          {(data ?? []).map((r) => (
            <RecordCardView key={r.id} record={r} onPress={onOpenRecord} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
