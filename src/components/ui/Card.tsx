import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type CardTone = 'default' | 'muted' | 'accent';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  tone?: CardTone;
  /** Turn off the built-in padding when the card owns its own layout. */
  padded?: boolean;
  className?: string;
}

const TONE_CLASSES: Record<CardTone, string> = {
  default: 'bg-white border-cream-300',
  muted: 'bg-cream-50 border-cream-300',
  accent: 'bg-clay-50 border-clay-200',
};

/** The base surface for every panel in the app. */
export function Card({
  children,
  tone = 'default',
  padded = true,
  className,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border shadow-card',
        TONE_CLASSES[tone],
        padded && 'p-4 sm:p-5',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
