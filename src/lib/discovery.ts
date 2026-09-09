import type {
  CompatibilityNote,
  CompatibilityPreview,
  DiscoverablePet,
  DiscoveryFilters,
  PetProfile,
  PetReportReason,
  Species,
  VaccinationStatus,
} from '@/types';

export const AGE_MIN_YEARS = 0;
export const AGE_MAX_YEARS = 15;

/**
 * `discoverableOnly` starts on and the age range starts fully open, so the
 * default view is "every pet that opted in" rather than a filtered subset.
 */
export const DEFAULT_FILTERS: DiscoveryFilters = {
  query: '',
  species: 'any',
  breed: 'any',
  sex: 'any',
  minAgeYears: AGE_MIN_YEARS,
  maxAgeYears: AGE_MAX_YEARS,
  city: 'any',
  vaccination: 'any',
  discoverableOnly: true,
};

export const SPECIES_OPTIONS: Array<{ id: Species | 'any'; label: string }> = [
  { id: 'any', label: 'Any species' },
  { id: 'dog', label: 'Dog' },
  { id: 'cat', label: 'Cat' },
  { id: 'rabbit', label: 'Rabbit' },
  { id: 'bird', label: 'Bird' },
  { id: 'other', label: 'Other' },
];

export const SEX_OPTIONS = [
  { id: 'any' as const, label: 'Any gender' },
  { id: 'female' as const, label: 'Female' },
  { id: 'male' as const, label: 'Male' },
];

export const VACCINATION_FILTER_OPTIONS: Array<{
  id: 'any' | VaccinationStatus;
  label: string;
}> = [
  { id: 'any', label: 'Any vaccination information' },
  { id: 'up-to-date', label: 'Owner says up to date' },
  { id: 'partial', label: 'Owner says partial' },
  { id: 'unknown', label: 'Owner has not shared' },
];

export const PET_REPORT_REASONS: Array<{
  id: PetReportReason;
  label: string;
}> = [
  { id: 'not-a-real-pet', label: 'This is not a real pet profile' },
  { id: 'animal-welfare', label: 'Animal welfare concern' },
  { id: 'misleading-details', label: 'Misleading or false details' },
  { id: 'commercial-breeding', label: 'Looks like commercial breeding' },
  { id: 'harassment', label: 'Harassment or abuse' },
  { id: 'other', label: 'Something else' },
];

/** Breed and city option lists are built from the data, never hard-coded. */
export function breedOptions(pets: DiscoverablePet[]): string[] {
  return [...new Set(pets.map((pet) => pet.breed))].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function cityOptions(pets: DiscoverablePet[]): string[] {
  return [...new Set(pets.map((pet) => pet.city))].sort((a, b) =>
    a.localeCompare(b),
  );
}

/** Age in whole years plus months, as a single number for range comparisons. */
export function ageInYears(pet: {
  ageYears: number;
  ageMonths: number;
}): number {
  return pet.ageYears + pet.ageMonths / 12;
}

export function ageLabel(pet: { ageYears: number; ageMonths: number }): string {
  const years = pet.ageYears === 1 ? '1 yr' : `${pet.ageYears} yrs`;
  if (pet.ageMonths === 0) return years;
  return `${years} ${pet.ageMonths} mo`;
}

export function isFiltered(filters: DiscoveryFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.species !== 'any' ||
    filters.breed !== 'any' ||
    filters.sex !== 'any' ||
    filters.city !== 'any' ||
    filters.vaccination !== 'any' ||
    filters.minAgeYears !== AGE_MIN_YEARS ||
    filters.maxAgeYears !== AGE_MAX_YEARS ||
    !filters.discoverableOnly
  );
}

/** How many filters are narrowing the list — drives the button's badge. */
export function activeFilterCount(filters: DiscoveryFilters): number {
  let count = 0;
  if (filters.query.trim()) count += 1;
  if (filters.species !== 'any') count += 1;
  if (filters.breed !== 'any') count += 1;
  if (filters.sex !== 'any') count += 1;
  if (filters.city !== 'any') count += 1;
  if (filters.vaccination !== 'any') count += 1;
  if (
    filters.minAgeYears !== AGE_MIN_YEARS ||
    filters.maxAgeYears !== AGE_MAX_YEARS
  ) {
    count += 1;
  }
  return count;
}

