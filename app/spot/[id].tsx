import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import SpotDetailScreen from "../../src/screens/SpotDetailScreen";

export default function SpotDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return (
    <SpotDetailScreen
      spotId={id}
      onBack={() => router.back()}
      onOpenRecord={(recordId) => router.push(`/record/${recordId}`)}
    />
  );
}
