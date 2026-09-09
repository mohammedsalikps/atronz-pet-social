import { cn } from '@/lib/utils';

const HAS_RADIUS = /(?:^|\s)rounded(?:-|\s|$)/;

/**
 * Neutral shimmer block used by every loading state in the app.
 *
 * Tailwind emits `rounded-full` before `rounded-lg`, so a caller's radius
 * would lose to the default one. Only apply the default when none was passed.
 */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-cream-300/70',
        !HAS_RADIUS.test(className ?? '') && 'rounded-lg',
        className,
      )}
    />
  );
}
