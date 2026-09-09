import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import {
  DEFAULT_MARKETPLACE_FILTERS,
  PRODUCT_AVAILABILITY_OPTIONS,
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_PRICE_MAX_INR,
  PRODUCT_PRICE_STEP_INR,
  PRODUCT_SPECIES_OPTIONS,
  SELLER_KIND_OPTIONS,
  applyMarketplaceFilters,
  formatInr,
} from '@/lib/marketplace';
import type { MarketplaceFilters, Product } from '@/types';

export interface MarketplaceFiltersSheetProps {
  open: boolean;
  filters: MarketplaceFilters;
  /** Counted against the draft, so the apply button never lies. */
  products: Product[];
  savedIds: string[];
  onClose: () => void;
  onApply: (filters: MarketplaceFilters) => void;
  onClear: () => void;
}

const SELECT_CLASS =
  'mt-1.5 h-11 w-full rounded-2xl border border-cream-300 bg-white px-3 text-sm text-charcoal-800 transition hover:border-clay-200';

/** Every marketplace filter, as a bottom sheet on mobile and a dialog above `sm`. */
export function MarketplaceFiltersSheet({
  open,
  filters,
  products,
  savedIds,
  onClose,
  onApply,
  onClear,
}: MarketplaceFiltersSheetProps) {
  const [draft, setDraft] = useState<MarketplaceFilters>(filters);

  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const patch = (next: Partial<MarketplaceFilters>) =>
    setDraft((current) => ({ ...current, ...next }));

  const previewCount = applyMarketplaceFilters(products, draft, savedIds).length;
  const priceEnabled = draft.maxPriceInr !== null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Filter products"
      description="All filters use details the seller supplied themselves."
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => {
              setDraft(DEFAULT_MARKETPLACE_FILTERS);
              onClear();
            }}
            block
            className="sm:w-auto"
          >
            Clear all filters
          </Button>
          <Button onClick={() => onApply(draft)} block className="sm:w-auto">
            Show {previewCount} {previewCount === 1 ? 'product' : 'products'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field id="mkt-filter-category" label="Product category">
          <select
            id="mkt-filter-category"
            value={draft.category}
            onChange={(event) =>
              patch({
                category: event.target.value as MarketplaceFilters['category'],
              })
            }
            className={SELECT_CLASS}
          >
            {PRODUCT_CATEGORY_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="mkt-filter-species" label="Pet type">
          <select
            id="mkt-filter-species"
            value={draft.species}
            onChange={(event) =>
              patch({
                species: event.target.value as MarketplaceFilters['species'],
              })
            }
            className={SELECT_CLASS}
          >
            {PRODUCT_SPECIES_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field id="mkt-filter-availability" label="Availability">
          <select
            id="mkt-filter-availability"
            value={draft.availability}
            onChange={(event) =>
              patch({
                availability: event.target
                  .value as MarketplaceFilters['availability'],
              })
            }
            className={SELECT_CLASS}
          >
            {PRODUCT_AVAILABILITY_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-charcoal-400">
            Seller-supplied and not verified.
          </p>
        </Field>

        <Field id="mkt-filter-seller" label="Seller type">
          <select
            id="mkt-filter-seller"
            value={draft.sellerKind}
            onChange={(event) =>
              patch({
                sellerKind: event.target
                  .value as MarketplaceFilters['sellerKind'],
              })
            }
            className={SELECT_CLASS}
          >
            {SELLER_KIND_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
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
                  maxPriceInr: event.target.checked
                    ? PRODUCT_PRICE_MAX_INR
                    : null,
                })
              }
              className="mt-0.5 h-4 w-4 shrink-0 accent-clay-700"
            />
            <span className="min-w-0">
              <span className="block text-sm font-medium text-charcoal-800">
                Limit by price
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-charcoal-500">
                Prices are illustrative demo figures, not quotes, and nothing
                here can be bought.
              </span>
            </span>
          </label>

          {priceEnabled ? (
            <div className="mt-2">
              <label
                htmlFor="mkt-filter-price"
                className="block text-xs font-medium text-charcoal-600"
              >
                Up to {formatInr(draft.maxPriceInr ?? PRODUCT_PRICE_MAX_INR)}
              </label>
              <input
                id="mkt-filter-price"
                type="range"
                min={PRODUCT_PRICE_STEP_INR}
                max={PRODUCT_PRICE_MAX_INR}
                step={PRODUCT_PRICE_STEP_INR}
                value={draft.maxPriceInr ?? PRODUCT_PRICE_MAX_INR}
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
              Only products I saved
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-charcoal-500">
              Saved products are kept for this session only.
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
