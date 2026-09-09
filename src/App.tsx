import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppErrorBoundary } from '@/components/layout/AppErrorBoundary';
import { AndroidBackButton } from '@/components/layout/AndroidBackButton';
import { AppShell } from '@/components/layout/AppShell';
import { ToastViewport } from '@/components/ui/ToastViewport';
import { AppDataProvider } from '@/context/AppDataContext';
import { ToastProvider } from '@/context/ToastContext';
import { AdoptionPage } from '@/pages/AdoptionPage';
import { DiscoverPage } from '@/pages/DiscoverPage';
import { HomePage } from '@/pages/HomePage';
import { MarketplacePage } from '@/pages/MarketplacePage';
import { MatchesPage } from '@/pages/MatchesPage';
import { MessagesPage } from '@/pages/MessagesPage';
import { MyPetsPage } from '@/pages/MyPetsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ServicesPage } from '@/pages/ServicesPage';

/**
 * `HashRouter` is deliberate: Capacitor serves the built app from the
 * filesystem, where a history-based router breaks on reload and deep links.
 */
export default function App() {
  return (
    <AppErrorBoundary>
      <AppDataProvider>
        <ToastProvider>
          <HashRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <AndroidBackButton />
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<Navigate to="/feed" replace />} />
                <Route path="/feed" element={<HomePage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/matches" element={<MatchesPage />} />
                <Route path="/adoption" element={<AdoptionPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/pets" element={<MyPetsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </HashRouter>
          <ToastViewport />
        </ToastProvider>
      </AppDataProvider>
    </AppErrorBoundary>
  );
}
