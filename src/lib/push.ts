import { Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";

// 앱이 포그라운드일 때도 배너/사운드 노출
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/**
 * 푸시 권한 요청 + Expo push token 발급.
 * 웹 / 시뮬레이터 / 권한 거부 시 null (호출부에서 무시).
 * 실제 전달은 실기기 + Expo Go(개발) 또는 EAS 빌드에서만.
 */
export async function registerForPush(): Promise<string | null> {
  try {
    if (Platform.OS === "web") return null;

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "기본",
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== "granted") {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== "granted") return null;

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;
    const token = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    return token.data ?? null;
  } catch {
    return null;
  }
}
