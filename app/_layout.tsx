import "../global.css";
import React from "react";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../src/lib/queryClient";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        {/* 상단(노치/상태바)만 여기서. 하단 안전영역은 탭바·각 화면이 처리 */}
        <SafeAreaView style={{ flex: 1 }} edges={["top"]} className="bg-bg">
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
              contentStyle: { backgroundColor: "#FFF8F5" },
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="record/new" />
            <Stack.Screen name="record/[id]" />
            <Stack.Screen name="spot/[id]" />
            <Stack.Screen name="search" />
            <Stack.Screen name="notifications" />
          </Stack>
        </SafeAreaView>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
