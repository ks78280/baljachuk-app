import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import { BBox, CursorPage, MapScope, TimelineTab } from "../types/api";
import {
  getTimeline,
  getRecordDetail,
  getMyRecords,
  getWishlist,
  updateRecord,
  deleteRecord,
  completeWish,
  setNotifySetting,
  UpdateRecordInput,
} from "../api/records";
import { getMapRecords, getMapClusters, getSpotRecords } from "../api/map";
import { getExplore } from "../api/explore";
import { getMe, getUserProfile, updateMe, deleteMe, UpdateMeInput } from "../api/users";
import {
  getConversations,
  openConversation,
  getMessages,
  sendMessage,
  markConversationRead,
} from "../api/dm";
import { getSpots, searchSpots, unlockSpots } from "../api/spots";
import { searchUsers } from "../api/users";
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../api/notifications";
import {
  likeRecord,
  unlikeRecord,
  getComments,
  addComment,
  deleteComment,
  follow,
  unfollow,
} from "../api/social";
import {
  RecordCard,
  Comment,
  AppNotification,
  User,
  Conversation,
  Message,
} from "../types/models";
import { Profile } from "../api/users";

/** 화면은 이 훅들만 쓴다. mock↔실서버 전환은 api 모듈 안에서만 일어난다. */

/** bbox 를 캐시 키로 쓸 때 미세한 이동으로 재요청이 폭주하지 않게 반올림 */
function bkey(b: BBox): string {
  const r = (n: number) => Math.round(n * 100) / 100;
  return `${r(b.swLat)},${r(b.swLng)},${r(b.neLat)},${r(b.neLng)}`;
}

export const qk = {
  timeline: (tab: TimelineTab) => ["timeline", tab] as const,
  mapRecords: (scope: MapScope, b: BBox) =>
    ["map-records", scope, bkey(b)] as const,
  mapClusters: (b: BBox, zoom: number) =>
    ["map-clusters", zoom, bkey(b)] as const,
  explore: () => ["explore"] as const,
  me: () => ["me"] as const,
  userProfile: (id: string) => ["user-profile", id] as const,
  recordDetail: (id: string) => ["record", id] as const,
  myRecords: () => ["my-records"] as const,
  spots: () => ["spots"] as const,
  spotRecords: (id: string) => ["spot-records", id] as const,
  comments: (recordId: string) => ["comments", recordId] as const,
  userSearch: (q: string) => ["search", "users", q] as const,
  spotSearch: (q: string) => ["search", "spots", q] as const,
  notifications: () => ["notifications"] as const,
  follow: (userId: string) => ["follow", userId] as const,
  wishlist: (userId: string) => ["wishlist", userId] as const,
  conversations: () => ["conversations"] as const,
  messages: (convoId: string) => ["messages", convoId] as const,
};

/** 한 기록(recordId)을 담고 있는 모든 캐시(상세·타임라인·스팟기록)를 동일하게 패치 */
function patchRecordEverywhere(
  qc: QueryClient,
  recordId: string,
  patch: (r: RecordCard) => RecordCard
) {
  qc.setQueryData<RecordCard>(qk.recordDetail(recordId), (d) => (d ? patch(d) : d));
  qc.setQueriesData<CursorPage<RecordCard>>({ queryKey: ["timeline"] }, (page) =>
    page
      ? { ...page, items: page.items.map((r) => (r.id === recordId ? patch(r) : r)) }
      : page
  );
  qc.setQueriesData<RecordCard[]>({ queryKey: ["spot-records"] }, (list) =>
    list ? list.map((r) => (r.id === recordId ? patch(r) : r)) : list
  );
  qc.setQueryData<RecordCard[]>(qk.myRecords(), (list) =>
    list ? list.map((r) => (r.id === recordId ? patch(r) : r)) : list
  );
}

/** 기록을 담고 있는 모든 목록 캐시에서 제거 */
function removeRecordEverywhere(qc: QueryClient, recordId: string) {
  qc.removeQueries({ queryKey: qk.recordDetail(recordId) });
  qc.setQueriesData<CursorPage<RecordCard>>({ queryKey: ["timeline"] }, (page) =>
    page ? { ...page, items: page.items.filter((r) => r.id !== recordId) } : page
  );
  qc.setQueriesData<RecordCard[]>({ queryKey: ["spot-records"] }, (list) =>
    list ? list.filter((r) => r.id !== recordId) : list
  );
  qc.setQueryData<RecordCard[]>(qk.myRecords(), (list) =>
    list ? list.filter((r) => r.id !== recordId) : list
  );
}

