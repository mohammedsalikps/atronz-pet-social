/**
 * Domain types for Atronz Pet Social.
 *
 * Deliberately narrow for Step 1 (the app shell): these describe the owner,
 * their pets, notifications and conversation stubs the shell needs to render.
 * Feed posts, listings, providers and products land with their own modules in
 * later steps.
 */

export type Species = 'dog' | 'cat' | 'rabbit' | 'bird' | 'other';

export type PetSex = 'male' | 'female';

export type PetSize = 'small' | 'medium' | 'large';

/** Coarse vaccination signal. Never a medical claim — owner-declared only. */
export type VaccinationStatus = 'up-to-date' | 'partial' | 'unknown';

export interface PetProfile {
  id: string;
  ownerId: string;
  name: string;
  species: Species;
  breed: string;
  sex: PetSex;
  size: PetSize;
  ageYears: number;
  ageMonths: number;
  /** Short owner-written blurb shown on the profile card. */
  bio: string;
  /** Owner-declared, shown with a disclaimer. Not verified by Atronz. */
  vaccination: VaccinationStatus;
  neutered: boolean;
  /** Opt-in. Controls whether the pet appears in Discover at all. */
  openToMating: boolean;
  /** Broad city level only — Atronz never stores or requests a precise location. */
  city: string;
}

/**
 * Everything the add/edit pet form collects.
 *
 * Ages are strings because they come from number inputs, which yield '' when
 * cleared; validation converts and range-checks them.
 */
export interface PetDraft {
  name: string;
  species: Species;
  breed: string;
  sex: PetSex;
  size: PetSize;
  ageYears: string;
  ageMonths: string;
  city: string;
  bio: string;
  vaccination: VaccinationStatus;
  neutered: boolean;
  /** Opt-in, and never enabled for the owner automatically. */
  openToMating: boolean;
}

/** What deleting a pet would change, shown before the user confirms. */
export interface PetDeletionImpact {
  petId: string;
  petName: string;
  /** Pending sent interests that would be withdrawn. */
  pendingInterests: number;
  /** Submitted booking requests that would be withdrawn. */
  activeBookings: number;
  /** Resolved records that would keep their history but lose the pet link. */
  detachedRecords: number;
}

/** Editable fields on the local demo profile. */
export interface ProfileDraft {
  name: string;
  bio: string;
  city: string;
}

export interface OwnerProfile {
  id: string;
  name: string;
  /** Public @handle. The email is never shown to other owners. */
  handle: string;
  email: string;
  bio: string;
  city: string;
  joinedYear: number;
  followers: number;
  following: number;
}

export type NotificationKind =
  | 'like'
  | 'comment'
  | 'follow'
  | 'match'
  | 'contact-request'
  | 'adoption-interest'
  | 'message'
  | 'service';

export interface SocialNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  /** Epoch milliseconds, so the relative label stays honest as time passes. */
  createdAt: number;
  read: boolean;
  /**
   * Stable key for the action that produced this notification, e.g.
   * `like:post-1`. Two notifications never share one, which is what stops a
   * repeated action from producing a second row.
   */
  sourceId?: string;
  /**
   * An in-app hash route this notification can open. Always a local route —
   * there is no field here for an external URL.
   */
  route?: string;
}

export type ConversationKind = 'owner' | 'provider';

/**
 * One message in a demo conversation.
 *
 * `senderId` is either the viewer's owner id or the other party's. There is no
 * delivery, receipt or transport of any kind behind this type.
 */
export interface DemoMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: number;
  /** Whether the viewer has read it. Their own messages are always read. */
  read: boolean;
}

/**
 * A demo conversation.
 *
 * Messages are the single source of truth: the preview line, the timestamp and
 * the unread count are all derived from them rather than stored, so they can
 * never disagree. No contact route exists on this type.
 */
export interface Conversation {
  id: string;
  kind: ConversationKind;
  /** Display name of the other party. */
  name: string;
  /** The other party's id, used for sender attribution only. */
  participantId: string;
  /** What the conversation is about, e.g. "About Mochi • Adoption". */
  context: string;
  messages: DemoMessage[];
}

/** Privacy switches the owner controls. Defaults are the private option. */
export interface PrivacySettings {
  showCity: boolean;
  allowContactRequests: boolean;
  discoverable: boolean;
}

/* ------------------------------------------------------------------ *
 * Feed (Step 2)
 * ------------------------------------------------------------------ */

/** Who can see a post. Defaults to the narrower option in the composer. */
export type PostVisibility = 'public' | 'followers';

export type FeedFilter = 'for-you' | 'following' | 'nearby';

/**
 * A post author as the feed needs them.
 *
 * Deliberately minimal: display name, public handle and broad city. No email,
 * phone or any other contact detail is carried on a post — those never leave
 * the owner's own profile.
 */
