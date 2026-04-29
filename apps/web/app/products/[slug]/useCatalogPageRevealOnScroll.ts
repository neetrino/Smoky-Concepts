'use client';

import { useEffect, useRef, useState } from 'react';

import {
  SIZE_CATALOG_PAGE_INTERSECT_HIDDEN_RATIO,
  SIZE_CATALOG_PAGE_INTERSECT_VISIBLE_RATIO,
} from './sizeCatalogPicker.constants';

/**
 * Bumps `revealTick` when an off-screen catalog page scrolls into view (for staggered card entrance).
 */
export function useCatalogPageRevealOnScroll(enabled: boolean) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [revealTick, setRevealTick] = useState(0);
  const enteredRef = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const el = pageRef.current;
    if (!el) {
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) {
          return;
        }
        const { isIntersecting, intersectionRatio } = entry;
        if (isIntersecting && intersectionRatio >= SIZE_CATALOG_PAGE_INTERSECT_VISIBLE_RATIO) {
          if (!enteredRef.current) {
            enteredRef.current = true;
            setRevealTick((t) => t + 1);
          }
          return;
        }
        if (intersectionRatio < SIZE_CATALOG_PAGE_INTERSECT_HIDDEN_RATIO) {
          enteredRef.current = false;
        }
      },
      { threshold: [0, 0.1, 0.15, 0.25, 0.35, 0.5, 0.75, 1] }
    );
    io.observe(el);
    return () => {
      enteredRef.current = false;
      io.disconnect();
    };
  }, [enabled]);

  return { pageRef, revealTick };
}
