import type {
  AdoptionApplication,
  AdoptionFilters,
  AdoptionListing,
  AdoptionStatus,
  ListerKind,
  Species,
} from '@/types';

export const ADOPT_AGE_MIN = 0;
export const ADOPT_AGE_MAX = 15;

export const REASON_LIMIT = 400;
export const LIVING_LIMIT = 300;
export const EXPERIENCE_LIMIT = 300;

export const DEFAULT_ADOPTION_FILTERS: AdoptionFilters = {
  query: '',
  species: 'any',
  breed: 'any',
  sex: 'any',
  minAgeYears: ADOPT_AGE_MIN,
  maxAgeYears: ADOPT_AGE_MAX,
  city: 'any',
  status: 'any',
  extraCareOnly: false,
  savedOnly: false,
};

export const ADOPTION_SPECIES_OPTIONS: Array<{
  id: Species | 'any';
  label: string;
}> = [
  { id: 'any', label: 'Any species' },
  { id: 'dog', label: 'Dog' },
  { id: 'cat', label: 'Cat' },
  { id: 'rabbit', label: 'Rabbit' },
  { id: 'bird', label: 'Bird' },
  { id: 'other', label: 'Other' },
];

export const ADOPTION_SEX_OPTIONS = [
  { id: 'any' as const, label: 'Any gender' },
  { id: 'female' as const, label: 'Female' },
  { id: 'male' as const, label: 'Male' },
];

export const ADOPTION_STATUS_OPTIONS: Array<{
  id: 'any' | AdoptionStatus;
  label: string;
}> = [
  { id: 'any', label: 'Any status' },
  { id: 'available', label: 'Available' },
  { id: 'pending', label: 'Pending' },
  { id: 'adopted', label: 'Adopted' },
];

const STATUS_LABELS: Record<AdoptionStatus, string> = {
  available: 'Available',
  pending: 'Pending',
  adopted: 'Adopted',
};

export function adoptionStatusLabel(status: AdoptionStatus): string {
  return STATUS_LABELS[status];
}

/** Tone is always paired with the text label — never colour alone. */
export function adoptionStatusTone(
  status: AdoptionStatus,
): 'positive' | 'warning' | 'neutral' {
  switch (status) {
    case 'available':
      return 'positive';
    case 'pending':
      return 'warning';
    case 'adopted':
      return 'neutral';
  }
}

const LISTER_LABELS: Record<ListerKind, string> = {
  owner: 'Listed by owner',
  shelter: 'Listed by shelter',
  rescue: 'Listed by rescue',
};

export function listerLabel(kind: ListerKind): string {
  return LISTER_LABELS[kind];
}

/** Only an available listing can take a new application. */
export function canApply(listing: AdoptionListing): boolean {
  return listing.status === 'available';
}

