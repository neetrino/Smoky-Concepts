'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';

/**
 * Tracks `clientWidth` of a scroll container (e.g. for full-viewport horizontal “pages”).
 */
export function useScrollerClientWidth(
  scrollerRef: RefObject<HTMLDivElement | null>,
  resyncKey: string
): number {
  const [widthPx, setWidthPx] = useState(0);

  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) {
      return;
    }
    const measure = () => {
      setWidthPx(el.clientWidth);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, [resyncKey, scrollerRef]);

  return widthPx;
}
