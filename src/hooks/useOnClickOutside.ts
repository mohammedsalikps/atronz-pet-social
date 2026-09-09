import { useEffect } from 'react';
import type { RefObject } from 'react';

/**
 * Closes popovers when the user clicks away or presses Escape.
 * `pointerdown` is used so it also fires for touch on Android.
 */
export function useOnClickOutside(
  ref: RefObject<HTMLElement>,
  handler: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) return;

    const onPointerDown = (event: PointerEvent) => {
      const el = ref.current;
      if (!el || el.contains(event.target as Node)) return;
      handler();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handler();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [ref, handler, enabled]);
}
