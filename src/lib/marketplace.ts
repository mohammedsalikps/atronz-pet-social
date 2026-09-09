import type {
  CartItem,
  MarketplaceFilters,
  MarketplaceSort,
  Product,
  ProductAvailability,
  ProductCategory,
  SellerKind,
  Species,
} from '@/types';

/** Price ceiling for the filter slider, above the most expensive mock product. */
export const PRODUCT_PRICE_MAX_INR = 5000;
export const PRODUCT_PRICE_STEP_INR = 250;

export const MAX_QUANTITY = 20;
export const MIN_QUANTITY = 1;

export const DEFAULT_MARKETPLACE_FILTERS: MarketplaceFilters = {
  query: '',
  category: 'any',
  species: 'any',
  maxPriceInr: null,
  availability: 'any',
  sellerKind: 'any',
  savedOnly: false,
};

export const PRODUCT_CATEGORY_OPTIONS: Array<{
  id: ProductCategory | 'any';
  label: string;
}> = [
  { id: 'any', label: 'Any category' },
  { id: 'food', label: 'Food and treats' },
  { id: 'toys', label: 'Toys' },
  { id: 'grooming', label: 'Grooming' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'bedding', label: 'Bedding' },
  { id: 'travel', label: 'Travel' },
  { id: 'training', label: 'Training' },
  { id: 'health', label: 'Health-related (informational)' },
];

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  food: 'Food and treats',
  toys: 'Toys',
  grooming: 'Grooming',
  accessories: 'Accessories',
  bedding: 'Bedding',
  travel: 'Travel',
  training: 'Training',
  health: 'Health-related',
};

export function productCategoryLabel(category: ProductCategory): string {
  return CATEGORY_LABELS[category];
}

/**
 * The health category is informational only.
 *
 * It must never read as diagnosis, treatment, cure or a guaranteed benefit, so
 * every surface that renders this category renders this note beside it.
 */
export function productCategoryCaveat(
  category: ProductCategory,
): string | null {
  if (category !== 'health') return null;
  return 'Informational demo listing only — not medical advice, not a treatment or cure, and no health benefit is claimed or guaranteed. Ask a licensed veterinarian before giving your pet anything.';
}

export const PRODUCT_SPECIES_OPTIONS: Array<{
  id: Species | 'any';
  label: string;
}> = [
  { id: 'any', label: 'Any pet type' },
  { id: 'dog', label: 'Dogs' },
  { id: 'cat', label: 'Cats' },
  { id: 'rabbit', label: 'Rabbits' },
  { id: 'bird', label: 'Birds' },
  { id: 'other', label: 'Other' },
];

export const PRODUCT_AVAILABILITY_OPTIONS: Array<{
  id: ProductAvailability | 'any';
  label: string;
}> = [
  { id: 'any', label: 'Any availability' },
  { id: 'in-stock', label: 'In stock' },
  { id: 'low-stock', label: 'Low stock' },
  { id: 'out-of-stock', label: 'Out of stock' },
];

const AVAILABILITY_LABELS: Record<ProductAvailability, string> = {
  'in-stock': 'In stock',
  'low-stock': 'Low stock',
  'out-of-stock': 'Out of stock',
};

export function productAvailabilityLabel(
  status: ProductAvailability,
): string {
  return AVAILABILITY_LABELS[status];
}

/** Tone always accompanies the text label — never colour alone. */
export function productAvailabilityTone(
  status: ProductAvailability,
): 'positive' | 'warning' | 'neutral' {
  switch (status) {
    case 'in-stock':
      return 'positive';
    case 'low-stock':
      return 'warning';
    case 'out-of-stock':
      return 'neutral';
  }
}

export const SELLER_KIND_OPTIONS: Array<{
  id: SellerKind | 'any';
  label: string;
}> = [
  { id: 'any', label: 'Any seller type' },
  { id: 'brand', label: 'Brand' },
  { id: 'independent', label: 'Independent seller' },
  { id: 'shelter-shop', label: 'Shelter shop' },
];

const SELLER_KIND_LABELS: Record<SellerKind, string> = {
  brand: 'Brand',
  independent: 'Independent seller',
  'shelter-shop': 'Shelter shop',
};

