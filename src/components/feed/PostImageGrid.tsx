import { useState } from 'react';
import { ImageOff, PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PostImage } from '@/types';

/**
 * Deterministic tint per image id.
 *
 * Placeholders are generated locally rather than fetched, so a post looks the
 * same offline, in the Android WebView, and on first paint. The same id always
 * gets the same tint, which stops the feed shimmering on re-render.
 */
const TINTS = [
  'from-clay-100 to-cream-200 text-clay-600',
  'from-sage-100 to-cream-200 text-sage-700',
  'from-cream-200 to-clay-100 text-clay-700',
  'from-clay-50 to-sage-100 text-sage-700',
];

function tintFor(id: string): string {
  let hash = 0;
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0;
  }
  return TINTS[hash % TINTS.length];
}

function PostImageTile({ image }: { image: PostImage }) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(image.url) && !failed;

  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
      {showImage ? (
        <img
          src={image.url}
          alt={image.alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={image.alt}
          className={cn(
            'flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br p-3 text-center',
            tintFor(image.id),
          )}
        >
          {failed ? (
            <ImageOff className="h-6 w-6 opacity-70" aria-hidden="true" />
          ) : (
            <PawPrint className="h-6 w-6 opacity-70" aria-hidden="true" />
          )}
          <span className="line-clamp-2 text-[11px] font-medium leading-snug opacity-80">
            {failed ? 'Image unavailable' : image.alt}
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * One to three images. Beyond three the extras are counted rather than shown,
 * so a post can never push the card taller than a phone screen.
 */
export function PostImageGrid({ images }: { images: PostImage[] }) {
  if (images.length === 0) return null;

  const shown = images.slice(0, 3);
  const extra = images.length - shown.length;

  return (
    <div
      className={cn(
        'mt-3 grid gap-0.5 overflow-hidden rounded-xl border border-cream-200',
        shown.length === 1 && 'grid-cols-1',
        shown.length === 2 && 'grid-cols-2',
        shown.length >= 3 && 'grid-cols-2',
      )}
    >
      {shown.map((image, index) => (
        <div
          key={image.id}
          className={cn(
            'relative min-w-0',
            // With three images the first spans the full width above the pair.
            shown.length >= 3 && index === 0 && 'col-span-2',
          )}
        >
          <PostImageTile image={image} />
          {extra > 0 && index === shown.length - 1 ? (
            <span className="absolute inset-0 flex items-center justify-center bg-charcoal-900/45 text-sm font-semibold text-white">
              +{extra} more
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
