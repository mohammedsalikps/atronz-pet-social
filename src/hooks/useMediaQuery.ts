import { useEffect, useState } from 'react';

/** Subscribes to a CSS media query. Used to close mobile-only UI on resize. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const list = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Tailwind's `lg` breakpoint — the desktop/mobile split for the app shell. */
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
