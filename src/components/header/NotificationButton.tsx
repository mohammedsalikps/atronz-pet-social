import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAppData } from '@/context/appData';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import { formatRelativeTime } from '@/lib/feed';
import { cn } from '@/lib/utils';
import type { NotificationKind } from '@/types';

/** Dot colour per notification kind — the only signal at this size. */
const KIND_DOT: Record<NotificationKind, string> = {
  like: 'bg-clay-400',
  comment: 'bg-clay-400',
  follow: 'bg-clay-400',
  match: 'bg-clay-600',
  'contact-request': 'bg-clay-600',
  'adoption-interest': 'bg-sage-500',
  message: 'bg-charcoal-400',
  service: 'bg-gold',
};

/** Bell in the top header plus the notification panel it opens. */
export function NotificationButton({ className }: { className?: string }) {
  const {
    notifications,
    unreadNotificationCount,
    markAllNotificationsRead,
    markNotificationRead,
  } = useAppData();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);
  useOnClickOutside(containerRef, close, open);

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={
          unreadNotificationCount > 0
            ? `Notifications, ${unreadNotificationCount} unread`
            : 'Notifications'
        }
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cream-300 bg-white text-charcoal-600 shadow-sm transition hover:border-clay-200 hover:text-charcoal-900"
      >
        <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
        {unreadNotificationCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-clay-700 px-1 text-[10px] font-semibold text-white ring-2 ring-cream-100">
            {unreadNotificationCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="Notifications"
          /* Right-anchored to the bell, which sits ~5rem from the right edge on
             mobile (gutter + avatar + gap). Clamping to `100vw - 5rem` keeps
             its left edge on screen at 320px. */
          className="absolute right-0 z-40 mt-2 w-[min(20rem,calc(100vw-5rem))] animate-fade-in overflow-hidden rounded-2xl border border-cream-300 bg-white shadow-pop sm:w-80"
        >
          <div className="flex items-center justify-between gap-3 border-b border-cream-200 px-4 py-3">
            <h3 className="text-sm font-semibold text-charcoal-800">
              Notifications
            </h3>
            {unreadNotificationCount > 0 ? (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="text-xs font-medium text-clay-700 transition hover:text-clay-800"
              >
                Mark all read
              </button>
            ) : null}
          </div>

          <div className="app-scrollbar max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <EmptyState
                icon={BellOff}
                title="You are all caught up"
                description="Likes, matches and contact requests will show up here."
                className="m-3 border-0 bg-transparent py-6"
              />
            ) : (
              <ul className="divide-y divide-cream-200">
                {notifications.map((note) => (
                  <li key={note.id}>
                    <button
                      type="button"
                      onClick={() => markNotificationRead(note.id)}
                      className={cn(
                        'flex w-full gap-3 px-4 py-3 text-left transition hover:bg-cream-50',
                        !note.read && 'bg-clay-50/60',
                      )}
                    >
                      <span
                        className={cn(
                          'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                          note.read ? 'bg-cream-300' : KIND_DOT[note.kind],
                        )}
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-medium text-charcoal-800">
                          {note.title}
                        </span>
                        <span className="mt-0.5 block text-sm text-charcoal-500">
                          {note.description}
                        </span>
                        <span className="mt-1 block text-xs text-charcoal-400">
                          <time dateTime={new Date(note.createdAt).toISOString()}>
                            {formatRelativeTime(note.createdAt)}
                          </time>
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-cream-200 p-2">
            <button
              type="button"
              onClick={() => {
                close();
                navigate('/notifications');
              }}
              className="w-full rounded-xl px-3 py-2 text-sm font-medium text-clay-700 transition hover:bg-cream-100"
            >
              See all notifications
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
