'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TRENDING_PAGE_SHIFT_REM, TRENDING_SLOT_TRANSITION_MS } from './trendingFeaturedCarousel';

export type TrendingSlideAnim =
  | { phase: 'idle' }
  | { phase: 'running'; dir: 'next' | 'prev'; fromPage: number; toPage: number };

const XL_MEDIA_QUERY = '(min-width: 1280px)';

function isXlViewport(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(XL_MEDIA_QUERY).matches;
}

/**
 * Horizontal "page" slide: outgoing trio moves off, incoming trio replaces it (desktop: rem shift; mobile: 50% of 200%-wide track).
 */
export function useTrendingTripletSlide(
  currentPage: number,
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
  maxPage: number,
  hasMultiplePages: boolean,
  playCircularTransition: (dir: 'next' | 'prev') => void
) {
  const [slideAnim, setSlideAnim] = useState<TrendingSlideAnim>({ phase: 'idle' });
  const desktopSlideTrackRef = useRef<HTMLDivElement | null>(null);
  const mobileSlideTrackRef = useRef<HTMLDivElement | null>(null);
  const pendingPageRef = useRef<number | null>(null);
  const isSlidingRef = useRef(false);
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      reduceMotionRef.current = mq.matches;
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const resetSlideState = useCallback(() => {
    pendingPageRef.current = null;
    isSlidingRef.current = false;
    setSlideAnim({ phase: 'idle' });
    [desktopSlideTrackRef.current, mobileSlideTrackRef.current].forEach((el) => {
      if (el) {
        el.style.transition = '';
        el.style.transform = '';
      }
    });
  }, []);

  useLayoutEffect(() => {
    if (slideAnim.phase !== 'running') return;
    const xl = isXlViewport();
    const el = xl ? desktopSlideTrackRef.current : mobileSlideTrackRef.current;
    if (!el) return;

    const { dir } = slideAnim;
    el.style.transition = 'none';
    if (xl) {
      el.style.transform = dir === 'next' ? 'translateX(0)' : `translateX(-${TRENDING_PAGE_SHIFT_REM}rem)`;
    } else {
      el.style.transform = dir === 'next' ? 'translateX(0)' : 'translateX(-50%)';
    }
    void el.offsetHeight;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `transform ${TRENDING_SLOT_TRANSITION_MS}ms cubic-bezier(0.33, 1, 0.68, 1)`;
        if (xl) {
          el.style.transform =
            dir === 'next' ? `translateX(-${TRENDING_PAGE_SHIFT_REM}rem)` : 'translateX(0)';
        } else {
          el.style.transform = dir === 'next' ? 'translateX(-50%)' : 'translateX(0)';
        }
      });
    });
  }, [slideAnim]);

  useLayoutEffect(() => {
    if (slideAnim.phase !== 'idle') return;
    [desktopSlideTrackRef.current, mobileSlideTrackRef.current].forEach((node) => {
      if (node) {
        node.style.transition = '';
        node.style.transform = '';
      }
    });
  }, [slideAnim.phase]);

  const onSlideTransitionEnd = useCallback(
    (e: React.TransitionEvent<HTMLDivElement>) => {
      if (e.propertyName !== 'transform' || e.target !== e.currentTarget) return;
      if (pendingPageRef.current === null) return;
      const nextPage = pendingPageRef.current;
      pendingPageRef.current = null;
      isSlidingRef.current = false;
      setCurrentPage(nextPage);
      setSlideAnim({ phase: 'idle' });
    },
    [setCurrentPage]
  );

  const startSlide = useCallback(
    (dir: 'next' | 'prev') => {
      if (!hasMultiplePages || isSlidingRef.current) return;
      const toPage =
        dir === 'next' ? (currentPage >= maxPage ? 0 : currentPage + 1) : currentPage === 0 ? maxPage : currentPage - 1;
      if (toPage === currentPage) return;

      if (reduceMotionRef.current) {
        playCircularTransition(dir);
        setCurrentPage(toPage);
        return;
      }

      isSlidingRef.current = true;
      playCircularTransition(dir);
      pendingPageRef.current = toPage;
      setSlideAnim({ phase: 'running', dir, fromPage: currentPage, toPage });
    },
    [hasMultiplePages, currentPage, maxPage, playCircularTransition, setCurrentPage]
  );

  return {
    slideAnim,
    desktopSlideTrackRef,
    mobileSlideTrackRef,
    startSlide,
    onSlideTransitionEnd,
    resetSlideState,
  };
}
