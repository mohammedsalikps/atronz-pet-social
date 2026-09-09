import type {
  Connection,
  InterestDirection,
  InterestRequest,
  InterestStatus,
} from '@/types';

export type MatchesTabId = 'received' | 'sent' | 'connections' | 'history';

export const MATCHES_TABS: Array<{
  id: MatchesTabId;
  label: string;
  /** Short label for the tab rail at 320px. */
  shortLabel: string;
  hint: string;
}> = [
  {
    id: 'received',
    label: 'Received',
    shortLabel: 'Received',
    hint: 'Owners who expressed interest in one of your pets.',
  },
  {
    id: 'sent',
    label: 'Sent',
    shortLabel: 'Sent',
    hint: 'Interests you sent from Discover. You can withdraw any of them.',
  },
  {
    id: 'connections',
    label: 'Connections',
    shortLabel: 'Linked',
    hint: 'Accepted on both sides. No contact details are shared.',
  },
  {
    id: 'history',
    label: 'History',
    shortLabel: 'History',
    hint: 'Declined and withdrawn interests, kept so nothing disappears.',
  },
];

const STATUS_LABELS: Record<InterestStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  withdrawn: 'Withdrawn',
};

export function interestStatusLabel(status: InterestStatus): string {
  return STATUS_LABELS[status];
}

/** Badge tone per status. Always paired with the text label, never alone. */
export function interestStatusTone(
  status: InterestStatus,
): 'neutral' | 'accent' | 'positive' | 'warning' {
  switch (status) {
    case 'pending':
      return 'accent';
    case 'accepted':
      return 'positive';
    case 'declined':
      return 'warning';
    case 'withdrawn':
      return 'neutral';
  }
}

export function directionLabel(direction: InterestDirection): string {
  return direction === 'received' ? 'Received' : 'Sent';
}

/**
 * Only a pending interest can be acted on, and only in the right direction.
 *
 * Enforced in the context as well as the UI, so a stale card, a double click
 * or a replayed handler cannot accept something already declined.
 */
export function canAccept(interest: InterestRequest): boolean {
  return interest.direction === 'received' && interest.status === 'pending';
}

export function canDecline(interest: InterestRequest): boolean {
  return interest.direction === 'received' && interest.status === 'pending';
}

export function canWithdraw(interest: InterestRequest): boolean {
  return interest.direction === 'sent' && interest.status === 'pending';
}

export interface MatchesSections {
  received: InterestRequest[];
  sent: InterestRequest[];
  history: InterestRequest[];
}

/**
 * Splits interests into the page's sections.
 *
 * Every section is derived here from one source list, so the counts on the
 * tabs and the rows underneath can never disagree.
 */
export function splitInterests(interests: InterestRequest[]): MatchesSections {
  const newestFirst = [...interests].sort((a, b) => b.sentAt - a.sentAt);
  return {
    received: newestFirst.filter(
      (item) => item.direction === 'received' && item.status === 'pending',
    ),
    sent: newestFirst.filter(
      (item) => item.direction === 'sent' && item.status === 'pending',
    ),
    history: newestFirst.filter(
      (item) => item.status === 'declined' || item.status === 'withdrawn',
    ),
  };
}

export function sortConnections(connections: Connection[]): Connection[] {
  return [...connections].sort((a, b) => b.createdAt - a.createdAt);
}
