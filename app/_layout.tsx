import "../global.css";
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../src/lib/queryClient";
import { AuthProvider, useAuth } from "../src/lib/auth";

function Splash() {
  return (
    <View className="flex-1 items-center justify-center bg-bg">
      <ActivityIndicator color="#FF6B45" />
    </View>
  );
}

/** 로그인 상태에 따라 (auth) 그룹 ↔ 나머지 화면을 강제 전환하는 라우트 가드. */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const inAuthGroup = segments[0] === "(auth)";

  useEffect(() => {
    if (status === "loading") return;
    if (status === "guest" && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (status === "authed" && inAuthGroup) {
      router.replace("/");
    }
  }, [status, inAuthGroup, router]);

  // 리다이렉트가 반영되기 전까지 보호 화면이 깜빡이지 않도록 스플래시로 가린다
  if (status === "loading") return <Splash />;
  if (status === "guest" && !inAuthGroup) return <Splash />;
  if (status === "authed" && inAuthGroup) return <Splash />;
  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AuthProvider>
          {/* 상단(노치/상태바)만 여기서. 하단 안전영역은 탭바·각 화면이 처리 */}
          <SafeAreaView style={{ flex: 1 }} edges={["top"]} className="bg-bg">
            <AuthGate>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: "slide_from_right",
                  contentStyle: { backgroundColor: "#FFF8F5" },
                }}
              >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="record/new" />
                <Stack.Screen name="record/[id]" />
                <Stack.Screen name="record/[id]/edit" />
                <Stack.Screen name="spot/[id]" />
                <Stack.Screen name="search" />
                <Stack.Screen name="notifications" />
                <Stack.Screen name="settings" />
                <Stack.Screen name="profile/edit" />
                <Stack.Screen name="feed-manage" />
              </Stack>
            </AuthGate>
          </SafeAreaView>
          <StatusBar style="dark" />
        </AuthProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
