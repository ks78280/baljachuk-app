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
    openEditRecord: (id: string) => router.push(`/record/${id}/edit`),
    openSpot: (id: string) => router.push(`/spot/${id}`),
    openSearch: () => router.push("/search"),
    openNotifications: () => router.push("/notifications"),
    openProfile: () => router.navigate("/profile"),
    openUserProfile: (id: string) => router.push(`/user/${id}`),
    openFollowers: (id: string) => router.push(`/user/${id}/followers`),
    openFollowing: (id: string) => router.push(`/user/${id}/following`),
    openSettings: () => router.push("/settings"),
    openProfileEdit: () => router.push("/profile/edit"),
    openFeedManage: () => router.push("/feed-manage"),
    openWishlist: () => router.push("/wishlist"),
    openMessages: () => router.push("/messages"),
    openChat: (id: string, name: string) =>
      router.push(`/chat/${id}?name=${encodeURIComponent(name)}`),
    close: () => router.back(),
  };
}
