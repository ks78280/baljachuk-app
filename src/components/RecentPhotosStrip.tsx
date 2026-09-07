import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import Img from "./Img";
import { GalleryIcon } from "./icons";
import {
  getRecentPhotos,
  requestRecentPhotosPermission,
} from "../lib/imagePicker";

type State =
  | { k: "loading" }
  | { k: "prompt" }
  | { k: "photos"; items: { id: string; uri: string }[] }
  | { k: "hidden" };

/**
 * 기기 최근 사진 가로 스트립 — 다이얼로그 없이 탭 한 번으로 첨부.
 * 권한 미결정이면 인라인으로 먼저 물어보고(priming), 거부돼 있으면 조용히 숨는다
 * (전체 선택기 쪽 PermissionSheet 가 설정 안내를 담당).
 */
export default function RecentPhotosStrip({
  onPick,
  disabled,
}: {
  onPick: (uri: string) => void;
  disabled?: boolean;
}) {
  const [state, setState] = useState<State>({ k: "loading" });

  async function load() {
    const r = await getRecentPhotos(15);
    if (r.status === "ok" && r.assets.length > 0)
      setState({ k: "photos", items: r.assets });
    else if (r.status === "undetermined") setState({ k: "prompt" });
    else setState({ k: "hidden" });
  }

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (state.k === "loading" || state.k === "hidden") return null;

  return (
    <View className="mb-4">
      <Text className="text-[11px] font-semibold text-ink-muted mb-2">최근 사진</Text>

      {state.k === "prompt" ? (
        <Pressable
          onPress={async () => {
            const ok = await requestRecentPhotosPermission();
            if (ok) {
              setState({ k: "loading" });
              load();
            } else {
              setState({ k: "hidden" });
            }
          }}
          className="self-start flex-row items-center gap-1.5 bg-coral-soft rounded-full px-3.5 py-2"
        >
          <GalleryIcon size={14} />
          <Text className="text-[12px] font-bold text-coral-dark">
            최근 사진 빠르게 첨부
          </Text>
        </Pressable>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-5"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        >
          {state.items.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => !disabled && onPick(p.uri)}
              disabled={disabled}
            >
              <Img
                source={{ uri: p.uri }}
                className="w-16 h-16 rounded-xl bg-coral-soft"
                style={disabled ? { opacity: 0.4 } : undefined}
              />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
