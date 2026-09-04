import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import RecordScreen from "../../../src/screens/RecordScreen";

export default function RecordEditRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return <RecordScreen editRecordId={id} onBack={() => router.back()} />;
}
