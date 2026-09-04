import React, { useEffect, useRef } from "react";
import {
  Animated,
  View,
  ScrollView,
  StyleProp,
  ViewStyle,
  DimensionValue,
} from "react-native";

/** 은은하게 깜빡이는 회색 박스. 스켈레톤의 기본 단위. */
export function SkeletonBox({
  w = "100%",
  h,
  radius = 8,
  style,
}: {
  w?: DimensionValue;
  h: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const opacity = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 650, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.55, duration: 650, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        { width: w, height: h, borderRadius: radius, backgroundColor: "#ECDFD7", opacity },
        style,
      ]}
    />
  );
}

function Line({ w, h = 12 }: { w: DimensionValue; h?: number }) {
  return <SkeletonBox w={w} h={h} radius={h / 2} />;
}

/** 타임라인/스팟상세의 기록 카드 스켈레톤 */
export function RecordCardSkeleton() {
  return (
    <View className="bg-white border border-border rounded-2xl overflow-hidden">
      <View className="flex-row items-center gap-2.5 p-3.5">
        <SkeletonBox w={32} h={32} radius={16} />
        <View className="gap-1.5">
          <Line w={90} h={11} />
          <Line w={140} h={9} />
        </View>
      </View>
      <SkeletonBox w="100%" h={180} radius={0} />
      <View className="p-3.5 gap-2.5">
        <Line w="90%" />
        <Line w="55%" />
        <View className="flex-row gap-3.5 pt-1">
          <SkeletonBox w={44} h={14} radius={7} />
          <SkeletonBox w={44} h={14} radius={7} />
        </View>
      </View>
    </View>
  );
}

export function TimelineSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="flex-1 px-5" style={{ gap: 16, paddingTop: 4 }}>
      {Array.from({ length: count }).map((_, i) => (
        <RecordCardSkeleton key={i} />
      ))}
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <View className="flex-1">
      <View className="px-5 pt-3.5 pb-4 items-center gap-3">
        <SkeletonBox w={76} h={76} radius={38} />
        <Line w={120} h={16} />
        <Line w={220} h={11} />
        <View className="flex-row gap-7 pt-1">
          {[0, 1, 2].map((i) => (
            <View key={i} className="items-center gap-1.5">
              <SkeletonBox w={28} h={16} />
              <Line w={44} h={9} />
            </View>
          ))}
        </View>
        <SkeletonBox w="100%" h={40} radius={12} style={{ marginTop: 6 }} />
      </View>
      <View className="px-5 pt-4">
        <SkeletonBox w="100%" h={240} radius={16} />
      </View>
    </View>
  );
}

export function RecordDetailSkeleton({ photoHeight = 260 }: { photoHeight?: number }) {
  return (
    <View className="flex-1">
      <View className="flex-row items-center gap-2.5 px-5 pb-3">
        <SkeletonBox w={32} h={32} radius={16} />
        <View className="gap-1.5">
          <Line w={90} h={12} />
          <Line w={130} h={10} />
        </View>
      </View>
      <SkeletonBox w="100%" h={photoHeight} radius={0} />
      <View className="px-5 py-3 gap-2">
        <Line w="95%" />
        <Line w="80%" />
      </View>
      <View className="px-5 gap-3 pt-3">
        {[0, 1].map((i) => (
          <View key={i} className="flex-row gap-2.5">
            <SkeletonBox w={28} h={28} radius={14} />
            <View className="flex-1 gap-1.5">
              <Line w={110} h={10} />
              <Line w="70%" h={11} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function SpotDetailSkeleton() {
  return (
    <View className="flex-1">
      <View className="px-5 pb-4 gap-3">
        <SkeletonBox w="100%" h={140} radius={16} />
        <Line w={140} h={16} />
        <Line w={100} h={11} />
        <Line w={80} h={10} />
      </View>
      <View className="h-px bg-border mx-5 mb-3" />
      <View className="px-5" style={{ gap: 14 }}>
        <RecordCardSkeleton />
        <RecordCardSkeleton />
      </View>
    </View>
  );
}

export function ExploreSkeleton() {
  return (
    <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
      <View className="px-5 pt-2">
        <Line w={140} h={11} />
      </View>
      <View className="pt-5 px-5">
        <Line w={110} h={13} />
        <View className="flex-row gap-2.5 pt-2.5">
          {[0, 1, 2].map((i) => (
            <View key={i} className="gap-1.5">
              <SkeletonBox w={132} h={96} radius={12} />
              <Line w={80} h={11} />
              <Line w={50} h={9} />
            </View>
          ))}
        </View>
      </View>
      <View className="px-5 pt-6 gap-2.5">
        <Line w={90} h={13} />
        <View className="flex-row flex-wrap gap-2">
          {[48, 40, 44, 64, 52].map((w, i) => (
            <SkeletonBox key={i} w={w} h={30} radius={15} />
          ))}
        </View>
      </View>
      <View className="px-5 pt-6 gap-4">
        <Line w={150} h={13} />
        {[0, 1].map((i) => (
          <View key={i} className="flex-row items-center gap-3">
            <SkeletonBox w={44} h={44} radius={22} />
            <View className="flex-1 gap-1.5">
              <Line w={110} h={11} />
              <Line w={160} h={9} />
            </View>
            <SkeletonBox w={64} h={28} radius={14} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export function SearchRowsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <View className="pt-1">
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} className="flex-row items-center gap-3 px-5 py-3">
          <SkeletonBox w={44} h={44} radius={22} />
          <View className="flex-1 gap-1.5">
            <Line w={110} h={11} />
            <Line w={150} h={9} />
          </View>
          <SkeletonBox w={64} h={28} radius={14} />
        </View>
      ))}
    </View>
  );
}
