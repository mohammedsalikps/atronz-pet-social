import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { BOTTOM_BAR_ITEMS } from '@/config/navigation';
import { useAppData } from '@/context/appData';
import { useBackHandler } from '@/hooks/useBackHandler';
import { cn } from '@/lib/utils';

/**
 * Bottom tab bar shown below the `lg` breakpoint.
 *
 * Only the five `inBottomBar` destinations appear — six tabs stop fitting at
 * 320px. The other five live in the drawer and the header.
 */
export function MobileNavigation({ className }: { className?: string }) {
  const { unreadMessageCount } = useAppData();

  return (
    <nav
      aria-label="Primary mobile"
      className={cn(
        'safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-cream-300 bg-cream-50/95 backdrop-blur lg:hidden',
        className,
      )}
    >
      <ul className="mx-auto flex max-w-lg items-stretch">
        {BOTTOM_BAR_ITEMS.map((item) => {
          const badge = item.id === 'messages' ? unreadMessageCount : 0;
          return (
            <li key={item.id} className="min-w-0 flex-1">
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 px-0.5 py-2 text-[11px] font-medium transition',
                    isActive
                      ? 'text-clay-700'
                      : 'text-charcoal-400 hover:text-charcoal-600',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={cn(
                        'relative flex h-7 w-12 items-center justify-center rounded-full transition',
                        isActive ? 'bg-clay-50' : 'bg-transparent',
                      )}
                    >
                      <item.icon
                        className="h-[18px] w-[18px]"
                        aria-hidden="true"
                      />
                      {badge > 0 ? (
                        <span
                          className="absolute right-1.5 top-0 h-2 w-2 rounded-full bg-clay-700 ring-2 ring-cream-50"
                          aria-hidden="true"
                        />
                      ) : null}
                    </span>
                    <span className="w-full truncate text-center">
                      {item.shortLabel}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export interface MobileMenuDrawerProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Slide-in drawer holding the full grouped sidebar, including the five
 * destinations the bottom bar has no room for.
 */
export function MobileMenuDrawer({ open, onClose }: MobileMenuDrawerProps) {
  // Android back closes the drawer rather than leaving the route behind it.
  useBackHandler(open, onClose);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <div
      /*
       * `invisible` when closed, not just `aria-hidden`: focusable content
       * inside an aria-hidden subtree is still reachable by Tab, so a keyboard
       * user could land in a drawer they cannot see. `visibility` takes the
       * whole subtree out of the tab order, and the delay lets the slide-out
       * finish before it applies.
       */
      className={cn(
        'lg:hidden',
        open ? 'pointer-events-auto' : 'invisible pointer-events-none',
      )}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-40 bg-charcoal-900/30 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0',
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[min(17rem,85vw)] transition-transform duration-200 ease-out',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="relative h-full">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="absolute right-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-cream-300 bg-white text-charcoal-500 transition hover:text-charcoal-800"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          <Sidebar onNavigate={onClose} className="h-full" />
        </div>
      </div>
    </div>
  );
}
