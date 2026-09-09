import type { PetDraft, PetProfile } from '@/types';

export const PET_NAME_MAX = 40;
export const PET_BREED_MAX = 60;
export const PET_CITY_MAX = 60;
export const PET_BIO_MAX = 300;
export const PET_AGE_YEARS_MAX = 30;
export const PET_AGE_MONTHS_MAX = 11;

/**
 * A blank pet.
 *
 * `openToMating` starts false and is never flipped on the user's behalf — the
 * discoverability opt-in from Step 3 has to stay an explicit choice.
 */
export const EMPTY_PET_DRAFT: PetDraft = {
  name: '',
  species: 'dog',
  breed: '',
  sex: 'female',
  size: 'medium',
  ageYears: '',
  ageMonths: '0',
  city: '',
  bio: '',
  vaccination: 'unknown',
  neutered: false,
  openToMating: false,
};

export function draftFromPet(pet: PetProfile): PetDraft {
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    sex: pet.sex,
    size: pet.size,
    ageYears: String(pet.ageYears),
    ageMonths: String(pet.ageMonths),
    city: pet.city,
    bio: pet.bio,
    vaccination: pet.vaccination,
    neutered: pet.neutered,
    openToMating: pet.openToMating,
  };
}

export interface PetValidation {
  valid: boolean;
  errors: {
    name?: string;
    breed?: string;
    ageYears?: string;
    ageMonths?: string;
    city?: string;
    bio?: string;
  };
}

/** Parses a numeric field, returning null when it is blank or not a number. */
function parseCount(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Validates a pet draft.
 *
 * Ages are range-checked rather than merely parsed, so a typo cannot put a
 * 300-year-old pet — or a `NaN` — into state. Run by the form and again by the
 * context, so no path can save an invalid pet.
 */
export function validatePet(draft: PetDraft): PetValidation {
  const errors: PetValidation['errors'] = {};

  const name = draft.name.trim();
  if (!name) errors.name = 'Give your pet a name.';
  else if (name.length > PET_NAME_MAX)
    errors.name = `Keep the name under ${PET_NAME_MAX} characters.`;

  const breed = draft.breed.trim();
  if (!breed) errors.breed = 'Add a breed, or "Mixed" if you are not sure.';
  else if (breed.length > PET_BREED_MAX)
    errors.breed = `Keep the breed under ${PET_BREED_MAX} characters.`;

  const years = parseCount(draft.ageYears);
  if (years === null) errors.ageYears = 'Enter age in whole years.';
  else if (years > PET_AGE_YEARS_MAX)
    errors.ageYears = `Years must be ${PET_AGE_YEARS_MAX} or less.`;

  const months = parseCount(draft.ageMonths);
  if (months === null) errors.ageMonths = 'Enter months as a number.';
  else if (months > PET_AGE_MONTHS_MAX)
    errors.ageMonths = `Months must be ${PET_AGE_MONTHS_MAX} or less.`;

  const city = draft.city.trim();
  if (!city) errors.city = 'Add a city. City level only — never an address.';
  else if (city.length > PET_CITY_MAX)
    errors.city = `Keep the city under ${PET_CITY_MAX} characters.`;

  if (draft.bio.trim().length > PET_BIO_MAX)
    errors.bio = `Keep the bio under ${PET_BIO_MAX} characters.`;

  return { valid: Object.keys(errors).length === 0, errors };
}

/**
 * Turns a validated draft into stored fields.
 *
 * Numbers are coerced here once, so nothing downstream has to guess whether a
 * value is a string or a number.
 */
export function petFieldsFromDraft(draft: PetDraft): Omit<PetProfile, 'id' | 'ownerId'> {
  return {
    name: draft.name.trim(),
    species: draft.species,
    breed: draft.breed.trim(),
    sex: draft.sex,
    size: draft.size,
    ageYears: parseCount(draft.ageYears) ?? 0,
    ageMonths: parseCount(draft.ageMonths) ?? 0,
    bio: draft.bio.trim(),
    vaccination: draft.vaccination,
    neutered: draft.neutered,
    openToMating: draft.openToMating,
    city: draft.city.trim(),
  };
}

export const SPECIES_CHOICES = [
  { id: 'dog' as const, label: 'Dog' },
  { id: 'cat' as const, label: 'Cat' },
  { id: 'rabbit' as const, label: 'Rabbit' },
  { id: 'bird' as const, label: 'Bird' },
  { id: 'other' as const, label: 'Other' },
];

export const SEX_CHOICES = [
  { id: 'female' as const, label: 'Female' },
  { id: 'male' as const, label: 'Male' },
];

export const SIZE_CHOICES = [
  { id: 'small' as const, label: 'Small' },
  { id: 'medium' as const, label: 'Medium' },
  { id: 'large' as const, label: 'Large' },
];

export const VACCINATION_CHOICES = [
  { id: 'up-to-date' as const, label: 'Up to date (owner-provided)' },
  { id: 'partial' as const, label: 'Partial (owner-provided)' },
  { id: 'unknown' as const, label: 'Not shared' },
];