export function useTimeline(tab: TimelineTab) {
  return useQuery({
    queryKey: qk.timeline(tab),
    queryFn: () => getTimeline(tab),
  });
}

export function useMapRecords(bbox: BBox, scope: MapScope, enabled = true) {
  return useQuery({
    queryKey: qk.mapRecords(scope, bbox),
    queryFn: () => getMapRecords(bbox, scope),
    enabled,
    placeholderData: (prev) => prev, // 팬/줌 중 이전 핀 유지
  });
}

export function useMapClusters(bbox: BBox, zoom: number, enabled = true) {
  return useQuery({
    queryKey: qk.mapClusters(bbox, zoom),
    queryFn: () => getMapClusters(bbox, zoom),
    enabled,
    placeholderData: (prev) => prev,
  });
}

/** 현재 위치로 반경 내 잠긴 스팟 해제. 새로 열리면 지도 핀 갱신. */
export function useUnlockSpots() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lat, lng }: { lat: number; lng: number }) =>
      unlockSpots(lat, lng),
    onSuccess: (unlockedIds) => {
      if (unlockedIds.length > 0) {
        qc.invalidateQueries({ queryKey: ["map-records"] });
        qc.invalidateQueries({ queryKey: ["spot-records"] });
      }
    },
  });
}

export function useExplore() {
  return useQuery({ queryKey: qk.explore(), queryFn: getExplore });
}

export function useMe() {
  return useQuery({ queryKey: qk.me(), queryFn: getMe });
}

export function useUserProfile(id: string) {
  return useQuery({
    queryKey: qk.userProfile(id),
    queryFn: () => getUserProfile(id),
    enabled: !!id,
  });
}

export function useRecordDetail(id: string) {
  return useQuery({
    queryKey: qk.recordDetail(id),
    queryFn: () => getRecordDetail(id),
    enabled: !!id,
  });
}

export function useSpots() {
  return useQuery({ queryKey: qk.spots(), queryFn: getSpots });
}

// ── Phase 3.5: 콘텐츠 관리 & 설정 ────────────────────────────────────

/** 피드 관리 화면용 — 내가 올린 기록 목록 */
export function useMyRecords() {
  return useQuery({ queryKey: qk.myRecords(), queryFn: getMyRecords });
}

/** 프로필/설정 수정 → me 캐시 갱신 */
export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdateMeInput) => updateMe(patch),
    onSuccess: (user: User) => {
      qc.setQueryData<Profile>(qk.me(), (prev) =>
        prev ? { ...prev, user } : prev
      );
    },
  });
}

/** 회원 탈퇴 — 성공 시 호출부에서 signOut() */
export function useDeleteMe() {
  return useMutation({ mutationFn: () => deleteMe() });
}

/** 캡션/공개범위 수정 → 모든 기록 캐시 패치 */
export function useUpdateRecord(recordId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdateRecordInput) => updateRecord(recordId, patch),
    onSuccess: (updated: RecordCard) => {
      patchRecordEverywhere(qc, recordId, (r) => ({
        ...r,
        caption: updated.caption,
        visibility: updated.visibility,
      }));
    },
  });
}

/** 기록 삭제 → 모든 목록에서 즉시 제거 */
export function useDeleteRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (recordId: string) => deleteRecord(recordId),
    onMutate: async (recordId) => {
      removeRecordEverywhere(qc, recordId);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["timeline"] });
      qc.invalidateQueries({ queryKey: ["map-records"] });
      qc.invalidateQueries({ queryKey: qk.spots() });
    },
  });
}

/** 위시 → 방문 완료 처리 */
export function useCompleteWish(recordId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => completeWish(recordId),
    onSuccess: () => {
      patchRecordEverywhere(qc, recordId, (r) => ({ ...r, isCompleted: true }));
    },
  });
}

