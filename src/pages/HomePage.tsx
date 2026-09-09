import { useCallback, useMemo, useState } from 'react';
import { EyeOff, Images, PenLine, Users } from 'lucide-react';
import { CommentsDialog } from '@/components/feed/CommentsDialog';
import { CreatePostDialog } from '@/components/feed/CreatePostDialog';
import { FeedFilterTabs } from '@/components/feed/FeedFilterTabs';
import { FeedSkeleton } from '@/components/feed/FeedSkeleton';
import { PostCard } from '@/components/feed/PostCard';
import { ReportPostDialog } from '@/components/feed/ReportPostDialog';
import { SafetyNotice } from '@/components/common/SafetyNotice';
import { PageHeading } from '@/components/layout/PageHeading';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppData } from '@/context/appData';
import { useToast } from '@/context/toast';
import {
  FEED_FILTERS,
  commentCount,
  filterPosts,
  likeCount,
  sortPosts,
} from '@/lib/feed';
import { greetingForNow } from '@/lib/utils';
import type { FeedFilter, NewPostDraft, ReportReason } from '@/types';

/**
 * Home — the social feed.
 *
 * Posts are the single source of truth in `AppDataContext`; this page only
 * selects, filters and renders them. Counts are derived per render from each
 * post's own reactions and comments, never stored alongside them.
 */
