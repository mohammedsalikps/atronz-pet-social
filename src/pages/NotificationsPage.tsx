import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  BellOff,
  CalendarCheck,
  CheckCheck,
  Heart,
  MessageCircle,
  MessageSquare,
  Sparkles,
  UserPlus,
  UsersRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeading } from '@/components/layout/PageHeading';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppData } from '@/context/appData';
import { formatRelativeTime } from '@/lib/feed';
import { cn } from '@/lib/utils';
import type { NotificationKind } from '@/types';

const KIND_ICON: Record<NotificationKind, LucideIcon> = {
  like: Heart,
  comment: MessageSquare,
  follow: UserPlus,
  match: UsersRound,
  'contact-request': MessageCircle,
  'adoption-interest': Sparkles,
  message: MessageCircle,
  service: CalendarCheck,
};

type Filter = 'all' | 'unread';

/**
 * Notifications — a record of what actually happened in this session.
 *
 * Every row here was produced by a real action the viewer took; nothing is
 * fabricated, and no row links anywhere outside the app.
 */
export function NotificationsPage() {
  const {
    notifications,
    unreadNotificationCount,
    markAllNotificationsRead,
    markNotificationRead,
    status,
  } = useAppData();
  const navigate = useNavigate();

  const [filter, setFilter] = useState<Filter>('all');
  const [announcement, setAnnouncement] = useState('');

  /* Newest first, from the one source the header count also reads. */
  const ordered = useMemo(
    () => [...notifications].sort((a, b) => b.createdAt - a.createdAt),
    [notifications],
  );

  const shown = useMemo(
    () => (filter === 'unread' ? ordered.filter((note) => !note.read) : ordered),
    [ordered, filter],
  );

  const handleOpen = useCallback(
    (id: string, route: string | undefined, title: string) => {
      markNotificationRead(id);
      setAnnouncement(`Marked "${title}" as read.`);
      // Local hash routes only — this app has no external links.
      if (route) navigate(route);
    },
    [markNotificationRead, navigate],
  );

  const handleMarkAll = useCallback(() => {
    const before = unreadNotificationCount;
    markAllNotificationsRead();
    setAnnouncement(
      before > 0
        ? `Marked ${before} ${before === 1 ? 'notification' : 'notifications'} as read.`
        : 'Everything was already read.',
    );
  }, [unreadNotificationCount, markAllNotificationsRead]);

  return (
    <div>
      <PageHeading
        eyebrow="Inbox"
        title="Notifications"
        description="Activity from this session — likes, comments, interests, applications, requests, saves and messages."
        action={
          <Button
            variant="secondary"
            size="sm"
            icon={CheckCheck}
            onClick={handleMarkAll}
            disabled={unreadNotificationCount === 0}
          >
            Mark all read
          </Button>
        }
      />

      <div
        role="tablist"
        aria-label="Notification filter"
        className="mb-3 flex gap-1.5 rounded-full border border-cream-300 bg-cream-50 p-1"
      >
        {(['all', 'unread'] as const).map((id) => {
          const selected = filter === id;
          const count = id === 'all' ? ordered.length : unreadNotificationCount;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFilter(id)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition',
                selected
                  ? 'bg-clay-700 text-white shadow-sm'
                  : 'text-charcoal-500 hover:bg-white hover:text-charcoal-800',
              )}
            >
              {id === 'all' ? 'All' : 'Unread'}
              <span
                className={cn(
                  'flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums',
                  selected
                    ? 'bg-white/20 text-white'
                    : 'bg-cream-200 text-charcoal-600',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {status === 'loading' ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-[72px] rounded-2xl" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <EmptyState
          icon={BellOff}
          title={
            filter === 'unread'
              ? 'You are all caught up'
              : 'No notifications yet'
          }
          description={
            filter === 'unread'
              ? 'Every notification has been read.'
              : 'Like a post, send an interest or save a product and it will show up here.'
          }
          actionLabel={filter === 'unread' ? 'Show all' : undefined}
          onAction={filter === 'unread' ? () => setFilter('all') : undefined}
        />
      ) : (
        <ul className="space-y-2">
          {shown.map((note) => {
            const Icon = KIND_ICON[note.kind];
            return (
              <li key={note.id}>
                <Card
                  padded={false}
                  className={cn(!note.read && 'border-clay-200 bg-clay-50/40')}
                >
                  <button
                    type="button"
                    onClick={() => handleOpen(note.id, note.route, note.title)}
                    aria-label={`${note.title}. ${note.read ? 'Read' : 'Unread'}.${note.route ? ' Opens in the app.' : ''}`}
                    className="flex w-full items-start gap-3 rounded-2xl p-4 text-left transition hover:bg-cream-50/70"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-clay-700 ring-1 ring-cream-300">
                      <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block break-words text-sm font-semibold text-charcoal-800">
                        {note.title}
                      </span>
                      <span className="mt-0.5 block break-words text-sm leading-relaxed text-charcoal-500">
                        {note.description}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-2">
                        <time
                          dateTime={new Date(note.createdAt).toISOString()}
                          className="text-xs text-charcoal-400"
                        >
                          {formatRelativeTime(note.createdAt)}
                        </time>
                        {!note.read ? <Badge tone="accent">Unread</Badge> : null}
                      </span>
                    </span>
                  </button>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-charcoal-400">
        <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Session-local activity only. Push delivery is not configured, nothing
        leaves the device, and every link here opens a page inside this app.
      </p>
    </div>
  );
}
