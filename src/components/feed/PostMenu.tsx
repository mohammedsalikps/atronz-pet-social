import { useCallback, useRef, useState } from 'react';
import { EyeOff, Flag, MoreHorizontal } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

export interface PostMenuProps {
  /** Used in the button's accessible name so screen readers get context. */
  postLabel: string;
  onHide: () => void;
  onReport: () => void;
}

/**
 * The per-post overflow menu.
 *
 * `useOnClickOutside` closes it on Escape and on outside pointerdown, which
 * also covers touch on Android.
 */
export function PostMenu({ postLabel, onHide, onReport }: PostMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useOnClickOutside(containerRef, close, open);

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`More options for ${postLabel}`}
        className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal-400 transition hover:bg-cream-100 hover:text-charcoal-700"
      >
        <MoreHorizontal className="h-[18px] w-[18px]" aria-hidden="true" />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label={`Options for ${postLabel}`}
          className="absolute right-0 z-30 mt-1 w-52 animate-fade-in overflow-hidden rounded-2xl border border-cream-300 bg-white p-1.5 shadow-pop"
        >
          <MenuItem
            icon={EyeOff}
            label="Hide this post"
            description="Removes it from your feed"
            onClick={() => {
              close();
              onHide();
            }}
          />
          <MenuItem
            icon={Flag}
            label="Report this post"
            description="Tell us what is wrong"
            onClick={() => {
              close();
              onReport();
            }}
          />
        </div>
      ) : null}
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-start gap-2.5 rounded-xl px-2.5 py-2 text-left transition hover:bg-cream-100"
    >
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0 text-charcoal-400"
        aria-hidden="true"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-charcoal-800">
          {label}
        </span>
        <span className="mt-0.5 block text-xs text-charcoal-500">
          {description}
        </span>
      </span>
    </button>
  );
}
