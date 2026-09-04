import "./global.css";
import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./src/lib/queryClient";
import { NavProvider, useNav } from "./src/lib/nav";
import BottomTabBar, { TabKey } from "./src/components/BottomTabBar";
import MapScreen from "./src/screens/MapScreen";
import ExploreScreen from "./src/screens/ExploreScreen";
import TimelineScreen from "./src/screens/TimelineScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import RecordScreen from "./src/screens/RecordScreen";
import RecordDetailScreen from "./src/screens/RecordDetailScreen";
import SpotDetailScreen from "./src/screens/SpotDetailScreen";
import SearchScreen from "./src/screens/SearchScreen";
import NotificationScreen from "./src/screens/NotificationScreen";

function Root() {
  const [activeTab, setActiveTab] = useState<TabKey>("map");
  const { modal, openCompose, openRecord, openSpot, close } = useNav();

  return (
    // 상단(노치/펀치홀/상태바)만 여기서 처리. 하단 안전영역은 각 화면이 처리
    // (탭바 배경이 화면 끝까지 이어지도록).
    <SafeAreaView style={{ flex: 1 }} edges={["top"]} className="bg-bg">
      {modal?.kind === "compose" && <RecordScreen onBack={close} />}
      {modal?.kind === "record" && (
        <RecordDetailScreen recordId={modal.id} onBack={close} onOpenSpot={openSpot} />
      )}
      {modal?.kind === "spot" && (
        <SpotDetailScreen spotId={modal.id} onBack={close} onOpenRecord={openRecord} />
      )}
      {modal?.kind === "search" && (
        <SearchScreen onBack={close} onOpenSpot={openSpot} />
      )}
      {modal?.kind === "notifications" && (
        <NotificationScreen onBack={close} onOpenRecord={openRecord} />
      )}

      {!modal && (
        <>
          {activeTab === "map" && <MapScreen />}
          {activeTab === "explore" && <ExploreScreen />}
          {activeTab === "timeline" && <TimelineScreen />}
          {activeTab === "profile" && <ProfileScreen />}
          <BottomTabBar
            active={activeTab}
            onChange={setActiveTab}
            onPressCompose={openCompose}
          />
        </>
      )}
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavProvider>
          <Root />
        </NavProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
