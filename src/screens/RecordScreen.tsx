import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import Img from "../components/Img";
import { BackIcon, CameraIcon, SmallPinIcon } from "../components/icons";
import PickerSheet, { PickerOption } from "../components/PickerSheet";
import LocationPickerModal, { PickedLocation } from "../components/LocationPickerModal";
import CalendarSheet from "../components/CalendarSheet";
import { PhotoSourceSheet, PermissionSheet } from "../components/PhotoSourceSheet";
import RecentPhotosStrip from "../components/RecentPhotosStrip";
import SuccessOverlay from "../components/SuccessOverlay";
import {
  MAX_PHOTOS,
  pickPhotos,
  normalizePhotos,
  openAppSettings,
  type PhotoSource,
} from "../lib/imagePicker";
import { haptic } from "../lib/haptics";
import { useKeyboardHeight } from "../lib/useKeyboard";
import { todayISO, formatDot } from "../lib/date";
import { createRecord } from "../api/records";
import { uploadPhotos } from "../api/uploads";
import { useRecordDetail, useUpdateRecord } from "../hooks/queries";
import { RecordType, Visibility } from "../types/models";

const VIS_LABEL: Record<Visibility, string> = {
  PUBLIC: "전체 공개",
  FRIENDS: "친구 공개",
  PRIVATE: "비공개",
};

type SheetKind = "spot" | "visibility" | "date";

