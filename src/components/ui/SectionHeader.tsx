import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface SectionHeaderProps {
  title: string;
  description?: string;
  /** Optional trailing control, e.g. a "View all" button. */
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({
  title,
  description,
  action,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-charcoal-800">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-sm text-charcoal-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
