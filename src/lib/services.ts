import type {
  BookingRequest,
  PriceRange,
  ServiceAvailability,
  ServiceCategory,
  ServiceFilters,
  ServiceListing,
  Species,
} from '@/types';

export const MESSAGE_LIMIT = 300;

/** Price ceiling for the filter slider, above the most expensive mock listing. */
export const PRICE_MAX_INR = 3000;
export const PRICE_STEP_INR = 250;

export const DEFAULT_SERVICE_FILTERS: ServiceFilters = {
  query: '',
  category: 'any',
  species: 'any',
  city: 'any',
  availability: 'any',
  maxPriceInr: null,
  savedOnly: false,
};

export const SERVICE_CATEGORY_OPTIONS: Array<{
  id: ServiceCategory | 'any';
  label: string;
}> = [
  { id: 'any', label: 'Any category' },
  { id: 'grooming', label: 'Grooming' },
  { id: 'walking', label: 'Walking' },
  { id: 'sitting', label: 'Pet sitting' },
  { id: 'boarding', label: 'Boarding' },
  { id: 'training', label: 'Training' },
  { id: 'vet-consult', label: 'Vet consultation (informational)' },
];

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  grooming: 'Grooming',
  walking: 'Walking',
  sitting: 'Pet sitting',
  boarding: 'Boarding',
  training: 'Training',
  'vet-consult': 'Vet consultation',
};

export function serviceCategoryLabel(category: ServiceCategory): string {
  return CATEGORY_LABELS[category];
}

/**
 * The vet category is an informational listing only.
 *
 * It must never read as a medical service, a diagnosis or triage, so every
 * surface that renders this category renders this note beside it.
 */
export function categoryCaveat(category: ServiceCategory): string | null {
  if (category !== 'vet-consult') return null;
  return 'Informational demo listing only — not a medical service, diagnosis or triage. Contact a licensed veterinarian directly for care.';
}

export const SERVICE_SPECIES_OPTIONS: Array<{
  id: Species | 'any';
  label: string;
}> = [
  { id: 'any', label: 'Any pet type' },
  { id: 'dog', label: 'Dogs' },
  { id: 'cat', label: 'Cats' },
  { id: 'rabbit', label: 'Rabbits' },
  { id: 'bird', label: 'Birds' },
  { id: 'other', label: 'Other' },
];

export const AVAILABILITY_OPTIONS: Array<{
  id: ServiceAvailability | 'any';
  label: string;
}> = [
  { id: 'any', label: 'Any availability' },
  { id: 'accepting', label: 'Accepting requests' },
  { id: 'waitlist', label: 'Waitlist only' },
  { id: 'closed', label: 'Not accepting' },
];

const AVAILABILITY_LABELS: Record<ServiceAvailability, string> = {
  accepting: 'Accepting requests',
  waitlist: 'Waitlist only',
  closed: 'Not accepting requests',
};

export function availabilityLabel(status: ServiceAvailability): string {
  return AVAILABILITY_LABELS[status];
}

/** Tone always accompanies the text label — never colour alone. */
export function availabilityTone(
  status: ServiceAvailability,
): 'positive' | 'warning' | 'neutral' {
  switch (status) {
    case 'accepting':
      return 'positive';
    case 'waitlist':
      return 'warning';
    case 'closed':
      return 'neutral';
  }
}

const UNIT_LABELS: Record<PriceRange['unit'], string> = {
  visit: 'per visit',
  hour: 'per hour',
  night: 'per night',
  session: 'per session',
};

/** "₹600–900 per visit", or "₹600 per visit" when the range is a point. */
export function priceLabel(price: PriceRange): string {
  const unit = UNIT_LABELS[price.unit];
  if (price.minInr === price.maxInr) {
    return `₹${price.minInr.toLocaleString('en-IN')} ${unit}`;
  }
  return `₹${price.minInr.toLocaleString('en-IN')}–${price.maxInr.toLocaleString('en-IN')} ${unit}`;
}

/** Requests are only offered where the provider says they are accepting. */
export function canRequest(listing: ServiceListing): boolean {
  return listing.availability === 'accepting';
}

