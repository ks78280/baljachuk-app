import React from "react";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import {
  MapPinTabIcon,
  CompassIcon,
  TimelineIcon,
  ProfileIcon,
  PlusIcon,
} from "./icons";

// route 파일명(app/(tabs)/*)과 매칭
const TABS: {
  name: string;
  label: string;
  Icon: React.FC<{ color?: string }>;
}[] = [
  { name: "index", label: "지도", Icon: MapPinTabIcon },
  { name: "explore", label: "탐색", Icon: CompassIcon },
  { name: "timeline", label: "타임라인", Icon: TimelineIcon },
  { name: "profile", label: "프로필", Icon: ProfileIcon },
];

// 탭 행 최소 높이 + 하단 안전영역. insets.bottom이 0으로 잘못 보고되는
// 환경(일부 기기 Expo Go)에 대비해 최소 여백(FLOOR)을 항상 확보한다.
const TAB_ROW_HEIGHT = 60;
const BOTTOM_SAFE_FLOOR = 20;

export default function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const activeName = state.routes[state.index]?.name;

  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  const renderTab = ({ name, label, Icon }: (typeof TABS)[number]) => {
    const active = activeName === name;
    return (
      <Pressable
        key={name}
        onPress={() => navigation.navigate(name)}
        className="items-center gap-1 flex-1"
        hitSlop={6}
      >
        <Icon color={active ? "#FF6B45" : "#B99287"} />
        <Text
          className="text-[11px]"
          style={{
            color: active ? "#FF6B45" : "#B99287",
            fontWeight: active ? "700" : "500",
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View
      className="relative flex-row items-center justify-between px-3.5 bg-white border-t border-border"
      style={{
        minHeight: TAB_ROW_HEIGHT,
        paddingBottom: Math.max(insets.bottom, BOTTOM_SAFE_FLOOR),
      }}
    >
      {left.map(renderTab)}
      <View style={{ width: 56 }} />
      {right.map(renderTab)}

      <Pressable
        onPress={() => router.push("/record/new")}
        className="absolute self-center -top-5 w-14 h-14 rounded-full bg-coral items-center justify-center shadow-lg"
        style={{ left: "50%", marginLeft: -28 }}
      >
        <PlusIcon />
      </Pressable>
    </View>
  );
}
