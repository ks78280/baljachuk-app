import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { CameraIcon, GalleryIcon } from "./icons";

function SheetShell({
  onClose,
  children,
}: {
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
      <Pressable
        className="bg-white rounded-t-3xl px-5 pt-4 pb-9"
        onPress={(e) => e.stopPropagation()}
      >
        <View className="items-center pb-3">
          <View className="w-9 h-1 rounded-full bg-border" />
        </View>
        {children}
      </Pressable>
    </Pressable>
  );
}

function Row({
  icon,
  label,
  sub,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  sub?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3.5 py-3.5"
      android_ripple={{ color: "#F3E2D8" }}
    >
      <View className="w-10 h-10 rounded-full bg-coral-soft items-center justify-center">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-[15px] font-semibold text-ink">{label}</Text>
        {sub ? <Text className="text-[11px] text-ink-muted mt-0.5">{sub}</Text> : null}
      </View>
    </Pressable>
  );
}

/** 사진 소스 선택 시트 (기본 Alert 대체). */
export function PhotoSourceSheet({
  visible,
  onPick,
  onClose,
}: {
  visible: boolean;
  onPick: (source: "camera" | "library") => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SheetShell onClose={onClose}>
        <Text className="text-[15px] font-bold text-ink mb-1 px-1">사진 추가</Text>
        <Row
          icon={<CameraIcon size={20} />}
          label="카메라로 촬영"
          onPress={() => onPick("camera")}
        />
        <View className="h-px bg-border" />
        <Row
          icon={<GalleryIcon size={20} />}
          label="앨범에서 선택"
          sub="여러 장 선택 가능"
          onPress={() => onPick("library")}
        />
      </SheetShell>
    </Modal>
  );
}

/** 권한이 막혔을 때(다시 묻기 불가) 설정으로 안내하는 시트. */
export function PermissionSheet({
  visible,
  kind,
  onOpenSettings,
  onClose,
}: {
  visible: boolean;
  kind: "camera" | "library" | null;
  onOpenSettings: () => void;
  onClose: () => void;
}) {
  const what = kind === "camera" ? "카메라" : "사진";
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SheetShell onClose={onClose}>
        <Text className="text-[15px] font-bold text-ink mb-1.5 px-1">
          {what} 접근 권한이 필요해요
        </Text>
        <Text className="text-[13px] text-ink-muted leading-5 px-1 mb-4">
          기록에 사진을 넣으려면 설정에서 {what} 권한을 허용해주세요. 권한은 사진을
          첨부할 때만 사용하고, 다른 용도로 쓰지 않아요.
        </Text>
        <Pressable
          onPress={onOpenSettings}
          className="items-center py-3.5 rounded-2xl bg-coral mb-2"
        >
          <Text className="text-[15px] font-bold text-white">설정 열기</Text>
        </Pressable>
        <Pressable onPress={onClose} className="items-center py-2.5">
          <Text className="text-[13px] font-semibold text-ink-muted">나중에</Text>
        </Pressable>
      </SheetShell>
    </Modal>
  );
}
