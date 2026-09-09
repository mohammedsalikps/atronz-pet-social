import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { Search, X } from 'lucide-react';
import { useToast } from '@/context/toast';
import { cn } from '@/lib/utils';

/**
 * Global search entry point, split into a trigger and a form.
 *
 * They are separate components because the header row cannot hold a field plus
 * three 40px controls at 320px: the trigger sits in the right-hand cluster
 * while the mobile form wraps onto its own line beneath it.
 */

export interface SearchTriggerProps {
  open: boolean;
  onToggle: () => void;
  className?: string;
}

/** Mobile-only toggle. The desktop layout shows the field directly. */
export function SearchTrigger({ open, onToggle, className }: SearchTriggerProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={open ? 'Close search' : 'Search Atronz Pet Social'}
      aria-expanded={open}
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream-300 bg-white text-charcoal-600 shadow-sm transition hover:border-clay-200 hover:text-charcoal-900 lg:hidden',
        className,
      )}
    >
      {open ? (
        <X className="h-[18px] w-[18px]" aria-hidden="true" />
      ) : (
        <Search className="h-[18px] w-[18px]" aria-hidden="true" />
      )}
    </button>
  );
}

export interface SearchFormProps {
  /** Focus on mount — used by the mobile row when it expands. */
  autoFocus?: boolean;
  onSubmitted?: () => void;
  className?: string;
}

/**
 * The field itself.
 *
 * Step 1 has nothing to search yet, so submitting acknowledges the query
 * rather than pretending to return results.
 */
export function SearchForm({
  autoFocus = false,
  onSubmitted,
  className,
}: SearchFormProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  const submit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;
      showToast({
        tone: 'info',
        title: `Searched for “${trimmed}”`,
        description:
          'Results arrive with the feed, discovery and marketplace modules.',
      });
      setQuery('');
      onSubmitted?.();
    },
    [query, showToast, onSubmitted],
  );

  return (
    <form onSubmit={submit} role="search" className={className}>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search pets, owners, services"
          aria-label="Search Atronz Pet Social"
          className="h-10 w-full rounded-full border border-cream-300 bg-white pl-9 pr-3 text-sm text-charcoal-800 shadow-sm transition placeholder:text-charcoal-400 hover:border-clay-200"
        />
      </div>
    </form>
  );
}
