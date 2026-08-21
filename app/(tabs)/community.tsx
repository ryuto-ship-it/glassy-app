import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { AppBackground } from '@/components/glass/AppBackground';
import { GlassSurface } from '@/components/glass/GlassSurface';
import { PillButton } from '@/components/glass/PillButton';
import { PlaceholderArt } from '@/components/glass/PlaceholderArt';
import { SkeletonCard } from '@/components/glass/Skeleton';
import { TabFade } from '@/components/glass/TabFade';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { CommunityPost, USER } from '@/data/mock';
import { formatRelative } from '@/lib/date';
import { useAppStore } from '@/store/useAppStore';
import { useUiStore } from '@/store/useUiStore';

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const openComposer = useUiStore((s) => s.openComposer);

  const posts = useAppStore((s) => s.posts);
  const toggleLike = useAppStore((s) => s.toggleLike);
  const toggleFollow = useAppStore((s) => s.toggleFollow);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const sorted = [...posts].sort((a, b) => {
    if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <View style={styles.root}>
      <AppBackground />
      <TabFade>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + spacing.md, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />}
      >
        <View style={styles.section}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.pageTitle}>Glow Feed</Text>
              <Text style={styles.pageSub}>
                {USER.followers.toLocaleString()} 팔로워 · {USER.following.toLocaleString()} 팔로잉
              </Text>
            </View>
            <PillButton label="후기 작성" onPress={openComposer} />
          </View>
        </View>

        <View style={styles.section}>
          <GlassSurface radius={radius.lg} padding={spacing.lg}>
            <View style={styles.activityHeaderRow}>
              <Ionicons name="flash" size={14} color={colors.accentGold} />
              <Text style={styles.activityTitle}>활동하고 GLAS 받기</Text>
            </View>
            <View style={styles.activityGrid}>
              <ActivityRule label="후기 작성" amount="+15" />
              <ActivityRule label="좋아요 받기" amount="+1" />
              <ActivityRule label="댓글 받기" amount="+2" />
              <ActivityRule label="팔로워 10명" amount="+20" />
            </View>
          </GlassSurface>
        </View>

        <View style={styles.section}>
          {loading ? (
            <View style={{ gap: spacing.md }}>
              <SkeletonCard />
              <SkeletonCard />
            </View>
          ) : (
            <View style={{ gap: spacing.lg }}>
              {sorted.map((post) => (
                <PostCard key={post.id} post={post} onLike={() => toggleLike(post.id)} onFollow={() => toggleFollow(post.id)} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      </TabFade>
    </View>
  );
}

function ActivityRule({ label, amount }: { label: string; amount: string }) {
  return (
    <View style={styles.activityItem}>
      <Text style={styles.activityAmount}>{amount} GLAS</Text>
      <Text style={styles.activityLabel}>{label}</Text>
    </View>
  );
}

function PostCard({
  post,
  onLike,
  onFollow,
}: {
  post: CommunityPost;
  onLike: () => void;
  onFollow: () => void;
}) {
  const scale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handleLike = () => {
    scale.value = withSequence(withTiming(1.35, { duration: 120 }), withTiming(1, { duration: 160 }));
    onLike();
  };

  return (
    <GlassSurface radius={radius.lg} padding={spacing.lg}>
      {post.pinned && (
        <View style={styles.pinnedChip}>
          <Ionicons name="pin" size={10} color="#fff" />
          <Text style={styles.pinnedChipText}>인기 후기</Text>
        </View>
      )}
      <View style={styles.earnedChip}>
        <Ionicons name="add-circle" size={11} color={colors.success} />
        <Text style={styles.earnedChipText}>+{post.glasEarned} GLAS 획득</Text>
      </View>
      <View style={styles.postHeader}>
        <Image source={{ uri: post.avatar }} style={styles.postAvatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.postAuthor}>{post.author}</Text>
          <Text style={styles.postLocation}>
            {post.location} · {formatRelative(post.createdAt)}
          </Text>
        </View>
        <Pressable onPress={onFollow} style={[styles.followBtn, post.isFollowing && styles.followBtnActive]}>
          <Text style={[styles.followBtnText, post.isFollowing && styles.followBtnTextActive]}>
            {post.isFollowing ? '팔로잉' : '팔로우'}
          </Text>
        </Pressable>
      </View>

      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }}>
        {post.images.map((img) => (
          <PlaceholderArt key={img} seed={`${post.id}-${img}`} iconSize={44} style={styles.postImage} />
        ))}
      </ScrollView>

      <Text style={styles.caption}>{post.caption}</Text>

      {post.tags.length > 0 && (
        <View style={styles.tagRow}>
          {post.tags.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>#{t}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footerRow}>
        <Pressable onPress={handleLike} style={styles.footerAction}>
          <Animated.View style={heartStyle}>
            <Ionicons name={post.liked ? 'heart' : 'heart-outline'} size={18} color={post.liked ? colors.danger : colors.textMuted} />
          </Animated.View>
          <Text style={styles.footerCount}>{post.likes.toLocaleString()}</Text>
        </Pressable>
        <View style={styles.footerAction}>
          <Ionicons name="chatbubble-outline" size={16} color={colors.textMuted} />
          <Text style={styles.footerCount}>{post.comments.length}</Text>
        </View>
      </View>

      {post.comments.length > 0 && (
        <View style={styles.commentPreview}>
          <Text style={styles.commentAuthor}>{post.comments[0].author}</Text>
          <Text style={styles.commentText} numberOfLines={1}>
            {post.comments[0].text}
          </Text>
        </View>
      )}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  section: { paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pageTitle: { fontFamily: fonts.display, fontSize: 24, color: colors.text },
  pageSub: { fontFamily: fonts.body, fontSize: 12, color: colors.textMuted, marginTop: 4 },
  pinnedChip: {
    position: 'absolute',
    top: -8,
    left: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    zIndex: 2,
  },
  pinnedChipText: { fontFamily: fonts.bodyBold, fontSize: 9, color: '#fff' },
  earnedChip: {
    position: 'absolute',
    top: -8,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(74,222,154,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(74,222,154,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    zIndex: 2,
  },
  earnedChipText: { fontFamily: fonts.bodyBold, fontSize: 9, color: colors.success },
  activityHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  activityTitle: { fontFamily: fonts.displaySemi, fontSize: 14, color: colors.text },
  activityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.md },
  activityItem: { width: '47%' },
  activityAmount: { fontFamily: fonts.bodyBold, fontSize: 14, color: colors.accentGold },
  activityLabel: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  postHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  postAvatar: { width: 38, height: 38, borderRadius: 19 },
  postAuthor: { fontFamily: fonts.bodySemi, fontSize: 13, color: colors.text },
  postLocation: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, marginTop: 1 },
  followBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accentViolet,
  },
  followBtnActive: { backgroundColor: colors.accentViolet, borderColor: colors.accentViolet },
  followBtnText: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.text },
  followBtnTextActive: { color: '#0B0B0D' },
  postImage: { width: 300, height: 220, borderRadius: radius.md, marginRight: spacing.sm },
  caption: { fontFamily: fonts.body, fontSize: 13, color: colors.text, marginTop: spacing.md, lineHeight: 19 },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: spacing.sm, flexWrap: 'wrap' },
  tag: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  tagText: { fontFamily: fonts.bodyMed, fontSize: 10, color: colors.textMuted },
  footerRow: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.md },
  footerAction: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerCount: { fontFamily: fonts.bodyMed, fontSize: 12, color: colors.textMuted },
  commentPreview: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  commentAuthor: { fontFamily: fonts.bodyBold, fontSize: 11, color: colors.text },
  commentText: { fontFamily: fonts.body, fontSize: 11, color: colors.textMuted, flex: 1 },
});
