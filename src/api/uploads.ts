import { Platform } from "react-native";
import { USE_MOCK, BASE_URL, runRefresh } from "./client";
import { getAccessToken } from "./authToken";
import { ApiRequestError } from "../types/api";

const UPLOADS_URL = `${BASE_URL.replace(/\/?$/, "")}/uploads`;

interface RawResponse {
  status: number;
  body: string;
}

/** localUris → FormData. */
async function buildForm(localUris: string[]): Promise<FormData> {
  const form = new FormData();
  for (let i = 0; i < localUris.length; i++) {
    const uri = localUris[i];
    const name = `photo_${Date.now()}_${i}.jpg`;
    if (Platform.OS === "web") {
      const blob = await fetch(uri).then((r) => r.blob());
      form.append("files", blob, name);
    } else {
      // RN 네이티브 FormData 파일 파트. XMLHttpRequest 경로에서만 지원됨
      // (Expo 의 전역 fetch 폴리필은 { uri, name, type } 를 못 다룸).
      form.append("files", { uri, name, type: "image/jpeg" } as unknown as Blob);
    }
  }
  return form;
}

/**
 * 네이티브: XMLHttpRequest 로 전송한다. Expo SDK 53+ 는 전역 fetch 를
 * spec 준수 폴리필로 교체하는데, 그 폴리필의 FormData 변환기가 RN 의
 * `{ uri }` 파일 파트를 지원하지 않아 "Unsupported FormDataPart implementation"
 * 로 터진다. XHR 은 네이티브 네트워킹 모듈을 그대로 타므로 파일 업로드가 된다.
 */
function sendNative(form: FormData): Promise<RawResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", UPLOADS_URL);
    const token = getAccessToken();
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    // Content-Type 은 설정하지 않는다 — RN 이 multipart boundary 를 붙인다.
    xhr.timeout = 60000;
    xhr.onload = () => resolve({ status: xhr.status, body: xhr.responseText });
    xhr.onerror = () => reject(new Error("네트워크 오류"));
    xhr.ontimeout = () => reject(new Error("시간 초과"));
    xhr.send(form);
  });
}

async function sendWeb(form: FormData): Promise<RawResponse> {
  const token = getAccessToken();
  const res = await fetch(UPLOADS_URL, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  return { status: res.status, body: await res.text().catch(() => "") };
}

const send = Platform.OS === "web" ? sendWeb : sendNative;

/**
 * 로컬 사진 URI(카메라/갤러리) → 서버에 업로드하고 공개 URL 배열을 돌려준다.
 * 목 모드에서는 로컬 URI 를 그대로 쓴다.
 * 실패 시 원인을 담은 ApiRequestError 를 던진다(호출부가 화면에 노출).
 */
export async function uploadPhotos(localUris: string[]): Promise<string[]> {
  if (localUris.length === 0) return [];
  if (USE_MOCK) return localUris;

  let res: RawResponse;
  try {
    res = await send(await buildForm(localUris));
  } catch (e) {
    throw new ApiRequestError({
      code: "UPLOAD_NETWORK",
      message: `업로드 통신 실패: ${(e as Error).message} (${localUris.length}장)`,
    });
  }

  // 401 → refresh 1회 후 재시도
  if (res.status === 401 && (await runRefresh())) {
    try {
      res = await send(await buildForm(localUris));
    } catch (e) {
      throw new ApiRequestError({
        code: "UPLOAD_NETWORK",
        message: `업로드 재시도 실패: ${(e as Error).message}`,
      });
    }
  }

  let json: { data?: { urls?: string[] }; error?: { code: string; message: string } } | null = null;
  try {
    json = res.body ? JSON.parse(res.body) : null;
  } catch {
    /* 아래에서 처리 */
  }

  if (res.status < 200 || res.status >= 300 || !json?.data?.urls) {
    if (json?.error) throw new ApiRequestError(json.error);
    throw new ApiRequestError({
      code: `UPLOAD_HTTP_${res.status}`,
      message: `업로드 실패 (HTTP ${res.status}) ${res.body.slice(0, 140)}`,
    });
  }
  return json.data.urls;
}
