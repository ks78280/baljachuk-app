import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import Img from "../components/Img";
import { useExplore } from "../hooks/queries";
import { useNav } from "../lib/nav";
import { SearchIcon } from "../components/icons";
import { ErrorView } from "../components/states";
import { ExploreSkeleton } from "../components/skeletons";
import FollowButton from "../components/FollowButton";
import { TrendingSpot, SuggestedUser } from "../types/models";

// "요즘 뜨는 지역" 가로 캐러셀: 한 화면에 2.5칸 (2칸은 온전히, 3번째는 절반만 보여
// 뒤에 더 있음을 알림). 화면 폭에 맞춰 카드 폭을 계산한다.
const CAROUSEL_SIDE_PADDING = 20;
const CAROUSEL_GAP = 10;
const CAROUSEL_VISIBLE_CARDS = 2.5;

function useTrendingCardWidth(): number {
  const { width } = useWindowDimensions();
  // 스크롤 시작 시 보이는 영역 = width - 좌측패딩. 그 안에 2.5칸 + 2개 gap이 들어가야 함.
  const usable = width - CAROUSEL_SIDE_PADDING - CAROUSEL_GAP * 2;
  return Math.round(usable / CAROUSEL_VISIBLE_CARDS);
}

function Tag({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="px-3.5 py-2 bg-coral-soft rounded-full">
      <Text className="text-[13px] font-semibold text-coral-dark">{label}</Text>
    </Pressable>
  );
}

function TrendingCard({
  item,
  width,
  onPress,
}: {
  item: TrendingSpot;
  width: number;
  onPress: (spotId: string) => void;
}) {
  return (
    <Pressable style={{ width }} onPress={() => onPress(item.spot.id)}>
      {item.coverImageUrl ? (
        <Img
          source={{ uri: item.coverImageUrl }}
          style={{ width, height: 96 }}
          className="rounded-xl bg-coral-soft"
        />
      ) : (
        <View style={{ width, height: 96 }} className="rounded-xl bg-[#FF8A5C]" />
      )}
      <Text className="text-[13px] font-bold text-ink mt-1.5" numberOfLines={1}>
        {item.spot.name}
      </Text>
      <Text className="text-[11px] text-ink-muted">기록 {item.recentRecordCount}개</Text>
    </Pressable>
  );
}

function PersonRow({ item }: { item: SuggestedUser }) {
  return (
    <View className="flex-row items-center gap-3 mb-4">
      {item.user.profileImageUrl ? (
        <Img source={{ uri: item.user.profileImageUrl }} className="w-11 h-11 rounded-full bg-coral-soft" />
      ) : (
        <View className="w-11 h-11 rounded-full bg-[#FFCBB4]" />
      )}
      <View className="flex-1">
        <Text className="text-sm font-bold text-ink">{item.user.nickname}</Text>
        <Text className="text-xs text-ink-muted">
          방문 지역 {item.visitedSpotCount} · 팔로워 {item.followerCount}
        </Text>
      </View>
      <FollowButton userId={item.user.id} initialFollowing={item.followedByMe} />
    </View>
  );
}

export default function ExploreScreen() {
  const { data, isLoading, isError, error, refetch, isRefetching } = useExplore();
  const [subTab, setSubTab] = useState<"spots" | "users">("spots");
  const trendingCardWidth = useTrendingCardWidth();
  const { openSpot, openSearch } = useNav();

  return (
    <View className="flex-1 bg-bg">
      <View className="px-5 pt-2 pb-3.5">
        <Text className="text-[22px] font-black text-ink">탐색</Text>
      </View>

      <View className="px-5 pb-4">
        <Pressable
          onPress={openSearch}
          className="flex-row items-center gap-2 bg-white border border-border rounded-2xl px-3.5 py-2.5"
        >
          <SearchIcon color="#B99287" size={18} />
          <Text className="text-sm text-ink-muted">닉네임, 지역으로 검색</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <ExploreSkeleton />
      ) : isError || !data ? (
        <ErrorView error={error} onRetry={refetch} />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#FF6B45" colors={["#FF6B45"]} />
          }
        >
          <View className="flex-row gap-5 px-5 pb-4 border-b border-border">
            {(
              [
                { key: "spots", label: "추천 지역" },
                { key: "users", label: "사용자" },
              ] as const
            ).map((t) => {
              const active = subTab === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => setSubTab(t.key)}
                  className="pb-2.5"
                  style={active ? { borderBottomWidth: 2, borderBottomColor: "#FF6B45" } : undefined}
                >
                  <Text
                    className={`text-[15px] ${
                      active ? "font-bold text-coral" : "font-medium text-ink-muted"
                    }`}
                  >
                    {t.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="pt-4">
            <Text className="text-[15px] font-bold text-ink mb-2.5 px-5">요즘 뜨는 지역</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: CAROUSEL_SIDE_PADDING,
                gap: CAROUSEL_GAP,
              }}
            >
              {data.trendingSpots.map((s) => (
                <TrendingCard
                  key={s.spot.id}
                  item={s}
                  width={trendingCardWidth}
                  onPress={openSpot}
                />
              ))}
            </ScrollView>
          </View>

          <View className="px-5 pt-5">
            <Text className="text-[15px] font-bold text-ink mb-2.5">인기 태그</Text>
            <View className="flex-row flex-wrap gap-2">
              {data.popularTags.map((tag) => (
                <Tag key={tag} label={tag} onPress={openSearch} />
              ))}
            </View>
          </View>

          <View className="px-5 pt-6">
            <Text className="text-[15px] font-bold text-ink mb-3">함께 팔로우하면 좋은 사람</Text>
            {data.suggestedUsers.map((u) => (
              <PersonRow key={u.user.id} item={u} />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