export interface PostAuthor {
  id: string;
  name: string;
  handle: string;
  /** Broad city only. Used by the Nearby filter; never a precise location. */
  city: string;
}

/** The pet a post is about, denormalised so a card renders without a lookup. */
export interface PostPet {
  id: string;
  name: string;
  species: Species;
  breed: string;
}

/**
 * An image on a post.
 *
 * `url` is optional and, when present, is whatever the owner typed into the
 * composer. Nothing is fetched by default: with no URL (or when one fails to
 * load) the tile renders a local placeholder, so the feed looks identical
 * offline and inside the Android WebView.
 */
export interface PostImage {
  id: string;
  /** Required — every image needs an accessible description. */
  alt: string;
  url?: string;
}

export interface PostReaction {
  userId: string;
  kind: 'like';
}

export interface PostComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  body: string;
  /** Epoch milliseconds, so the relative label stays honest as time passes. */
  createdAt: number;
}

export interface FeedPost {
  id: string;
  author: PostAuthor;
  pet: PostPet;
  createdAt: number;
  body: string;
  images: PostImage[];
  visibility: PostVisibility;
  /** Source of truth for the like count — never a stored number. */
  reactions: PostReaction[];
  comments: PostComment[];
  /** Viewer-scoped save state. Local to this device. */
  saved: boolean;
}

export type ReportReason =
  | 'spam'
  | 'animal-welfare'
  | 'misleading'
  | 'harassment'
  | 'other';

export interface PostReport {
  postId: string;
  reason: ReportReason;
  reportedAt: number;
}

/** Everything the composer collects. */
export interface NewPostDraft {
  body: string;
  petId: string;
  imageUrl: string;
  visibility: PostVisibility;
}

/* ------------------------------------------------------------------ *
 * Discovery & interest (Step 3)
 * ------------------------------------------------------------------ */

/** Owner-declared activity level. Observation only, never a health measure. */
export type EnergyLevel = 'low' | 'moderate' | 'high';

/** A photo on a pet profile. Same safe-placeholder contract as post images. */
export interface PetPhoto {
  id: string;
  alt: string;
  url?: string;
}

/**
 * A pet another owner has chosen to make discoverable.
 *
 * Every descriptive field here is owner-provided and unverified. There is no
 * screening, no veterinary record and no genetic information in this type, and
 * none may be added without a real verification process behind it.
 *
 * Contact details are deliberately absent: no email, phone, address or
 * coordinates exist on this object, so no screen can leak them.
 */
export interface DiscoverablePet {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerHandle: string;
  name: string;
  species: Species;
  breed: string;
  sex: PetSex;
  size: PetSize;
  ageYears: number;
  ageMonths: number;
  /** Broad city only. No coordinates, no radius, no distance. */
  city: string;
  /** Owner-written description. */
  bio: string;
  /** Owner-declared vaccination status. Not verified by Atronz. */
  vaccination: VaccinationStatus;
  neutered: boolean;
  /** Owner-written notes. Never rendered as a diagnosis or a score. */
  healthNotes: string;
  energyLevel: EnergyLevel;
  /** Owner-declared temperament words, used for the compatibility preview. */
  temperament: string[];
  goodWithOtherPets: boolean;
  photos: PetPhoto[];
  /** Opt-in. A pet with this false never appears in Discover. */
  discoverable: boolean;
}

export type InterestStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'withdrawn';

/** Who started the interest. Both directions use the same record shape. */
export type InterestDirection = 'sent' | 'received';

/**
 * An interest between the viewer and another owner's pet.
 *
 * `petId` is always the OTHER pet and `fromPetId` is always the viewer's pet,
 * whichever direction the interest travelled — so one shape serves both
 * inboxes without a second model.
 *
 * An interest shares nothing automatically: it does not reveal contact
 * details, and accepting one does not either.
 */
export interface InterestRequest {
  id: string;
  /** The other owner's pet. */
  petId: string;
  /** The viewer's pet the interest concerns, if they have one. */
  fromPetId: string | null;
  direction: InterestDirection;
  status: InterestStatus;
  sentAt: number;
  /** When the status last moved off `pending`. Null while still pending. */
  resolvedAt: number | null;
}

/**
 * An accepted connection between the viewer's pet and another owner's pet.
 *
 * Carries ids and a timestamp only. No contact detail exists on this type, so
 * accepting an interest cannot reveal one.
 */
export interface Connection {
  id: string;
  /** The interest that produced it — one connection per accepted interest. */
  interestId: string;
  petId: string;
  fromPetId: string | null;
  createdAt: number;
}

/** How the viewer currently relates to a pet, for the shared profile dialog. */
export interface PetRelationship {
  status: InterestStatus | null;
  direction: InterestDirection | null;
}

