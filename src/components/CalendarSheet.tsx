import React from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { Calendar } from "react-native-calendars";
import { todayISO } from "../lib/date";

/** 방문 날짜 선택용 캘린더 시트. 미래 날짜는 비활성. */
export default function CalendarSheet({
  visible,
  value,
  onSelect,
  onClose,
  title = "방문한 날짜",
}: {
  visible: boolean;
  value: string;
  onSelect: (iso: string) => void;
  onClose: () => void;
  title?: string;
}) {
  const today = todayISO();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/40 justify-end" onPress={onClose}>
        <Pressable
          className="bg-white rounded-t-3xl px-4 pt-4 pb-8"
          onPress={(e) => e.stopPropagation()}
        >
          <View className="items-center pb-2">
            <View className="w-9 h-1 rounded-full bg-border" />
          </View>
          <Text className="text-[15px] font-bold text-ink mb-1 px-1">{title}</Text>

          <Calendar
            current={value || today}
            maxDate={today}
            onDayPress={(d: { dateString: string }) => {
              onSelect(d.dateString);
              onClose();
            }}
            markedDates={{ [value]: { selected: true, selectedColor: "#FF6B45" } }}
            theme={{
              todayTextColor: "#FF6B45",
              arrowColor: "#FF6B45",
              monthTextColor: "#2B1710",
              textMonthFontWeight: "700",
              textDayFontSize: 14,
              textDisabledColor: "#D9C7BC",
            }}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
