import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  AGE_MAX_YEARS,
  AGE_MIN_YEARS,
  DEFAULT_FILTERS,
  SEX_OPTIONS,
  SPECIES_OPTIONS,
  VACCINATION_FILTER_OPTIONS,
  applyFilters,
} from '@/lib/discovery';
import type { DiscoverablePet, DiscoveryFilters } from '@/types';

export interface DiscoveryFiltersSheetProps {
  open: boolean;
  filters: DiscoveryFilters;
  breeds: string[];
  cities: string[];
  /** The visible set the draft is counted against, so the button never lies. */
  pets: DiscoverablePet[];
  onClose: () => void;
  onApply: (filters: DiscoveryFilters) => void;
  onClear: () => void;
}

/**
 * Every filter, in a bottom sheet on mobile and a dialog on desktop.
 *
 * The draft is local until Apply, so a half-set range never flashes results
 * behind the sheet. Opening it resyncs from the live filters.
 */
export function DiscoveryFiltersSheet({
  open,
  filters,
  breeds,
  cities,
  pets,
  onClose,
  onApply,
  onClear,
}: DiscoveryFiltersSheetProps) {
  const [draft, setDraft] = useState<DiscoveryFilters>(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const patch = (next: Partial<DiscoveryFilters>) =>
    setDraft((current) => ({ ...current, ...next }));

  /* Counted from the draft, not the applied filters — the button has to match
     what pressing it will actually show. */
  const previewCount = applyFilters(pets, draft).length;

  // Keep the range coherent whichever end the user moves.
  const setMinAge = (value: number) =>
    patch({ minAgeYears: Math.min(value, draft.maxAgeYears) });
  const setMaxAge = (value: number) =>
    patch({ maxAgeYears: Math.max(value, draft.minAgeYears) });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filter pets"
      description="All filters use profile details owners typed themselves."
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              setDraft(DEFAULT_FILTERS);
              onClear();
            }}
            block
            className="sm:w-auto"
          >
            Clear all filters
          </Button>
          <Button onClick={() => onApply(draft)} block className="sm:w-auto">
            Show {previewCount} {previewCount === 1 ? 'pet' : 'pets'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field id="filter-species" label="Species">
          <select
            id="filter-species"
            value={draft.species}
            onChange={(event) =>
              patch({
                species: event.target.value as DiscoveryFilters['species'],
                // A species change can strand a breed from another species.
                breed: 'any',
              })
            }
            className={SELECT_CLASS}
          >
            {SPECIES_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="filter-breed" label="Breed">
          <select
            id="filter-breed"
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

        <Field id="filter-sex" label="Gender">
          <select
            id="filter-sex"
            value={draft.sex}
            onChange={(event) =>
              patch({ sex: event.target.value as DiscoveryFilters['sex'] })
            }
            className={SELECT_CLASS}
          >
            {SEX_OPTIONS.map((option) => (
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
          <p className="mt-0.5 text-xs text-charcoal-400" id="filter-age-hint">
            {draft.minAgeYears} to {draft.maxAgeYears} years
          </p>
          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="filter-age-min"
                className="block text-xs font-medium text-charcoal-600"
              >
                Youngest ({draft.minAgeYears} yrs)
              </label>
              <input
                id="filter-age-min"
                type="range"
                min={AGE_MIN_YEARS}
                max={AGE_MAX_YEARS}
                step={1}
                value={draft.minAgeYears}
                aria-describedby="filter-age-hint"
                onChange={(event) => setMinAge(Number(event.target.value))}
                className="mt-1.5 w-full accent-clay-700"
              />
            </div>
            <div>
              <label
                htmlFor="filter-age-max"
                className="block text-xs font-medium text-charcoal-600"
              >
                Oldest ({draft.maxAgeYears} yrs)
              </label>
              <input
                id="filter-age-max"
                type="range"
                min={AGE_MIN_YEARS}
                max={AGE_MAX_YEARS}
                step={1}
                value={draft.maxAgeYears}
                aria-describedby="filter-age-hint"
                onChange={(event) => setMaxAge(Number(event.target.value))}
                className="mt-1.5 w-full accent-clay-700"
              />
            </div>
          </div>
        </fieldset>

        <Field id="filter-city" label="City">
          <select
            id="filter-city"
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

        <Field id="filter-vaccination" label="Vaccination information">
          <select
            id="filter-vaccination"
            value={draft.vaccination}
            onChange={(event) =>
              patch({
                vaccination: event.target
                  .value as DiscoveryFilters['vaccination'],
              })
            }
            className={SELECT_CLASS}
          >
            {VACCINATION_FILTER_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-charcoal-400">
            Owner-provided and not verified by Atronz.
          </p>
        </Field>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-cream-300 bg-cream-50 p-3">
          <input
            type="checkbox"
            checked={draft.discoverableOnly}
            onChange={(event) =>
              patch({ discoverableOnly: event.target.checked })
            }
            className="mt-0.5 h-4 w-4 shrink-0 accent-clay-700"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-charcoal-800">
              Discoverable pets only
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-charcoal-500">
              On by default. Owner opt-in is enforced before any filter runs, so
              turning this off can never reveal a pet whose owner opted out.
            </span>
          </span>
        </label>
      </div>
    </Modal>
  );
}

const SELECT_CLASS =
  'mt-1.5 h-11 w-full rounded-2xl border border-cream-300 bg-white px-3 text-sm text-charcoal-800 transition hover:border-clay-200';

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
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
