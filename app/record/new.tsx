import React from "react";
import { useRouter } from "expo-router";
import RecordScreen from "../../src/screens/RecordScreen";

export default function RecordNewRoute() {
  const router = useRouter();
  return <RecordScreen onBack={() => router.back()} />;
}
