import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useToast } from '@/context/toast';
import type { ToastTone } from '@/context/toast';
import { cn } from '@/lib/utils';

const TONE_ICON: Record<ToastTone, LucideIcon> = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
};

const TONE_CLASSES: Record<ToastTone, string> = {
  success: 'text-sage-600',
  info: 'text-clay-600',
  warning: 'text-amber-600',
};

/**
 * Renders the toast stack. Sits above the mobile bottom nav and moves to the
 * top-right on desktop, and never blocks the safe area on Android.
 */
export function ToastViewport() {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      /* Always mounted and never display:none — a live region inserted at the
         same time as its content is frequently not announced. With no toasts
         it has no children, so nothing is painted. */
      className="pointer-events-none fixed inset-x-0 bottom-[5.5rem] z-50 flex flex-col items-center gap-2 px-4 lg:inset-x-auto lg:bottom-auto lg:right-6 lg:top-6 lg:items-end lg:px-0"
    >
      {toasts.map((toast) => {
        const Icon = TONE_ICON[toast.tone];
        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex w-full max-w-sm animate-fade-in items-start gap-3 rounded-2xl border border-cream-300 bg-white p-3.5 shadow-pop lg:w-80"
          >
            <Icon
              className={cn(
                'mt-0.5 h-[18px] w-[18px] shrink-0',
                TONE_CLASSES[toast.tone],
              )}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-charcoal-800">
                {toast.title}
              </p>
              {toast.description ? (
                <p className="mt-0.5 text-sm text-charcoal-500">
                  {toast.description}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss notification"
              className="-m-1 shrink-0 rounded-full p-1 text-charcoal-400 transition hover:bg-cream-100 hover:text-charcoal-700"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
