// 백엔드 붙기 전까지 쓰는 목 데이터. 타입은 실제 모델과 동일하다.
import {
  User,
  Spot,
  RecordCard,
  MapPin,
  Comment,
  TrendingSpot,
  SuggestedUser,
  AppNotification,
  UserStats,
  Visibility,
} from "../types/models";

const img = (seed: string, w = 800, h = 600) =>
  `https://picsum.photos/seed/${seed}/${w}/${h}`;

export const me: User = {
  id: "u-me",
  nickname: "강산",
  profileImageUrl: img("kangsan", 200, 200),
  bio: "여행과 기록을 좋아합니다. 지도를 하나씩 채워가는 중.",
  defaultVisibility: "FRIENDS",
};

export const meStats: UserStats = {
  visitedSpotCount: 12,
  followerCount: 340,
  followingCount: 210,
};

const users: Record<string, User> = {
  "u-me": me,
  "u-summer": {
    id: "u-summer",
    nickname: "여름날의기록",
    profileImageUrl: img("summer", 200, 200),
    bio: null,
  },
  "u-explorer": {
    id: "u-explorer",
    nickname: "동네탐험가J",
    profileImageUrl: img("explorer", 200, 200),
    bio: null,
  },
  "u-coffee": {
    id: "u-coffee",
    nickname: "커피한잔의여유",
    profileImageUrl: img("coffee", 200, 200),
    bio: "카페 투어가 취미",
  },
  "u-hiking": {
    id: "u-hiking",
    nickname: "주말산행러",
    profileImageUrl: img("hiking", 200, 200),
    bio: null,
  },
  "u-sea": {
    id: "u-sea",
    nickname: "바다보러갈래",
    profileImageUrl: img("sea", 200, 200),
    bio: "해안선을 따라 걷는 중",
  },
};

/** 사용자 검색 대상 (닉네임 매칭). 실서버에서는 GET /users/search 가 대신함. */
export const allUsers: User[] = Object.values(users).filter((u) => u.id !== "u-me");

export const spots: Spot[] = [
  { id: "s-dgt", name: "동대구역", latitude: 35.8797, longitude: 128.6285, address: "대구 동구 신암동", recordCount: 24 },
  { id: "s-hae", name: "해운대", latitude: 35.1587, longitude: 129.1604, address: "부산 해운대구", recordCount: 41 },
  { id: "s-gj", name: "경주 대릉원", latitude: 35.8390, longitude: 129.2100, address: "경북 경주시", recordCount: 9 },
  { id: "s-cafe", name: "북성로 카페거리", latitude: 35.8721, longitude: 128.5905, address: "대구 중구", recordCount: 15 },
];

const spotById = (id: string) => spots.find((s) => s.id === id)!;

export const timelineMine: RecordCard[] = [
  {
    id: "r-1",
    type: "VISITED",
    author: me,
    spot: spotById("s-dgt"),
    caption: "가을 저녁 동대구역, 노을이 예뻤던 하루.",
    photos: [{ id: "p-1", originalUrl: img("dgt1"), thumbnailUrl: img("dgt1", 400, 300), width: 800, height: 600, orderIndex: 0 }],
    visibility: "FRIENDS",
    visitedAt: "2026-09-01",
    nearbyNotifyEnabled: true,
    likeCount: 12,
    commentCount: 3,
    likedByMe: false,
    locked: false,
    createdAt: "2026-09-04T15:00:00Z",
  },
  {
    id: "r-2",
    type: "WISH",
    author: me,
    spot: spotById("s-gj"),
    caption: "벚꽃 필 때 친구들이랑 꼭 가보고 싶은 곳!",
    photos: [],
    visibility: "FRIENDS",
    visitedAt: null,
    isCompleted: false,
    likeCount: 2,
    commentCount: 0,
    likedByMe: false,
    locked: false,
    createdAt: "2026-09-03T09:00:00Z",
  },
];

export const timelineFriends: RecordCard[] = [
  {
    id: "r-3",
    type: "VISITED",
    author: users["u-summer"],
    spot: spotById("s-hae"),
    caption: "해운대 근처에서 잠금 해제됩니다",
    photos: [{ id: "p-3", originalUrl: img("hae1"), thumbnailUrl: img("hae1", 400, 300), width: 800, height: 600, orderIndex: 0 }],
    visibility: "FRIENDS",
    visitedAt: "2026-09-02",
    likeCount: 8,
    commentCount: 1,
    likedByMe: true,
    locked: true,
    createdAt: "2026-09-02T18:00:00Z",
  },
  {
    id: "r-4",
    type: "VISITED",
    author: users["u-explorer"],
    spot: spotById("s-cafe"),
    caption: "북성로 골목 카페 투어. 커피가 다 좋았다.",
    photos: [
      { id: "p-4a", originalUrl: img("cafe1"), thumbnailUrl: img("cafe1", 400, 300), width: 800, height: 600, orderIndex: 0 },
      { id: "p-4b", originalUrl: img("cafe2"), thumbnailUrl: img("cafe2", 400, 300), width: 800, height: 600, orderIndex: 1 },
    ],
    visibility: "PUBLIC",
    visitedAt: "2026-09-03",
    likeCount: 21,
    commentCount: 5,
    likedByMe: false,
    locked: false,
    createdAt: "2026-09-03T12:00:00Z",
  },
];

export const commentsByRecord: Record<string, Comment[]> = {
  "r-1": [
    { id: "c-1", author: users["u-summer"], content: "노을 색감 진짜 예쁘네요!", createdAt: "2026-09-04T16:00:00Z" },
    { id: "c-2", author: users["u-explorer"], content: "여기 저도 가봤어요 ㅎㅎ", createdAt: "2026-09-04T17:30:00Z" },
  ],
};

