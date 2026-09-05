import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { BBox, MapScope } from "../types/api";
import {
  useMapRecords,
  useMapClusters,
  useUnlockSpots,
  useUnreadNotificationCount,
} from "../hooks/queries";
import { useNav } from "../lib/nav";
import { getCurrentLocation } from "../lib/location";
import MapCanvas from "../components/map/MapCanvas";
import { MapMarkerVM, MapRegion } from "../components/map/types";
import { SearchIcon, BellIcon } from "../components/icons";

// 클러스터 ↔ 개별 핀 전환 줌 (설계서 §11.2)
const PIN_ZOOM = 12;
const INITIAL = { lat: 36.3, lng: 127.8, zoom: 7 };
const INITIAL_BBOX: BBox = { swLat: 33.8, swLng: 125.5, neLat: 38.7, neLng: 130.1 };

const SCOPES: { key: MapScope; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "friends", label: "친구" },
  { key: "me", label: "나" },
];

export default function MapScreen() {
  const [scope, setScope] = useState<MapScope>("all");
  const [region, setRegion] = useState<MapRegion>({ ...INITIAL_BBOX, zoom: INITIAL.zoom });
  const [myLoc, setMyLoc] = useState<{ lat: number; lng: number } | null>(null);
  const { openSpot, openSearch, openNotifications, openProfile } = useNav();
  const unread = useUnreadNotificationCount();
  const unlock = useUnlockSpots();
  const unlockedOnce = useRef(false);

  const showClusters = region.zoom < PIN_ZOOM;
  const bbox: BBox = region;

  const pinsQ = useMapRecords(bbox, scope, !showClusters);
  const clustersQ = useMapClusters(bbox, region.zoom, scope, showClusters);
  const loading = showClusters ? clustersQ.isLoading : pinsQ.isLoading;
  const errored = showClusters ? clustersQ.isError : pinsQ.isError;

  // 지도 진입 시 1회: 현재 위치 조회 → 반경 내 잠긴 스팟 해제 (설계서 §11.4.3)
  useEffect(() => {
    if (unlockedOnce.current) return;
    unlockedOnce.current = true;
    (async () => {
      const loc = await getCurrentLocation();
      if (!loc) return;
      setMyLoc(loc);
      unlock.mutate(loc);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const markers: MapMarkerVM[] = useMemo(() => {
    if (showClusters) {
      return (clustersQ.data ?? []).map((c, i) => ({
        id: `c${i}:${c.latitude.toFixed(3)},${c.longitude.toFixed(3)}`,
        lat: c.latitude,
        lng: c.longitude,
        kind: "cluster" as const,
        count: c.count,
      }));
    }
    return (pinsQ.data ?? []).map((p) => ({
      id: p.recordId,
      lat: p.latitude,
      lng: p.longitude,
      kind: p.type === "WISH" ? ("wish" as const) : p.locked ? ("locked" as const) : ("pin" as const),
      color: p.color,
      spotId: p.spotId,
    }));
  }, [showClusters, clustersQ.data, pinsQ.data]);

  return (
    <View className="flex-1 bg-bg">
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
          <Pressable onPress={openProfile} hitSlop={8}>
            <View className="w-[30px] h-[30px] rounded-full bg-coral" />
          </Pressable>
        </View>
      </View>

      <View className="flex-1 relative overflow-hidden bg-[#F3ECE2]">
        <MapCanvas
          markers={markers}
          myLocation={myLoc}
          initialCenter={INITIAL}
          onRegionChange={setRegion}
          onPinPress={({ spotId }) => spotId && openSpot(spotId)}
        />

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

        {loading && (
          <View className="absolute right-4 top-4 bg-white/90 rounded-full p-1.5">
            <ActivityIndicator color="#FF6B45" size="small" />
          </View>
        )}
        {errored && (
          <View className="absolute left-0 right-0 top-16 items-center">
            <Text className="text-xs text-[#B4694F] bg-white/90 px-3 py-1 rounded-full">
              지도 데이터를 불러오지 못했어요
            </Text>
          </View>
        )}
        {showClusters && (
          <View className="absolute right-4 bottom-4 bg-white/90 rounded-full px-3 py-1">
            <Text className="text-[10px] font-semibold text-ink-muted">확대하면 개별 기록</Text>
          </View>
        )}
      </View>
    </View>
  );
}