export type PetReportReason =
  | 'not-a-real-pet'
  | 'animal-welfare'
  | 'misleading-details'
  | 'commercial-breeding'
  | 'harassment'
  | 'other';

export interface PetReport {
  petId: string;
  reason: PetReportReason;
  reportedAt: number;
}

export interface PetBlock {
  petId: string;
  blockedAt: number;
}

export type VaccinationFilter = 'any' | VaccinationStatus;

/** Every discovery filter, held as one controlled object. */
export interface DiscoveryFilters {
  /** Free text over pet name and breed. */
  query: string;
  species: Species | 'any';
  breed: string | 'any';
  sex: PetSex | 'any';
  minAgeYears: number;
  maxAgeYears: number;
  city: string | 'any';
  vaccination: VaccinationFilter;
  /** Discoverable-only is on by default and cannot hide an opted-in pet. */
  discoverableOnly: boolean;
}

/**
 * The compatibility preview.
 *
 * Built only from attributes both owners typed into their own profiles. It is
 * a list of observations, never a score, a percentage or a recommendation.
 */
export interface CompatibilityNote {
  id: string;
  label: string;
  /** True when the two profiles align on this attribute. */
  shared: boolean;
}

export interface CompatibilityPreview {
  /** Null when the viewer has no pet to compare against. */
  comparedWithPetId: string | null;
  notes: CompatibilityNote[];
  sharedCount: number;
  totalCount: number;
}

/* ------------------------------------------------------------------ *
 * Adoption (Step 5)
 * ------------------------------------------------------------------ */

export type AdoptionStatus = 'available' | 'pending' | 'adopted';

/** Who published the listing. A public label only — never a contact route. */
export type ListerKind = 'owner' | 'shelter' | 'rescue';

/**
 * A pet listed for adoption or rehoming.
 *
 * Like `DiscoverablePet`, this type carries no contact field of any kind: no
 * email, phone, address, coordinates or link. Everything descriptive is
 * lister-provided and unverified.
 */
export interface AdoptionListing {
  id: string;
  name: string;
  species: Species;
  breed: string;
  sex: PetSex;
  size: PetSize;
  ageYears: number;
  ageMonths: number;
  /** Broad city only. No coordinates, no radius, no distance. */
  city: string;
  /** Lister-written description. */
  description: string;
  status: AdoptionStatus;
  listerKind: ListerKind;
  /** Public display name of the owner, shelter or rescue. */
  listerName: string;
  /** Lister-declared. Not verified by Atronz. */
  vaccination: VaccinationStatus;
  /** Lister-written notes. Never rendered as a diagnosis. */
  healthNotes: string;
  /**
   * Extra-care needs the lister described, e.g. "Needs a quiet home".
   * Empty means none were stated — never "none required".
   */
  careNeeds: string[];
  photos: PetPhoto[];
  listedAt: number;
}

export type ApplicationStatus = 'submitted' | 'withdrawn';

/**
 * A demo adoption application.
 *
 * Session-local: nothing is sent, no organisation is contacted, and this
 * record confers no rights or obligations of any kind.
 */
export interface AdoptionApplication {
  id: string;
  listingId: string;
  /** Taken from the local profile, never typed as a new identity. */
  applicantName: string;
  reason: string;
  livingSituation: string;
  experience: string;
  /** The applicant confirmed they will verify everything independently. */
  acknowledged: boolean;
  status: ApplicationStatus;
  submittedAt: number;
  withdrawnAt: number | null;
}

export type AdoptionStatusFilter = 'any' | AdoptionStatus;

/** Every adoption filter, held as one controlled object. */
export interface AdoptionFilters {
  query: string;
  species: Species | 'any';
  breed: string | 'any';
  sex: PetSex | 'any';
  minAgeYears: number;
  maxAgeYears: number;
  city: string | 'any';
  status: AdoptionStatusFilter;
  /** Show only listings whose lister described extra-care needs. */
  extraCareOnly: boolean;
  /** Show only listings the viewer saved. */
  savedOnly: boolean;
}

/** What the shared report dialog needs. Deliberately not a contact record. */
export interface ReportSubject {
  id: string;
  name: string;
  /** Secondary line, e.g. the owner or shelter display name. */
  byline: string;
}

/* ------------------------------------------------------------------ *
 * Services (Step 6)
 * ------------------------------------------------------------------ */

export type ServiceCategory =
  | 'grooming'
  | 'walking'
  | 'sitting'
  | 'boarding'
  | 'training'
  | 'vet-consult';

export type ServiceAvailability = 'accepting' | 'waitlist' | 'closed';

/** Deterministic mock pricing. Indicative only — never a quote or a charge. */
export interface PriceRange {
  minInr: number;
  maxInr: number;
  unit: 'visit' | 'hour' | 'night' | 'session';
}

