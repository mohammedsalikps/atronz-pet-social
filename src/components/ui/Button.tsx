import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  /** Stretch to the container — the default on mobile action rows. */
  block?: boolean;
}

/*
 * clay-700 rather than the brand clay-500 for solid fills: white text on 500
 * lands at 3.1:1, on 700 at 6.2:1.
 */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-clay-700 text-white hover:bg-clay-800 disabled:bg-clay-300',
  secondary:
    'border border-cream-300 bg-white text-charcoal-700 hover:border-clay-200 hover:text-charcoal-900',
  ghost: 'text-charcoal-600 hover:bg-cream-200 hover:text-charcoal-900',
  danger:
    'border border-red-200 bg-white text-red-700 hover:bg-red-50',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[13px] gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
};

/** The one button in the app. Every call to action routes through it. */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  block = false,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium transition disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        block ? 'w-full' : '',
        className,
      )}
      {...rest}
    >
      {Icon ? (
        <Icon
          className={size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </button>
  );
}
