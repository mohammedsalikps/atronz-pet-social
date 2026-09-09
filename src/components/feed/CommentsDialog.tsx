import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { COMMENT_BODY_LIMIT, formatRelativeTime, sortComments } from '@/lib/feed';
import type { FeedPost } from '@/types';

export interface CommentsDialogProps {
  post: FeedPost | null;
  onClose: () => void;
  onSubmit: (body: string) => void;
}

/**
 * The comment thread for one post.
 *
 * Built on the shared Modal, so it is a full-width bottom sheet on mobile and
 * inherits Escape, the focus trap and focus restoration.
 */
export function CommentsDialog({ post, onClose, onSubmit }: CommentsDialogProps) {
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);

  const commentId = post ? post.comments.length : 0;

  // Reset the field when the dialog opens on a different post.
  useEffect(() => {
    setBody('');
    setError(null);
  }, [post?.id]);

  // Keep the newest comment in view after one is added.
  useEffect(() => {
    if (post) listEndRef.current?.scrollIntoView({ block: 'nearest' });
  }, [commentId, post]);

  if (!post) return null;

  const comments = sortComments(post.comments);
  const trimmed = body.trim();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!trimmed) {
      setError('Write a comment before posting.');
      return;
    }
    if (trimmed.length > COMMENT_BODY_LIMIT) {
      setError(`Comments are limited to ${COMMENT_BODY_LIMIT} characters.`);
      return;
    }
    onSubmit(trimmed);
    setBody('');
    setError(null);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Comments"
      description={`On ${post.author.name}'s post about ${post.pet.name}`}
      footer={
        <form onSubmit={handleSubmit} noValidate>
          <label
            htmlFor="comment-body"
            className="block text-xs font-medium text-charcoal-600"
          >
            Add a comment
          </label>
          <div className="mt-1.5 flex items-start gap-2">
            <textarea
              id="comment-body"
              value={body}
              onChange={(event) => {
                setBody(event.target.value);
                if (error) setError(null);
              }}
              rows={2}
              maxLength={COMMENT_BODY_LIMIT}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'comment-error' : 'comment-count'}
              placeholder="Say something kind"
              className="min-w-0 flex-1 resize-none rounded-2xl border border-cream-300 bg-white px-3 py-2 text-sm text-charcoal-800 transition placeholder:text-charcoal-400 hover:border-clay-200"
            />
            <Button
              type="submit"
              icon={Send}
              size="sm"
              className="mt-0.5 shrink-0"
              disabled={!trimmed}
            >
              Post
            </Button>
          </div>
          <div className="mt-1.5 flex items-start justify-between gap-3">
            {error ? (
              <p id="comment-error" role="alert" className="text-xs text-red-700">
                {error}
              </p>
            ) : (
              <span />
            )}
            <p
              id="comment-count"
              className="shrink-0 text-xs tabular-nums text-charcoal-400"
            >
              {body.length}/{COMMENT_BODY_LIMIT}
            </p>
          </div>
        </form>
      }
    >
      {comments.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No comments yet"
          description="Be the first to say something about this post."
          className="border-0 bg-transparent py-6"
        />
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => (
            <li key={comment.id} className="flex gap-2.5">
              <Avatar name={comment.authorName} size="sm" />
              <div className="min-w-0 flex-1 rounded-2xl bg-cream-50 px-3 py-2">
                <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
                  <span className="min-w-0 max-w-full truncate text-sm font-medium text-charcoal-800">
                    {comment.authorName}
                  </span>
                  <time
                    dateTime={new Date(comment.createdAt).toISOString()}
                    className="shrink-0 text-xs text-charcoal-400"
                  >
                    {formatRelativeTime(comment.createdAt)}
                  </time>
                </div>
                <p className="mt-0.5 break-words text-sm leading-relaxed text-charcoal-600">
                  {comment.body}
                </p>
              </div>
            </li>
          ))}
          <div ref={listEndRef} />
        </ul>
      )}
    </Modal>
  );
}