/** 피드 관리 — 기록별 인근 친구 알림 토글 (낙관적) */
export function useSetNotifySetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      setNotifySetting(id, enabled),
    onMutate: async ({ id, enabled }) => {
      patchRecordEverywhere(qc, id, (r) => ({ ...r, nearbyNotifyEnabled: enabled }));
      return { id, enabled };
    },
    onError: (_e, { id, enabled }) => {
      patchRecordEverywhere(qc, id, (r) => ({ ...r, nearbyNotifyEnabled: !enabled }));
    },
  });
}

/** 댓글 삭제 (낙관적) — comments 캐시에서 제거 + commentCount -1 */
export function useDeleteComment(recordId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(recordId, commentId),
    onMutate: async (commentId) => {
      await qc.cancelQueries({ queryKey: qk.comments(recordId) });
      const prev = qc.getQueryData<Comment[]>(qk.comments(recordId));
      qc.setQueryData<Comment[]>(qk.comments(recordId), (list) =>
        (list ?? []).filter((c) => c.id !== commentId)
      );
      patchRecordEverywhere(qc, recordId, (r) => ({
        ...r,
        commentCount: Math.max(0, r.commentCount - 1),
      }));
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.comments(recordId), ctx.prev);
      patchRecordEverywhere(qc, recordId, (r) => ({
        ...r,
        commentCount: r.commentCount + 1,
      }));
    },
  });
}

export function useUserSearch(q: string) {
  return useQuery({
    queryKey: qk.userSearch(q),
    queryFn: () => searchUsers(q),
    enabled: q.trim().length > 0,
  });
}

export function useSpotSearch(q: string) {
  return useQuery({
    queryKey: qk.spotSearch(q),
    queryFn: () => searchSpots(q),
    enabled: q.trim().length > 0,
  });
}

export function useNotifications() {
  return useQuery({ queryKey: qk.notifications(), queryFn: getNotifications });
}

/** 파생값: 안읽은 알림 수 (헤더 뱃지용) */
export function useUnreadNotificationCount(): number {
  const { data } = useNotifications();
  return (data ?? []).filter((n) => !n.isRead).length;
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: qk.notifications() });
      const prev = qc.getQueryData<AppNotification[]>(qk.notifications());
      qc.setQueryData<AppNotification[]>(qk.notifications(), (list) =>
        (list ?? []).map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.notifications(), ctx.prev);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: qk.notifications() });
      const prev = qc.getQueryData<AppNotification[]>(qk.notifications());
      qc.setQueryData<AppNotification[]>(qk.notifications(), (list) =>
        (list ?? []).map((n) => ({ ...n, isRead: true }))
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.notifications(), ctx.prev);
    },
  });
}

export function useSpotRecords(spotId: string) {
  return useQuery({
    queryKey: qk.spotRecords(spotId),
    queryFn: () => getSpotRecords(spotId),
    enabled: !!spotId,
  });
}

export function useComments(recordId: string) {
  return useQuery({
    queryKey: qk.comments(recordId),
    queryFn: () => getComments(recordId),
    enabled: !!recordId,
  });
}

/** 좋아요 토글 — 상세·타임라인·스팟기록 캐시를 한꺼번에 낙관적 갱신, 실패 시 역패치 */
export function useToggleLike(recordId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nextLiked: boolean) =>
      nextLiked ? likeRecord(recordId) : unlikeRecord(recordId),
    onMutate: async (nextLiked) => {
      await qc.cancelQueries({ queryKey: qk.recordDetail(recordId) });
      patchRecordEverywhere(qc, recordId, (r) =>
        r.likedByMe === nextLiked
          ? r
          : {
              ...r,
              likedByMe: nextLiked,
              likeCount: Math.max(0, r.likeCount + (nextLiked ? 1 : -1)),
            }
      );
    },
    onError: (_e, nextLiked) => {
      // 요청 실패 → 방금 반영한 토글을 되돌린다
      patchRecordEverywhere(qc, recordId, (r) =>
        r.likedByMe !== nextLiked
          ? r
          : {
              ...r,
              likedByMe: !nextLiked,
              likeCount: Math.max(0, r.likeCount + (nextLiked ? -1 : 1)),
            }
      );
    },
  });
}

