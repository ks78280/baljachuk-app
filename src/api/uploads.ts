import { Platform } from "react-native";
import { USE_MOCK, BASE_URL, runRefresh } from "./client";
import { getAccessToken } from "./authToken";
import { ApiRequestError } from "../types/api";

const UPLOADS_URL = `${BASE_URL.replace(/\/?$/, "")}/uploads`;

/** localUris → FormData. RN 은 { uri, name, type } 파일 디스크립터를 받는다. */
async function buildForm(localUris: string[]): Promise<FormData> {
  const form = new FormData();
  for (let i = 0; i < localUris.length; i++) {
    const uri = localUris[i];
    const name = `photo_${Date.now()}_${i}.jpg`;
    if (Platform.OS === "web") {
      const blob = await fetch(uri).then((r) => r.blob());
      form.append("files", blob, name);
    } else {
      form.append("files", { uri, name, type: "image/jpeg" } as unknown as Blob);
    }
  }
  return form;
}

function postForm(form: FormData): Promise<Response> {
  const token = getAccessToken();
  return fetch(UPLOADS_URL, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
}

/**
 * 로컬 사진 URI(카메라/갤러리) → 서버에 업로드하고 공개 URL 배열을 돌려준다.
 * 목 모드에서는 로컬 URI 를 그대로 쓴다.
 * 실패 시 원인을 담은 ApiRequestError 를 던진다(호출부가 화면에 노출).
 */
export async function uploadPhotos(localUris: string[]): Promise<string[]> {
  if (localUris.length === 0) return [];
  if (USE_MOCK) return localUris;

  const scheme = (localUris[0].split(":")[0] || "?").slice(0, 12);

  let res: Response;
  try {
    res = await postForm(await buildForm(localUris));
  } catch (e) {
    // fetch 자체 실패 = 요청이 기기를 못 벗어남 (대개 URI 를 못 읽음)
    throw new ApiRequestError({
      code: "UPLOAD_NETWORK",
      message: `업로드 통신 실패: ${(e as Error).message} · uri=${scheme}:// (${localUris.length}장)`,
    });
  }

  // 401 → refresh 1회 후 재시도 (uploadPhotos 는 apiFetch 를 안 타므로 여기서 직접)
  if (res.status === 401) {
    const ok = await runRefresh();
    if (ok) {
      try {
        res = await postForm(await buildForm(localUris));
      } catch (e) {
        throw new ApiRequestError({
          code: "UPLOAD_NETWORK",
          message: `업로드 재시도 실패: ${(e as Error).message}`,
        });
      }
    }
  }

  const bodyText = await res.text().catch(() => "");
  let json: { data?: { urls?: string[] }; error?: { code: string; message: string } } | null = null;
  try {
    json = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    /* 아래에서 처리 */
  }

  if (!res.ok || !json?.data?.urls) {
    if (json?.error) throw new ApiRequestError(json.error);
    throw new ApiRequestError({
      code: `UPLOAD_HTTP_${res.status}`,
      message: `업로드 실패 (HTTP ${res.status}) ${bodyText.slice(0, 140)}`,
    });
  }
  return json.data.urls;
}
