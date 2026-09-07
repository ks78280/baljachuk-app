import { Platform, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";

/** 기록 1건에 첨부 가능한 최대 사진 수 */
export const MAX_PHOTOS = 5;

export type PhotoSource = "camera" | "library";

export type PickResult =
  | { status: "ok"; uris: string[] }
  | { status: "canceled" }
  | { status: "blocked" }; // 권한 거부 + 다시 묻기 불가 → 설정으로 안내 필요

/** 권한 확보. 미결정이면 요청, 거부+재요청불가면 "blocked". */
async function ensurePermission(source: PhotoSource): Promise<"granted" | "blocked"> {
  if (Platform.OS === "web") return "granted";
  const get =
    source === "camera"
      ? ImagePicker.getCameraPermissionsAsync
      : ImagePicker.getMediaLibraryPermissionsAsync;
  const request =
    source === "camera"
      ? ImagePicker.requestCameraPermissionsAsync
      : ImagePicker.requestMediaLibraryPermissionsAsync;

  let perm = await get();
  if (perm.granted) return "granted";
  if (perm.canAskAgain) perm = await request();
  return perm.granted ? "granted" : "blocked";
}

/**
 * 사진 선택/촬영. 권한 처리 포함.
 * - camera: 1장 (편집 허용)
 * - library: 최대 remaining 장 다중 선택
 */
export async function pickPhotos(
  source: PhotoSource,
  remaining: number
): Promise<PickResult> {
  if (remaining <= 0) return { status: "canceled" };

  const perm = await ensurePermission(source);
  if (perm === "blocked") return { status: "blocked" };

  const res =
    source === "camera"
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ["images"],
          allowsEditing: true,
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          allowsMultipleSelection: true,
          selectionLimit: remaining,
          quality: 0.8,
        });

  if (res.canceled) return { status: "canceled" };
  return { status: "ok", uris: res.assets.map((a) => a.uri).slice(0, remaining) };
}

/** OS 앱 설정 화면 열기 (권한 blocked 안내에서 사용). */
export function openAppSettings() {
  Linking.openSettings().catch(() => {});
}
