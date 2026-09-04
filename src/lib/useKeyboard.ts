import { useEffect, useState } from "react";
import { Keyboard, KeyboardEvent, Platform } from "react-native";

/**
 * 현재 소프트 키보드 높이(px). 닫혀 있으면 0.
 *
 * KeyboardAvoidingView가 Android(특히 Expo Go / 삼성 키보드)에서 잘 안 먹어,
 * 이 값을 컨테이너 paddingBottom으로 직접 넣어 하단 입력바를 키보드 위로 올린다.
 *
 * - `keyboardDidChangeFrame` 도 구독: 삼성 키보드 상단 툴바가 키보드 뒤에 붙으며
 *   프레임이 커지는 경우를 반영.
 * - `extra`: 키보드 위로 더 띄울 여유(px). 미지정 시 Android는 삼성 툴바를 감안한
 *   기본 여유(44)를 둔다.
 */
const DEFAULT_EXTRA_ANDROID = 44;

export function useKeyboardHeight(extra?: number): number {
  const [height, setHeight] = useState(0);
  const pad = extra ?? (Platform.OS === "android" ? DEFAULT_EXTRA_ANDROID : 0);

  useEffect(() => {
    const showEvt = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onFrame = (e: KeyboardEvent) => {
      const h = e.endCoordinates?.height ?? 0;
      setHeight(h > 1 ? h : 0);
    };
    const onHide = () => setHeight(0);

    const subs = [
      Keyboard.addListener(showEvt, onFrame),
      Keyboard.addListener("keyboardDidChangeFrame", onFrame),
      Keyboard.addListener(hideEvt, onHide),
    ];
    return () => subs.forEach((s) => s.remove());
  }, []);

  return height > 0 ? height + pad : 0;
}
