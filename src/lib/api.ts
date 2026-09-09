import {
  MOCK_ADOPTION_LISTINGS,
  MOCK_CONVERSATIONS,
  MOCK_DISCOVERABLE_PETS,
  MOCK_FOLLOWING_IDS,
  MOCK_INTERESTS,
  MOCK_NOTIFICATIONS,
  MOCK_OWNER,
  MOCK_PETS,
  MOCK_POSTS,
  MOCK_PRIVACY,
  MOCK_PRODUCTS,
  MOCK_SERVICES,
} from '@/data/mockData';
import type {
  AdoptionListing,
  Conversation,
  DiscoverablePet,
  FeedPost,
  InterestRequest,
  OwnerProfile,
  PetProfile,
  PrivacySettings,
  Product,
  ServiceListing,
  SocialNotification,
} from '@/types';

/**
 * The single seam between the UI and its data source.
 *
 * Everything is async and returns plain domain objects, so swapping the mock
 * bodies for `fetch(...)` later requires no component changes. Nothing here
 * touches the network today — the app is fully usable offline.
 */

const LATENCY_MS = 400;

function delay<T>(value: T, ms = LATENCY_MS): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), ms);
  });
}

export interface SocialBootstrap {
  owner: OwnerProfile;
  pets: PetProfile[];
  notifications: SocialNotification[];
  conversations: Conversation[];
  privacy: PrivacySettings;
  posts: FeedPost[];
  followingIds: string[];
  discoverablePets: DiscoverablePet[];
  interests: InterestRequest[];
  adoptionListings: AdoptionListing[];
  serviceListings: ServiceListing[];
  products: Product[];
}

export function fetchBootstrap(): Promise<SocialBootstrap> {
  return delay({
    owner: MOCK_OWNER,
    pets: MOCK_PETS,
    notifications: MOCK_NOTIFICATIONS,
    conversations: MOCK_CONVERSATIONS,
    privacy: MOCK_PRIVACY,
    posts: MOCK_POSTS,
    followingIds: MOCK_FOLLOWING_IDS,
    discoverablePets: MOCK_DISCOVERABLE_PETS,
    interests: MOCK_INTERESTS,
    adoptionListings: MOCK_ADOPTION_LISTINGS,
    serviceListings: MOCK_SERVICES,
    products: MOCK_PRODUCTS,
  });
}
