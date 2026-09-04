import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import RecordDetailScreen from "../../src/screens/RecordDetailScreen";

export default function RecordDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return (
    <RecordDetailScreen
      recordId={id}
      onBack={() => router.back()}
      onOpenSpot={(spotId) => router.push(`/spot/${spotId}`)}
    />
  );
}
