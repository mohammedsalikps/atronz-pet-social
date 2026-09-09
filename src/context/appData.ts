import { createContext, useContext } from 'react';
import type { ApplicationDraft } from '@/lib/adoption';
import type { BookingDraft } from '@/lib/services';
import type {
  AdoptionApplication,
  AdoptionListing,
  BookingRequest,
  CartItem,
  Connection,
  Conversation,
  DemoMessage,
  DiscoverablePet,
  FeedPost,
  InterestRequest,
  InterestStatus,
  NewPostDraft,
  OwnerProfile,
  PetBlock,
  PetDeletionImpact,
  PetDraft,
  PetProfile,
  PetReport,
  PetReportReason,
  PostComment,
  PostReport,
  PrivacySettings,
  ProfileDraft,
  Product,
  ReportReason,
  ServiceListing,
  SocialNotification,
} from '@/types';

/*
 * The app-data contract, split out from the provider component.
 *
 * React Fast Refresh only accepts a module whose exports are all
 * components. Keeping the context object, the value type and the
 * `useAppData` hook here leaves `AppDataContext.tsx` exporting nothing but
 * `AppDataProvider`, which is what makes hot updates work instead of
 * invalidating the module and stranding consumers on a stale context.
 */

export type Status = 'loading' | 'ready' | 'error';

export interface AppDataValue {
  status: Status;
  owner: OwnerProfile | null;
  pets: PetProfile[];
  notifications: SocialNotification[];
  unreadNotificationCount: number;
  conversations: Conversation[];
  unreadMessageCount: number;
  privacy: PrivacySettings;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setPrivacy: (patch: Partial<PrivacySettings>) => void;
  reload: () => void;

  /* Messages ------------------------------------------------------------ */

  /** Conversation ids the viewer blocked. Hidden everywhere, count included. */
  blockedConversationIds: string[];
  /** Adds a message to a demo thread. Returns null when the body is invalid. */
  sendMessage: (conversationId: string, body: string) => DemoMessage | null;
  markConversationRead: (conversationId: string) => void;
  blockConversation: (conversationId: string) => void;
  reportConversation: (conversationId: string, reason: PetReportReason) => void;

  /* Pets ---------------------------------------------------------------- */

  /** The pet other screens default to. Null only when there are no pets. */
  activePetId: string | null;
  setActivePet: (petId: string | null) => void;
  /** Returns the new pet, or null when the draft does not validate. */
  addPet: (draft: PetDraft) => PetProfile | null;
  updatePet: (petId: string, draft: PetDraft) => PetProfile | null;
  /** What deleting would change, so the confirm dialog can say so first. */
  previewPetDeletion: (petId: string) => PetDeletionImpact | null;
  /** Deletes and cleans up references. Returns what it actually changed. */
  deletePet: (petId: string) => PetDeletionImpact | null;

  /* Profile ------------------------------------------------------------- */

  updateProfile: (draft: ProfileDraft) => OwnerProfile | null;
  /** Restores every session-local change to the deterministic mock state. */
  resetDemoData: () => void;

  /* Feed ---------------------------------------------------------------- */

  /** Every post the viewer could see, newest first, before hide/report. */
  posts: FeedPost[];
  /** What the feed actually renders: posts minus hidden and reported ones. */
  visiblePosts: FeedPost[];
  followingIds: string[];
  hiddenPostIds: string[];
  reports: PostReport[];
  /** True when the viewer liked the post — derived from its reactions. */
  isPostLiked: (postId: string) => boolean;
  toggleLike: (postId: string) => void;
  toggleSave: (postId: string) => void;
  hidePost: (postId: string) => void;
  reportPost: (postId: string, reason: ReportReason) => void;
  restoreHiddenPosts: () => void;
  addComment: (postId: string, body: string) => PostComment | null;
  /** Returns the new post, or null when the draft does not validate. */
  createPost: (draft: NewPostDraft) => FeedPost | null;

  /* Discovery ----------------------------------------------------------- */

  /** Every pet in the source data, before visibility rules or filters. */
  discoverablePets: DiscoverablePet[];
  interests: InterestRequest[];
  petBlocks: PetBlock[];
  petReports: PetReport[];
  /** The viewer's pending SENT interest for a pet, if any. */
  interestFor: (petId: string) => InterestRequest | null;
  /** Sends an interest. Returns null when one is already pending. */
  sendInterest: (petId: string, fromPetId: string | null) => InterestRequest | null;
  blockPet: (petId: string) => void;
  reportPet: (petId: string, reason: PetReportReason) => void;

  /* Matches ------------------------------------------------------------- */

  connections: Connection[];
  /** How the viewer relates to a pet, in either direction. */
  relationshipFor: (petId: string) => {
    status: InterestStatus | null;
    direction: InterestRequest['direction'] | null;
  };
  /** Accepts a pending received interest and creates one connection. */
  acceptInterest: (interestId: string) => Connection | null;
  declineInterest: (interestId: string) => boolean;
  /** Withdraws a pending sent interest by its id. */
  withdrawInterest: (interestId: string) => boolean;
  connectionForPet: (petId: string) => Connection | null;

  /* Adoption ------------------------------------------------------------ */

  adoptionListings: AdoptionListing[];
  adoptionApplications: AdoptionApplication[];
  savedListingIds: string[];
  /** Listing ids the viewer blocked or reported. Hidden from every view. */
  hiddenListingIds: string[];
  /** The viewer's still-submitted application for a listing, if any. */
  applicationFor: (listingId: string) => AdoptionApplication | null;
  /** Submits an application. Returns null when invalid or already applied. */
  submitApplication: (
    listingId: string,
    draft: ApplicationDraft,
  ) => AdoptionApplication | null;
  withdrawApplication: (applicationId: string) => boolean;
  toggleSavedListing: (listingId: string) => void;
  blockListing: (listingId: string) => void;
  reportListing: (listingId: string, reason: PetReportReason) => void;

  /* Services ------------------------------------------------------------ */

  serviceListings: ServiceListing[];
  bookingRequests: BookingRequest[];
  savedServiceIds: string[];
  /** Provider ids the viewer blocked. All their services disappear. */
  blockedProviderIds: string[];
  /** Still-submitted requests for a service, across the viewer's pets. */
  bookingsForService: (serviceId: string) => BookingRequest[];
  /** Submits a request. Returns null when invalid or already requested. */
  submitBooking: (
    serviceId: string,
    draft: BookingDraft,
  ) => BookingRequest | null;
  withdrawBooking: (bookingId: string) => boolean;
  toggleSavedService: (serviceId: string) => void;
  blockProvider: (providerId: string) => void;
  reportProvider: (providerId: string, reason: PetReportReason) => void;

  /* Marketplace --------------------------------------------------------- */

  products: Product[];
  cartItems: CartItem[];
  savedProductIds: string[];
  /** Seller ids the viewer blocked. All their products disappear. */
  blockedSellerIds: string[];
  /**
   * Adds one, or increments an existing line. Never creates a duplicate row.
   * Returns the resulting quantity, read from the ref, so a caller announcing
   * the change cannot report a stale number after rapid clicks.
   */
  addToCart: (productId: string) => number;
  removeFromCart: (productId: string) => void;
  setCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleSavedProduct: (productId: string) => void;
  blockSeller: (sellerId: string) => void;
  reportSeller: (sellerId: string, reason: PetReportReason) => void;
}

export const AppDataContext = createContext<AppDataValue | null>(null);

export function useAppData(): AppDataValue {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used inside an <AppDataProvider>.');
  }
  return context;
}
