import { useRouter } from "expo-router";

/**
 * 화면들이 계속 `useNav().openSpot(id)` 식으로 쓰도록 유지하는 얇은 래퍼.
 * (Phase 1에서 useState 기반 임시 네비 → Expo Router로 교체. API는 동일하게 둠)
 */
export function useNav() {
  const router = useRouter();
  return {
    openCompose: () => router.push("/record/new"),
    openRecord: (id: string) => router.push(`/record/${id}`),
    openSpot: (id: string) => router.push(`/spot/${id}`),
    openSearch: () => router.push("/search"),
    openNotifications: () => router.push("/notifications"),
    close: () => router.back(),
  };
}
