import type { Conversation, DemoMessage } from '@/types';

/** The viewer's owner id. Everything else in a thread is the other party. */
export const VIEWER_ID = 'owner-1';

export const MESSAGE_MAX_LENGTH = 1000;

export interface MessageValidation {
  valid: boolean;
  error?: string;
}

/**
 * A message must have real content and fit the limit.
 *
 * Whitespace-only is rejected rather than trimmed to nothing and sent, so the
 * send control and the context agree on what counts as empty.
 */
export function validateMessage(body: string): MessageValidation {
  const trimmed = body.trim();
  if (!trimmed) {
    return { valid: false, error: 'Write a message before sending.' };
  }
  if (trimmed.length > MESSAGE_MAX_LENGTH) {
    return {
      valid: false,
      error: `Messages are limited to ${MESSAGE_MAX_LENGTH} characters.`,
    };
  }
  return { valid: true };
}

/** Oldest first, matching how a thread reads. Order is never mutated in place. */
export function sortMessages(messages: DemoMessage[]): DemoMessage[] {
  return [...messages].sort((a, b) => a.createdAt - b.createdAt);
}

export function lastMessageOf(conversation: Conversation): DemoMessage | null {
  const sorted = sortMessages(conversation.messages);
  return sorted[sorted.length - 1] ?? null;
}

/**
 * Unread count for one conversation.
 *
 * Derived from the messages themselves, so a blocked or emptied conversation
 * cannot leave an orphaned badge behind.
 */
export function unreadCountOf(conversation: Conversation): number {
  return conversation.messages.filter(
    (message) => message.senderId !== VIEWER_ID && !message.read,
  ).length;
}

export function totalUnread(conversations: Conversation[]): number {
  return conversations.reduce(
    (total, conversation) => total + unreadCountOf(conversation),
    0,
  );
}

/** Conversations the viewer has not blocked, newest activity first. */
export function visibleConversations(
  conversations: Conversation[],
  blockedIds: string[],
): Conversation[] {
  return conversations
    .filter((conversation) => !blockedIds.includes(conversation.id))
    .sort((a, b) => {
      const aLast = lastMessageOf(a)?.createdAt ?? 0;
      const bLast = lastMessageOf(b)?.createdAt ?? 0;
      return bLast - aLast;
    });
}

/** Free-text search over the other party, the context line and the messages. */
export function searchConversations(
  conversations: Conversation[],
  query: string,
): Conversation[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return conversations;
  return conversations.filter((conversation) => {
    const haystack = [
      conversation.name,
      conversation.context,
      ...conversation.messages.map((message) => message.body),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(trimmed);
  });
}
