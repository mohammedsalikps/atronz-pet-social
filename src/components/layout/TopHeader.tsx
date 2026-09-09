import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { NotificationButton } from '@/components/header/NotificationButton';
import { ProfileButton } from '@/components/header/ProfileButton';
import { SearchForm, SearchTrigger } from '@/components/header/SearchControl';
import { Logo } from '@/components/ui/Logo';
import { activeNavItem } from '@/config/navigation';

export interface TopHeaderProps {
  onOpenMenu: () => void;
}

/**
 * Sticky header inside the main content column.
 *
 * The control row is `flex-wrap` on purpose: on mobile the search field is a
 * `basis-full` sibling of the button cluster and needs a line to wrap onto.
 */
export function TopHeader({ onOpenMenu }: TopHeaderProps) {
  const { pathname } = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const sectionLabel = activeNavItem(pathname)?.label ?? 'Atronz Pet Social';

  // A route change means the user got where they were going — collapse search.
  useEffect(() => setSearchOpen(false), [pathname]);

  return (
    <header className="safe-top sticky top-0 z-30 border-b border-cream-300 bg-cream-100/90 backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Open menu"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cream-300 bg-white text-charcoal-600 shadow-sm transition hover:border-clay-200 lg:hidden"
          >
            <Menu className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>

          {/* Compact brand on mobile, section title on desktop. */}
          <Logo showWordmark={false} className="lg:hidden" />
          <h1 className="hidden min-w-0 truncate text-lg font-semibold tracking-tight text-charcoal-900 lg:block">
            {sectionLabel}
          </h1>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <SearchForm className="hidden w-72 lg:block" />
            <SearchTrigger
              open={searchOpen}
              onToggle={() => setSearchOpen((value) => !value)}
            />
            <NotificationButton />
            <ProfileButton />
          </div>

          {searchOpen ? (
            <SearchForm
              autoFocus
              onSubmitted={() => setSearchOpen(false)}
              className="mt-1 w-full basis-full animate-fade-in lg:hidden"
            />
          ) : null}
        </div>
      </div>
    </header>
  );
}
