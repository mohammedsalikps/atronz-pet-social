import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Extra content below the action, e.g. a planned-features list. */
  children?: ReactNode;
  className?: string;
}

/** Shared empty state so no panel or route ever renders blank. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-cream-300 bg-cream-50 px-4 py-10 text-center',
        className,
      )}
    >
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white text-clay-600 ring-1 ring-cream-300">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-charcoal-800">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-charcoal-500">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <Button variant="secondary" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      ) : null}
      {children ? <div className="mt-5 w-full">{children}</div> : null}
    </div>
  );
}
