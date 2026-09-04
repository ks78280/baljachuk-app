import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BackIcon, CommentIcon, LockIcon, SmallPinIcon } from "../components/icons";
import { ErrorView } from "../components/states";
import { RecordDetailSkeleton } from "../components/skeletons";
import LikeButton from "../components/LikeButton";
import { useKeyboardHeight } from "../lib/useKeyboard";
import { formatRelative } from "../lib/time";
import { RecordCard, Comment } from "../types/models";
import { useRecordDetail, useComments, useAddComment } from "../hooks/queries";

function Avatar({ uri, size = 32 }: { uri: string | null; size?: number }) {
  return uri ? (
    <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} className="bg-coral-soft" />
  ) : (
    <View style={{ width: size, height: size, borderRadius: size / 2 }} className="bg-[#FFB199]" />
  );
}

function PhotoCarousel({ record }: { record: RecordCard }) {
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);

  if (record.photos.length === 0) return null;

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    setPage(Math.round(e.nativeEvent.contentOffset.x / width));
  }

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
      >
        {record.photos.map((p) => (
          <Image
            key={p.id}
            source={{ uri: p.originalUrl }}
            style={{ width, height: width * 0.75 }}
            className="bg-coral-soft"
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      {record.photos.length > 1 && (
        <View className="flex-row justify-center gap-1.5 py-2">
          {record.photos.map((p, i) => (
            <View
              key={p.id}
              className={`h-1.5 rounded-full ${i === page ? "w-4 bg-coral" : "w-1.5 bg-border"}`}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function CommentRow({ comment }: { comment: Comment }) {
  return (
    <View className="flex-row gap-2.5 py-2.5">
      <Avatar uri={comment.author.profileImageUrl} size={28} />
      <View className="flex-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-[13px] font-bold text-ink">{comment.author.nickname}</Text>
          <Text className="text-[11px] text-ink-muted">{formatRelative(comment.createdAt)}</Text>
        </View>
        <Text className="text-[13px] text-ink leading-5 mt-0.5">{comment.content}</Text>
      </View>
    </View>
  );
}

export default function RecordDetailScreen({
  recordId,
  onBack,
  onOpenSpot,
}: {
  recordId: string;
  onBack: () => void;
  onOpenSpot: (spotId: string) => void;
}) {
  const insets = useSafeAreaInsets();
  // Android는 삼성 키보드 툴바를 감안한 기본 여유가 훅 안에 들어있음. 안 맞으면 숫자 지정.
  const kb = useKeyboardHeight();
  const scrollRef = useRef<ScrollView>(null);
  const { data: record, isLoading, isError, refetch } = useRecordDetail(recordId);
  const { data: comments } = useComments(recordId);
  const addComment = useAddComment(recordId);
  const [draft, setDraft] = useState("");

  // 키보드가 올라오면 댓글이 우선 보이도록 목록을 맨 아래로 스크롤
  useEffect(() => {
    if (kb > 0) {
      const t = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
      return () => clearTimeout(t);
    }
  }, [kb]);

  function submitComment() {
    const text = draft.trim();
    if (!text || addComment.isPending) return;
    addComment.mutate(text, {
      onSuccess: () => {
        setDraft("");
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
      },
    });
  }

  return (
    // KeyboardAvoidingView가 Android에서 잘 안 먹어 키보드 높이를 직접 paddingBottom으로.
    // 키보드가 뜨면 화면이 그만큼 줄어 하단 입력바가 키보드 위로 올라오고,
    // 위 게시물은 가려지더라도 댓글 목록/입력창/등록 버튼이 우선 노출된다.
    <View className="flex-1 bg-bg" style={{ paddingBottom: kb }}>
      <View className="flex-row items-center gap-2 px-4 pt-2 pb-3">
        <Pressable onPress={onBack} hitSlop={10}>
          <BackIcon />
        </Pressable>
        <Text className="text-base font-bold text-ink">기록</Text>
      </View>

      {isLoading ? (
        <RecordDetailSkeleton />
      ) : isError || !record ? (
        <ErrorView onRetry={refetch} />
      ) : (
        <>
          <ScrollView
            ref={scrollRef}
            className="flex-1"
            keyboardShouldPersistTaps="handled"
          >
            {/* 작성자 + 스팟 */}
            <View className="flex-row items-center gap-2.5 px-5 pb-3">
              <Avatar uri={record.author.profileImageUrl} />
              <View className="flex-1">
                <Text className="text-sm font-bold text-ink">{record.author.nickname}</Text>
                <Pressable
                  onPress={() => onOpenSpot(record.spot.id)}
                  className="flex-row items-center gap-1"
                  hitSlop={6}
                >
                  <SmallPinIcon size={12} />
                  <Text className="text-[12px] text-coral font-semibold">{record.spot.name}</Text>
                  <Text className="text-[11px] text-ink-muted">· {formatRelative(record.createdAt)}</Text>
                </Pressable>
              </View>
            </View>

            {record.locked ? (
              <View className="mx-5 mb-4 rounded-2xl bg-[#D8C3BA] items-center justify-center py-14 gap-3">
                <View className="w-12 h-12 rounded-full bg-black/35 items-center justify-center">
                  <LockIcon />
                </View>
                <Text className="text-[13px] font-semibold text-[#5C4A42]">
                  {record.spot.name} 근처에서 잠금 해제됩니다
                </Text>
              </View>
            ) : (
              <>
                <PhotoCarousel record={record} />
                {!!record.caption && (
                  <Text className="px-5 py-3 text-sm text-ink leading-6">{record.caption}</Text>
                )}

                {/* 좋아요 / 댓글 카운트 */}
                <View className="flex-row items-center gap-5 px-5 py-2 border-b border-border">
                  <LikeButton
                    recordId={record.id}
                    liked={record.likedByMe}
                    count={record.likeCount}
                    size={20}
                  />
                  <View className="flex-row items-center gap-1.5">
                    <CommentIcon size={20} />
                    <Text className="text-[13px] text-ink-muted">{record.commentCount}</Text>
                  </View>
                </View>

                {/* 댓글 목록 */}
                <View className="px-5 pt-2 pb-4">
                  {comments && comments.length > 0 ? (
                    comments.map((c) => <CommentRow key={c.id} comment={c} />)
                  ) : (
                    <Text className="text-[13px] text-ink-muted py-6 text-center">
                      첫 댓글을 남겨보세요
                    </Text>
                  )}
                </View>
              </>
            )}
          </ScrollView>

          {!record.locked && (
            <View
              className="flex-row items-center gap-2 border-t border-border bg-bg px-4 pt-2.5"
              style={{ paddingBottom: kb > 0 ? 8 : Math.max(insets.bottom, 12) }}
            >
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="댓글 달기..."
                placeholderTextColor="#8C6F63"
                className="flex-1 bg-white border border-border rounded-full px-4 py-2 text-sm text-ink"
                maxLength={300}
                onSubmitEditing={submitComment}
                returnKeyType="send"
              />
              <Pressable
                onPress={submitComment}
                disabled={!draft.trim() || addComment.isPending}
                className={`px-3.5 py-2 rounded-full bg-coral ${
                  !draft.trim() || addComment.isPending ? "opacity-40" : ""
                }`}
              >
                <Text className="text-[13px] font-bold text-white">등록</Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );
}
