import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Img from "../components/Img";
import { BackIcon, CameraIcon } from "../components/icons";
import { useMe, useUpdateMe } from "../hooks/queries";
import { useKeyboardHeight } from "../lib/useKeyboard";
import { pickPhotos } from "../lib/imagePicker";
import { haptic } from "../lib/haptics";
import { ApiRequestError } from "../types/api";

export default function ProfileEditScreen({ onBack }: { onBack: () => void }) {
  const { data } = useMe();
  const updateMe = useUpdateMe();
  const kb = useKeyboardHeight();

  const [nickname, setNickname] = useState(data?.user.nickname ?? "");
  const [bio, setBio] = useState(data?.user.bio ?? "");
  const [image, setImage] = useState<string | null>(data?.user.profileImageUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [prefilled, setPrefilled] = useState(!!data);

  // me 쿼리가 마운트 후에 도착하면 1회 프리필
  useEffect(() => {
    if (prefilled || !data) return;
    setNickname(data.user.nickname);
    setBio(data.user.bio ?? "");
    setImage(data.user.profileImageUrl ?? null);
    setPrefilled(true);
  }, [prefilled, data]);

  const nickOk = nickname.trim().length >= 2;

  async function pickImage() {
    const r = await pickPhotos("library", 1);
    if (r.status === "ok" && r.uris[0]) {
      haptic.light();
      setImage(r.uris[0]);
    }
  }

  function save() {
    if (!nickOk || updateMe.isPending) return;
    setError(null);
    updateMe.mutate(
      {
        nickname: nickname.trim(),
        bio: bio.trim(),
        // 실서버 전환 시엔 presign 업로드 후 URL 로 교체 (Phase 4)
        profileImageUrl: image ?? "",
      },
      {
        onSuccess: onBack,
        onError: (e) =>
          setError(
            e instanceof ApiRequestError && e.code === "NICKNAME_TAKEN"
              ? "이미 사용 중인 닉네임이에요"
              : "저장에 실패했어요. 잠시 후 다시 시도해주세요."
          ),
      }
    );
  }

  return (
    <View className="flex-1 bg-bg" style={{ paddingBottom: kb }}>
      <View className="flex-row items-center justify-between px-4 pt-2 pb-3">
        <Pressable onPress={onBack} hitSlop={10}>
          <BackIcon />
        </Pressable>
        <Text className="text-base font-bold text-ink">프로필 편집</Text>
        <Pressable
          onPress={save}
          disabled={!nickOk || updateMe.isPending}
          className="py-1.5 px-4 rounded-full"
          style={{ backgroundColor: nickOk && !updateMe.isPending ? "#FF6B45" : "#F0C7B7" }}
        >
          {updateMe.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-[13px] font-bold text-white">저장</Text>
          )}
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5" keyboardShouldPersistTaps="handled">
        <View className="items-center py-6">
          <Pressable onPress={pickImage} className="relative">
            {image ? (
              <Img source={{ uri: image }} className="w-24 h-24 rounded-full bg-coral-soft" />
            ) : (
              <View className="w-24 h-24 rounded-full bg-[#FF8A5C]" />
            )}
            <View className="absolute right-0 bottom-0 w-8 h-8 rounded-full bg-white items-center justify-center border border-border">
              <CameraIcon size={16} />
            </View>
          </Pressable>
          <Text className="text-[12px] text-ink-muted mt-2">사진 변경</Text>
        </View>

        <Text className="text-[12px] font-bold text-ink-muted mb-1.5">닉네임</Text>
        <TextInput
          value={nickname}
          onChangeText={setNickname}
          placeholder="2자 이상"
          placeholderTextColor="#B99287"
          maxLength={20}
          className="bg-white border border-border rounded-xl px-4 py-3 text-[15px] text-ink mb-4"
        />

        <Text className="text-[12px] font-bold text-ink-muted mb-1.5">소개</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="나를 한 줄로 소개해보세요"
          placeholderTextColor="#B99287"
          multiline
          maxLength={160}
          className="bg-white border border-border rounded-xl px-4 py-3 text-[15px] text-ink"
          style={{ minHeight: 88, textAlignVertical: "top", lineHeight: 22 }}
        />

        {error && <Text className="text-[13px] text-coral-dark mt-3">{error}</Text>}
      </ScrollView>
    </View>
  );
}
