import { Platform, Linking, Image as RNImage } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
// 클래식 API(getAssetsAsync/MediaType/SortBy) 는 SDK 54부터 /legacy 로 이동
import * as MediaLibrary from "expo-media-library/legacy";

/** 기록 1건에 첨부 가능한 최대 사진 수 */
export const MAX_PHOTOS = 5;

/** 업로드 전 리사이즈 상한 (긴 변 기준). */
const MAX_DIMENSION = 1600;

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

function getSize(uri: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    RNImage.getSize(
      uri,
      (w, h) => resolve({ w, h }),
      () => resolve({ w: 0, h: 0 })
    );
  });
}

/**
 * 업로드 전 정규화 — 긴 변 1600px 로 축소 + JPEG 82% 압축.
 * 카메라/앨범/최근사진 어느 경로로 들어왔든 일관된 크기로 만든다.
 * 실패하거나 이미 작으면 원본 uri 를 그대로 돌려준다.
 */
export async function normalizePhotos(uris: string[]): Promise<string[]> {
  if (Platform.OS === "web") return uris;
  return Promise.all(
    uris.map(async (uri) => {
      try {
        const { w, h } = await getSize(uri);
        const longest = Math.max(w, h);
        const actions =
          longest > MAX_DIMENSION
            ? [
                w >= h
                  ? { resize: { width: MAX_DIMENSION } }
                  : { resize: { height: MAX_DIMENSION } },
              ]
            : [];
        const out = await ImageManipulator.manipulateAsync(uri, actions, {
          compress: 0.82,
          format: ImageManipulator.SaveFormat.JPEG,
        });
        return out.uri;
      } catch {
        return uri;
      }
    })
  );
}

export type RecentPhotosResult =
  | { status: "ok"; assets: { id: string; uri: string }[] }
  | { status: "undetermined" }
  | { status: "blocked" }
  | { status: "unsupported" };

/** 기기 최근 사진 N장 (인앱 빠른 첨부 스트립용). 권한은 요청하지 않고 상태만 본다. */
export async function getRecentPhotos(limit = 15): Promise<RecentPhotosResult> {
  if (Platform.OS === "web") return { status: "unsupported" };
  const perm = await MediaLibrary.getPermissionsAsync();
  if (!perm.granted) {
    return perm.canAskAgain ? { status: "undetermined" } : { status: "blocked" };
  }
  const page = await MediaLibrary.getAssetsAsync({
    first: limit,
    mediaType: MediaLibrary.MediaType.photo,
    sortBy: [[MediaLibrary.SortBy.creationTime, false]],
  });
  return {
    status: "ok",
    assets: page.assets.map((a) => ({ id: a.id, uri: a.uri })),
  };
}

/** 최근사진 스트립 권한 요청. granted 여부 반환. */
export async function requestRecentPhotosPermission(): Promise<boolean> {
  const perm = await MediaLibrary.requestPermissionsAsync();
  return perm.granted;
}
