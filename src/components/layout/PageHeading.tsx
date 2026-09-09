import type { ReactNode } from 'react';

export interface PageHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}

/** Consistent title block used by every non-Overview route. */
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: PageHeadingProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-charcoal-400">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-charcoal-900 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 text-sm text-charcoal-500 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {/* `min-w-0` rather than `shrink-0`: a status pill carrying a very long
          pet name must be able to shrink instead of pushing the page wide. */}
      {action ? <div className="min-w-0 max-w-full">{action}</div> : null}
    </div>
  );
}
