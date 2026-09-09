import { useCallback, useMemo, useState } from 'react';
import {
  Bookmark,
  PackageSearch,
  ShoppingBag,
  SlidersHorizontal,
  Store,
  X,
} from 'lucide-react';
import { DemoCartDialog } from '@/components/marketplace/DemoCartDialog';
import { MarketplaceFiltersSheet } from '@/components/marketplace/MarketplaceFiltersSheet';
import { ProductCard } from '@/components/marketplace/ProductCard';
import { ProductDetailDialog } from '@/components/marketplace/ProductDetailDialog';
import { ReportPetDialog } from '@/components/discovery/ReportPetDialog';
import { SafetyNotice } from '@/components/common/SafetyNotice';
import { PageHeading } from '@/components/layout/PageHeading';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useAppData } from '@/context/appData';
import { useToast } from '@/context/toast';
import {
  DEFAULT_MARKETPLACE_FILTERS,
  SORT_OPTIONS,
  activeMarketplaceFilterCount,
  applyMarketplaceFilters,
  cartItemCount,
  formatInr,
  isMarketplaceFiltered,
  resolveCartLines,
  sortProducts,
  visibleProducts,
} from '@/lib/marketplace';
import type { MarketplaceFilters, MarketplaceSort, PetReportReason } from '@/types';

/**
 * Marketplace — browse demo products and build a demo cart.
 *
 * Products live in `AppDataContext`; this page derives the visible set on
 * every render. Blocked sellers are removed before any filter, sort, saved
 * view or cart calculation runs, so exclusion is structural.
 */