// 지도 핀 — 스팟 좌표를 그대로 쓰되, 잠긴 핀은 color=null
export const mapPins: MapPin[] = [
  { recordId: "r-1", spotId: "s-dgt", spotName: "동대구역", latitude: 35.8797, longitude: 128.6285, type: "VISITED", color: "#FF9457", locked: false },
  { recordId: "r-4", spotId: "s-cafe", spotName: "북성로 카페거리", latitude: 35.8721, longitude: 128.5905, type: "VISITED", color: "#3FAE8A", locked: false },
  { recordId: "r-3", spotId: "s-hae", spotName: "해운대", latitude: 35.1587, longitude: 129.1604, type: "VISITED", color: null, locked: true },
  { recordId: "r-2", spotId: "s-gj", spotName: "경주 대릉원", latitude: 35.8390, longitude: 129.2100, type: "WISH", color: "#E0668F", locked: false },
];

export const trendingSpots: TrendingSpot[] = [
  { spot: spotById("s-dgt"), coverImageUrl: img("dgt-cover", 400, 300), recentRecordCount: 24 },
  { spot: spotById("s-hae"), coverImageUrl: img("hae-cover", 400, 300), recentRecordCount: 41 },
  { spot: spotById("s-gj"), coverImageUrl: img("gj-cover", 400, 300), recentRecordCount: 9 },
];

export const popularTags: string[] = ["#감성", "#카페", "#야경", "#혼자여행", "#데이트"];

export const suggestedUsers: SuggestedUser[] = [
  { user: users["u-summer"], visitedSpotCount: 38, followerCount: 512, followedByMe: false },
  { user: users["u-explorer"], visitedSpotCount: 22, followerCount: 288, followedByMe: false },
];

export const notifications: AppNotification[] = [
  { id: "n-1", type: "LIKE", actor: users["u-summer"], targetId: "r-1", isRead: false, createdAt: "2026-09-04T16:05:00Z" },
  { id: "n-2", type: "COMMENT", actor: users["u-explorer"], targetId: "r-1", isRead: false, createdAt: "2026-09-04T15:31:00Z" },
  { id: "n-3", type: "NEARBY_FRIEND_RECORD", actor: users["u-coffee"], targetId: "r-4", isRead: false, createdAt: "2026-09-04T12:10:00Z" },
  { id: "n-4", type: "NEW_RECORD", actor: users["u-explorer"], targetId: "r-4", isRead: true, createdAt: "2026-09-03T20:00:00Z" },
  { id: "n-5", type: "FOLLOW", actor: users["u-summer"], targetId: null, isRead: true, createdAt: "2026-09-03T10:00:00Z" },
  { id: "n-6", type: "LIKE", actor: users["u-hiking"], targetId: "r-1", isRead: true, createdAt: "2026-09-02T09:00:00Z" },
];

// ── 목 상태 뮤테이션 (백엔드처럼 "저장"된 것처럼 보이게) ──────────────
export function findRecord(id: string): RecordCard | undefined {
  return [...timelineMine, ...timelineFriends].find((r) => r.id === id);
}

export function applyLike(id: string, liked: boolean): void {
  const r = findRecord(id);
  if (r && r.likedByMe !== liked) {
    r.likedByMe = liked;
    r.likeCount = Math.max(0, r.likeCount + (liked ? 1 : -1));
  }
}

export function applyComment(recordId: string, comment: Comment): void {
  (commentsByRecord[recordId] ??= []).push(comment);
  const r = findRecord(recordId);
  if (r) r.commentCount += 1;
}

export function prependRecord(record: RecordCard): void {
  timelineMine.unshift(record);
}

export function applyFollow(userId: string, followed: boolean): void {
  const s = suggestedUsers.find((x) => x.user.id === userId);
  if (s) s.followedByMe = followed;
}

export function markNotificationRead(id: string): void {
  const n = notifications.find((x) => x.id === id);
  if (n) n.isRead = true;
}

export function markAllNotificationsRead(): void {
  notifications.forEach((n) => {
    n.isRead = true;
  });
}

// ── Phase 3.5: 콘텐츠 관리 ────────────────────────────────────────────
export function updateMe(patch: Partial<User>): User {
  Object.assign(me, patch);
  return { ...me };
}

export interface RecordFieldPatch {
  caption?: string;
  visibility?: Visibility;
  isCompleted?: boolean;
  nearbyNotifyEnabled?: boolean;
}

export function updateRecordFields(id: string, patch: RecordFieldPatch): RecordCard | undefined {
  const r = findRecord(id);
  if (!r) return undefined;
  Object.assign(r, patch);
  return { ...r, photos: [...r.photos] };
}

export function removeRecord(id: string): void {
  for (const list of [timelineMine, timelineFriends]) {
    const i = list.findIndex((r) => r.id === id);
    if (i >= 0) {
      const [gone] = list.splice(i, 1);
      const s = spots.find((x) => x.id === gone.spot.id);
      if (s && s.recordCount > 0) s.recordCount -= 1;
      break;
    }
  }
  delete commentsByRecord[id];
}

export function removeComment(recordId: string, commentId: string): void {
  const list = commentsByRecord[recordId];
  if (!list) return;
  const i = list.findIndex((c) => c.id === commentId);
  if (i >= 0) {
    list.splice(i, 1);
    const r = findRecord(recordId);
    if (r && r.commentCount > 0) r.commentCount -= 1;
  }
}
