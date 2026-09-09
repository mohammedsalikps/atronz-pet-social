import { NavLink } from 'react-router-dom';
import { ArrowUpRight, HeartPulse } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { NAV_GROUPS, navItemsInGroup } from '@/config/navigation';
import { useAppData } from '@/context/appData';
import { cn } from '@/lib/utils';

export interface SidebarProps {
  /** Called after a nav item is chosen — used to close the mobile drawer. */
  onNavigate?: () => void;
  className?: string;
}

/**
 * Primary navigation column. Rendered fixed on desktop and reused verbatim
 * inside the mobile drawer, so there is only one nav implementation.
 *
 * Grouped rather than flat: ten destinations in a single list is a wall.
 */
export function Sidebar({ onNavigate, className }: SidebarProps) {
  const { unreadNotificationCount, unreadMessageCount } = useAppData();

  const badgeFor = (id: string): number => {
    if (id === 'notifications') return unreadNotificationCount;
    if (id === 'messages') return unreadMessageCount;
    return 0;
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r border-cream-300 bg-cream-50',
        className,
      )}
    >
      <div className="px-5 pb-4 pt-5">
        <Logo showProductName />
      </div>

      <nav
        aria-label="Primary"
        className="app-scrollbar flex-1 overflow-y-auto px-3 pb-2"
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.id} className="mb-3 last:mb-0">
            <p className="px-2.5 pb-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-charcoal-400">
              {group.label}
            </p>
            <ul className="space-y-1">
              {navItemsInGroup(group.id).map((item) => {
                const badge = badgeFor(item.id);
                return (
                  <li key={item.id}>
                    <NavLink
                      to={item.to}
                      onClick={onNavigate}
                      className={({ isActive }) =>
                        cn(
                          'group flex items-center gap-3 rounded-xl px-2.5 py-2 text-sm font-medium transition',
                          isActive
                            ? 'bg-white text-charcoal-900 shadow-card ring-1 ring-cream-300'
                            : 'text-charcoal-500 hover:bg-white/70 hover:text-charcoal-800',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition',
                              isActive
                                ? 'bg-clay-700 text-white'
                                : 'bg-cream-200 text-charcoal-500 group-hover:bg-clay-50 group-hover:text-clay-700',
                            )}
                          >
                            <item.icon
                              className="h-[17px] w-[17px]"
                              aria-hidden="true"
                            />
                          </span>
                          <span className="min-w-0 flex-1 truncate">
                            {item.label}
                          </span>
                          {badge > 0 ? (
                            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-clay-700 px-1.5 text-[11px] font-semibold text-white">
                              {badge}
                            </span>
                          ) : null}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/*
        Cross-link to the sibling product. Atronz Pet Health is a separate
        install with its own package id, so this is informational for now —
        it deliberately does not deep-link anywhere.
      */}
      <div className="border-t border-cream-300 p-3">
        <div className="flex items-start gap-3 rounded-xl border border-cream-300 bg-white p-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sage-50 text-sage-700">
            <HeartPulse className="h-[17px] w-[17px]" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1 text-sm font-medium text-charcoal-800">
              Atronz Pet Health
              <ArrowUpRight
                className="h-3.5 w-3.5 text-charcoal-400"
                aria-hidden="true"
              />
            </span>
            <span className="mt-0.5 block text-xs leading-snug text-charcoal-500">
              Health monitoring lives in its own app
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
