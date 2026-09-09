import {
  Bookmark,
  Globe,
  Heart,
  MessageCircle,
  Share2,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PostImageGrid } from '@/components/feed/PostImageGrid';
import { PostMenu } from '@/components/feed/PostMenu';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { commentCount, formatRelativeTime, likeCount } from '@/lib/feed';
import { cn, speciesLabel } from '@/lib/utils';
import type { FeedPost } from '@/types';

export interface PostCardProps {
  post: FeedPost;
  liked: boolean;
  onToggleLike: () => void;
  onToggleSave: () => void;
  onOpenComments: () => void;
  onShare: () => void;
  onHide: () => void;
  onReport: () => void;
}

/**
 * A single post.
 *
 * Every state is carried by an icon change, a label change and `aria-pressed`
 * as well as colour, so none of it depends on colour alone.
 */
export function PostCard({
  post,
  liked,
  onToggleLike,
  onToggleSave,
  onOpenComments,
  onShare,
  onHide,
  onReport,
}: PostCardProps) {
  const likes = likeCount(post);
  const comments = commentCount(post);
  const postLabel = `${post.author.name}'s post about ${post.pet.name}`;
  const VisibilityIcon = post.visibility === 'public' ? Globe : Users;

  return (
    <Card padded={false} className="overflow-hidden">
      <article aria-label={postLabel}>
        <header className="flex items-start gap-3 p-4 pb-3">
          <Avatar name={post.author.name} size="md" />

          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="min-w-0 max-w-full truncate text-sm font-semibold text-charcoal-900">
                {post.author.name}
              </span>
              <span className="min-w-0 max-w-full truncate text-xs text-charcoal-400">
                {post.author.handle}
              </span>
            </div>

            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-charcoal-500">
              <span className="min-w-0 truncate font-medium text-charcoal-700">
                {post.pet.name}
              </span>
              <span aria-hidden="true">•</span>
              <span className="min-w-0 truncate">
                {speciesLabel(post.pet.species)} · {post.pet.breed}
              </span>
              <span aria-hidden="true">•</span>
              <time dateTime={new Date(post.createdAt).toISOString()}>
                {formatRelativeTime(post.createdAt)}
              </time>
            </div>
          </div>

          <PostMenu postLabel={postLabel} onHide={onHide} onReport={onReport} />
        </header>

        <div className="px-4">
          {post.body ? (
            /* `break-words` so an unbroken 60-character string cannot widen
               the card on a 320px screen. */
            <p className="whitespace-pre-line break-words text-sm leading-relaxed text-charcoal-700">
              {post.body}
            </p>
          ) : null}

          <PostImageGrid images={post.images} />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge tone="neutral">
              <VisibilityIcon className="h-3 w-3" aria-hidden="true" />
              {post.visibility === 'public' ? 'Public' : 'Followers'}
            </Badge>
            {post.saved ? <Badge tone="accent">Saved</Badge> : null}
          </div>
        </div>

        <footer className="mt-3 grid grid-cols-4 gap-1 border-t border-cream-200 p-1.5">
          <ActionButton
            icon={Heart}
            label={liked ? 'Unlike' : 'Like'}
            count={likes}
            active={liked}
            filled={liked}
            onClick={onToggleLike}
            accessibleName={`${liked ? 'Unlike' : 'Like'} ${postLabel}. ${likes} ${likes === 1 ? 'like' : 'likes'}.`}
          />
          <ActionButton
            icon={MessageCircle}
            label="Comment"
            count={comments}
            onClick={onOpenComments}
            accessibleName={`Open comments on ${postLabel}. ${comments} ${comments === 1 ? 'comment' : 'comments'}.`}
          />
          <ActionButton
            icon={Share2}
            label="Share"
            onClick={onShare}
            accessibleName={`Share ${postLabel}`}
          />
          <ActionButton
            icon={Bookmark}
            label={post.saved ? 'Saved' : 'Save'}
            active={post.saved}
            filled={post.saved}
            onClick={onToggleSave}
            accessibleName={`${post.saved ? 'Remove from saved' : 'Save'} ${postLabel}`}
          />
        </footer>
      </article>
    </Card>
  );
}

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  count?: number;
  active?: boolean;
  filled?: boolean;
  onClick: () => void;
  accessibleName: string;
}

function ActionButton({
  icon: Icon,
  label,
  count,
  active = false,
  filled = false,
  onClick,
  accessibleName,
}: ActionButtonProps) {
  const pressable = label !== 'Comment' && label !== 'Share';

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={accessibleName}
      aria-pressed={pressable ? active : undefined}
      className={cn(
        'flex min-w-0 items-center justify-center gap-1.5 rounded-xl px-1 py-2 text-xs font-medium transition',
        active
          ? 'bg-clay-50 text-clay-700'
          : 'text-charcoal-500 hover:bg-cream-100 hover:text-charcoal-800',
      )}
    >
      <Icon
        className="h-[17px] w-[17px] shrink-0"
        // A filled icon carries the state without relying on the tint.
        fill={filled ? 'currentColor' : 'none'}
        aria-hidden="true"
      />
      {/* Four labelled actions do not fit a 320px card, and a truncated
          "Co…" is worse than none. The icon, the count and the button's
          accessible name carry it below `sm`. */}
      <span className="hidden truncate sm:inline">{label}</span>
      {typeof count === 'number' && count > 0 ? (
        <span className="shrink-0 tabular-nums">{count}</span>
      ) : null}
    </button>
  );
}