export default function RecordScreen({
  onBack,
  editRecordId,
}: {
  onBack: () => void;
  editRecordId?: string;
}) {
  const insets = useSafeAreaInsets();
  const kb = useKeyboardHeight();
  const queryClient = useQueryClient();

  const editing = !!editRecordId;
  const { data: editRecord } = useRecordDetail(editRecordId ?? "");
  const updateRecord = useUpdateRecord(editRecordId ?? "");

  const [type, setType] = useState<RecordType>("VISITED");
  const [picked, setPicked] = useState<PickedLocation | null>(null);
  const [caption, setCaption] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("FRIENDS");
  const [visitedAt, setVisitedAt] = useState<string>(todayISO());
  const [photos, setPhotos] = useState<string[]>([]);

  const [sheet, setSheet] = useState<SheetKind | null>(null);
  const [photoSheet, setPhotoSheet] = useState(false);
  const [permBlocked, setPermBlocked] = useState<PhotoSource | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadPct, setUploadPct] = useState<number | null>(null);
  const [posted, setPosted] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  // 수정 모드: 기존 기록 값으로 1회 프리필
  useEffect(() => {
    if (!editing || prefilled || !editRecord) return;
    setType(editRecord.type);
    setCaption(editRecord.caption);
    setVisibility(editRecord.visibility);
    setVisitedAt(editRecord.visitedAt ?? todayISO());
    setPhotos(editRecord.photos.map((p) => p.originalUrl));
    setPrefilled(true);
  }, [editing, prefilled, editRecord]);

  // 수정 모드에서 스팟 이름 표시용 (위치는 수정 불가)
  const editSpotName = editRecord?.spot.name ?? null;

  const isWish = type === "WISH";

  function changeType(next: RecordType) {
    setType(next);
    setFormError(null);
    // 위시(가고 싶은 곳)는 비공개를 허용하지 않음 (설계서 9.2)
    if (next === "WISH" && visibility === "PRIVATE") setVisibility("FRIENDS");
  }

  // ── 사진 ─────────────────────────────
  async function appendPhotos(uris: string[]) {
    if (uris.length === 0) return;
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) return;
    const normalized = await normalizePhotos(uris.slice(0, room));
    haptic.light();
    setFormError(null);
    setPhotos((prev) => [...prev, ...normalized].slice(0, MAX_PHOTOS));
  }
  function removePhoto(index: number) {
    haptic.light();
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }
  function addPhoto() {
    if (MAX_PHOTOS - photos.length <= 0) return;
    haptic.light();
    setPhotoSheet(true);
  }
  async function onPickSource(source: PhotoSource) {
    setPhotoSheet(false);
    const remaining = MAX_PHOTOS - photos.length;
    const r = await pickPhotos(source, remaining);
    if (r.status === "ok") void appendPhotos(r.uris);
    else if (r.status === "blocked") setPermBlocked(source);
  }

  // ── 시트 옵션 ─────────────────────────
  const visibilityOptions: PickerOption<Visibility>[] = [
    { label: VIS_LABEL.PUBLIC, value: "PUBLIC" },
    { label: VIS_LABEL.FRIENDS, value: "FRIENDS" },
    { label: VIS_LABEL.PRIVATE, value: "PRIVATE", disabled: isWish },
  ];

  // ── 제출 ─────────────────────────────
  async function submit() {
    if (submitting) return;

    // 수정 모드: 캡션/공개범위만 반영
    if (editing) {
      setSubmitting(true);
      setFormError(null);
      updateRecord.mutate(
        { caption: caption.trim(), visibility },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["timeline"] });
            queryClient.invalidateQueries({ queryKey: ["spot-records"] });
            onBack();
          },
          onError: () => {
            setFormError("수정에 실패했습니다. 잠시 후 다시 시도해주세요");
            setSubmitting(false);
          },
        }
      );
      return;
    }

    if (!picked) {
      setFormError("위치를 선택해주세요");
      return;
    }
    if (!isWish && photos.length === 0) {
      setFormError("사진을 1장 이상 추가해주세요");
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setUploadPct(isWish ? null : 0);
    try {
      // 로컬 사진 URI → 서버 업로드(목이면 그대로) → 받은 URL로 기록 생성
      const photoUrls = isWish
        ? []
        : await uploadPhotos(photos, (p) => setUploadPct(p));
      await createRecord({
        type,
        spot: {
          name: picked.name,
          latitude: picked.latitude,
          longitude: picked.longitude,
          address: picked.address ?? undefined,
        },
        caption: caption.trim(),
        photoUrls,
        visibility,
        visitedAt: isWish ? null : visitedAt,
      });
      queryClient.invalidateQueries({ queryKey: ["timeline"] });
      queryClient.invalidateQueries({ queryKey: ["map-records"] });
      queryClient.invalidateQueries({ queryKey: ["my-records"] });
      haptic.success();
      setPosted(true); // 성공 오버레이 → onDone 에서 onBack
    } catch (e) {
      console.warn("[record submit]", e);
      haptic.warning();
      const msg = e instanceof Error ? e.message : String(e);
      setFormError(msg || "게시에 실패했습니다. 잠시 후 다시 시도해주세요");
    } finally {
      setSubmitting(false);
      setUploadPct(null);
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
        <Text className="text-base font-bold text-ink">
          {editing ? "기록 수정" : "기록 작성"}
        </Text>
        <Pressable
          onPress={submit}
          disabled={submitting}
          className={`py-1.5 px-4 bg-coral rounded-full ${submitting ? "opacity-50" : ""}`}
        >
          <Text className="text-[13px] font-bold text-white">
            {submitting ? (editing ? "저장 중" : "게시 중") : editing ? "저장" : "게시"}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 4 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* 유형 선택 (수정 모드에선 잠금) */}
        <View className="flex-row bg-coral-soft rounded-2xl p-1 mb-4.5">
          {(["VISITED", "WISH"] as RecordType[]).map((t) => {
            const active = type === t;
            return (
              <Pressable
                key={t}
                onPress={() => !editing && changeType(t)}
                disabled={editing}
                className={`flex-1 items-center py-2.5 rounded-xl ${active ? "bg-coral" : ""} ${
                  editing && !active ? "opacity-40" : ""
                }`}
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
        {editing && (
          <Text className="text-[11px] text-ink-muted -mt-3 mb-3">
            수정에서는 캡션과 공개 범위만 바꿀 수 있어요
          </Text>
        )}

        {/* 사진 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-2 -mx-5"
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
          {photos.map((uri, index) => (
            <View key={`${uri}-${index}`} className="relative">
              <Img
                source={{ uri }}
                className="w-[104px] h-[104px] rounded-2xl bg-coral-soft"
              />
              {index === 0 && photos.length > 1 && (
                <View className="absolute bottom-1.5 left-1.5 bg-black/55 rounded-full px-2 py-0.5">
                  <Text className="text-[10px] font-bold text-white">대표</Text>
                </View>
              )}
              {!editing && (
                <Pressable
                  onPress={() => removePhoto(index)}
                  hitSlop={8}
                  className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(43,23,16,0.82)" }}
                >
                  <Text className="text-white text-[13px] leading-none">×</Text>
                </Pressable>
              )}
            </View>
          ))}

          {canAddMore && !editing && (
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
          {editing
            ? "사진과 위치는 수정할 수 없어요"
            : isWish
              ? "위시는 사진 없이 등록할 수 있어요"
              : "사진을 1장 이상 추가해주세요"}
        </Text>

        {/* 최근 사진 빠른 첨부 (네이티브) */}
        {!editing && Platform.OS !== "web" && (
          <RecentPhotosStrip
            onPick={(uri) => void appendPhotos([uri])}
            disabled={!canAddMore}
          />
        )}

        {/* 위치 */}
        <View className="mb-4">
          <Pressable
            onPress={() => !editing && setSheet("spot")}
            disabled={editing}
            className="w-full rounded-2xl bg-[#F6E3D8] items-center justify-center py-6 gap-1.5"
          >
            <SmallPinIcon size={26} />
            <Text className="text-sm font-bold text-ink">
              {editing ? editSpotName ?? "위치" : picked?.name ?? "지도에서 위치 선택"}
            </Text>
            {!editing && picked?.address ? (
              <Text className="text-[11px] text-ink-muted">{picked.address}</Text>
            ) : null}
            {!editing && (
              <Text className="text-[12px] font-semibold text-coral mt-0.5">
                {picked ? "위치 변경" : "지도 열기"}
              </Text>
            )}
          </Pressable>
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
              onPress={() => !editing && setSheet("date")}
              disabled={editing}
              className="py-2 px-3.5 bg-white border border-border rounded-full"
            >
              <Text className="text-xs font-semibold text-ink">
                {formatDot(visitedAt)}{editing ? "" : " ▾"}
              </Text>
            </Pressable>
          )}
        </View>

        {formError && (
          <Text className="text-xs text-coral-dark mb-4">{formError}</Text>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: Math.max(insets.bottom, 20) }}>
        {submitting && !isWish && uploadPct != null && (
          <View className="h-1.5 rounded-full bg-coral-soft mb-2.5 overflow-hidden">
            <View
              className="h-full bg-coral rounded-full"
              style={{ width: `${Math.round(uploadPct * 100)}%` }}
            />
          </View>
        )}
        <Pressable
          onPress={submit}
          disabled={submitting}
          className={`w-full items-center py-4 bg-coral rounded-2xl shadow-lg ${
            submitting ? "opacity-60" : ""
          }`}
        >
          <Text className="text-[15px] font-bold text-white">
            {editing
              ? submitting
                ? "저장 중..."
                : "저장하기"
              : submitting
                ? uploadPct != null && uploadPct < 1
                  ? `사진 업로드 ${Math.round(uploadPct * 100)}%`
                  : "게시하는 중..."
                : "게시하기"}
          </Text>
        </Pressable>
      </View>

      <LocationPickerModal
        visible={sheet === "spot"}
        initial={picked ? { lat: picked.latitude, lng: picked.longitude } : null}
        onPick={(loc) => {
          setPicked(loc);
          setFormError(null);
          setSheet(null);
        }}
        onClose={() => setSheet(null)}
      />
      <PhotoSourceSheet
        visible={photoSheet}
        onPick={onPickSource}
        onClose={() => setPhotoSheet(false)}
      />
      <PermissionSheet
        visible={!!permBlocked}
        kind={permBlocked}
        onOpenSettings={() => {
          setPermBlocked(null);
          openAppSettings();
        }}
        onClose={() => setPermBlocked(null)}
      />
      <PickerSheet
        visible={sheet === "visibility"}
        title="공개 범위"
        options={visibilityOptions}
        selected={visibility}
        onSelect={setVisibility}
        onClose={() => setSheet(null)}
      />
      <CalendarSheet
        visible={sheet === "date"}
        value={visitedAt}
        onSelect={setVisitedAt}
        onClose={() => setSheet(null)}
      />

      <SuccessOverlay
        visible={posted}
        message={type === "WISH" ? "담았어요!" : "게시 완료!"}
        onDone={onBack}
      />
    </View>
  );
}
