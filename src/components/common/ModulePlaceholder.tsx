import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Check } from 'lucide-react';
import { PageHeading } from '@/components/layout/PageHeading';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export interface ModulePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Which build step this module lands in, e.g. "Step 3". */
  step: string;
  /** What the finished module will contain — the scope, stated up front. */
  planned: string[];
  /** Optional standing disclaimer, e.g. the mating safety notice. */
  children?: ReactNode;
}

/**
 * The Step 1 stand-in for a module that has not been built yet.
 *
 * It states the scope rather than showing fake content: a screen that mocks up
 * a feed nobody can interact with reads as broken, whereas a stated plan reads
 * as deliberate.
 */
export function ModulePlaceholder({
  eyebrow,
  title,
  description,
  icon,
  step,
  planned,
  children,
}: ModulePlaceholderProps) {
  return (
    <div>
      <PageHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        action={<Badge tone="accent">Arrives in {step}</Badge>}
      />

      {children ? <div className="mb-4">{children}</div> : null}

      <EmptyState
        icon={icon}
        title="Nothing here yet"
        description="The app shell is in place. This module gets built next."
      >
        <ul className="mx-auto grid max-w-xl gap-2 text-left sm:grid-cols-2">
          {planned.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2 rounded-xl border border-cream-300 bg-white px-3 py-2 text-sm text-charcoal-600"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-clay-600"
                aria-hidden="true"
              />
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ul>
      </EmptyState>
    </div>
  );
}