export interface DiscoveryContext {
  viewerId: string;
  /** Pets the viewer blocked. Blocked pets never appear, filters aside. */
  blockedPetIds: string[];
  /** Reported pets are removed from the viewer's discovery as well. */
  reportedPetIds: string[];
}

/**
 * The pets the viewer is allowed to see at all, before any filter.
 *
 * The owner opt-in is enforced HERE rather than in `applyFilters`, so no
 * combination of filter settings can reveal a pet whose owner opted out. The
 * `discoverableOnly` filter below is therefore only ever able to narrow this
 * set further, never widen it.
 *
 * The viewer's own pets are excluded, and so is anything they blocked or
 * reported.
 */
export function discoverableFor(
  pets: DiscoverablePet[],
  context: DiscoveryContext,
): DiscoverablePet[] {
  return pets.filter(
    (pet) =>
      pet.discoverable &&
      pet.ownerId !== context.viewerId &&
      !context.blockedPetIds.includes(pet.id) &&
      !context.reportedPetIds.includes(pet.id),
  );
}

/** Applies the controlled filter object. Pure — no state, no side effects. */
export function applyFilters(
  pets: DiscoverablePet[],
  filters: DiscoveryFilters,
): DiscoverablePet[] {
  const query = filters.query.trim().toLowerCase();

  return pets.filter((pet) => {
    if (filters.discoverableOnly && !pet.discoverable) return false;
    if (filters.species !== 'any' && pet.species !== filters.species)
      return false;
    if (filters.breed !== 'any' && pet.breed !== filters.breed) return false;
    if (filters.sex !== 'any' && pet.sex !== filters.sex) return false;
    if (filters.city !== 'any' && pet.city !== filters.city) return false;
    if (filters.vaccination !== 'any' && pet.vaccination !== filters.vaccination)
      return false;

    const age = ageInYears(pet);
    if (age < filters.minAgeYears || age > filters.maxAgeYears) return false;

    if (query) {
      const haystack = `${pet.name} ${pet.breed}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}

/**
 * Builds the compatibility preview.
 *
 * Every note compares two things an owner typed into a profile. Nothing here
 * looks at health, fertility, pedigree or genetics, and the result is a list of
 * observations — deliberately not a score, a percentage or a recommendation.
 *
 * With no pet to compare against, the notes list is empty rather than invented.
 */
export function buildCompatibility(
  pet: DiscoverablePet,
  viewerPet: PetProfile | null,
): CompatibilityPreview {
  if (!viewerPet) {
    return {
      comparedWithPetId: null,
      notes: [],
      sharedCount: 0,
      totalCount: 0,
    };
  }

  const notes: CompatibilityNote[] = [
    {
      id: 'species',
      label:
        pet.species === viewerPet.species
          ? 'Same species'
          : 'Different species',
      shared: pet.species === viewerPet.species,
    },
    {
      id: 'size',
      label: pet.size === viewerPet.size ? 'Similar size' : 'Different size',
      shared: pet.size === viewerPet.size,
    },
    {
      id: 'age',
      label:
        Math.abs(ageInYears(pet) - ageInYears(viewerPet)) <= 2
          ? 'Within two years in age'
          : 'More than two years apart in age',
      shared: Math.abs(ageInYears(pet) - ageInYears(viewerPet)) <= 2,
    },
    {
      id: 'city',
      label: pet.city === viewerPet.city ? 'Same city' : 'Different city',
      shared: pet.city === viewerPet.city,
    },
    {
      id: 'sociable',
      label: pet.goodWithOtherPets
        ? 'Owner says good with other pets'
        : 'Owner has not said they are good with other pets',
      shared: pet.goodWithOtherPets,
    },
  ];

  return {
    comparedWithPetId: viewerPet.id,
    notes,
    sharedCount: notes.filter((note) => note.shared).length,
    totalCount: notes.length,
  };
}

/** Owner-provided phrasing used everywhere vaccination is shown. */
export function ownerProvidedVaccinationLabel(
  status: VaccinationStatus,
): string {
  switch (status) {
    case 'up-to-date':
      return 'Owner says vaccinations are up to date';
    case 'partial':
      return 'Owner says vaccinations are partial';
    case 'unknown':
      return 'Owner has not shared vaccination information';
  }
}
