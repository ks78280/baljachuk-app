import React from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import AdminUserDetailScreen from "../../../src/screens/AdminUserDetailScreen";

export default function AdminUserDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return <AdminUserDetailScreen userId={id} onBack={() => router.back()} />;
}
