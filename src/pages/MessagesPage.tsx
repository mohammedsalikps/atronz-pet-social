import { useCallback, useMemo, useState } from 'react';
import { MessageCircle, MessagesSquare, Search } from 'lucide-react';
import { MessageThread } from '@/components/messages/MessageThread';
import { ReportPetDialog } from '@/components/discovery/ReportPetDialog';
import { PageHeading } from '@/components/layout/PageHeading';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppData } from '@/context/appData';
import { useBackHandler } from '@/hooks/useBackHandler';
import { useToast } from '@/context/toast';
import { formatRelativeTime } from '@/lib/feed';
import {
  lastMessageOf,
  searchConversations,
  unreadCountOf,
  visibleConversations,
} from '@/lib/messaging';
import { cn } from '@/lib/utils';
import type { PetReportReason } from '@/types';

/**
 * Messages — demo conversations.
 *
 * Two panes on desktop, one at a time on mobile. Every derived value (preview
 * line, timestamp, unread badge, header count) comes from the messages
 * themselves, so nothing can disagree.
 */
export function MessagesPage() {
  const {
    status,
    conversations,
    blockedConversationIds,
    sendMessage,
    markConversationRead,
    blockConversation,
    reportConversation,
  } = useAppData();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);
  const [blockId, setBlockId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const visible = useMemo(
    () => visibleConversations(conversations, blockedConversationIds),
    [conversations, blockedConversationIds],
  );

  const results = useMemo(
    () => searchConversations(visible, query),
    [visible, query],
  );

  const openConversation = openId
    ? (visible.find((item) => item.id === openId) ?? null)
    : null;
  const reportTarget = reportId
    ? (visible.find((item) => item.id === reportId) ?? null)
    : null;
  const blockTarget = blockId
    ? (visible.find((item) => item.id === blockId) ?? null)
    : null;

  const closeThread = useCallback(() => setOpenId(null), []);
  /* On Android, back from an open thread returns to the list instead of
     leaving Messages entirely. */
  useBackHandler(openId !== null, closeThread);

  const handleOpen = useCallback(
    (conversationId: string) => {
      setOpenId(conversationId);
      markConversationRead(conversationId);
    },
    [markConversationRead],
  );

  const handleSend = useCallback(
    (body: string) => {
      if (!openConversation) return;
      const message = sendMessage(openConversation.id, body);
      if (!message) {
        showToast({
          tone: 'warning',
          title: 'Message not added',
          description: 'Write something before sending.',
        });
        return;
      }
      showToast({
        tone: 'success',
        title: 'Message added to this demo conversation',
        description: `Nothing was delivered to ${openConversation.name}.`,
      });
      setAnnouncement(
        `Message added to this demo conversation. Nothing was delivered to ${openConversation.name}.`,
      );
    },
    [openConversation, sendMessage, showToast],
  );

  const handleConfirmBlock = useCallback(() => {
    if (!blockTarget) return;
    const name = blockTarget.name;
    blockConversation(blockTarget.id);
    setBlockId(null);
    if (openId === blockTarget.id) setOpenId(null);
    showToast({
      tone: 'info',
      title: 'Conversation blocked',
      description: `${name} is hidden, and any unread count went with it.`,
    });
    setAnnouncement(`Blocked ${name}. The conversation and its unread count are gone.`);
  }, [blockTarget, blockConversation, openId, showToast]);

  const handleReport = useCallback(
    (reason: PetReportReason) => {
      if (!reportTarget) return;
      const name = reportTarget.name;
      reportConversation(reportTarget.id, reason);
      setReportId(null);
      if (openId === reportTarget.id) setOpenId(null);
      showToast({
        tone: 'success',
        title: 'Conversation reported',
        description: `${name} has been hidden from your messages.`,
      });
      setAnnouncement(`Reported ${name} and hid the conversation.`);
    },
    [reportTarget, reportConversation, openId, showToast],
  );

  return (
    <div>
      <PageHeading
        eyebrow="Inbox"
        title="Messages"
        description="Demo conversations held in this session. Messages are never delivered to anyone."
      />

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {status === 'loading' ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-[84px] rounded-2xl" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="No conversations"
          description={
            blockedConversationIds.length > 0
              ? 'You have blocked every conversation. Blocked threads stay hidden for this session.'
              : 'Demo conversations start from a match, an adoption listing or a service enquiry.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
          {/* List — hidden on mobile while a thread is open. */}
          <div className={cn(openConversation ? 'hidden lg:block' : 'block')}>
            <div className="mb-3">
              <label
                htmlFor="messages-search"
                className="block text-xs font-medium text-charcoal-600"
              >
                Search conversations
              </label>
              <div className="relative mt-1.5">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400"
                  aria-hidden="true"
                />
                <input
                  id="messages-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Name, topic or message"
                  className="h-11 w-full rounded-2xl border border-cream-300 bg-white pl-9 pr-3 text-sm text-charcoal-800 transition placeholder:text-charcoal-400 hover:border-clay-200"
                />
              </div>
            </div>

            {results.length === 0 ? (
              <EmptyState
                icon={Search}
                title="No conversations match"
                description="Try a different name, topic or word from a message."
                actionLabel="Clear search"
                onAction={() => setQuery('')}
              />
            ) : (
              <ul className="space-y-2" aria-label="Conversations">
                {results.map((conversation) => {
                  const last = lastMessageOf(conversation);
                  const unread = unreadCountOf(conversation);
                  const active = conversation.id === openId;
                  return (
                    <li key={conversation.id}>
                      <Card padded={false} className={cn(active && 'border-clay-300')}>
                        <button
                          type="button"
                          onClick={() => handleOpen(conversation.id)}
                          aria-label={`Open conversation with ${conversation.name}${unread > 0 ? `, ${unread} unread` : ''}`}
                          className="flex w-full items-start gap-3 rounded-2xl p-3.5 text-left transition hover:bg-cream-50"
                        >
                          <Avatar name={conversation.name} size="lg" />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start gap-2">
                              <span className="min-w-0 flex-1 break-words text-sm font-semibold text-charcoal-900">
                                {conversation.name}
                              </span>
                              {last ? (
                                <span className="shrink-0 text-xs text-charcoal-400">
                                  {formatRelativeTime(last.createdAt)}
                                </span>
                              ) : null}
                            </span>
                            <span className="mt-0.5 block break-words text-xs text-charcoal-400">
                              {conversation.context}
                            </span>
                            <span className="mt-1 flex items-center gap-2">
                              <span className="min-w-0 flex-1 truncate text-sm text-charcoal-500">
                                {last ? last.body : 'No messages yet'}
                              </span>
                              {unread > 0 ? (
                                <span className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-clay-700 px-1.5 text-[11px] font-semibold text-white">
                                  {unread}
                                </span>
                              ) : null}
                            </span>
                          </span>
                        </button>
                      </Card>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Thread — the only pane on mobile once a conversation is open. */}
          <div className={cn(openConversation ? 'block' : 'hidden lg:block')}>
            <Card padded={false} className="flex min-h-[26rem] flex-col overflow-hidden lg:min-h-[34rem]">
              {openConversation ? (
                <MessageThread
                  conversation={openConversation}
                  onBack={closeThread}
                  onSend={handleSend}
                  onReport={() => setReportId(openConversation.id)}
                  onBlock={() => setBlockId(openConversation.id)}
                />
              ) : (
                <div className="flex flex-1 items-center justify-center p-4">
                  <EmptyState
                    icon={MessageCircle}
                    title="Choose a conversation"
                    description="Open a thread on the left to read it. Everything here is demo data."
                    className="border-0 bg-transparent"
                  />
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-charcoal-400">
        <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <Badge tone="neutral">Demo</Badge>
        <span className="min-w-0">
          Conversations are local placeholder data. Nothing is sent, stored on a
          server, or shared with anyone.
        </span>
      </p>

      <ConfirmDialog
        open={blockTarget !== null}
        title="Block this conversation?"
        description={`${blockTarget?.name ?? 'This conversation'} will be hidden from your messages for this session, along with any unread count. Nothing is sent to them.`}
        confirmLabel="Block conversation"
        destructive
        onConfirm={handleConfirmBlock}
        onCancel={() => setBlockId(null)}
      />

      <ReportPetDialog
        subject={
          reportTarget
            ? {
                id: reportTarget.id,
                name: reportTarget.name,
                byline: reportTarget.context,
              }
            : null
        }
        title="Report this conversation"
        onClose={() => setReportId(null)}
        onConfirm={handleReport}
      />
    </div>
  );
}
