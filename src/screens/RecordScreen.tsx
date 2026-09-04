import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { BackIcon, CameraIcon, SmallPinIcon } from "../components/icons";
import PickerSheet, { PickerOption } from "../components/PickerSheet";
import { MAX_PHOTOS, takePhoto, pickFromLibrary } from "../lib/imagePicker";
import { useKeyboardHeight } from "../lib/useKeyboard";
import { todayISO, formatDot, recentDateOptions } from "../lib/date";
import { createRecord } from "../api/records";
import { useSpots, qk } from "../hooks/queries";
import { RecordType, Visibility } from "../types/models";

const VIS_LABEL: Record<Visibility, string> = {
  PUBLIC: "전체 공개",
  FRIENDS: "친구 공개",
  PRIVATE: "비공개",
};

type SheetKind = "spot" | "visibility" | "date";

export default function RecordScreen({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const kb = useKeyboardHeight();
  const queryClient = useQueryClient();
  const { data: spots } = useSpots();

  const [type, setType] = useState<RecordType>("VISITED");
  const [spotId, setSpotId] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("FRIENDS");
  const [visitedAt, setVisitedAt] = useState<string>(todayISO());
  const [photos, setPhotos] = useState<string[]>([]);

  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 스팟 목록이 오면 첫 항목을 기본 선택 (실제 앱에선 GPS/EXIF 기반)
  useEffect(() => {
    if (!spotId && spots && spots.length > 0) setSpotId(spots[0].id);
  }, [spots, spotId]);

  const selectedSpot = useMemo(
    () => spots?.find((s) => s.id === spotId) ?? null,
    [spots, spotId]
  );

  const isWish = type === "WISH";

  function changeType(next: RecordType) {
    setType(next);
    setFormError(null);
    // 위시(가고 싶은 곳)는 비공개를 허용하지 않음 (설계서 9.2)
    if (next === "WISH" && visibility === "PRIVATE") setVisibility("FRIENDS");
  }

  // ── 사진 ─────────────────────────────
  function appendPhotos(uris: string[]) {
    if (uris.length === 0) return;
    setFormError(null);
    setPhotos((prev) => [...prev, ...uris].slice(0, MAX_PHOTOS));
  }
  function removePhoto(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }
  function addPhoto() {
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    if (Platform.OS === "web") {
      void pickFromLibrary(remaining).then(appendPhotos);
      return;
    }
    Alert.alert("사진 추가", undefined, [
      {
        text: "카메라로 촬영",
        onPress: () => void takePhoto().then((uri) => uri && appendPhotos([uri])),
      },
      {
        text: "갤러리에서 선택",
        onPress: () => void pickFromLibrary(remaining).then(appendPhotos),
      },
      { text: "취소", style: "cancel" },
    ]);
  }

  // ── 시트 옵션 ─────────────────────────
  const spotOptions: PickerOption<string>[] = (spots ?? []).map((s) => ({
    label: s.name,
    sublabel: s.address ?? undefined,
    value: s.id,
  }));
  const visibilityOptions: PickerOption<Visibility>[] = [
    { label: VIS_LABEL.PUBLIC, value: "PUBLIC" },
    { label: VIS_LABEL.FRIENDS, value: "FRIENDS" },
    { label: VIS_LABEL.PRIVATE, value: "PRIVATE", disabled: isWish },
  ];
  const dateOptions: PickerOption<string>[] = recentDateOptions().map((o) => ({
    label: o.label,
    value: o.value,
  }));

  // ── 제출 ─────────────────────────────
  async function submit() {
    if (submitting) return;
    if (!spotId) {
      setFormError("위치를 선택해주세요");
      return;
    }
    if (!isWish && photos.length === 0) {
      setFormError("사진을 1장 이상 추가해주세요");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    try {
      // 사진은 지금 로컬 URI를 그대로 넘긴다. 실서버 전환 시:
      // /uploads/presign → S3 PUT → 반환된 URL 목록으로 교체.
      await createRecord({
        type,
        spotId,
        caption: caption.trim(),
        photoUrls: photos,
        visibility,
        visitedAt: isWish ? null : visitedAt,
      });
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      queryClient.invalidateQueries({ queryKey: ["map-records"] });
      onBack();
    } catch {
      setFormError("게시에 실패했습니다. 잠시 후 다시 시도해주세요");
    } finally {
      setSubmitting(false);
    }
  }

  const canAddMore = photos.length < MAX_PHOTOS;

  return (
    // 키보드 높이를 직접 paddingBottom으로 (KeyboardAvoidingView가 Android에서 불안정).
    <View className="flex-1 bg-bg" style={{ paddingBottom: kb }}>
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <Pressable onPress={onBack} hitSlop={10}>
          <BackIcon />
        </Pressable>
        <Text className="text-base font-bold text-ink">기록 작성</Text>
        <Pressable
          onPress={submit}
          disabled={submitting}
          className={`py-1.5 px-4 bg-coral rounded-full ${submitting ? "opacity-50" : ""}`}
        >
          <Text className="text-[13px] font-bold text-white">
            {submitting ? "게시 중" : "게시"}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 4 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* 유형 선택 */}
        <View className="flex-row bg-coral-soft rounded-2xl p-1 mb-4.5">
          {(["VISITED", "WISH"] as RecordType[]).map((t) => {
            const active = type === t;
            return (
              <Pressable
                key={t}
                onPress={() => changeType(t)}
                className={`flex-1 items-center py-2.5 rounded-xl ${active ? "bg-coral" : ""}`}
              >
                <Text
                  className={`text-sm ${
                    active ? "font-bold text-white" : "font-semibold text-[#B4694F]"
                  }`}
                >
                  {t === "VISITED" ? "다녀왔어요" : "가고 싶어요"}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* 사진 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2 -mx-5"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
          {photos.map((uri, index) => (
            <View key={`${uri}-${index}`} className="relative">
              <Image
                source={{ uri }}
                className="w-[104px] h-[104px] rounded-2xl bg-coral-soft"
                resizeMode="cover"
              />
              <Pressable
                onPress={() => removePhoto(index)}
                hitSlop={8}
                className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full items-center justify-center"
                style={{ backgroundColor: "rgba(43,23,16,0.82)" }}
              >
                <Text className="text-white text-[13px] leading-none">×</Text>
              </Pressable>
            </View>
          ))}

          {canAddMore && (
            <Pressable
              onPress={addPhoto}
              className="w-[104px] h-[104px] rounded-2xl bg-white items-center justify-center gap-1.5"
              style={{ borderWidth: 1.5, borderColor: "#E7B7A6", borderStyle: "dashed" }}
            >
              <CameraIcon />
              <Text className="text-[11px] font-semibold text-coral-dark">사진 추가</Text>
              <Text className="text-[10px] text-ink-muted">
                {photos.length}/{MAX_PHOTOS}
              </Text>
            </Pressable>
          )}
        </ScrollView>
        <Text className="text-[11px] text-ink-muted mb-4">
          {isWish ? "위시는 사진 없이 등록할 수 있어요" : "사진을 1장 이상 추가해주세요"}
        </Text>

        {/* 위치 */}
        <View className="mb-4">
          <View className="w-full h-[120px] rounded-2xl bg-[#F6E3D8] items-center justify-center">
            <SmallPinIcon size={28} />
          </View>
          <View className="flex-row items-center justify-between mt-2.5">
            <View className="flex-row items-center gap-1.5">
              <SmallPinIcon />
              <Text className="text-sm font-bold text-ink">
                {selectedSpot?.name ?? "위치 선택"}
              </Text>
            </View>
            <Pressable onPress={() => setSheet("spot")} hitSlop={8}>
              <Text className="text-[13px] font-semibold text-coral">위치 수정</Text>
            </Pressable>
          </View>
        </View>

        {/* 캡션 */}
        <View className="bg-white border border-border rounded-2xl p-3.5 mb-4" style={{ minHeight: 88 }}>
          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="이 장소에서의 순간을 기록해보세요..."
            placeholderTextColor="#8C6F63"
            multiline
            maxLength={500}
            className="text-sm text-ink"
            style={{ minHeight: 60, lineHeight: 22, textAlignVertical: "top" }}
          />
        </View>

        {/* 옵션 */}
        <View className="flex-row flex-wrap gap-2 mb-3">
          <Pressable
            onPress={() => setSheet("visibility")}
            className="py-2 px-3.5 bg-white border border-border rounded-full"
          >
            <Text className="text-xs font-semibold text-ink">
              {VIS_LABEL[visibility]} ▾
            </Text>
          </Pressable>

          {!isWish && (
            <Pressable
              onPress={() => setSheet("date")}
              className="py-2 px-3.5 bg-white border border-border rounded-full"
            >
              <Text className="text-xs font-semibold text-ink">
                {formatDot(visitedAt)} ▾
              </Text>
            </Pressable>
          )}
        </View>

        {formError && (
          <Text className="text-xs text-coral-dark mb-4">{formError}</Text>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 20) }}>
        <Pressable
          onPress={submit}
          disabled={submitting}
          className={`w-full items-center py-4 bg-coral rounded-2xl shadow-lg ${
            submitting ? "opacity-50" : ""
          }`}
        >
          <Text className="text-[15px] font-bold text-white">
            {submitting ? "게시 중..." : "게시하기"}
          </Text>
        </Pressable>
      </View>

      <PickerSheet
        visible={sheet === "spot"}
        title="위치 선택"
        options={spotOptions}
        selected={spotId}
        onSelect={setSpotId}
        onClose={() => setSheet(null)}
      />
      <PickerSheet
        visible={sheet === "visibility"}
        title="공개 범위"
        options={visibilityOptions}
        selected={visibility}
        onSelect={setVisibility}
        onClose={() => setSheet(null)}
      />
      <PickerSheet
        visible={sheet === "date"}
        title="방문한 날짜"
        options={dateOptions}
        selected={visitedAt}
        onSelect={setVisitedAt}
        onClose={() => setSheet(null)}
      />
    </View>
  );
}
