import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  AVAILABILITY_OPTIONS,
  DEFAULT_SERVICE_FILTERS,
  PRICE_MAX_INR,
  PRICE_STEP_INR,
  SERVICE_CATEGORY_OPTIONS,
  SERVICE_SPECIES_OPTIONS,
  applyServiceFilters,
} from '@/lib/services';
import type { ServiceFilters, ServiceListing } from '@/types';

export interface ServiceFiltersSheetProps {
  open: boolean;
  filters: ServiceFilters;
  cities: string[];
  /** Counted against the draft, so the apply button never lies. */
  listings: ServiceListing[];
  savedIds: string[];
  onClose: () => void;
  onApply: (filters: ServiceFilters) => void;
  onClear: () => void;
}

const SELECT_CLASS =
  'mt-1.5 h-11 w-full rounded-2xl border border-cream-300 bg-white px-3 text-sm text-charcoal-800 transition hover:border-clay-200';

/** Every service filter, as a bottom sheet on mobile and a dialog above `sm`. */
export function ServiceFiltersSheet({
  open,
  filters,
  cities,
  listings,
  savedIds,
  onClose,
  onApply,
  onClear,
}: ServiceFiltersSheetProps) {
  const [draft, setDraft] = useState<ServiceFilters>(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const patch = (next: Partial<ServiceFilters>) =>
    setDraft((current) => ({ ...current, ...next }));

  const previewCount = applyServiceFilters(listings, draft, savedIds).length;
  const priceEnabled = draft.maxPriceInr !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filter services"
      description="All filters use details the provider supplied themselves."
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              setDraft(DEFAULT_SERVICE_FILTERS);
              onClear();
            }}
            block
            className="sm:w-auto"
          >
            Clear all filters
          </Button>
          <Button onClick={() => onApply(draft)} block className="sm:w-auto">
            Show {previewCount} {previewCount === 1 ? 'service' : 'services'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field id="svc-filter-category" label="Service category">
          <select
            id="svc-filter-category"
            value={draft.category}
            onChange={(event) =>
              patch({
                category: event.target.value as ServiceFilters['category'],
              })
            }
            className={SELECT_CLASS}
          >
            {SERVICE_CATEGORY_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="svc-filter-species" label="Pet type">
          <select
            id="svc-filter-species"
            value={draft.species}
            onChange={(event) =>
              patch({ species: event.target.value as ServiceFilters['species'] })
            }
            className={SELECT_CLASS}
          >
            {SERVICE_SPECIES_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="svc-filter-city" label="City">
          <select
            id="svc-filter-city"
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

        <Field id="svc-filter-availability" label="Availability">
          <select
            id="svc-filter-availability"
            value={draft.availability}
            onChange={(event) =>
              patch({
                availability: event.target
                  .value as ServiceFilters['availability'],
              })
            }
            className={SELECT_CLASS}
          >
            {AVAILABILITY_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-charcoal-400">
            Provider-supplied and not verified.
          </p>
        </Field>

        <fieldset>
          <legend className="text-sm font-medium text-charcoal-800">
            Maximum price
          </legend>
          <label className="mt-1.5 flex cursor-pointer items-start gap-2.5 rounded-2xl border border-cream-300 bg-cream-50 p-3">
            <input
              type="checkbox"
              checked={priceEnabled}
              onChange={(event) =>
                patch({
                  maxPriceInr: event.target.checked ? PRICE_MAX_INR : null,
                })
              }
              className="mt-0.5 h-4 w-4 shrink-0 accent-clay-700"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-charcoal-800">
                Limit by price
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-charcoal-500">
                Services with no published price are excluded while this is on.
                Prices are demo figures, not quotes.
              </span>
            </span>
          </label>

          {priceEnabled ? (
            <div className="mt-2">
              <label
                htmlFor="svc-filter-price"
                className="block text-xs font-medium text-charcoal-600"
              >
                Up to ₹{(draft.maxPriceInr ?? PRICE_MAX_INR).toLocaleString('en-IN')}
              </label>
              <input
                id="svc-filter-price"
                type="range"
                min={PRICE_STEP_INR}
                max={PRICE_MAX_INR}
                step={PRICE_STEP_INR}
                value={draft.maxPriceInr ?? PRICE_MAX_INR}
                onChange={(event) =>
                  patch({ maxPriceInr: Number(event.target.value) })
                }
                className="mt-1.5 w-full accent-clay-700"
              />
            </div>
          ) : null}
        </fieldset>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-cream-300 bg-cream-50 p-3">
          <input
            type="checkbox"
            checked={draft.savedOnly}
            onChange={(event) => patch({ savedOnly: event.target.checked })}
            className="mt-0.5 h-4 w-4 shrink-0 accent-clay-700"
          />
          <span className="min-w-0">
            <span className="block text-sm font-medium text-charcoal-800">
              Only services I saved
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-charcoal-500">
              Saved services are kept for this session only.
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
