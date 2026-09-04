import { apiFetch, USE_MOCK, mockDelay } from "./client";
import { TrendingSpot, SuggestedUser } from "../types/models";
import * as mock from "../mocks/db";

export interface ExploreData {
  trendingSpots: TrendingSpot[];
  popularTags: string[];
  suggestedUsers: SuggestedUser[];
}

export async function getExplore(): Promise<ExploreData> {
  if (USE_MOCK) {
    return mockDelay({
      trendingSpots: mock.trendingSpots,
      popularTags: mock.popularTags,
      suggestedUsers: mock.suggestedUsers,
    });
  }
  // 실제로는 3개 엔드포인트를 병렬 호출해 합친다
  const [trendingSpots, popularTags, suggestedUsers] = await Promise.all([
    apiFetch<TrendingSpot[]>("/explore/trending-spots"),
    apiFetch<string[]>("/explore/popular-tags"),
    apiFetch<SuggestedUser[]>("/explore/suggested-users"),
  ]);
  return { trendingSpots, popularTags, suggestedUsers };
}
