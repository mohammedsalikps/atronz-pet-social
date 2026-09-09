import lockupSrc from '@/assets/brand/atronz-lockup.png';
import markSrc from '@/assets/brand/atronz-mark.png';
import { cn } from '@/lib/utils';

export interface LogoProps {
  /** Hide the wordmark when the shell is in a tight space. */
  showWordmark?: boolean;
  /** Product line shown under the company lockup. */
  showProductName?: boolean;
  className?: string;
}

/**
 * The official Atronz Innovations logo, shared with Atronz Pet Health.
 *
 * Both files are the supplied artwork with the paper background matted out —
 * never redrawn or recoloured — so the intrinsic aspect ratio is preserved and
 * only `height` is set, letting width follow naturally. Only the product line
 * underneath differs between the two apps.
 */
export function Logo({
  showWordmark = true,
  showProductName = false,
  className,
}: LogoProps) {
  if (!showWordmark) {
    return (
      <img
        src={markSrc}
        alt="Atronz"
        width={192}
        height={192}
        className={cn('h-9 w-9 shrink-0 object-contain', className)}
      />
    );
  }

  return (
    <span className={cn('flex min-w-0 flex-col gap-1', className)}>
      <img
        src={lockupSrc}
        alt="Atronz Innovations"
        width={640}
        height={171}
        className="h-8 w-auto max-w-full self-start object-contain object-left"
      />
      {showProductName ? (
        <span className="pl-0.5 text-[11px] font-medium uppercase leading-none tracking-[0.14em] text-charcoal-400">
          Pet Social
        </span>
      ) : null}
    </span>
  );
}