export function HomePage() {
  const {
    status,
    owner,
    pets,
    privacy,
    visiblePosts,
    followingIds,
    hiddenPostIds,
    isPostLiked,
    toggleLike,
    toggleSave,
    hidePost,
    reportPost,
    restoreHiddenPosts,
    addComment,
    createPost,
  } = useAppData();
  const { showToast } = useToast();

  const [filter, setFilter] = useState<FeedFilter>('for-you');
  const [composerOpen, setComposerOpen] = useState(false);
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);
  const [reportPostId, setReportPostId] = useState<string | null>(null);
  /*
   * Announcements for actions that change state without opening anything:
   * like, save, hide, report, publish and comment. Toasts cover the loud ones,
   * this covers every one for screen reader users.
   */
  const [announcement, setAnnouncement] = useState('');

  const feedPosts = useMemo(
    () =>
      sortPosts(
        filterPosts(visiblePosts, filter, {
          viewerId: owner?.id ?? '',
          followingIds,
          // Nearby needs a city the owner has chosen to share. No city, no results.
          city: privacy.showCity ? (owner?.city ?? null) : null,
        }),
      ),
    [visiblePosts, filter, owner, followingIds, privacy.showCity],
  );

  const commentsPost = commentsPostId
    ? (visiblePosts.find((post) => post.id === commentsPostId) ?? null)
    : null;
  const reportTarget = reportPostId
    ? (visiblePosts.find((post) => post.id === reportPostId) ?? null)
    : null;

  const handleToggleLike = useCallback(
    (postId: string) => {
      const post = visiblePosts.find((item) => item.id === postId);
      if (!post) return;
      const willLike = !isPostLiked(postId);
      toggleLike(postId);
      const nextCount = likeCount(post) + (willLike ? 1 : -1);
      setAnnouncement(
        `${willLike ? 'Liked' : 'Unliked'} ${post.author.name}'s post. ${nextCount} ${nextCount === 1 ? 'like' : 'likes'}.`,
      );
    },
    [visiblePosts, isPostLiked, toggleLike],
  );

  const handleToggleSave = useCallback(
    (postId: string) => {
      const post = visiblePosts.find((item) => item.id === postId);
      if (!post) return;
      toggleSave(postId);
      setAnnouncement(
        post.saved
          ? `Removed ${post.author.name}'s post from your saved posts.`
          : `Saved ${post.author.name}'s post.`,
      );
    },
    [visiblePosts, toggleSave],
  );

  const handleShare = useCallback(
    (postId: string) => {
      const post = visiblePosts.find((item) => item.id === postId);
      if (!post) return;
      /*
       * Nothing is copied or sent: there is no clipboard call and no share
       * target. The wording says so rather than implying a link is waiting on
       * the clipboard.
       */
      showToast({
        tone: 'info',
        title: 'Post shared in demo mode',
        description: `Sharing ${post.author.name}'s post about ${post.pet.name} is a preview — nothing was copied or sent.`,
      });
      setAnnouncement(
        `Shared ${post.author.name}'s post in demo mode. Nothing was copied or sent.`,
      );
    },
    [visiblePosts, showToast],
  );

  const handleHide = useCallback(
    (postId: string) => {
      const post = visiblePosts.find((item) => item.id === postId);
      if (!post) return;
      hidePost(postId);
      showToast({
        tone: 'info',
        title: 'Post hidden',
        description: 'You will not see this post in your feed again.',
      });
      setAnnouncement(`Hid ${post.author.name}'s post from your feed.`);
    },
    [visiblePosts, hidePost, showToast],
  );

  const handleReport = useCallback(
    (reason: ReportReason) => {
      const post = reportTarget;
      if (!post) return;
      reportPost(post.id, reason);
      setReportPostId(null);
      showToast({
        tone: 'success',
        title: 'Post reported',
        description:
          'Thanks — it has been removed from your feed. Reports stay on this device in the preview.',
      });
      setAnnouncement(
        `Reported ${post.author.name}'s post and removed it from your feed.`,
      );
    },
    [reportTarget, reportPost, showToast],
  );

  const handleAddComment = useCallback(
    (body: string) => {
      if (!commentsPost) return;
      const comment = addComment(commentsPost.id, body);
      if (!comment) return;
      const nextCount = commentCount(commentsPost) + 1;
      setAnnouncement(
        `Comment added. ${nextCount} ${nextCount === 1 ? 'comment' : 'comments'} on this post.`,
      );
    },
    [commentsPost, addComment],
  );

  const handlePublish = useCallback(
    (draft: NewPostDraft) => {
      const post = createPost(draft);
      if (!post) return;
      setComposerOpen(false);
      // A followers-only post is invisible under Nearby unless the city matches;
      // snapping back to For You guarantees the author sees what they published.
      setFilter('for-you');
      showToast({
        tone: 'success',
        title: 'Post published',
        description: `Your post about ${post.pet.name} is at the top of your feed.`,
      });
      setAnnouncement(`Published your post about ${post.pet.name}.`);
    },
    [createPost, showToast],
  );

  const filterLabel =
    FEED_FILTERS.find((item) => item.id === filter)?.label ?? 'For You';

  return (
    <div>
      <PageHeading
        eyebrow="Atronz Pet Social"
        title="Home"
        description="Share your pets, meet nearby owners, and keep up with the community."
      />

      {/* Composer entry point, doubling as the current-user context row. */}
      <Card className="mb-4">
        <div className="flex items-center gap-3">
          {owner ? (
            <Avatar name={owner.name} size="lg" />
          ) : (
            <Avatar name="Atronz" size="lg" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-charcoal-900">
              {owner ? `${greetingForNow()}, ${owner.name.split(' ')[0]}` : greetingForNow()}
            </p>
            <p className="truncate text-xs text-charcoal-500">
              {pets.length > 0
                ? `Posting as ${owner?.handle ?? 'you'} · ${pets.map((pet) => pet.name).join(', ')}`
                : `Posting as ${owner?.handle ?? 'you'}`}
            </p>
          </div>
          <Button
            icon={PenLine}
            size="sm"
            className="shrink-0"
            onClick={() => setComposerOpen(true)}
          >
            <span className="hidden sm:inline">Create post</span>
            <span className="sm:hidden">Post</span>
          </Button>
        </div>
      </Card>

      <FeedFilterTabs value={filter} onChange={setFilter} />

      {/* Single polite live region for every feed action. */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      <div
        id="feed-panel"
        role="tabpanel"
        aria-labelledby={`feed-tab-${filter}`}
        className="mt-4"
      >
        {/*
          Standing disclosure while Nearby is selected. The tab hint is a single
          line; this states the whole rule, so "Nearby" is never mistaken for
          live location.
        */}
        {filter === 'nearby' ? (
          <SafetyNotice
            title="Nearby uses demo city-level data"
            className="mb-3"
          >
            Posts are matched on the city name in a profile — placeholder data
            in this preview. Atronz Pet Social does not track your location, ask
            for a location permission, or use GPS, and there is no distance or
            radius behind this filter.
          </SafetyNotice>
        ) : null}

        {status === 'loading' ? (
          <FeedSkeleton />
        ) : feedPosts.length > 0 ? (
          <div className="space-y-3">
            {feedPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                liked={isPostLiked(post.id)}
                onToggleLike={() => handleToggleLike(post.id)}
                onToggleSave={() => handleToggleSave(post.id)}
                onOpenComments={() => setCommentsPostId(post.id)}
                onShare={() => handleShare(post.id)}
                onHide={() => handleHide(post.id)}
                onReport={() => setReportPostId(post.id)}
              />
            ))}
          </div>
        ) : visiblePosts.length === 0 ? (
          /* Everything has been hidden or reported. */
          <EmptyState
            icon={EyeOff}
            title="Your feed is empty"
            description={
              hiddenPostIds.length > 0
                ? 'You have hidden every post in your feed. You can bring the hidden ones back.'
                : 'There is nothing left to show. Create a post to get started.'
            }
            actionLabel={hiddenPostIds.length > 0 ? 'Show hidden posts' : 'Create a post'}
            onAction={
              hiddenPostIds.length > 0
                ? () => {
                    restoreHiddenPosts();
                    setAnnouncement('Hidden posts restored to your feed.');
                  }
                : () => setComposerOpen(true)
            }
          />
        ) : (
          /* Posts exist, but none match the selected filter. */
          <EmptyState
            icon={filter === 'nearby' ? Users : Images}
            title={`Nothing in ${filterLabel} yet`}
            description={
              filter === 'nearby' && !privacy.showCity
                ? 'Nearby matches on the city name in your profile. Turn on “Show my city” in Profile to use it — no location permission is involved.'
                : filter === 'nearby'
                  ? 'No demo posts share your city right now. Try For You instead.'
                  : 'The owners you follow have not posted recently. Try For You instead.'
            }
            actionLabel="Switch to For You"
            onAction={() => setFilter('for-you')}
          />
        )}
      </div>

      <CreatePostDialog
        open={composerOpen}
        pets={pets}
        onClose={() => setComposerOpen(false)}
        onPublish={handlePublish}
      />

      <CommentsDialog
        post={commentsPost}
        onClose={() => setCommentsPostId(null)}
        onSubmit={handleAddComment}
      />

      <ReportPostDialog
        post={reportTarget}
        onClose={() => setReportPostId(null)}
        onConfirm={handleReport}
      />
    </div>
  );
}
