import {
  Bell,
  Compass,
  Heart,
  Home,
  MessageCircle,
  PawPrint,
  Scissors,
  ShoppingBag,
  Sparkles,
  UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type NavGroupId = 'community' | 'find' | 'marketplace' | 'inbox' | 'you';

export interface NavItem {
  id: string;
  label: string;
  /** Short label for the mobile bottom bar, where space is tight. */
  shortLabel: string;
  to: string;
  icon: LucideIcon;
  group: NavGroupId;
  /**
   * Ten destinations do not fit a 320px bottom bar. Exactly five items carry
   * this flag; everything else is reachable from the sidebar, the mobile
   * drawer, or the header (Notifications and Profile).
   */
  inBottomBar?: boolean;
}

export const NAV_GROUPS: Array<{ id: NavGroupId; label: string }> = [
  { id: 'community', label: 'Community' },
  { id: 'find', label: 'Find a pet' },
  { id: 'marketplace', label: 'Services & shop' },
  { id: 'inbox', label: 'Inbox' },
  { id: 'you', label: 'You' },
];

/**
 * Single source of truth for primary navigation.
 * The sidebar, the mobile bottom bar, the header title and the router all read
 * from this list.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    id: 'feed',
    label: 'Home',
    shortLabel: 'Home',
    to: '/feed',
    icon: Home,
    group: 'community',
    inBottomBar: true,
  },
  {
    id: 'discover',
    label: 'Discover',
    shortLabel: 'Discover',
    to: '/discover',
    icon: Compass,
    group: 'community',
    inBottomBar: true,
  },
  {
    id: 'matches',
    label: 'Matches',
    shortLabel: 'Matches',
    to: '/matches',
    icon: Heart,
    group: 'community',
    inBottomBar: true,
  },
  {
    id: 'adoption',
    label: 'Adoption',
    shortLabel: 'Adopt',
    to: '/adoption',
    icon: Sparkles,
    group: 'find',
    inBottomBar: true,
  },
  {
    id: 'services',
    label: 'Services',
    shortLabel: 'Services',
    to: '/services',
    icon: Scissors,
    group: 'marketplace',
  },
  {
    id: 'marketplace',
    label: 'Marketplace',
    shortLabel: 'Shop',
    to: '/marketplace',
    icon: ShoppingBag,
    group: 'marketplace',
  },
  {
    id: 'messages',
    label: 'Messages',
    shortLabel: 'Chats',
    to: '/messages',
    icon: MessageCircle,
    group: 'inbox',
    inBottomBar: true,
  },
  {
    id: 'notifications',
    label: 'Notifications',
    shortLabel: 'Alerts',
    to: '/notifications',
    icon: Bell,
    group: 'inbox',
  },
  {
    id: 'pets',
    label: 'My Pets',
    shortLabel: 'Pets',
    to: '/pets',
    icon: PawPrint,
    group: 'you',
  },
  {
    id: 'profile',
    label: 'Profile',
    shortLabel: 'Profile',
    to: '/profile',
    icon: UserRound,
    group: 'you',
  },
];

export const BOTTOM_BAR_ITEMS = NAV_ITEMS.filter((item) => item.inBottomBar);

export function navItemsInGroup(group: NavGroupId): NavItem[] {
  return NAV_ITEMS.filter((item) => item.group === group);
}

/** Longest match wins so `/pets` never shadows a future `/pets/:id`. */
export function activeNavItem(pathname: string): NavItem | undefined {
  return [...NAV_ITEMS]
    .sort((a, b) => b.to.length - a.to.length)
    .find((item) => pathname === item.to || pathname.startsWith(`${item.to}/`));
}
