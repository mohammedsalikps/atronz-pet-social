import { useEffect } from 'react';
import { pushBackHandler } from '@/lib/androidBack';

/**
 * Registers an Android back handler while `active` is true.
 *
 * `handler` is read through a ref-free closure on purpose: the effect re-runs
 * whenever the handler identity changes, which keeps it from capturing stale
 * state. Callers should wrap theirs in `useCallback`.
 */
export function useBackHandler(active: boolean, handler: () => void): void {
  useEffect(() => {
    if (!active) return;
    return pushBackHandler(() => {
      handler();
      return true;
    });
  }, [active, handler]);
}
