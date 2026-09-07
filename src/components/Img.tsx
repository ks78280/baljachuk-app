import React from "react";
import { Image as ExpoImage, type ImageProps } from "expo-image";
import { cssInterop } from "nativewind";

// NativeWind 가 expo-image 에는 className→style 매핑을 자동으로 안 걸어줌
cssInterop(ExpoImage, { className: "style" });

/**
 * 앱 공용 이미지. react-native <Image> 대체.
 * - 200ms 페이드 인 (빈칸→툭 튀어나오는 것 방지)
 * - 메모리+디스크 캐시 (재방문 시 즉시 표시)
 * - 기본 contentFit="cover"
 * caller 는 className / style / contentFit / placeholder 로 덮어쓸 수 있음.
 */
export default function Img(props: ImageProps) {
  return (
    <ExpoImage
      transition={200}
      cachePolicy="memory-disk"
      contentFit="cover"
      {...props}
    />
  );
}
