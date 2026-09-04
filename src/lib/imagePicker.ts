import { Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

/** 기록 1건에 첨부 가능한 최대 사진 수 */
export const MAX_PHOTOS = 5;

async function hasPermission(kind: "camera" | "library"): Promise<boolean> {
  // 웹은 파일 다이얼로그라 별도 권한 요청이 없다
  if (Platform.OS === "web") return true;
  const res =
    kind === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  return res.granted;
}

/** 카메라로 1장 촬영. 취소하거나 권한이 없으면 null */
export async function takePhoto(): Promise<string | null> {
  if (!(await hasPermission("camera"))) return null;
  const res = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    quality: 0.8,
  });
  return res.canceled ? null : res.assets[0]?.uri ?? null;
}

/** 갤러리에서 최대 remaining장 선택. 취소하거나 권한이 없으면 빈 배열 */
export async function pickFromLibrary(remaining: number): Promise<string[]> {
  if (remaining <= 0) return [];
  if (!(await hasPermission("library"))) return [];
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: true,
    selectionLimit: remaining,
    quality: 0.8,
  });
  return res.canceled ? [] : res.assets.map((a) => a.uri);
}
