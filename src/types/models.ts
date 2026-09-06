// 설계서 9장 ERD 기준 도메인 모델. 백엔드(NestJS) 응답과 1:1로 매칭되도록 유지한다.

export type RecordType = "VISITED" | "WISH";
export type Visibility = "PUBLIC" | "FRIENDS" | "PRIVATE";
export type NotificationType =
  | "LIKE"
  | "COMMENT"
  | "FOLLOW"
  | "NEW_RECORD"
  | "NEARBY_FRIEND_RECORD";

export type Role = "USER" | "ADMIN";
export type UserStatus = "ACTIVE" | "SUSPENDED";

export interface User {
  id: string;
  nickname: string;
  profileImageUrl: string | null;
  bio: string | null;
  /** GET /users/me 에서만 채워짐 (본인). 설정의 "기본 공개 범위" */
  defaultVisibility?: Visibility;
  /** 서버 응답엔 항상 포함. 옛 목 데이터 호환 위해 optional. */
  role?: Role;
}

/** GET /admin/users 목록 행 */
export interface AdminUserRow {
  id: string;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
  recordCount: number;
  followerCount: number;
  followingCount: number;
}

/** GET /admin/users/:id 상세 */
export interface AdminUserDetail extends AdminUserRow {
  bio: string | null;
  likeCount: number;
  commentCount: number;
  recentRecords: {
    id: string;
    type: RecordType;
    caption: string;
    visibility: Visibility;
    spotName: string;
    createdAt: string;
  }[];
}

/** GET /users/search 결과 — 검색 시점의 팔로우 상태를 함께 내려줌 (F3) */
export interface UserSearchResult extends User {
  followedByMe: boolean;
}

/** /users/:id/stats */
export interface UserStats {
  visitedSpotCount: number;
  followerCount: number;
  followingCount: number;
}

export interface Spot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  recordCount: number;
}

export interface Photo {
  id: string;
  originalUrl: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  orderIndex: number;
}

/** 피드/타임라인/상세에서 공통으로 쓰는 기록 카드 뷰모델.
 *  서버가 작성자·스팟·사진·카운트·본인 상호작용·잠금여부를 조합해 내려준다. */
export interface RecordCard {
  id: string;
  type: RecordType;
  author: User;
  spot: Spot;
  caption: string;
  photos: Photo[];
  visibility: Visibility;
  visitedAt: string | null; // WISH는 null
  /** WISH 전용 — 방문 후 완료 처리 여부 (설계서 9.2) */
  isCompleted?: boolean;
  /** VISITED 전용 — 기록별 인근 친구 알림 on/off (피드 관리에서 토글) */
  nearbyNotifyEnabled?: boolean;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  /** 시간·위치 기반 잠금 (설계서 2.3 / 11.4). true면 사진/캡션은 축약본만 온다 */
  locked: boolean;
  createdAt: string;
}

/** 지도 뷰포트 조회용 경량 핀 (GET /map/records) */
export interface MapPin {
  recordId: string;
  spotId: string;
  spotName: string;
  latitude: number;
  longitude: number;
  type: RecordType;
  /** 핀 색상 (사진 대표색을 채도 정규화한 값). 잠긴 핀은 null */
  color: string | null;
  locked: boolean;
}

/** 지도 클러스터 마커 (GET /map/clusters) */
export interface MapCluster {
  latitude: number;
  longitude: number;
  count: number;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: string;
}

export interface TrendingSpot {
  spot: Spot;
  coverImageUrl: string | null;
  recentRecordCount: number;
}

export interface SuggestedUser {
  user: User;
  visitedSpotCount: number;
  followerCount: number;
  followedByMe: boolean;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  actor: User;
  targetId: string | null;
  isRead: boolean;
  createdAt: string;
}

/** DM (설계서 §9 CONVERSATION/MESSAGE) */
export interface Conversation {
  id: string;
  other: User;
  lastMessage: { content: string; createdAt: string; mine: boolean } | null;
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  mine: boolean;
  readAt: string | null;
}
