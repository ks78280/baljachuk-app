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
  updateRecord,
  deleteRecord,
  completeWish,
  setNotifySetting,
  UpdateRecordInput,
} from "../api/records";
import { getMapRecords, getSpotRecords } from "../api/map";
import { getExplore } from "../api/explore";
import { getMe, updateMe, deleteMe, UpdateMeInput } from "../api/users";
import { getSpots, searchSpots } from "../api/spots";
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
import { RecordCard, Comment, AppNotification, User } from "../types/models";
import { Profile } from "../api/users";

/** 화면은 이 훅들만 쓴다. mock↔실서버 전환은 api 모듈 안에서만 일어난다. */

export const qk = {
  timeline: (tab: TimelineTab) => ["timeline", tab] as const,
  mapRecords: (scope: MapScope) => ["map-records", scope] as const,
  explore: () => ["explore"] as const,
  me: () => ["me"] as const,
  recordDetail: (id: string) => ["record", id] as const,
  myRecords: () => ["my-records"] as const,
  spots: () => ["spots"] as const,
  spotRecords: (id: string) => ["spot-records", id] as const,
  comments: (recordId: string) => ["comments", recordId] as const,
  userSearch: (q: string) => ["search", "users", q] as const,
  spotSearch: (q: string) => ["search", "spots", q] as const,
  notifications: () => ["notifications"] as const,
  follow: (userId: string) => ["follow", userId] as const,
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

// 목 단계에서는 bbox가 의미 없지만, 실서버 전환 시 뷰포트를 그대로 넘기면 된다
const WHOLE_KOREA: BBox = { swLat: 33, swLng: 124, neLat: 39, neLng: 132 };

export function useMapRecords(scope: MapScope) {
  return useQuery({
    queryKey: qk.mapRecords(scope),
    queryFn: () => getMapRecords(WHOLE_KOREA, scope),
  });
}

export function useExplore() {
  return useQuery({ queryKey: qk.explore(), queryFn: getExplore });
}

export function useMe() {
  return useQuery({ queryKey: qk.me(), queryFn: getMe });
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
