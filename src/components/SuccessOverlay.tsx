import React, { useEffect, useRef } from "react";
import { Animated, View, Text, AccessibilityInfo } from "react-native";

/**
 * 게시 성공 시 잠깐 뜨는 체크 오버레이. ~950ms 뒤 onDone 호출.
 * 화면 전체를 덮어 그동안의 상태 전환(뒤로가기)을 감춘다.
 */
export default function SuccessOverlay({
  visible,
  message = "게시 완료!",
  onDone,
}: {
  visible: boolean;
  message?: string;
  onDone: () => void;
}) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    AccessibilityInfo.announceForAccessibility?.(message);
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 130,
        useNativeDriver: true,
      }),
    ]).start();
    const t = setTimeout(onDone, 950);
    return () => clearTimeout(t);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,246,241,0.94)",
      }}
    >
      <Animated.View style={{ transform: [{ scale }], alignItems: "center" }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            backgroundColor: "#FF6B45",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 36, fontWeight: "900", lineHeight: 40 }}>
            ✓
          </Text>
        </View>
        <Text style={{ fontSize: 16, fontWeight: "800", color: "#2B1710" }}>
          {message}
        </Text>
      </Animated.View>
    </Animated.View>
  );
}
