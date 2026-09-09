import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { PetPhoto } from '@/components/discovery/PetPhoto';
import { SafetyNotice } from '@/components/common/SafetyNotice';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import {
  MAX_QUANTITY,
  MIN_QUANTITY,
  cartItemCount,
  cartSubtotalInr,
  formatInr,
} from '@/lib/marketplace';
import type { CartLine } from '@/lib/marketplace';

export interface DemoCartDialogProps {
  open: boolean;
  /** Already resolved against visible products, so blocked lines are gone. */
  lines: CartLine[];
  onClose: () => void;
  onSetQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onClear: () => void;
}

/**
 * The demo cart.
 *
 * There is no checkout, no payment field, no tax, shipping or final total —
 * only an illustrative subtotal — because none of those could be honest here.
 */
export function DemoCartDialog({
  open,
  lines,
  onClose,
  onSetQuantity,
  onRemove,
  onClear,
}: DemoCartDialogProps) {
  const count = cartItemCount(lines);
  const subtotal = cartSubtotalInr(lines);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Demo cart"
      description="No checkout or payment — this cart exists only in this session."
      footer={
        <div className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-charcoal-600">
              Illustrative subtotal
              <span className="ml-1 text-charcoal-400">
                ({count} {count === 1 ? 'item' : 'items'})
              </span>
            </span>
            <span className="text-lg font-semibold tabular-nums text-charcoal-900">
              {formatInr(subtotal)}
            </span>
          </div>
          <p className="text-xs leading-relaxed text-charcoal-400">
            Illustrative only. No tax, shipping or discount is calculated, no
            order is placed, nothing is reserved and no payment is owed.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            {lines.length > 0 ? (
              <Button
                variant="secondary"
                onClick={onClear}
                block
                className="sm:w-auto"
              >
                Empty cart
              </Button>
            ) : null}
            <Button onClick={onClose} block className="sm:w-auto">
              Keep browsing
            </Button>
          </div>
        </div>
      }
    >
      {lines.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your demo cart is empty"
          description="Add a product to see how the cart behaves. Nothing can be bought here."
          className="border-0 bg-transparent py-6"
        />
      ) : (
        <ul className="space-y-3">
          {lines.map((line) => (
            <li
              key={line.product.id}
              className="flex items-start gap-3 rounded-2xl border border-cream-200 p-3"
            >
              <PetPhoto
                photo={line.product.photos[0]}
                fallbackAlt={`No photo shared for ${line.product.name}`}
                className="h-16 w-16 shrink-0 rounded-xl border border-cream-200"
              />

              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-semibold text-charcoal-900">
                  {line.product.name}
                </p>
                <p className="mt-0.5 break-words text-xs text-charcoal-500">
                  {line.product.sellerName} · {formatInr(line.product.priceInr)}{' '}
                  each
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {/* Quantity controls, each with its own accessible name. */}
                  <div className="flex items-center gap-1 rounded-full border border-cream-300 bg-white p-0.5">
                    <button
                      type="button"
                      onClick={() =>
                        onSetQuantity(line.product.id, line.quantity - 1)
                      }
                      disabled={line.quantity <= MIN_QUANTITY}
                      aria-label={`Decrease quantity of ${line.product.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-charcoal-600 transition hover:bg-cream-100 disabled:cursor-not-allowed disabled:text-charcoal-400"
                    >
                      <Minus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <span
                      aria-label={`Quantity of ${line.product.name}`}
                      className="min-w-[24px] text-center text-sm font-medium tabular-nums text-charcoal-800"
                    >
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onSetQuantity(line.product.id, line.quantity + 1)
                      }
                      disabled={line.quantity >= MAX_QUANTITY}
                      aria-label={`Increase quantity of ${line.product.name}`}
                      className="flex h-7 w-7 items-center justify-center rounded-full text-charcoal-600 transition hover:bg-cream-100 disabled:cursor-not-allowed disabled:text-charcoal-400"
                    >
                      <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>

                  <span className="text-sm font-semibold tabular-nums text-charcoal-800">
                    {formatInr(line.lineTotalInr)}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRemove(line.product.id)}
                    aria-label={`Remove ${line.product.name} from the demo cart`}
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-full text-charcoal-400 transition hover:bg-cream-100 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <SafetyNotice title="Nothing is being bought" className="mt-4">
        This is a demo cart in a preview build. There is no checkout, no
        payment, no order, no reservation and no delivery. No seller is
        contacted and no card or payment details are ever collected. The cart
        clears when you reload.
      </SafetyNotice>
    </Modal>
  );
}
