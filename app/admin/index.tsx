import React from "react";
import { useRouter } from "expo-router";
import AdminUsersScreen from "../../src/screens/AdminUsersScreen";

export default function AdminUsersRoute() {
  const router = useRouter();
  return (
    <AdminUsersScreen
      onBack={() => router.back()}
      onOpenUser={(id) => router.push(`/admin/users/${id}`)}
    />
  );
}
