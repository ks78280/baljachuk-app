import React from "react";
import { Modal, View, Text, Pressable, ScrollView } from "react-native";

export interface PickerOption<T> {
  label: string;
  value: T;
  sublabel?: string;
  disabled?: boolean;
}

interface PickerSheetProps<T extends string> {
  visible: boolean;
  title: string;
  options: PickerOption<T>[];
  selected: T | null;
  onSelect: (value: T) => void;
  onClose: () => void;
}

/** 하단에서 올라오는 옵션 선택 시트. 위치·공개범위·날짜 선택에 공용. */
export default function PickerSheet<T extends string>({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: PickerSheetProps<T>) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable
          className="bg-white rounded-t-3xl px-5 pt-4 pb-8"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="items-center pb-3">
            <View className="w-9 h-1 rounded-full bg-border" />
          </View>
          <Text className="text-[15px] font-bold text-ink mb-2">{title}</Text>

          <ScrollView style={{ maxHeight: 320 }}>
            {options.map((opt) => {
              const active = opt.value === selected;
              return (
                <Pressable
                  key={opt.value}
                  disabled={opt.disabled}
                  onPress={() => {
                    onSelect(opt.value);
                    onClose();
                  }}
                  className="flex-row items-center justify-between py-3.5 border-b border-border"
                  style={opt.disabled ? { opacity: 0.35 } : undefined}
                >
                  <View>
                    <Text
                      className={`text-sm ${
                        active ? "font-bold text-coral" : "font-medium text-ink"
                      }`}
                    >
                      {opt.label}
                    </Text>
                    {opt.sublabel && (
                      <Text className="text-[11px] text-ink-muted mt-0.5">
                        {opt.sublabel}
                      </Text>
                    )}
                  </View>
                  {active && <Text className="text-coral text-sm font-bold">✓</Text>}
                </Pressable>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
