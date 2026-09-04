import React from "react";
import { useRouter } from "expo-router";
import FeedManageScreen from "../src/screens/FeedManageScreen";

export default function FeedManageRoute() {
  const router = useRouter();
  return (
    <FeedManageScreen
      onBack={() => router.back()}
      onEditRecord={(id) => router.push(`/record/${id}/edit`)}
    />
  );
}
