// 액세스 토큰 보관소. 지금은 메모리에만 두고, 실제 로그인 붙일 때
// expo-secure-store 등으로 영속화하면 된다. (set/get 인터페이스는 유지)

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
