import { Bookmark, Info, ShoppingBag } from 'lucide-react';
import { PetPhoto } from '@/components/discovery/PetPhoto';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  canAddToCart,
  formatInr,
  productAvailabilityLabel,
  productAvailabilityTone,
  productCategoryCaveat,
  productCategoryLabel,
  sellerKindLabel,
} from '@/lib/marketplace';
import { speciesLabel } from '@/lib/utils';
import type { Product } from '@/types';

export interface ProductCardProps {
  product: Product;
  /** Quantity already in the demo cart. 0 when not added. */
  cartQuantity: number;
  saved: boolean;
  onViewDetails: () => void;
  onAddToCart: () => void;
  onToggleSave: () => void;
}

/**
 * One product.
 *
 * Every claim is attributed to the seller. The card renders no merchant link,
 * contact route or payment control because `Product` carries none.
 */
export function ProductCard({
  product,
  cartQuantity,
  saved,
  onViewDetails,
  onAddToCart,
  onToggleSave,
}: ProductCardProps) {
  const addable = canAddToCart(product);
  const caveat = productCategoryCaveat(product.category);

  return (
    <Card padded={false} className="flex flex-col overflow-hidden">
      <article
        aria-label={`${product.name} from ${product.sellerName}`}
        className="flex flex-1 flex-col"
      >
        <div className="relative">
          <PetPhoto
            photo={product.photos[0]}
            fallbackAlt={`No photo shared for ${product.name}`}
            className="aspect-[4/3] w-full"
          />
          <button
            type="button"
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label={
              saved
                ? `Remove ${product.name} from saved products`
                : `Save ${product.name} to your products`
            }
            className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-cream-300 bg-white/95 text-charcoal-500 shadow-sm transition hover:text-clay-700"
          >
            <Bookmark
              className="h-[17px] w-[17px]"
              fill={saved ? 'currentColor' : 'none'}
              aria-hidden="true"
            />
          </button>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex flex-wrap items-start gap-x-2 gap-y-1">
            <h3 className="min-w-0 flex-1 break-words text-base font-semibold tracking-tight text-charcoal-900">
              {product.name}
            </h3>
            <Badge>{productCategoryLabel(product.category)}</Badge>
          </div>

          <p className="mt-0.5 break-words text-sm text-charcoal-500">
            {product.sellerName} · {sellerKindLabel(product.sellerKind)}
          </p>

          <p className="mt-1 break-words text-xs text-charcoal-400">
            Suits {product.species.map((s) => speciesLabel(s)).join(', ')}
          </p>

          <p className="mt-2 line-clamp-3 break-words text-sm leading-relaxed text-charcoal-600">
            {product.description}
          </p>

          {/* Health-category products must never read as medical. */}
          {caveat ? (
            <p className="mt-2 flex items-start gap-1.5 rounded-xl bg-cream-100 px-2.5 py-2 text-xs leading-relaxed text-charcoal-500">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="min-w-0 break-words">{caveat}</span>
            </p>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-base font-semibold text-charcoal-900">
              {formatInr(product.priceInr)}
            </span>
            <Badge tone={productAvailabilityTone(product.availability)}>
              {productAvailabilityLabel(product.availability)}
            </Badge>
            {saved ? <Badge tone="accent">Saved</Badge> : null}
            {cartQuantity > 0 ? (
              <Badge tone="positive">In demo cart ({cartQuantity})</Badge>
            ) : null}
          </div>

          {/* A seller claim, phrased as one — never stars or an Atronz score. */}
          {product.rating ? (
            <p className="mt-2 text-xs text-charcoal-400">
              Seller states {product.rating.average.toFixed(1)} out of 5 from{' '}
              {product.rating.count} reviews. Not verified by Atronz.
            </p>
          ) : null}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button
              variant="secondary"
              size="sm"
              onClick={onViewDetails}
              block
              className="sm:flex-1"
            >
              View details
            </Button>
            {addable ? (
              <Button
                size="sm"
                icon={ShoppingBag}
                onClick={onAddToCart}
                block
                className="sm:flex-1"
              >
                Add to demo cart
              </Button>
            ) : null}
          </div>

          {/* Why the add control is absent, stated rather than left blank. */}
          {!addable ? (
            <p className="mt-2 text-xs text-charcoal-400">
              Seller states this is out of stock, so it cannot be added.
            </p>
          ) : null}
        </div>
      </article>
    </Card>
  );
}
