import React from "react";
import { Tabs } from "expo-router/js-tabs";
import BottomTabBar from "../../src/components/BottomTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="timeline" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