export function MarketplacePage() {
  const {
    status,
    products,
    cartItems,
    savedProductIds,
    blockedSellerIds,
    addToCart,
    removeFromCart,
    setCartQuantity,
    clearCart,
    toggleSavedProduct,
    blockSeller,
    reportSeller,
  } = useAppData();
  const { showToast } = useToast();

  const [filters, setFilters] = useState<MarketplaceFilters>(
    DEFAULT_MARKETPLACE_FILTERS,
  );
  const [sort, setSort] = useState<MarketplaceSort>('relevance');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [reportSellerId, setReportSellerId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const visible = useMemo(
    () => visibleProducts(products, blockedSellerIds),
    [products, blockedSellerIds],
  );

  const results = useMemo(
    () =>
      sortProducts(
        applyMarketplaceFilters(visible, filters, savedProductIds),
        sort,
      ),
    [visible, filters, savedProductIds, sort],
  );

  /* Saved ids that still resolve to a visible product, so blocking a seller
     never leaves a count pointing at something nobody can see. */
  const visibleSavedIds = useMemo(
    () => savedProductIds.filter((id) => visible.some((item) => item.id === id)),
    [savedProductIds, visible],
  );

  /* Cart lines resolved against visible products only — a blocked seller's
     rows drop out of the drawer, the count and the subtotal together. */
  const cartLines = useMemo(
    () => resolveCartLines(cartItems, visible),
    [cartItems, visible],
  );
  const cartCount = cartItemCount(cartLines);

  const quantityOf = useCallback(
    (productId: string) =>
      cartLines.find((line) => line.product.id === productId)?.quantity ?? 0,
    [cartLines],
  );

  const filterCount = activeMarketplaceFilterCount(filters);

  const productById = useCallback(
    (id: string | null) =>
      id ? (visible.find((item) => item.id === id) ?? null) : null,
    [visible],
  );

  const detailProduct = productById(detailId);
  const reportTarget = reportSellerId
    ? (visible.find((item) => item.sellerId === reportSellerId) ?? null)
    : null;

  const handleClearFilters = useCallback(() => {
    setFilters(DEFAULT_MARKETPLACE_FILTERS);
    setFiltersOpen(false);
    setAnnouncement('Filters cleared.');
  }, []);

  const handleToggleSave = useCallback(
    (productId: string) => {
      const product = productById(productId);
      const wasSaved = savedProductIds.includes(productId);
      toggleSavedProduct(productId);
      setAnnouncement(
        wasSaved
          ? `Removed ${product?.name ?? 'product'} from saved products.`
          : `Saved ${product?.name ?? 'product'}.`,
      );
    },
    [productById, savedProductIds, toggleSavedProduct],
  );

  const handleAddToCart = useCallback(
    (productId: string) => {
      const product = productById(productId);
      if (!product) return;
      const next = addToCart(productId);
      showToast({
        tone: 'success',
        title: 'Added to demo cart',
        description: `${product.name} — nothing is bought, reserved or paid for.`,
      });
      setAnnouncement(
        `${product.name} added to the demo cart. Quantity ${next}. Nothing is bought or reserved.`,
      );
    },
    [productById, addToCart, showToast],
  );

  const handleSetQuantity = useCallback(
    (productId: string, quantity: number) => {
      const product = productById(productId);
      setCartQuantity(productId, quantity);
      setAnnouncement(
        `${product?.name ?? 'Product'} quantity set to ${Math.max(1, Math.min(20, Math.round(quantity)))}.`,
      );
    },
    [productById, setCartQuantity],
  );

  const handleRemoveFromCart = useCallback(
    (productId: string) => {
      const product = productById(productId);
      removeFromCart(productId);
      setAnnouncement(
        `${product?.name ?? 'Product'} removed from the demo cart.`,
      );
    },
    [productById, removeFromCart],
  );

  const handleClearCart = useCallback(() => {
    clearCart();
    setAnnouncement('Demo cart emptied.');
  }, [clearCart]);

  const handleReport = useCallback(
    (reason: PetReportReason) => {
      if (!reportTarget) return;
      const seller = reportTarget.sellerName;
      reportSeller(reportTarget.sellerId, reason);
      setReportSellerId(null);
      setDetailId(null);
      showToast({
        tone: 'success',
        title: 'Seller reported',
        description: `Every product from ${seller} has been removed from your results and cart.`,
      });
      setAnnouncement(`Reported ${seller} and removed all of their products.`);
    },
    [reportTarget, reportSeller, showToast],
  );

  const handleBlock = useCallback(
    (sellerId: string) => {
      const product = visible.find((item) => item.sellerId === sellerId);
      const seller = product?.sellerName ?? 'this seller';
      blockSeller(sellerId);
      setDetailId(null);
      showToast({
        tone: 'info',
        title: 'Seller blocked',
        description: `Every product from ${seller} is hidden, saved products and demo cart included.`,
      });
      setAnnouncement(`Blocked ${seller} and removed all of their products.`);
    },
    [visible, blockSeller, showToast],
  );

  return (
    <div>
      <PageHeading
        eyebrow="Marketplace"
        title="Marketplace"
        description="Food, toys, grooming and everyday supplies. Every product, price and cart action here is demo data held in this session only."
      />

      <SafetyNotice
        title="Demo products — nothing here can be bought"
        className="mb-4"
      >
        Sellers, product claims, availability, prices, reviews and suitability
        are placeholder or seller-supplied information. Atronz does not verify
        any of it and makes no claim about quality or safety. There is no
        checkout, payment, order, reservation or delivery, and no payment
        details are ever collected.
      </SafetyNotice>

      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-0 flex-1 basis-full sm:basis-56">
            <label
              htmlFor="marketplace-search"
              className="block text-xs font-medium text-charcoal-600"
            >
              Search products, sellers or descriptions
            </label>
            <input
              id="marketplace-search"
              type="search"
              value={filters.query}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  query: event.target.value,
                }))
              }
              placeholder="Try “toy” or “bed”"
              className="mt-1.5 h-11 w-full rounded-2xl border border-cream-300 bg-white px-3 text-sm text-charcoal-800 transition placeholder:text-charcoal-400 hover:border-clay-200"
            />
          </div>

          <div className="min-w-0 basis-full sm:basis-52">
            <label
              htmlFor="marketplace-sort"
              className="block text-xs font-medium text-charcoal-600"
            >
              Sort by
            </label>
            <select
              id="marketplace-sort"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as MarketplaceSort);
                setAnnouncement('Sort order updated.');
              }}
              className="mt-1.5 h-11 w-full rounded-2xl border border-cream-300 bg-white px-3 text-sm text-charcoal-800 transition hover:border-clay-200"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="secondary"
            icon={SlidersHorizontal}
            onClick={() => setFiltersOpen(true)}
            className="h-11 shrink-0"
          >
            Filters
            {filterCount > 0 ? (
              <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-clay-700 px-1.5 text-[11px] font-semibold text-white">
                {filterCount}
              </span>
            ) : null}
          </Button>

          <Button
            variant={filters.savedOnly ? 'primary' : 'secondary'}
            icon={Bookmark}
            aria-pressed={filters.savedOnly}
            onClick={() =>
              setFilters((current) => ({
                ...current,
                savedOnly: !current.savedOnly,
              }))
            }
            className="h-11 shrink-0"
          >
            Saved ({visibleSavedIds.length})
          </Button>

          <Button
            variant="secondary"
            icon={ShoppingBag}
            onClick={() => setCartOpen(true)}
            className="h-11 shrink-0"
            aria-label={`Open demo cart, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}
          >
            Demo cart ({cartCount})
          </Button>

          {isMarketplaceFiltered(filters) ? (
            <Button
              variant="ghost"
              icon={X}
              onClick={handleClearFilters}
              className="h-11 shrink-0"
            >
              Clear filters
            </Button>
          ) : null}
        </div>
      </Card>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {status === 'loading' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-[430px] rounded-2xl" />
          ))}
        </div>
      ) : results.length > 0 ? (
        <>
          <p className="mb-3 text-sm text-charcoal-500" role="status">
            {results.length} {results.length === 1 ? 'product' : 'products'}
            {isMarketplaceFiltered(filters)
              ? results.length === 1
                ? ' matches your filters'
                : ' match your filters'
              : ' available'}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cartQuantity={quantityOf(product.id)}
                saved={savedProductIds.includes(product.id)}
                onViewDetails={() => setDetailId(product.id)}
                onAddToCart={() => handleAddToCart(product.id)}
                onToggleSave={() => handleToggleSave(product.id)}
              />
            ))}
          </div>
        </>
      ) : visible.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No products to show"
          description={
            blockedSellerIds.length > 0
              ? 'You have blocked or reported every seller that was available. Blocked sellers stay hidden for this session.'
              : 'No products are listed right now. Check back later.'
          }
        />
      ) : filters.savedOnly && visibleSavedIds.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="No saved products yet"
          description="Save a product with the bookmark control and it will appear here."
          actionLabel="Show all products"
          onAction={() =>
            setFilters((current) => ({ ...current, savedOnly: false }))
          }
        />
      ) : (
        <EmptyState
          icon={PackageSearch}
          title="No products match these filters"
          description={`${visible.length} ${visible.length === 1 ? 'product is' : 'products are'} available, but none match what you have selected. Try clearing a filter or raising the price limit.`}
          actionLabel="Clear filters"
          onAction={handleClearFilters}
        />
      )}

      <MarketplaceFiltersSheet
        open={filtersOpen}
        filters={filters}
        products={visible}
        savedIds={savedProductIds}
        onClose={() => setFiltersOpen(false)}
        onApply={(next) => {
          setFilters(next);
          setFiltersOpen(false);
          setAnnouncement('Filters applied.');
        }}
        onClear={handleClearFilters}
      />

      {/*
        One dialog at a time throughout: every hand-off closes the dialog it
        came from, so two `aria-modal` dialogs and two focus traps are never
        active together.
      */}
      <ProductDetailDialog
        product={detailProduct}
        cartQuantity={detailId ? quantityOf(detailId) : 0}
        saved={detailId ? savedProductIds.includes(detailId) : false}
        onClose={() => setDetailId(null)}
        onAddToCart={() => {
          if (detailId) handleAddToCart(detailId);
        }}
        onToggleSave={() => {
          if (detailId) handleToggleSave(detailId);
        }}
        onReport={() => {
          setReportSellerId(detailProduct?.sellerId ?? null);
          setDetailId(null);
        }}
        onBlock={() => {
          if (detailProduct) handleBlock(detailProduct.sellerId);
        }}
      />

      <DemoCartDialog
        open={cartOpen}
        lines={cartLines}
        onClose={() => setCartOpen(false)}
        onSetQuantity={handleSetQuantity}
        onRemove={handleRemoveFromCart}
        onClear={handleClearCart}
      />

      <ReportPetDialog
        subject={
          reportTarget
            ? {
                id: reportTarget.sellerId,
                name: reportTarget.sellerName,
                byline: `${formatInr(reportTarget.priceInr)} · seller`,
              }
            : null
        }
        title="Report this seller"
        onClose={() => setReportSellerId(null)}
        onConfirm={handleReport}
      />
    </div>
  );
}
