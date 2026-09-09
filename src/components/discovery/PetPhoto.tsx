import { useState } from 'react';
import { ImageOff, PawPrint } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PetPhoto as PetPhotoType } from '@/types';

/**
 * Deterministic tint per photo id, so a card never shimmers between renders.
 * Placeholders are drawn locally — nothing is fetched.
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

export interface PetPhotoProps {
  photo: PetPhotoType | undefined;
  /** Used for the placeholder's label when a pet has no photos at all. */
  fallbackAlt: string;
  className?: string;
}

/**
 * One pet photo with a safe local fallback.
 *
 * Three cases, all handled: a photo with a working URL, a photo whose URL
 * fails to load, and no photo at all. None of them renders a broken image or
 * an empty box.
 */
export function PetPhoto({ photo, fallbackAlt, className }: PetPhotoProps) {
  const [failed, setFailed] = useState(false);
  const alt = photo?.alt ?? fallbackAlt;
  const showImage = Boolean(photo?.url) && !failed;

  return (
    <div className={cn('relative overflow-hidden bg-cream-100', className)}>
      {showImage ? (
        <img
          src={photo?.url}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className={cn(
            'flex h-full w-full flex-col items-center justify-center gap-1.5 bg-gradient-to-br p-3 text-center',
            tintFor(photo?.id ?? fallbackAlt),
          )}
        >
          {failed ? (
            <ImageOff className="h-6 w-6 opacity-70" aria-hidden="true" />
          ) : (
            <PawPrint className="h-6 w-6 opacity-70" aria-hidden="true" />
          )}
          <span className="line-clamp-2 break-words text-[11px] font-medium leading-snug opacity-80">
            {failed ? 'Image unavailable' : alt}
          </span>
        </div>
      )}
    </div>
  );
}
