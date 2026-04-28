'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/** Pixel tolerance when comparing scroll position to edges. */
const SCROLL_EDGE_THRESHOLD_PX = 4;

function readScrollEdges(el: HTMLDivElement): { canLeft: boolean; canRight: boolean; overflow: boolean } {
  const { scrollLeft, scrollWidth, clientWidth } = el;
  const overflow = scrollWidth > clientWidth + SCROLL_EDGE_THRESHOLD_PX;
  const canLeft = scrollLeft > SCROLL_EDGE_THRESHOLD_PX;
  const canRight = scrollLeft < scrollWidth - clientWidth - SCROLL_EDGE_THRESHOLD_PX;
  return { canLeft, canRight, overflow };
}

/**
 * Paged horizontal scroll for size catalog: one viewport width per arrow press (both rows move together).
 */
export function useSizeCatalogHorizontalScroll(resyncToken: string | number) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const syncScrollEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }
    const { canLeft, canRight, overflow } = readScrollEdges(el);
    setCanScrollLeft(canLeft);
    setCanScrollRight(canRight);
    setHasOverflow(overflow);
  }, []);

  useEffect(() => {
    syncScrollEdges();
  }, [resyncToken, syncScrollEdges]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }
    const ro = new ResizeObserver(syncScrollEdges);
    ro.observe(el);
    el.addEventListener('scroll', syncScrollEdges, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener('scroll', syncScrollEdges);
    };
  }, [syncScrollEdges]);

  const scrollByDirection = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }
    el.scrollBy({ left: dir * el.clientWidth, behavior: 'smooth' });
  }, []);

  return { scrollerRef, hasOverflow, canScrollLeft, canScrollRight, scrollByDirection };
}
