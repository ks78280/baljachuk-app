import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { TimelineTab } from "../types/api";
import { useTimeline } from "../hooks/queries";
import { useNav } from "../lib/nav";
import RecordCardView from "../components/RecordCardView";
import { ErrorView, EmptyView } from "../components/states";
import { TimelineSkeleton } from "../components/skeletons";

const TABS: { key: TimelineTab; label: string }[] = [
  { key: "mine", label: "내 기록" },
  { key: "friends", label: "친구 기록" },
];

export default function TimelineScreen() {
  const [tab, setTab] = useState<TimelineTab>("mine");
  const { data, isLoading, isError, error, refetch } = useTimeline(tab);
  const { openRecord } = useNav();

  return (
    <View className="flex-1 bg-bg">
      <View className="px-5 pt-2 pb-3.5">
        <Text className="text-[22px] font-black text-ink mb-3.5">타임라인</Text>
        <View className="flex-row bg-coral-soft rounded-xl p-1 w-[200px]">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <Pressable
                key={t.key}
                onPress={() => setTab(t.key)}
                className={`flex-1 items-center py-2 rounded-lg ${active ? "bg-white" : ""}`}
              >
                <Text
                  className={`text-[13px] ${
                    active ? "font-bold text-coral" : "font-semibold text-ink-muted"
                  }`}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {isLoading ? (
        <TimelineSkeleton />
      ) : isError ? (
        <ErrorView error={error} onRetry={refetch} />
      ) : !data || data.items.length === 0 ? (
        <EmptyView message="아직 기록이 없어요" />
      ) : (
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingBottom: 24, gap: 16 }}
        >
          {data.items.map((record) => (
            <RecordCardView key={record.id} record={record} onPress={openRecord} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}
