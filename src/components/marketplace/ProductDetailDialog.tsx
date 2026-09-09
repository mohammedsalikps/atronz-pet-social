import { Ban, Bookmark, Flag, Info, ShoppingBag } from 'lucide-react';
import { PetPhoto } from '@/components/discovery/PetPhoto';
import { SafetyNotice } from '@/components/common/SafetyNotice';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
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

export interface ProductDetailDialogProps {
  product: Product | null;
  cartQuantity: number;
  saved: boolean;
  onClose: () => void;
  onAddToCart: () => void;
  onToggleSave: () => void;
  onReport: () => void;
  onBlock: () => void;
}

/**
 * Full product detail.
 *
 * A bottom sheet on mobile and a dialog above `sm`, from the shared Modal, so
 * Escape, the focus trap and focus restoration behave as everywhere else.
 */
export function ProductDetailDialog({
  product,
  cartQuantity,
  saved,
  onClose,
  onAddToCart,
  onToggleSave,
  onReport,
  onBlock,
}: ProductDetailDialogProps) {
  if (!product) return null;

  const addable = canAddToCart(product);
  const caveat = productCategoryCaveat(product.category);

  return (
    <Modal
      open
      onClose={onClose}
      title={product.name}
      description={`${productCategoryLabel(product.category)} · ${product.sellerName}`}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} block className="sm:w-auto">
            Close
          </Button>
          <Button
            variant="secondary"
            icon={Bookmark}
            onClick={onToggleSave}
            aria-pressed={saved}
            block
            className="sm:w-auto"
          >
            {saved ? 'Saved' : 'Save product'}
          </Button>
          {addable ? (
            <Button
              icon={ShoppingBag}
              onClick={onAddToCart}
              block
              className="sm:w-auto"
            >
              Add to demo cart
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-lg font-semibold text-charcoal-900">
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

        {caveat ? (
          <p className="flex items-start gap-1.5 rounded-2xl border border-cream-300 bg-cream-100 px-3 py-2.5 text-xs leading-relaxed text-charcoal-600">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 break-words">{caveat}</span>
          </p>
        ) : null}

        {product.photos.length > 0 ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {product.photos.map((photo) => (
              <PetPhoto
                key={photo.id}
                photo={photo}
                fallbackAlt={`Photo of ${product.name}`}
                className="aspect-[4/3] w-full rounded-xl border border-cream-200"
              />
            ))}
          </div>
        ) : (
          <PetPhoto
            photo={undefined}
            fallbackAlt={`No photo shared for ${product.name}`}
            className="aspect-[16/9] w-full rounded-xl border border-cream-200"
          />
        )}

        <section>
          <h3 className="text-sm font-semibold text-charcoal-800">
            About this product
          </h3>
          <p className="mt-1.5 break-words text-sm leading-relaxed text-charcoal-600">
            {product.description}
          </p>
          <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Detail
              label="Category"
              value={productCategoryLabel(product.category)}
            />
            <Detail
              label="Suits"
              value={product.species.map((s) => speciesLabel(s)).join(', ')}
            />
            <Detail
              label="Availability"
              value={productAvailabilityLabel(product.availability)}
            />
            <Detail label="Price" value={formatInr(product.priceInr)} />
          </dl>
          <p className="mt-2 break-words text-sm text-charcoal-500">
            Sold by {product.sellerName} ·{' '}
            {sellerKindLabel(product.sellerKind)}
          </p>
        </section>

        {/* Only rendered when the seller actually published spec lines. */}
        {product.productInfo.length > 0 ? (
          <section>
            <h3 className="text-sm font-semibold text-charcoal-800">
              Product information
            </h3>
            <ul className="mt-2 space-y-1.5">
              {product.productInfo.map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay-400"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 break-words text-charcoal-600">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section>
          <h3 className="text-sm font-semibold text-charcoal-800">
            Seller-supplied notes
          </h3>
          {product.sellerNotes.length > 0 ? (
            <ul className="mt-2 space-y-1.5">
              {product.sellerNotes.map((note) => (
                <li key={note} className="flex items-start gap-2 text-sm">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cream-300"
                    aria-hidden="true"
                  />
                  <span className="min-w-0 break-words text-charcoal-600">
                    {note}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1.5 text-sm text-charcoal-500">
              This seller published no notes.
            </p>
          )}
          {product.rating ? (
            <p className="mt-2 text-sm text-charcoal-600">
              Seller states {product.rating.average.toFixed(1)} out of 5 from{' '}
              {product.rating.count} reviews.
            </p>
          ) : (
            <p className="mt-2 text-sm text-charcoal-500">
              This seller published no rating.
            </p>
          )}
          <p className="mt-1.5 text-xs text-charcoal-400">
            All of the above is written by the seller. Atronz does not check
            product claims, safety, materials, reviews or pricing.
          </p>
        </section>

        <SafetyNotice title="Demo product — nothing here is verified">
          Products, sellers, prices, availability, reviews and suitability are
          placeholder or seller-supplied information in a preview build. Atronz
          does not verify any of it and makes no claim about quality, safety or
          suitability for your pet. Nothing here can be bought: there is no
          checkout, payment, order, reservation or delivery, and the demo cart
          exists only in this browser session.
        </SafetyNotice>

        <section className="border-t border-cream-200 pt-3">
          <h3 className="text-sm font-semibold text-charcoal-800">
            Safety controls
          </h3>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Button
              variant="secondary"
              size="sm"
              icon={Flag}
              onClick={onReport}
              block
              className="sm:w-auto"
            >
              Report this seller
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={Ban}
              onClick={onBlock}
              block
              className="sm:w-auto"
            >
              Block this seller
            </Button>
          </div>
          <p className="mt-1.5 text-xs text-charcoal-400">
            Blocking removes every product from {product.sellerName}, including
            saved products and anything of theirs in your demo cart.
          </p>
        </section>
      </div>
    </Modal>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-cream-200 bg-cream-50 px-3 py-2">
      <dt className="text-[10px] uppercase tracking-wide text-charcoal-400">
        {label}
      </dt>
      <dd className="break-words text-sm font-medium text-charcoal-800">
        {value}
      </dd>
    </div>
  );
}
