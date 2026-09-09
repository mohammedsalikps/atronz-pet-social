import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowLeft, Ban, Flag, Send } from 'lucide-react';
import { SafetyNotice } from '@/components/common/SafetyNotice';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatRelativeTime } from '@/lib/feed';
import {
  MESSAGE_MAX_LENGTH,
  VIEWER_ID,
  sortMessages,
  validateMessage,
} from '@/lib/messaging';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/types';

export interface MessageThreadProps {
  conversation: Conversation;
  /** Mobile only — the list and thread share one column below `lg`. */
  onBack: () => void;
  onSend: (body: string) => void;
  onReport: () => void;
  onBlock: () => void;
}

/**
 * One conversation.
 *
 * Nothing here transmits: sending appends a row the viewer can see, and the
 * composer says so rather than implying delivery.
 */
export function MessageThread({
  conversation,
  onBack,
  onSend,
  onReport,
  onBlock,
}: MessageThreadProps) {
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  /* A ref, not state: four synchronous submits all read the same rendered
     value, so only a ref can gate them. It reopens on the next change. */
  const sendingRef = useRef(false);

  const messages = sortMessages(conversation.messages);
  const trimmed = body.trim();
  const validation = validateMessage(body);

  useEffect(() => {
    setBody('');
    setError(null);
    sendingRef.current = false;
  }, [conversation.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [messages.length, conversation.id]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (sendingRef.current) return;
    if (!validation.valid) {
      setError(validation.error ?? 'This message cannot be sent.');
      return;
    }
    sendingRef.current = true;
    onSend(trimmed);
    setBody('');
    setError(null);
    // Re-open immediately: each deliberate submit should send its own message.
    sendingRef.current = false;
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-start gap-3 border-b border-cream-200 p-4">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to conversations"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cream-300 bg-white text-charcoal-600 transition hover:border-clay-200 lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>

        <Avatar name={conversation.name} size="md" />

        <div className="min-w-0 flex-1">
          <h2 className="break-words text-sm font-semibold text-charcoal-900">
            {conversation.name}
          </h2>
          <p className="mt-0.5 break-words text-xs text-charcoal-500">
            {conversation.context}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onReport}
            aria-label={`Report ${conversation.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal-400 transition hover:bg-cream-100 hover:text-charcoal-700"
          >
            <Flag className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onBlock}
            aria-label={`Block ${conversation.name}`}
            className="flex h-9 w-9 items-center justify-center rounded-full text-charcoal-400 transition hover:bg-cream-100 hover:text-red-700"
          >
            <Ban className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="app-scrollbar min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
        <SafetyNotice title="Demo conversation — never share private details">
          These messages exist only in this browser session and reach no one.
          Never share passwords, bank or card details, your exact address, or
          identity documents here — in this demo or anywhere else.
        </SafetyNotice>

        {messages.map((message) => {
          const mine = message.senderId === VIEWER_ID;
          return (
            <div
              key={message.id}
              className={cn('flex', mine ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-2xl px-3 py-2 sm:max-w-[75%]',
                  mine
                    ? 'bg-clay-700 text-white'
                    : 'border border-cream-200 bg-cream-50 text-charcoal-700',
                )}
              >
                <p className="text-[11px] font-medium opacity-80">
                  {mine ? 'You' : message.senderName}
                </p>
                <p className="mt-0.5 whitespace-pre-line break-words text-sm leading-relaxed">
                  {message.body}
                </p>
                <p
                  className={cn(
                    'mt-1 text-[11px]',
                    mine ? 'text-white/70' : 'text-charcoal-400',
                  )}
                >
                  <time dateTime={new Date(message.createdAt).toISOString()}>
                    {formatRelativeTime(message.createdAt)}
                  </time>
                  {!mine && !message.read ? (
                    <span className="ml-1.5 font-medium">· Unread</span>
                  ) : null}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} noValidate className="border-t border-cream-200 p-4">
        <label
          htmlFor="message-body"
          className="block text-xs font-medium text-charcoal-600"
        >
          Write a message
        </label>
        <div className="mt-1.5 flex items-start gap-2">
          <textarea
            id="message-body"
            value={body}
            onChange={(event) => {
              setBody(event.target.value);
              if (error) setError(null);
            }}
            rows={2}
            maxLength={MESSAGE_MAX_LENGTH}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              error ? 'message-error message-count' : 'message-count'
            }
            placeholder="This stays in the demo"
            className="min-w-0 flex-1 resize-none rounded-2xl border border-cream-300 bg-white px-3 py-2 text-sm text-charcoal-800 transition placeholder:text-charcoal-400 hover:border-clay-200"
          />
          <Button
            type="submit"
            icon={Send}
            size="sm"
            className="mt-0.5 shrink-0"
            disabled={!trimmed}
          >
            Send
          </Button>
        </div>
        <div className="mt-1.5 flex items-start justify-between gap-3">
          {error ? (
            <p id="message-error" role="alert" className="text-xs text-red-700">
              {error}
            </p>
          ) : (
            <Badge tone="neutral">Demo mode · nothing is delivered</Badge>
          )}
          <p
            id="message-count"
            className={cn(
              'shrink-0 text-xs tabular-nums',
              body.length >= MESSAGE_MAX_LENGTH
                ? 'font-semibold text-red-700'
                : 'text-charcoal-400',
            )}
          >
            {body.length}/{MESSAGE_MAX_LENGTH}
          </p>
        </div>
      </form>
    </div>
  );
}
