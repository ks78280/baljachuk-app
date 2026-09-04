# baljachuk-app

**발자국(baljachuk)** — 위치 기반 사진 SNS. 하나의 Expo 코드베이스로 **모바일**(카메라·갤러리로 기록 등록)과 **웹**(피드 구경)을 모두 서빙한다.

백엔드: [baljachuk-api](https://github.com/ks78280/baljachuk-api) (NestJS + PostGIS)

핵심 컨셉: 다녀온 장소를 사진과 함께 지도에 남긴다. **24시간이 지난 남의 기록은, 그 장소에 직접 가야 잠금이 풀린다.**

---

## 기술 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | **Expo SDK 57** / React Native 0.86 / React 19 |
| 라우팅 | **Expo Router** (파일 기반, `app/`) |
| 서버 상태 | **@tanstack/react-query v5** — 화면은 훅만 의존, mock↔실서버 전환은 api 모듈에서 |
| 스타일 | **NativeWind v4** (Tailwind for RN) |
| 지도 | **Leaflet + OSM** — 웹은 `<iframe srcDoc>`, 네이티브는 `react-native-webview`로 동일 HTML |
| 인증 | JWT — `expo-secure-store`(네이티브) / `localStorage`(웹), 401 인터셉터 자동 refresh |
| 위치 | `expo-location` (현재 위치 → 스팟 잠금 해제) |
| 푸시 | `expo-notifications` (토큰 등록 배선) |
| E2E | Playwright (웹 스모크) |

## 구조

```
app/                      # Expo Router 라우트 (얇은 어댑터, useRouter/useLocalSearchParams → screen props)
  (auth)/sign-in          #   로그인/회원가입
  (tabs)/                 #   지도 · 탐색 · 타임라인 · 프로필
  record/[id], /new, /[id]/edit
  spot/[id]  search  notifications  settings  feed-manage  wishlist
  messages   chat/[id]
src/
  screens/                # 실제 화면 컴포넌트 (데이터는 훅으로만)
  components/             # RecordCardView, LikeButton, PickerSheet, map/, skeletons, states ...
  api/                    # client.ts(USE_MOCK 플래그 + apiFetch) + 도메인 모듈
  hooks/queries.ts        # React Query 훅 + qk 키 팩토리 (화면은 이것만 씀)
  lib/                    # auth, nav, location, push, useKeyboard, queryClient ...
  mocks/db.ts             # USE_MOCK=true 일 때의 목 데이터 (상태 뮤테이션 포함)
```

**데이터 흐름**: `화면 → hooks/queries.ts → api/도메인모듈 → (USE_MOCK ? mocks/db.ts : apiFetch)`. `apiFetch`는 공통 응답 `{data,error}`를 언래핑하고, 토큰 자동 첨부 + `401 → refresh → 재시도` 인터셉터를 가진다.

---

## 로컬 실행

```bash
npm install
cp .env.example .env        # EXPO_PUBLIC_USE_MOCK, EXPO_PUBLIC_API_BASE_URL

# 목 데이터로 UI만 보기
EXPO_PUBLIC_USE_MOCK=true 로 두고
npx expo start --web        # http://localhost:8081

# 실 백엔드 연결 (baljachuk-api 를 먼저 띄운 상태)
EXPO_PUBLIC_USE_MOCK=false
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api
npx expo start             # 웹: 브라우저, 실기기: Expo Go 로 QR (localhost → PC LAN IP)
```

시드 계정: `gangsan@baljachuk.dev` / `pw123456`

### E2E (Playwright, 웹)

```bash
npm run e2e:install        # 최초 1회 (chromium)
# 백엔드 + 프론트(:8081) + 시드가 떠 있는 상태에서
npm run e2e                # 로그인 → 지도 → 타임라인 → 기록 상세 → 좋아요
```

---

## 배포

- **웹** → Vercel: build `npx expo export -p web`, output `dist`. 환경변수 `EXPO_PUBLIC_API_BASE_URL` = Railway API URL, `EXPO_PUBLIC_USE_MOCK=false`.
- **네이티브** → EAS Build로 Android APK (선택, 미진행).

## 구현 순서 (개발 로그)

Phase 0 프론트 프레임(mock) → 1 Expo Router → 2 인증 → 3 NestJS 백엔드 → 3.5 콘텐츠 관리·설정 → 4 프론트↔백엔드 연결 → 5 실 지도(Leaflet) → 6 위시리스트·알림·DM → 7 배포·보안

## 알려진 한계

- 다른 유저 프로필 전용 화면 없음 (스팟 상세로 우회)
- 검색 결과의 팔로우 버튼이 현재 팔로우 상태를 표시하지 않음 (탭하면 정상 토글)
- 지도는 Leaflet WebView — 네이티브 지도 SDK 아님
- 푸시 알림은 실기기에서만 실제 수신
