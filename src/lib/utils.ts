import type { PetProfile, Species, VaccinationStatus } from '@/types';

/** Tiny classnames joiner — keeps conditional Tailwind lists readable. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function petAgeLabel(pet: PetProfile): string {
  const years = pet.ageYears === 1 ? '1 yr' : `${pet.ageYears} yrs`;
  if (pet.ageMonths === 0) return years;
  return `${years} ${pet.ageMonths} mo`;
}

const SPECIES_LABELS: Record<Species, string> = {
  dog: 'Dog',
  cat: 'Cat',
  rabbit: 'Rabbit',
  bird: 'Bird',
  other: 'Other',
};

export function speciesLabel(species: Species): string {
  return SPECIES_LABELS[species];
}

/** "Indie • Female • 3 yrs 4 mo" — the one-line summary on a pet card. */
export function petSubtitle(pet: PetProfile): string {
  const sex = pet.sex === 'female' ? 'Female' : 'Male';
  return `${pet.breed} • ${sex} • ${petAgeLabel(pet)}`;
}

const VACCINATION_LABELS: Record<VaccinationStatus, string> = {
  'up-to-date': 'Vaccinations up to date',
  partial: 'Vaccinations partial',
  unknown: 'Vaccination status not shared',
};

export function vaccinationLabel(status: VaccinationStatus): string {
  return VACCINATION_LABELS[status];
}

/** Tailwind classes for the pill carrying a vaccination status. */
export function vaccinationTone(status: VaccinationStatus): string {
  switch (status) {
    case 'up-to-date':
      return 'bg-sage-50 text-sage-700 border-sage-200';
    case 'partial':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'unknown':
      return 'bg-cream-100 text-charcoal-500 border-cream-300';
  }
}

export function formatCount(value: number): string {
  if (value < 1000) return String(value);
  return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
}

/** Greeting that matches the time of day on the user's device. */
export function greetingForNow(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
