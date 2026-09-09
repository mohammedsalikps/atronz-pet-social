import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SafetyNoticeProps {
  title: string;
  children: string;
  className?: string;
}

/**
 * Standing disclaimer block.
 *
 * Discovery, mating and adoption all surface owner-declared information that
 * Atronz does not verify. Every one of those screens must carry this notice —
 * the app makes no medical, genetic or suitability guarantee.
 */
export function SafetyNotice({ title, children, className }: SafetyNoticeProps) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-2xl border border-cream-300 bg-cream-50 p-4',
        className,
      )}
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-charcoal-500 ring-1 ring-cream-300">
        <ShieldCheck className="h-[17px] w-[17px]" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-charcoal-800">{title}</p>
        <p className="mt-1 text-sm leading-relaxed text-charcoal-500">
          {children}
        </p>
      </div>
    </div>
  );
}