/** 댓글 작성 — comments 캐시에 즉시 추가, commentCount는 상세·타임라인·스팟기록 모두 +1 */
export function useAddComment(recordId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => addComment(recordId, content),
    onSuccess: (created: Comment) => {
      qc.setQueryData<Comment[]>(qk.comments(recordId), (prev) =>
        prev ? [...prev, created] : [created]
      );
      patchRecordEverywhere(qc, recordId, (r) => ({
        ...r,
        commentCount: r.commentCount + 1,
      }));
    },
  });
}

/** 팔로우 상태를 별도 캐시(qk.follow)에 보관. 목록 새로고침과 무관하게 유지된다. */
export function useFollowState(userId: string, initial: boolean): boolean {
  const { data } = useQuery({
    queryKey: qk.follow(userId),
    queryFn: () => initial,
    initialData: initial,
    enabled: false, // fetch 안 함, 캐시만 사용
    staleTime: Infinity,
  });
  return data ?? initial;
}

export function useToggleFollow(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (next: boolean) => (next ? follow(userId) : unfollow(userId)),
    onMutate: (next) => {
      const prev = qc.getQueryData<boolean>(qk.follow(userId));
      qc.setQueryData(qk.follow(userId), next);
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      qc.setQueryData(qk.follow(userId), ctx?.prev ?? false);
    },
  });
}

// ── Phase 6: 위시리스트 / DM ────────────────────────────────────────

export function useWishlist(userId: string) {
  return useQuery({
    queryKey: qk.wishlist(userId),
    queryFn: () => getWishlist(userId),
    enabled: !!userId,
  });
}

/** 대화방 목록 — 8초 폴링 (설계서 §12.1: MVP는 5~10초 폴링) */
export function useConversations() {
  return useQuery({
    queryKey: qk.conversations(),
    queryFn: getConversations,
    refetchInterval: 8000,
  });
}

/** 안읽은 DM 총합 (탭/헤더 뱃지용) */
export function useUnreadDmCount(): number {
  const { data } = useConversations();
  return (data ?? []).reduce((sum, c) => sum + c.unreadCount, 0);
}

/** 대화 메시지 — 5초 폴링 */
export function useMessages(convoId: string) {
  return useQuery({
    queryKey: qk.messages(convoId),
    queryFn: () => getMessages(convoId),
    enabled: !!convoId,
    refetchInterval: 5000,
  });
}

export function useOpenConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => openConversation(userId),
    onSuccess: (conv) => {
      qc.setQueryData<Conversation[]>(qk.conversations(), (list) => {
        const rest = (list ?? []).filter((c) => c.id !== conv.id);
        return [conv, ...rest];
      });
    },
  });
}

/** 메시지 전송 — 낙관적으로 목록 끝에 추가 */
export function useSendMessage(convoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => sendMessage(convoId, content),
    onMutate: async (content) => {
      await qc.cancelQueries({ queryKey: qk.messages(convoId) });
      const prev = qc.getQueryData<CursorPage<Message>>(qk.messages(convoId));
      const optimistic: Message = {
        id: `tmp-${Date.now()}`,
        content,
        createdAt: new Date().toISOString(),
        mine: true,
        readAt: null,
      };
      qc.setQueryData<CursorPage<Message>>(qk.messages(convoId), (p) =>
        p ? { ...p, items: [...p.items, optimistic] } : { items: [optimistic], nextCursor: null }
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.messages(convoId), ctx.prev);
    },
    onSuccess: (real) => {
      qc.setQueryData<CursorPage<Message>>(qk.messages(convoId), (p) =>
        p
          ? {
              ...p,
              items: p.items.map((m) => (m.id.startsWith("tmp-") ? real : m)),
            }
          : { items: [real], nextCursor: null }
      );
      qc.invalidateQueries({ queryKey: qk.conversations() });
    },
  });
}

export function useMarkConversationRead(convoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markConversationRead(convoId),
    onMutate: () => {
      qc.setQueryData<Conversation[]>(qk.conversations(), (list) =>
        (list ?? []).map((c) => (c.id === convoId ? { ...c, unreadCount: 0 } : c))
      );
    },
  });
}