/**
 * A provider-supplied rating summary.
 *
 * Rendered as the provider's own claim, never as an Atronz score or
 * endorsement, and never as stars that could read as verification.
 */
export interface ProviderRating {
  average: number;
  count: number;
}

/**
 * A pet service listing.
 *
 * Carries no contact route of any kind: no phone, email, address, coordinates
 * or link. `providerName` is a public display name only, and every
 * descriptive field is provider-supplied and unverified.
 */
export interface ServiceListing {
  id: string;
  /** Blocking is per provider, so all of a provider's services disappear. */
  providerId: string;
  providerName: string;
  name: string;
  category: ServiceCategory;
  /** Species the provider says they work with. */
  species: Species[];
  /** Broad city only. No coordinates, no radius, no distance. */
  city: string;
  description: string;
  availability: ServiceAvailability;
  /** Absent when the provider did not publish a price. */
  price?: PriceRange;
  /** Provider's own claims. Never presented as licensed or certified. */
  qualifications: string[];
  /** Provider's own summary. Absent when they published none. */
  rating?: ProviderRating;
  preparationNotes: string[];
  cancellationNote?: string;
  photos: PetPhoto[];
}

export type BookingStatus = 'submitted' | 'withdrawn';

/**
 * A demo booking request.
 *
 * Session-local: no provider is contacted, no appointment exists, and no
 * payment obligation is created. There is deliberately no accepted or
 * confirmed status, because nothing on the other side could produce one.
 */
export interface BookingRequest {
  id: string;
  serviceId: string;
  /** One of the viewer's own pets. */
  petId: string;
  /** ISO date string (yyyy-mm-dd) from a native date input. */
  preferredDate: string;
  timeWindow: string;
  message: string;
  acknowledged: boolean;
  status: BookingStatus;
  submittedAt: number;
  withdrawnAt: number | null;
}

export type ServiceCategoryFilter = 'any' | ServiceCategory;
export type ServiceAvailabilityFilter = 'any' | ServiceAvailability;

export interface ServiceFilters {
  query: string;
  category: ServiceCategoryFilter;
  species: Species | 'any';
  city: string | 'any';
  availability: ServiceAvailabilityFilter;
  /** Upper bound on the listing's lowest price. `null` means no limit. */
  maxPriceInr: number | null;
  savedOnly: boolean;
}

/* ------------------------------------------------------------------ *
 * Marketplace (Step 7)
 * ------------------------------------------------------------------ */

export type ProductCategory =
  | 'food'
  | 'toys'
  | 'grooming'
  | 'accessories'
  | 'bedding'
  | 'travel'
  | 'training'
  | 'health';

export type SellerKind = 'brand' | 'independent' | 'shelter-shop';

export type ProductAvailability = 'in-stock' | 'low-stock' | 'out-of-stock';

/** A seller's own rating claim. Never an Atronz score or endorsement. */
export interface SellerRating {
  average: number;
  count: number;
}

/**
 * A marketplace product.
 *
 * Carries no contact route and no purchase route: no phone, email, address,
 * coordinates, merchant link or payment field. `sellerName` is a public
 * display name only, and every claim is seller-provided and unverified.
 */
export interface Product {
  id: string;
  /** Blocking is per seller, so all of a seller's products disappear. */
  sellerId: string;
  sellerName: string;
  sellerKind: SellerKind;
  name: string;
  category: ProductCategory;
  /** Species the seller says the product suits. */
  species: Species[];
  description: string;
  /** Deterministic mock price in paise-free rupees. Illustrative only. */
  priceInr: number;
  availability: ProductAvailability;
  rating?: SellerRating;
  /** Seller's own notes. Never rendered as a medical or safety claim. */
  sellerNotes: string[];
  /** Basic spec lines, e.g. "Weight: 2 kg". Absent when none published. */
  productInfo: string[];
  photos: PetPhoto[];
}

/**
 * A line in the demo cart.
 *
 * There is deliberately no order, checkout, payment or reservation type — a
 * cart line is the furthest this app goes.
 */
export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: number;
}

export type ProductCategoryFilter = 'any' | ProductCategory;
export type ProductAvailabilityFilter = 'any' | ProductAvailability;
export type SellerKindFilter = 'any' | SellerKind;

export type MarketplaceSort = 'relevance' | 'price-asc' | 'price-desc';

export interface MarketplaceFilters {
  query: string;
  category: ProductCategoryFilter;
  species: Species | 'any';
  /** Upper bound on price. `null` means no limit. */
  maxPriceInr: number | null;
  availability: ProductAvailabilityFilter;
  sellerKind: SellerKindFilter;
  savedOnly: boolean;
}
