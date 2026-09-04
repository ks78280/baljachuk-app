import { Platform } from "react-native";
import { USE_MOCK, BASE_URL } from "./client";
import { getAccessToken } from "./authToken";
import { ApiRequestError } from "../types/api";

/**
 * 로컬 사진 URI(카메라/갤러리) → 서버에 업로드하고 공개 URL 배열을 돌려준다.
 * 목 모드에서는 로컬 URI 를 그대로 쓴다(웹의 blob:/data: 는 목 DB 에 그냥 저장돼도 됨).
 * 실배포에서는 S3 pre-signed URL 방식으로 교체 (설계서 §7.3, Phase 7).
 */
export async function uploadPhotos(localUris: string[]): Promise<string[]> {
  if (localUris.length === 0) return [];
  if (USE_MOCK) return localUris;

  const form = new FormData();
  for (let i = 0; i < localUris.length; i++) {
    const uri = localUris[i];
    const name = `photo_${Date.now()}_${i}.jpg`;
    if (Platform.OS === "web") {
      const blob = await fetch(uri).then((r) => r.blob());
      form.append("files", blob, name);
    } else {
      // RN 의 FormData 는 { uri, name, type } 파일 디스크립터를 받는다
      form.append("files", { uri, name, type: "image/jpeg" } as unknown as Blob);
    }
  }

  const token = getAccessToken();
  const res = await fetch(`${BASE_URL.replace(/\/?$/, "")}/uploads`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });

  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.data?.urls) {
    throw new ApiRequestError(
      json?.error ?? { code: "UPLOAD_FAILED", message: "사진 업로드에 실패했어요" }
    );
  }
  return json.data.urls as string[];
}
