import React from "react";
import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  MapPinTabIcon,
  CompassIcon,
  TimelineIcon,
  ProfileIcon,
  PlusIcon,
} from "./icons";

export type TabKey = "map" | "explore" | "timeline" | "profile";

const TABS: { key: TabKey; label: string; Icon: React.FC<{ color?: string }> }[] = [
  { key: "map", label: "지도", Icon: MapPinTabIcon },
  { key: "explore", label: "탐색", Icon: CompassIcon },
  { key: "timeline", label: "타임라인", Icon: TimelineIcon },
  { key: "profile", label: "프로필", Icon: ProfileIcon },
];

// 탭 행 자체의 최소 높이(아이콘+라벨). 기기 하단 안전영역(제스처 바 등)은
// 여기에 패딩으로 더해서 처리한다 — 화면마다 다른 하단 인셋에 맞추기 위함.
// insets.bottom이 0으로 잘못 보고되는 경우(일부 기기의 Expo Go 환경)에
// 대비해 최소 여백(FLOOR)을 항상 확보한다 — 실제 기기 폰 버튼과 겹치는
// 문제의 원인이었다.
const TAB_ROW_HEIGHT = 60;
const BOTTOM_SAFE_FLOOR = 20;

export default function BottomTabBar({
  active,
  onChange,
  onPressCompose,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  onPressCompose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  return (
    <View
      className="relative flex-row items-center justify-between px-3.5 bg-white border-t border-border"
      style={{ minHeight: TAB_ROW_HEIGHT, paddingBottom: Math.max(insets.bottom, BOTTOM_SAFE_FLOOR) }}
    >
      {left.map(({ key, label, Icon }) => (
        <Pressable
          key={key}
          onPress={() => onChange(key)}
          className="items-center gap-1 flex-1"
          hitSlop={6}
        >
          <Icon color={active === key ? "#FF6B45" : "#B99287"} />
          <Text
            className="text-[11px]"
            style={{ color: active === key ? "#FF6B45" : "#B99287", fontWeight: active === key ? "700" : "500" }}
          >
            {label}
          </Text>
        </Pressable>
      ))}

      <View style={{ width: 56 }} />

      {right.map(({ key, label, Icon }) => (
        <Pressable
          key={key}
          onPress={() => onChange(key)}
          className="items-center gap-1 flex-1"
          hitSlop={6}
        >
          <Icon color={active === key ? "#FF6B45" : "#B99287"} />
          <Text
            className="text-[11px]"
            style={{ color: active === key ? "#FF6B45" : "#B99287", fontWeight: active === key ? "700" : "500" }}
          >
            {label}
          </Text>
        </Pressable>
      ))}

      <Pressable
        onPress={onPressCompose}
        className="absolute self-center -top-5 w-14 h-14 rounded-full bg-coral items-center justify-center shadow-lg"
        style={{ left: "50%", marginLeft: -28 }}
      >
        <PlusIcon />
      </Pressable>
    </View>
  );
}
