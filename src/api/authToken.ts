// 액세스/리프레시 토큰 보관소.
// - client.ts 는 매 요청마다 "동기적으로" 토큰이 필요하므로 메모리에 캐시한다.
// - 영속 저장소는 네이티브=expo-secure-store, 웹=localStorage. 부팅 시 1회 읽고
//   이후에는 쓰기만 백그라운드로 흘려보낸다.

import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "baljachuk.accessToken";
const REFRESH_KEY = "baljachuk.refreshToken";

let accessToken: string | null = null;
let refreshToken: string | null = null;

const isWeb = Platform.OS === "web";

async function persistGet(key: string): Promise<string | null> {
  try {
    if (isWeb) return globalThis.localStorage?.getItem(key) ?? null;
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function persistSet(key: string, value: string | null): Promise<void> {
  try {
    if (value == null) {
      if (isWeb) globalThis.localStorage?.removeItem(key);
      else await SecureStore.deleteItemAsync(key);
      return;
    }
    if (isWeb) globalThis.localStorage?.setItem(key, value);
    else await SecureStore.setItemAsync(key, value);
  } catch {
    // 저장 실패는 조용히 무시한다 (다음 부팅 때 재로그인하면 됨)
  }
}

/** 앱 부팅 시 1회 호출. 저장된 토큰을 메모리로 끌어올린다. */
export async function loadTokens(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
}> {
  const [a, r] = await Promise.all([
    persistGet(ACCESS_KEY),
    persistGet(REFRESH_KEY),
  ]);
  accessToken = a;
  refreshToken = r;
  return { accessToken, refreshToken };
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return refreshToken;
}

/** 로그인 / 토큰 갱신 성공 시. 메모리 + 영속 저장소를 함께 갱신한다. */
export function setTokens(next: {
  accessToken: string;
  refreshToken?: string | null;
}): void {
  accessToken = next.accessToken;
  void persistSet(ACCESS_KEY, next.accessToken);
  if (next.refreshToken !== undefined) {
    refreshToken = next.refreshToken;
    void persistSet(REFRESH_KEY, next.refreshToken);
  }
}

/** 로그아웃 / 세션 만료 시. */
export function clearTokens(): void {
  accessToken = null;
  refreshToken = null;
  void persistSet(ACCESS_KEY, null);
  void persistSet(REFRESH_KEY, null);
}
