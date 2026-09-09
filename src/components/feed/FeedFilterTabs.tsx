import { FEED_FILTERS } from '@/lib/feed';
import { cn } from '@/lib/utils';
import type { FeedFilter } from '@/types';

export interface FeedFilterTabsProps {
  value: FeedFilter;
  onChange: (filter: FeedFilter) => void;
}

/**
 * The three feed filters.
 *
 * A real tablist: arrow keys move between tabs and `aria-selected` carries the
 * state, so it does not depend on the pill tint. The hint line under the tabs
 * states each filter's rule — Nearby in particular, so nobody has to guess
 * whether it is reading their location.
 */
export function FeedFilterTabs({ value, onChange }: FeedFilterTabsProps) {
  const activeIndex = FEED_FILTERS.findIndex((filter) => filter.id === value);
  const hint = FEED_FILTERS[activeIndex]?.hint ?? '';

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const next =
      (activeIndex + delta + FEED_FILTERS.length) % FEED_FILTERS.length;
    onChange(FEED_FILTERS[next].id);
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Feed filter"
        onKeyDown={onKeyDown}
        className="no-scrollbar flex gap-1.5 overflow-x-auto rounded-full border border-cream-300 bg-cream-50 p-1"
      >
        {FEED_FILTERS.map((filter) => {
          const selected = filter.id === value;
          return (
            <button
              key={filter.id}
              type="button"
              role="tab"
              id={`feed-tab-${filter.id}`}
              aria-selected={selected}
              aria-controls="feed-panel"
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(filter.id)}
              className={cn(
                'shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition',
                selected
                  ? 'bg-clay-700 text-white shadow-sm'
                  : 'text-charcoal-500 hover:bg-white hover:text-charcoal-800',
              )}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 px-1 text-xs text-charcoal-400">{hint}</p>
    </div>
  );
}
