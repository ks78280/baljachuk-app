import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import FollowListScreen from "../../../src/screens/FollowListScreen";

export default function FollowingRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return <FollowListScreen userId={id} kind="following" onBack={() => router.back()} />;
}
