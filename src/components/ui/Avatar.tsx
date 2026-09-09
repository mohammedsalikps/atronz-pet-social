import { useEffect, useState } from 'react';
import { cn, initialsOf } from '@/lib/utils';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
export type AvatarShape = 'circle' | 'rounded';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  className?: string;
}

const SIZE_CLASSES: Record<AvatarSize, string> = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-10 w-10 text-xs',
  lg: 'h-12 w-12 text-sm',
  xl: 'h-16 w-16 text-base',
  '2xl': 'h-20 w-20 text-lg',
  '3xl': 'h-28 w-28 text-2xl',
};

const SHAPE_CLASSES: Record<AvatarShape, string> = {
  circle: 'rounded-full',
  rounded: 'rounded-2xl',
};

/**
 * Photo avatar with a graceful fallback: if the remote image is missing or the
 * device is offline, the initials tile is shown instead of a broken image.
 */
export function Avatar({
  name,
  src,
  size = 'md',
  shape = 'circle',
  className,
}: AvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const showImage = Boolean(src) && !failed;

  return (
    <span
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden bg-clay-100 font-semibold uppercase tracking-wide text-clay-700 ring-1 ring-inset ring-black/5',
        SIZE_CLASSES[size],
        SHAPE_CLASSES[shape],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden="true">{initialsOf(name)}</span>
      )}
      {showImage ? null : <span className="sr-only">{name}</span>}
    </span>
  );
}
