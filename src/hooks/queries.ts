import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";
import { BBox, CursorPage, MapScope, TimelineTab } from "../types/api";
import { getTimeline, getRecordDetail } from "../api/records";
import { getMapRecords, getSpotRecords } from "../api/map";
import { getExplore } from "../api/explore";
import { getMe } from "../api/users";
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
  follow,
  unfollow,
} from "../api/social";
import { RecordCard, Comment, AppNotification } from "../types/models";

/** 화면은 이 훅들만 쓴다. mock↔실서버 전환은 api 모듈 안에서만 일어난다. */

export const qk = {
  timeline: (tab: TimelineTab) => ["timeline", tab] as const,
  mapRecords: (scope: MapScope) => ["map-records", scope] as const,
  explore: () => ["explore"] as const,
  me: () => ["me"] as const,
  recordDetail: (id: string) => ["record", id] as const,
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
