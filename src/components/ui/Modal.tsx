import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { useBackHandler } from '@/hooks/useBackHandler';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Centred dialog on desktop, full-width bottom sheet on mobile — the pattern
 * Android users expect, and it keeps the close control inside thumb reach.
 *
 * Escape closes it, Tab is trapped inside it, and focus returns to whatever
 * opened it so keyboard users are never dropped at the top of the document.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  /* Android back closes the dialog instead of navigating out from under it.
     Every dialog in the app is built on this Modal, so registering here covers
     all of them at once. */
  useBackHandler(open, onClose);

  useEffect(() => {
    if (!open) return;

    returnFocusRef.current = document.activeElement as HTMLElement | null;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null);
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    // Prefer the first control; fall back to the panel itself.
    const firstField = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    (firstField ?? panelRef.current)?.focus();

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      returnFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 animate-fade-in bg-charcoal-900/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={cn(
          'safe-bottom relative z-10 flex max-h-[88vh] w-full animate-fade-in flex-col',
          'rounded-t-3xl border border-cream-300 bg-white shadow-pop',
          'sm:max-w-lg sm:rounded-3xl',
        )}
      >
        <div className="flex items-start gap-3 border-b border-cream-200 p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-semibold tracking-tight text-charcoal-900">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-charcoal-500">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-m-1 shrink-0 rounded-full p-1.5 text-charcoal-400 transition hover:bg-cream-100 hover:text-charcoal-800"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="app-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {children}
        </div>

        {footer ? (
          <div className="border-t border-cream-200 p-4 sm:p-5">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
