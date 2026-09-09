import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  ADOPTION_SEX_OPTIONS,
  ADOPTION_SPECIES_OPTIONS,
  ADOPTION_STATUS_OPTIONS,
  ADOPT_AGE_MAX,
  ADOPT_AGE_MIN,
  DEFAULT_ADOPTION_FILTERS,
  applyAdoptionFilters,
} from '@/lib/adoption';
import type { AdoptionFilters, AdoptionListing } from '@/types';

export interface AdoptionFiltersSheetProps {
  open: boolean;
  filters: AdoptionFilters;
  breeds: string[];
  cities: string[];
  /** Counted against the draft, so the apply button never lies. */
  listings: AdoptionListing[];
  savedIds: string[];
  onClose: () => void;
  onApply: (filters: AdoptionFilters) => void;
  onClear: () => void;
}

const SELECT_CLASS =
  'mt-1.5 h-11 w-full rounded-2xl border border-cream-300 bg-white px-3 text-sm text-charcoal-800 transition hover:border-clay-200';

/** Every adoption filter, as a bottom sheet on mobile and a dialog above `sm`. */
export function AdoptionFiltersSheet({
  open,
  filters,
  breeds,
  cities,
  listings,
  savedIds,
  onClose,
  onApply,
  onClear,
}: AdoptionFiltersSheetProps) {
  const [draft, setDraft] = useState<AdoptionFilters>(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const patch = (next: Partial<AdoptionFilters>) =>
    setDraft((current) => ({ ...current, ...next }));

  const previewCount = applyAdoptionFilters(listings, draft, savedIds).length;

  const setMinAge = (value: number) =>
    patch({ minAgeYears: Math.min(value, draft.maxAgeYears) });
  const setMaxAge = (value: number) =>
    patch({ maxAgeYears: Math.max(value, draft.minAgeYears) });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filter listings"
      description="All filters use details the owner, shelter or rescue provided."
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              setDraft(DEFAULT_ADOPTION_FILTERS);
              onClear();
            }}
            block
            className="sm:w-auto"
          >
            Clear all filters
          </Button>
          <Button onClick={() => onApply(draft)} block className="sm:w-auto">
            Show {previewCount} {previewCount === 1 ? 'listing' : 'listings'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field id="adopt-filter-species" label="Species">
          <select
            id="adopt-filter-species"
            value={draft.species}
            onChange={(event) =>
              patch({
                species: event.target.value as AdoptionFilters['species'],
                // A species change can strand a breed from another species.
                breed: 'any',
              })
            }
            className={SELECT_CLASS}
          >
            {ADOPTION_SPECIES_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="adopt-filter-breed" label="Breed">
          <select
            id="adopt-filter-breed"
            value={draft.breed}
            onChange={(event) => patch({ breed: event.target.value })}
            className={SELECT_CLASS}
          >
            <option value="any">Any breed</option>
            {breeds.map((breed) => (
              <option key={breed} value={breed}>
                {breed}
              </option>
            ))}
          </select>
        </Field>

        <Field id="adopt-filter-sex" label="Gender">
          <select
            id="adopt-filter-sex"
            value={draft.sex}
            onChange={(event) =>
              patch({ sex: event.target.value as AdoptionFilters['sex'] })
            }
            className={SELECT_CLASS}
          >
            {ADOPTION_SEX_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <fieldset>
          <legend className="text-sm font-medium text-charcoal-800">
            Age range
          </legend>
          <p id="adopt-age-hint" className="mt-0.5 text-xs text-charcoal-400">
            {draft.minAgeYears} to {draft.maxAgeYears} years
          </p>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="adopt-filter-age-min"
                className="block text-xs font-medium text-charcoal-600"
              >
                Youngest ({draft.minAgeYears} yrs)
              </label>
              <input
                id="adopt-filter-age-min"
                type="range"
                min={ADOPT_AGE_MIN}
                max={ADOPT_AGE_MAX}
                step={1}
                value={draft.minAgeYears}
                aria-describedby="adopt-age-hint"
                onChange={(event) => setMinAge(Number(event.target.value))}
                className="mt-1.5 w-full accent-clay-700"
              />
            </div>
            <div>
              <label
                htmlFor="adopt-filter-age-max"
                className="block text-xs font-medium text-charcoal-600"
              >
                Oldest ({draft.maxAgeYears} yrs)
              </label>
              <input
                id="adopt-filter-age-max"
                type="range"
                min={ADOPT_AGE_MIN}
                max={ADOPT_AGE_MAX}
                step={1}
                value={draft.maxAgeYears}
                aria-describedby="adopt-age-hint"
                onChange={(event) => setMaxAge(Number(event.target.value))}
                className="mt-1.5 w-full accent-clay-700"
              />
            </div>
          </div>
        </fieldset>

        <Field id="adopt-filter-city" label="City">
          <select
            id="adopt-filter-city"
            value={draft.city}
            onChange={(event) => patch({ city: event.target.value })}
            className={SELECT_CLASS}
          >
            <option value="any">Any city</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-charcoal-400">
            Broad city only — Atronz does not use GPS or precise location.
          </p>
        </Field>

        <Field id="adopt-filter-status" label="Adoption status">
          <select
            id="adopt-filter-status"
            value={draft.status}
            onChange={(event) =>
              patch({ status: event.target.value as AdoptionFilters['status'] })
            }
            className={SELECT_CLASS}
          >
            {ADOPTION_STATUS_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-cream-300 bg-cream-50 p-3">
          <input
            type="checkbox"
            checked={draft.extraCareOnly}
            onChange={(event) => patch({ extraCareOnly: event.target.checked })}
            className="mt-0.5 h-4 w-4 shrink-0 accent-clay-700"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-charcoal-800">
              Only listings with extra-care needs described
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-charcoal-500">
              Matches listings where the lister wrote down specific care needs.
              An empty list means nothing was stated, not that none exist.
            </span>
          </span>
        </label>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-cream-300 bg-cream-50 p-3">
          <input
            type="checkbox"
            checked={draft.savedOnly}
            onChange={(event) => patch({ savedOnly: event.target.checked })}
            className="mt-0.5 h-4 w-4 shrink-0 accent-clay-700"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-charcoal-800">
              Only listings I saved
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-charcoal-500">
              Saved listings are kept for this session only.
            </span>
          </span>
        </label>
      </div>
    </Modal>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-charcoal-800">
        {label}
      </label>
      {children}
    </div>
  );
}