export function serviceCityOptions(listings: ServiceListing[]): string[] {
  return [...new Set(listings.map((item) => item.city))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function isServiceFiltered(filters: ServiceFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.category !== 'any' ||
    filters.species !== 'any' ||
    filters.city !== 'any' ||
    filters.availability !== 'any' ||
    filters.maxPriceInr !== null ||
    filters.savedOnly
  );
}

export function activeServiceFilterCount(filters: ServiceFilters): number {
  let count = 0;
  if (filters.query.trim()) count += 1;
  if (filters.category !== 'any') count += 1;
  if (filters.species !== 'any') count += 1;
  if (filters.city !== 'any') count += 1;
  if (filters.availability !== 'any') count += 1;
  if (filters.maxPriceInr !== null) count += 1;
  if (filters.savedOnly) count += 1;
  return count;
}

/**
 * Services the viewer may see at all.
 *
 * Blocking is by provider, so every listing from a blocked provider is removed
 * here — before any filter runs, so no filter combination, including "Saved
 * only", can bring one back.
 */
export function visibleServices(
  listings: ServiceListing[],
  blockedProviderIds: string[],
): ServiceListing[] {
  return listings.filter(
    (item) => !blockedProviderIds.includes(item.providerId),
  );
}

/** Pure filter application. No state, no side effects. */
export function applyServiceFilters(
  listings: ServiceListing[],
  filters: ServiceFilters,
  savedIds: string[],
): ServiceListing[] {
  const query = filters.query.trim().toLowerCase();

  return listings.filter((listing) => {
    if (filters.savedOnly && !savedIds.includes(listing.id)) return false;
    if (filters.category !== 'any' && listing.category !== filters.category)
      return false;
    if (filters.species !== 'any' && !listing.species.includes(filters.species))
      return false;
    if (filters.city !== 'any' && listing.city !== filters.city) return false;
    if (
      filters.availability !== 'any' &&
      listing.availability !== filters.availability
    ) {
      return false;
    }

    if (filters.maxPriceInr !== null) {
      // A listing with no published price cannot satisfy a price ceiling.
      if (!listing.price) return false;
      if (listing.price.minInr > filters.maxPriceInr) return false;
    }

    if (query) {
      const haystack =
        `${listing.name} ${listing.providerName} ${listing.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}

export interface BookingDraft {
  petId: string;
  preferredDate: string;
  timeWindow: string;
  message: string;
  acknowledged: boolean;
}

export const TIME_WINDOWS = [
  'Morning (8am – 12pm)',
  'Afternoon (12pm – 4pm)',
  'Evening (4pm – 8pm)',
];

export interface BookingValidation {
  valid: boolean;
  errors: {
    petId?: string;
    preferredDate?: string;
    timeWindow?: string;
    message?: string;
    acknowledged?: string;
  };
}

/**
 * Validates a booking draft.
 *
 * Run in the dialog on submit and again in the context, so an incomplete
 * request cannot reach state by any path.
 */
export function validateBooking(draft: BookingDraft): BookingValidation {
  const errors: BookingValidation['errors'] = {};

  if (!draft.petId) {
    errors.petId = 'Choose which of your pets this request is for.';
  }
  if (!draft.preferredDate) {
    errors.preferredDate = 'Choose a preferred date.';
  }
  if (!draft.timeWindow) {
    errors.timeWindow = 'Choose a preferred time window.';
  }
  if (draft.message.length > MESSAGE_LIMIT) {
    errors.message = `Keep this under ${MESSAGE_LIMIT} characters.`;
  }
  if (!draft.acknowledged) {
    errors.acknowledged =
      'Confirm you understand this is a demo request and books nothing.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/** Every still-submitted request for a service, in either pet. */
export function activeBookingsFor(
  bookings: BookingRequest[],
  serviceId: string,
): BookingRequest[] {
  return bookings.filter(
    (item) => item.serviceId === serviceId && item.status === 'submitted',
  );
}

/** Duplicates are scoped to viewer + pet + service, as specified. */
export function activeBookingForPet(
  bookings: BookingRequest[],
  serviceId: string,
  petId: string,
): BookingRequest | null {
  return (
    bookings.find(
      (item) =>
        item.serviceId === serviceId &&
        item.petId === petId &&
        item.status === 'submitted',
    ) ?? null
  );
}
