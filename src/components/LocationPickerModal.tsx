import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import MapCanvas from "./map/MapCanvas";
import { MapRegion } from "./map/types";
import { SmallPinIcon } from "./icons";
import { useReverseGeocode } from "../hooks/queries";
import { getCurrentLocation } from "../lib/location";

export interface PickedLocation {
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
}

const KOREA_CENTER = { lat: 36.5, lng: 127.85, zoom: 7 };

export default function LocationPickerModal({
  visible,
  onClose,
  onPick,
  initial,
}: {
  visible: boolean;
  onClose: () => void;
  onPick: (loc: PickedLocation) => void;
  initial?: { lat: number; lng: number } | null;
}) {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    initial ? { lat: initial.lat, lng: initial.lng } : null
  );
  const [name, setName] = useState("");
  const [nameTouched, setNameTouched] = useState(false);
  const [myLoc, setMyLoc] = useState<{ lat: number; lng: number } | null>(null);
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom?: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const initialCenter = useMemo(
    () => (initial ? { lat: initial.lat, lng: initial.lng, zoom: 16 } : KOREA_CENTER),
    // 모달이 열릴 때 한 번만
    [visible] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const geo = useReverseGeocode(center?.lat ?? null, center?.lng ?? null);
  const address = geo.data?.address ?? null;

  // 주소가 처음 오면, 사용자가 이름을 안 건드렸을 때 한해 기본값으로 채움
  const lastFilledFrom = useRef<string | null>(null);
  useEffect(() => {
    if (address && !nameTouched && address !== lastFilledFrom.current) {
      setName(address);
      lastFilledFrom.current = address;
    }
  }, [address, nameTouched]);

  // 모달 닫혔다 다시 열리면 상태 초기화
  useEffect(() => {
    if (!visible) {
      setName("");
      setNameTouched(false);
      setMyLoc(null);
      setFlyTo(null);
      setCenter(initial ? { lat: initial.lat, lng: initial.lng } : null);
      lastFilledFrom.current = null;
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  function onRegion(r: MapRegion) {
    setCenter({
      lat: (r.swLat + r.neLat) / 2,
      lng: (r.swLng + r.neLng) / 2,
    });
  }

  async function useCurrentLocation() {
    if (locating) return;
    setLocating(true);
    const loc = await getCurrentLocation();
    setLocating(false);
    if (!loc) return;
    setMyLoc(loc);
    setFlyTo({ lat: loc.lat, lng: loc.lng, zoom: 16 });
  }

  function confirm() {
    if (!center || !name.trim()) return;
    onPick({
      name: name.trim().slice(0, 120),
      latitude: center.lat,
      longitude: center.lng,
      address,
    });
  }

  const canConfirm = !!center && !!name.trim();

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose} transparent={false}>
      <View className="flex-1 bg-bg">
        <View className="flex-row items-center gap-3 px-5 pt-2 pb-3">
          <Pressable onPress={onClose} hitSlop={10}>
            <Text className="text-2xl text-ink">×</Text>
          </Pressable>
          <Text className="text-base font-bold text-ink">위치 선택</Text>
        </View>

        <View className="flex-1 relative overflow-hidden bg-[#F3ECE2]">
          <MapCanvas
            markers={[]}
            myLocation={myLoc}
            initialCenter={initialCenter}
            onRegionChange={onRegion}
            flyTo={flyTo}
          />

          {/* 중앙 고정 핀 — 지도를 움직여 이 지점을 맞춘다 */}
          <View
            className="absolute inset-0 items-center justify-center"
            pointerEvents="none"
          >
            <View style={{ transform: [{ translateY: -14 }] }}>
              <SmallPinIcon size={34} />
            </View>
          </View>

          <Pressable
            onPress={useCurrentLocation}
            className="absolute left-4 bottom-4 flex-row items-center gap-1.5 bg-white/95 rounded-full px-3.5 py-2 shadow"
          >
            {locating ? (
              <ActivityIndicator size="small" color="#FF6B45" />
            ) : (
              <SmallPinIcon size={14} />
            )}
            <Text className="text-[12px] font-bold text-ink">현재 위치</Text>
          </Pressable>
        </View>

        <View
          className="px-5 pt-3.5 pb-6 border-t border-border bg-bg"
          style={Platform.OS === "web" ? undefined : { paddingBottom: 28 }}
        >
          <Text className="text-[11px] text-ink-muted mb-1.5" numberOfLines={1}>
            {geo.isFetching ? "주소 확인 중…" : address ?? "지도를 움직여 위치를 맞춰주세요"}
          </Text>
          <TextInput
            value={name}
            onChangeText={(t) => {
              setName(t);
              setNameTouched(true);
            }}
            placeholder="이 장소의 이름 (예: 전포 카페거리)"
            placeholderTextColor="#8C6F63"
            className="bg-white border border-border rounded-xl px-3.5 py-2.5 text-sm text-ink"
            maxLength={120}
          />
          <Pressable
            onPress={confirm}
            disabled={!canConfirm}
            className={`mt-3 items-center py-3.5 rounded-2xl bg-coral ${canConfirm ? "" : "opacity-40"}`}
          >
            <Text className="text-[15px] font-bold text-white">이 위치로 설정</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
