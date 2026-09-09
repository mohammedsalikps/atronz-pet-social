import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  MobileMenuDrawer,
  MobileNavigation,
} from '@/components/layout/MobileNavigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopHeader } from '@/components/layout/TopHeader';
import { useIsDesktop } from '@/hooks/useMediaQuery';

/**
 * The persistent frame around every route: fixed sidebar on desktop, bottom
 * tab bar plus a drawer on mobile, and a sticky header in between.
 */
export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const isDesktop = useIsDesktop();
  const { pathname } = useLocation();

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Close the drawer when the viewport grows or the route changes.
  useEffect(() => {
    if (isDesktop) setMenuOpen(false);
  }, [isDesktop]);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-cream-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        <Sidebar className="h-full" />
      </aside>

      <MobileMenuDrawer open={menuOpen} onClose={closeMenu} />

      <div className="flex min-h-screen flex-col lg:pl-64">
        <TopHeader onOpenMenu={() => setMenuOpen(true)} />

        {/* `pb-28` clears the mobile tab bar; desktop has no bar to clear. */}
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-5 sm:px-6 sm:pt-6 lg:px-8 lg:pb-12">
          <Outlet />
        </main>
      </div>

      <MobileNavigation />
    </div>
  );
}
