import React, { useEffect } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "../../src/lib/auth";

/** 관리자 페이지는 web + role=ADMIN 인 세션만. 아니면 홈으로 되돌린다. */
export default function AdminLayout() {
  const { status, user } = useAuth();
  const router = useRouter();
  const allowed = Platform.OS === "web" && user?.role === "ADMIN";

  useEffect(() => {
    if (status === "loading") return;
    if (!allowed) router.replace("/");
  }, [allowed, status, router]);

  if (status === "loading" || !allowed) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator color="#FF6B45" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFF8F5" },
      }}
    />
  );
}
