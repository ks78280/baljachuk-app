import React, { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { MapScope } from "../types/api";
import { MapPin } from "../types/models";
import { useMapRecords, useUnreadNotificationCount } from "../hooks/queries";
import { useNav } from "../lib/nav";
import {
  SearchIcon,
  BellIcon,
  PhotoPin,
  WishPin,
  MapBackground,
} from "../components/icons";

// 목 스팟(대구·부산·경주 근방)을 감싸는 고정 bbox. 실제 지도 SDK 연동 전까지
// 위경도를 배경 SVG 좌표계로 투영하는 데만 쓴다.
const VIEW_BBOX = { swLat: 35.05, swLng: 128.5, neLat: 36.0, neLng: 129.3 };

function project(pin: MapPin): { left: `${number}%`; top: `${number}%` } {
  const x = ((pin.longitude - VIEW_BBOX.swLng) / (VIEW_BBOX.neLng - VIEW_BBOX.swLng)) * 100;
  const y = ((VIEW_BBOX.neLat - pin.latitude) / (VIEW_BBOX.neLat - VIEW_BBOX.swLat)) * 100;
  const clamp = (n: number) => Math.min(94, Math.max(2, n));
  return { left: `${clamp(x)}%`, top: `${clamp(y)}%` };
}

const SCOPES: { key: MapScope; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "friends", label: "친구" },
  { key: "me", label: "나" },
];

export default function MapScreen() {
  const [scope, setScope] = useState<MapScope>("all");
  const { data: pins, isLoading, isError } = useMapRecords(scope);
  const { openSpot, openSearch, openNotifications } = useNav();
  const unread = useUnreadNotificationCount();

  return (
    <View className="flex-1 bg-bg">
      {/* 헤더 */}
      <View className="flex-row items-center justify-between px-5 pb-3.5">
        <Text className="text-[21px] font-black text-ink">발자국</Text>
        <View className="flex-row items-center gap-4">
          <Pressable onPress={openSearch} hitSlop={8}>
            <SearchIcon />
          </Pressable>
          <Pressable onPress={openNotifications} hitSlop={8}>
            <BellIcon />
            {unread > 0 && (
              <View className="absolute -top-0.5 -right-0.5 w-[7px] h-[7px] rounded-full bg-coral border border-bg" />
            )}
          </Pressable>
          <View className="w-[30px] h-[30px] rounded-full bg-coral" />
        </View>
      </View>

      <View className="flex-1 relative overflow-hidden bg-[#F3ECE2]">
        <MapBackground />

        {/* scope 토글 */}
        <View className="absolute left-4 top-4 flex-row bg-white/95 rounded-full p-0.5 shadow">
          {SCOPES.map((s) => {
            const active = scope === s.key;
            return (
              <Pressable
                key={s.key}
                onPress={() => setScope(s.key)}
                className={`px-3 py-1 rounded-full ${active ? "bg-coral" : ""}`}
              >
                <Text
                  className={`text-[11px] font-bold ${active ? "text-white" : "text-ink-muted"}`}
                >
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isLoading && (
          <View className="absolute right-4 top-4">
            <ActivityIndicator color="#FF6B45" />
          </View>
        )}
        {isError && (
          <View className="absolute left-0 right-0 top-16 items-center">
            <Text className="text-xs text-[#B4694F] bg-white/90 px-3 py-1 rounded-full">
              핀을 불러오지 못했어요
            </Text>
          </View>
        )}

        {(pins ?? []).map((pin) => {
          const pos = project(pin);
          return (
            <Pressable
              key={pin.recordId}
              className="absolute"
              style={pos}
              hitSlop={8}
              onPress={() => openSpot(pin.spotId)}
            >
              {pin.type === "WISH" ? (
                <WishPin />
              ) : (
                <PhotoPin fill={pin.locked ? "#C9B8AE" : pin.color ?? "#FF9457"} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
