import { useEffect, useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { REPORT_REASONS } from '@/lib/feed';
import { cn } from '@/lib/utils';
import type { FeedPost, ReportReason } from '@/types';

export interface ReportPostDialogProps {
  post: FeedPost | null;
  onClose: () => void;
  onConfirm: (reason: ReportReason) => void;
}

/**
 * Report confirmation.
 *
 * A reason is required — a report with no reason is not actionable, and asking
 * for one is also a small speed bump against mis-taps on the overflow menu.
 */
export function ReportPostDialog({
  post,
  onClose,
  onConfirm,
}: ReportPostDialogProps) {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setReason(null);
    setSubmitted(false);
  }, [post?.id]);

  if (!post) return null;

  const handleConfirm = () => {
    setSubmitted(true);
    if (!reason) return;
    onConfirm(reason);
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Report this post"
      description={`${post.author.name}'s post about ${post.pet.name}`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} block className="sm:w-auto">
            Cancel
          </Button>
          <Button
            variant="danger"
            icon={Flag}
            onClick={handleConfirm}
            block
            className="sm:w-auto"
          >
            Report post
          </Button>
        </div>
      }
    >
      <fieldset>
        <legend className="text-sm font-medium text-charcoal-800">
          What is wrong with this post?
        </legend>
        <div className="mt-2 space-y-2">
          {REPORT_REASONS.map((option) => (
            <label
              key={option.id}
              className={cn(
                'flex cursor-pointer items-center gap-2.5 rounded-2xl border p-3 text-sm transition',
                reason === option.id
                  ? 'border-clay-300 bg-clay-50 font-medium text-charcoal-900'
                  : 'border-cream-300 bg-white text-charcoal-700 hover:border-clay-200',
              )}
            >
              <input
                type="radio"
                name="report-reason"
                value={option.id}
                checked={reason === option.id}
                onChange={() => {
                  setReason(option.id);
                  setSubmitted(false);
                }}
                className="h-4 w-4 shrink-0 accent-clay-700"
              />
              <span className="min-w-0">{option.label}</span>
            </label>
          ))}
        </div>
        {submitted && !reason ? (
          <p role="alert" className="mt-2 text-xs text-red-700">
            Choose a reason before reporting.
          </p>
        ) : null}
      </fieldset>

      <p className="mt-4 text-xs leading-relaxed text-charcoal-400">
        Reporting removes the post from your feed. Reports are stored locally in
        this preview and are not sent anywhere.
      </p>
    </Modal>
  );
}