export function sellerKindLabel(kind: SellerKind): string {
  return SELLER_KIND_LABELS[kind];
}

export const SORT_OPTIONS: Array<{ id: MarketplaceSort; label: string }> = [
  { id: 'relevance', label: 'Relevance' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
];

/** "₹1,250" — illustrative demo pricing, never a charge. */
export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/** A product can only be added to the demo cart while it is not out of stock. */
export function canAddToCart(product: Product): boolean {
  return product.availability !== 'out-of-stock';
}

export function isMarketplaceFiltered(filters: MarketplaceFilters): boolean {
  return (
    filters.query.trim() !== '' ||
    filters.category !== 'any' ||
    filters.species !== 'any' ||
    filters.maxPriceInr !== null ||
    filters.availability !== 'any' ||
    filters.sellerKind !== 'any' ||
    filters.savedOnly
  );
}

export function activeMarketplaceFilterCount(
  filters: MarketplaceFilters,
): number {
  let count = 0;
  if (filters.query.trim()) count += 1;
  if (filters.category !== 'any') count += 1;
  if (filters.species !== 'any') count += 1;
  if (filters.maxPriceInr !== null) count += 1;
  if (filters.availability !== 'any') count += 1;
  if (filters.sellerKind !== 'any') count += 1;
  if (filters.savedOnly) count += 1;
  return count;
}

/**
 * Products the viewer may see at all.
 *
 * Blocking is by seller, so every product from a blocked seller is removed
 * here — before any filter, sort, saved view, or cart calculation runs. That
 * makes exclusion structural rather than something each surface must remember.
 */
export function visibleProducts(
  products: Product[],
  blockedSellerIds: string[],
): Product[] {
  return products.filter(
    (item) => !blockedSellerIds.includes(item.sellerId),
  );
}

/** Pure filter application. No state, no side effects. */
export function applyMarketplaceFilters(
  products: Product[],
  filters: MarketplaceFilters,
  savedIds: string[],
): Product[] {
  const query = filters.query.trim().toLowerCase();

  return products.filter((product) => {
    if (filters.savedOnly && !savedIds.includes(product.id)) return false;
    if (filters.category !== 'any' && product.category !== filters.category)
      return false;
    if (filters.species !== 'any' && !product.species.includes(filters.species))
      return false;
    if (
      filters.availability !== 'any' &&
      product.availability !== filters.availability
    ) {
      return false;
    }
    if (
      filters.sellerKind !== 'any' &&
      product.sellerKind !== filters.sellerKind
    ) {
      return false;
    }
    if (filters.maxPriceInr !== null && product.priceInr > filters.maxPriceInr)
      return false;

    if (query) {
      const haystack =
        `${product.name} ${product.sellerName} ${product.description}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    return true;
  });
}

/**
 * Sorting.
 *
 * "Relevance" keeps the source order rather than inventing a score — there is
 * no ranking signal here, and a fabricated one would be a lie.
 */
export function sortProducts(
  products: Product[],
  sort: MarketplaceSort,
): Product[] {
  if (sort === 'relevance') return products;
  const copy = [...products];
  copy.sort((a, b) =>
    sort === 'price-asc' ? a.priceInr - b.priceInr : b.priceInr - a.priceInr,
  );
  return copy;
}

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return MIN_QUANTITY;
  return Math.max(MIN_QUANTITY, Math.min(MAX_QUANTITY, Math.round(quantity)));
}

export interface CartLine {
  product: Product;
  quantity: number;
  lineTotalInr: number;
}

/**
 * Resolves cart items against the products the viewer can actually see.
 *
 * A line whose product is blocked or missing is dropped here, so the drawer,
 * the count and the subtotal all agree without any of them filtering
 * separately.
 */
export function resolveCartLines(
  items: CartItem[],
  visible: Product[],
): CartLine[] {
  return items.flatMap((item) => {
    const product = visible.find((candidate) => candidate.id === item.productId);
    if (!product) return [];
    return [
      {
        product,
        quantity: item.quantity,
        lineTotalInr: product.priceInr * item.quantity,
      },
    ];
  });
}

export function cartItemCount(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.quantity, 0);
}

export function cartSubtotalInr(lines: CartLine[]): number {
  return lines.reduce((total, line) => total + line.lineTotalInr, 0);
}
