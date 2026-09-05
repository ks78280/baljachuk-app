import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import UserProfileScreen from "../../src/screens/UserProfileScreen";

export default function UserProfileRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return <UserProfileScreen userId={id} onBack={() => router.back()} />;
}