export function breedOptionsFor(listings: AdoptionListing[]): string[] {
  return [...new Set(listings.map((item) => item.breed))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function cityOptionsFor(listings: AdoptionListing[]): string[] {
  return [...new Set(listings.map((item) => item.city))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function listingAgeInYears(listing: {
  ageYears: number;
  ageMonths: number;
}): number {
  return listing.ageYears + listing.ageMonths / 12;
}

export function isAdoptionFiltered(filters: AdoptionFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.species !== 'any' ||
    filters.breed !== 'any' ||
    filters.sex !== 'any' ||
    filters.city !== 'any' ||
    filters.status !== 'any' ||
    filters.extraCareOnly ||
    filters.savedOnly ||
    filters.minAgeYears !== ADOPT_AGE_MIN ||
    filters.maxAgeYears !== ADOPT_AGE_MAX
  );
}

export function activeAdoptionFilterCount(filters: AdoptionFilters): number {
  let count = 0;
  if (filters.query.trim()) count += 1;
  if (filters.species !== 'any') count += 1;
  if (filters.breed !== 'any') count += 1;
  if (filters.sex !== 'any') count += 1;
  if (filters.city !== 'any') count += 1;
  if (filters.status !== 'any') count += 1;
  if (filters.extraCareOnly) count += 1;
  if (filters.savedOnly) count += 1;
  if (
    filters.minAgeYears !== ADOPT_AGE_MIN ||
    filters.maxAgeYears !== ADOPT_AGE_MAX
  ) {
    count += 1;
  }
  return count;
}

export interface AdoptionVisibility {
  /** Listing ids the viewer blocked or reported. */
  hiddenIds: string[];
  savedIds: string[];
}

/**
 * Listings the viewer may see at all.
 *
 * Blocked and reported listings are removed here, before any filter runs, so
 * no filter combination — including "Saved only" — can bring one back.
 */
export function visibleListings(
  listings: AdoptionListing[],
  visibility: AdoptionVisibility,
): AdoptionListing[] {
  return listings.filter((item) => !visibility.hiddenIds.includes(item.id));
}

/** Pure filter application. No state, no side effects. */
export function applyAdoptionFilters(
  listings: AdoptionListing[],
  filters: AdoptionFilters,
  savedIds: string[],
): AdoptionListing[] {
  const query = filters.query.trim().toLowerCase();

  return listings.filter((listing) => {
    if (filters.savedOnly && !savedIds.includes(listing.id)) return false;
    if (filters.species !== 'any' && listing.species !== filters.species)
      return false;
    if (filters.breed !== 'any' && listing.breed !== filters.breed) return false;
    if (filters.sex !== 'any' && listing.sex !== filters.sex) return false;
    if (filters.city !== 'any' && listing.city !== filters.city) return false;
    if (filters.status !== 'any' && listing.status !== filters.status)
      return false;
    if (filters.extraCareOnly && listing.careNeeds.length === 0) return false;

    const age = listingAgeInYears(listing);
    if (age < filters.minAgeYears || age > filters.maxAgeYears) return false;

    if (query) {
      const haystack =
        `${listing.name} ${listing.breed} ${listing.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}

export interface ApplicationDraft {
  reason: string;
  livingSituation: string;
  experience: string;
  acknowledged: boolean;
}

export interface ApplicationValidation {
  valid: boolean;
  errors: {
    reason?: string;
    livingSituation?: string;
    experience?: string;
    acknowledged?: string;
  };
}

/**
 * Validates an application draft.
 *
 * Run on submit in the dialog and again in the context, so an incomplete
 * application cannot reach state by any path.
 */
export function validateApplication(
  draft: ApplicationDraft,
): ApplicationValidation {
  const errors: ApplicationValidation['errors'] = {};

  const reason = draft.reason.trim();
  if (!reason) {
    errors.reason = 'Tell the lister why you would like to adopt.';
  } else if (reason.length > REASON_LIMIT) {
    errors.reason = `Keep this under ${REASON_LIMIT} characters.`;
  }

  const living = draft.livingSituation.trim();
  if (!living) {
    errors.livingSituation = 'Describe your living situation.';
  } else if (living.length > LIVING_LIMIT) {
    errors.livingSituation = `Keep this under ${LIVING_LIMIT} characters.`;
  }

  const experience = draft.experience.trim();
  if (!experience) {
    errors.experience = 'Describe your experience with pets.';
  } else if (experience.length > EXPERIENCE_LIMIT) {
    errors.experience = `Keep this under ${EXPERIENCE_LIMIT} characters.`;
  }

  if (!draft.acknowledged) {
    errors.acknowledged =
      'Confirm that you will verify everything independently.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/** The viewer's live application for a listing, if one is still submitted. */
export function activeApplicationFor(
  applications: AdoptionApplication[],
  listingId: string,
): AdoptionApplication | null {
  return (
    applications.find(
      (item) => item.listingId === listingId && item.status === 'submitted',
    ) ?? null
  );
}
