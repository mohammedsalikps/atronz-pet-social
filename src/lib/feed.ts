import type {
  FeedFilter,
  FeedPost,
  PostComment,
  PostVisibility,
  ReportReason,
} from '@/types';

/** Composer limit. Enforced in the UI and again before a post is created. */
export const POST_BODY_LIMIT = 500;

/** Where the character counter turns into a warning. */
export const POST_BODY_WARN_AT = POST_BODY_LIMIT - 60;

export const COMMENT_BODY_LIMIT = 300;

export const FEED_FILTERS: Array<{
  id: FeedFilter;
  label: string;
  /** Shown under the tabs so the filter's rule is never a mystery. */
  hint: string;
}> = [
  {
    id: 'for-you',
    label: 'For You',
    hint: 'Everything from the Atronz community.',
  },
  {
    id: 'following',
    label: 'Following',
    hint: 'Only the owners you follow.',
  },
  {
    id: 'nearby',
    label: 'Nearby',
    hint: 'Demo city-level data — not real-time location tracking.',
  },
];

export const REPORT_REASONS: Array<{ id: ReportReason; label: string }> = [
  { id: 'spam', label: 'Spam or a scam' },
  { id: 'animal-welfare', label: 'Animal welfare concern' },
  { id: 'misleading', label: 'Misleading or false information' },
  { id: 'harassment', label: 'Harassment or abuse' },
  { id: 'other', label: 'Something else' },
];

export const VISIBILITY_OPTIONS: Array<{
  id: PostVisibility;
  label: string;
  description: string;
}> = [
  {
    id: 'followers',
    label: 'Followers',
    description: 'Only owners who follow you can see this post.',
  },
  {
    id: 'public',
    label: 'Public',
    description: 'Anyone on Atronz Pet Social can see this post.',
  },
];

/** Count derived from the reactions list, never stored alongside it. */
export function likeCount(post: FeedPost): number {
  return post.reactions.length;
}

export function isLikedBy(post: FeedPost, userId: string): boolean {
  return post.reactions.some((reaction) => reaction.userId === userId);
}

export function commentCount(post: FeedPost): number {
  return post.comments.length;
}

export interface FeedFilterContext {
  viewerId: string;
  /** Author ids the viewer follows. */
  followingIds: string[];
  /** The viewer's own broad city, or null when they keep it private. */
  city: string | null;
}

/**
 * Applies the selected feed filter.
 *
 * Nearby is a plain city-string match on purpose: no coordinates, no radius,
 * no device location. If the viewer has not shared a city, Nearby returns
 * nothing rather than guessing.
 */
export function filterPosts(
  posts: FeedPost[],
  filter: FeedFilter,
  context: FeedFilterContext,
): FeedPost[] {
  switch (filter) {
    case 'following':
      return posts.filter(
        (post) =>
          context.followingIds.includes(post.author.id) ||
          post.author.id === context.viewerId,
      );
    case 'nearby':
      if (!context.city) return [];
      return posts.filter((post) => post.author.city === context.city);
    case 'for-you':
      return posts;
  }
}

/** Newest first. The feed is never re-sorted anywhere else. */
export function sortPosts(posts: FeedPost[]): FeedPost[] {
  return [...posts].sort((a, b) => b.createdAt - a.createdAt);
}

/** "Just now", "14m", "3h", "2d", then an absolute date. */
export function formatRelativeTime(
  createdAt: number,
  now: number = Date.now(),
): string {
  const seconds = Math.max(0, Math.round((now - createdAt) / 1000));
  if (seconds < 45) return 'Just now';

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
  }).format(new Date(createdAt));
}

/**
 * Ids for locally created posts and comments.
 *
 * `crypto.randomUUID` is not available in every Android WebView, so this falls
 * back to a counter that is still unique within the session.
 */
let localIdCounter = 0;
export function createLocalId(prefix: string): string {
  localIdCounter += 1;
  const random =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-local-${localIdCounter}-${random}`;
}

export interface DraftValidation {
  valid: boolean;
  /** Field-level messages, keyed so the composer can place them. */
  errors: { body?: string; pet?: string };
}

/**
 * A post needs something to say: text, an image, or both.
 *
 * Run by the composer on submit and again by the context before a post is
 * created, so an invalid post cannot reach the feed by any path.
 */
export function validateDraft(draft: {
  body: string;
  imageUrl: string;
  petId: string;
}): DraftValidation {
  const errors: DraftValidation['errors'] = {};
  const body = draft.body.trim();

  if (!body && !draft.imageUrl.trim()) {
    errors.body = 'Write something, or add an image, before publishing.';
  } else if (body.length > POST_BODY_LIMIT) {
    errors.body = `Posts are limited to ${POST_BODY_LIMIT} characters.`;
  }

  if (!draft.petId) {
    errors.pet = 'Choose which pet this post is about.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/** Newest comment last, matching how a conversation reads. */
export function sortComments(comments: PostComment[]): PostComment[] {
  return [...comments].sort((a, b) => a.createdAt - b.createdAt);
}
