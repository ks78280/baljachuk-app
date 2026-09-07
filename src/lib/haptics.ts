import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

const enabled = Platform.OS !== "web";

/** 가벼운 촉각 피드백. 웹에선 no-op, 실패는 무시. */
export const haptic = {
  light: () =>
    enabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  medium: () =>
    enabled && Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
  success: () =>
    enabled &&
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
  warning: () =>
    enabled &&
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {}),
};
