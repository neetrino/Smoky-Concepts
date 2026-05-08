'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { ProductsCatalogCard } from '../../app/products/components/ProductsCatalogCard';
import {
  getCategoryLabel,
  getSectionLabel,
  getSizeLabel,
  toCatalogProduct,
  type CatalogProduct,
} from '../../app/products/components/catalogProductLabels';
import { HomeSectionTitle } from './HomeSectionTitle';
import { HomeActionButton } from './HomeActionButton';
import { HOME_ASSET_PATHS } from './homePage.data';
import { useTranslation } from '@/lib/i18n-client';

const ITEMS_PER_PAGE = 3;
/** Desktop card width — matches products catalog `xl:w-[13rem]`. */
const CARD_WIDTH_REM = 13;
const CARD_GAP_REM = 0.75;
/** Tight cluster width: 3 cards + 2 gaps (one focal page's product row). */
const CLUSTER_INNER_REM = CARD_WIDTH_REM * 3 + CARD_GAP_REM * 2;
/** Each track slot reserves a bit more than the cluster so adjacent (faded) clusters breathe. */
const PAGE_FRAME_REM = CLUSTER_INNER_REM + 4;
const TRACK_TRANSITION_MS = 520;
const TRACK_EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

const TRENDING_FEATURED_PAGE_SIZE = 100;
const PLACEHOLDER_IMAGE = HOME_ASSET_PATHS.packMark;

interface ApiProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  images?: string[];
  inStock?: boolean;
  categories?: Array<{ id: string; slug: string; title: string }>;
  brand?: { id: string; name: string } | null;
  skus?: string[];
  colors?: string[];
  originalPrice?: number | null;
  defaultVariantId?: string | null;
  defaultVariantStock?: number;
  defaultSku?: string;
}

interface ProductsResponse {
  data: ApiProduct[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

function mapApiProductToCatalogProduct(product: ApiProduct): CatalogProduct {
  const base = toCatalogProduct({
    id: product.id,
    slug: product.slug,
    title: product.title,
    price: product.price ?? 0,
    image: product.image,
    images: product.images,
    inStock: product.inStock,
    originalPrice: product.originalPrice ?? null,
    defaultVariantId: product.defaultVariantId ?? null,
    defaultVariantStock: product.defaultVariantStock ?? 0,
    defaultSku: product.defaultSku ?? '',
    categories: product.categories,
    skus: product.skus,
    colors: product.colors,
  });
  if (!base.image && (base.images?.length ?? 0) === 0) {
    return { ...base, image: PLACEHOLDER_IMAGE };
  }
  return base;
}

/** Group items by category label so same-category items become one page. */
function groupCatalogByCategory(products: CatalogProduct[]): CatalogProduct[] {
  const byCategory = new Map<string, CatalogProduct[]>();
  for (const product of products) {
    const section = getSectionLabel(product);
    const key = getCategoryLabel(product, section) || 'Other';
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(product);
  }
  const result: CatalogProduct[] = [];
  byCategory.forEach((group) => result.push(...group));
  return result;
}

interface TrendingPage {
  key: string;
  items: CatalogProduct[];
  categoryLabel: string;
}

/** Slice catalog into 3-card pages; pad short tail by wrapping so each page always has 3 cards. */
function buildTrendingPages(items: CatalogProduct[]): TrendingPage[] {
  if (items.length === 0) return [];
  const pages: TrendingPage[] = [];
  for (let i = 0; i < items.length; i += ITEMS_PER_PAGE) {
    const slice = items.slice(i, i + ITEMS_PER_PAGE);
    while (slice.length < ITEMS_PER_PAGE) {
      slice.push(items[slice.length % items.length]);
    }
    const anchor = slice[1] ?? slice[0];
    const section = anchor ? getSectionLabel(anchor) : '';
    const rawLabel = anchor ? getCategoryLabel(anchor, section) : '';
    const categoryLabel = rawLabel && rawLabel !== 'Featured' ? rawLabel : section || 'Featured';
    pages.push({ key: `trending-page-${i}`, items: slice, categoryLabel });
  }
  return pages;
}

/**
 * Trending section that displays featured (favorite) products from API.
 * Desktop view is a Figma-style coverflow: previous category cluster on the left
 * (faded), focal cluster centered, next cluster on the right — all sliding together
 * when arrows are pressed.
 */
export function TrendingFeaturedSection() {
  const { t } = useTranslation();
  const [items, setItems] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [suppressTransition, setSuppressTransition] = useState(false);

  const pages = useMemo(() => buildTrendingPages(items), [items]);
  const totalPages = pages.length;
  const hasMultiplePages = totalPages > 1;
  const safeCurrent = totalPages > 0 ? Math.min(currentPage, totalPages - 1) : 0;

  const prevIdx = totalPages > 0 ? (safeCurrent - 1 + totalPages) % totalPages : 0;
  const nextIdx = totalPages > 0 ? (safeCurrent + 1) % totalPages : 0;
  const currentLabel = pages[safeCurrent]?.categoryLabel ?? '—';
  const prevLabel = totalPages > 1 ? pages[prevIdx]?.categoryLabel ?? '' : '';
  const nextLabel = totalPages > 1 ? pages[nextIdx]?.categoryLabel ?? '' : '';

  const fetchFeatured = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const aggregatedItems: ApiProduct[] = [];
      let pageCursor = 1;
      let totalApiPages = 1;

      do {
        const response = await apiClient.get<ProductsResponse>('/api/v1/products', {
          params: {
            filter: 'featured',
            limit: String(TRENDING_FEATURED_PAGE_SIZE),
            page: String(pageCursor),
          },
        });
        const pageItems = Array.isArray(response?.data) ? response.data : [];
        aggregatedItems.push(...pageItems);
        totalApiPages = Math.max(1, response?.meta?.totalPages ?? 1);
        pageCursor += 1;
      } while (pageCursor <= totalApiPages);

      const seenIds = new Set<string>();
      const mapped: CatalogProduct[] = aggregatedItems
        .filter((p) => {
          const id = p.id?.trim() ?? '';
          if (!id || seenIds.has(id)) return false;
          seenIds.add(id);
          return true;
        })
        .map((p) => {
          const mappedProduct = mapApiProductToCatalogProduct(p);
          if (!mappedProduct.image && !mappedProduct.images?.length) {
            return { ...mappedProduct, image: PLACEHOLDER_IMAGE };
          }
          return mappedProduct;
        });
      setItems(groupCatalogByCategory(mapped));
    } catch (err) {
      console.error('TrendingFeaturedSection: failed to load featured products', err);
      setError('load_error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);

  useEffect(() => {
    setCurrentPage(0);
  }, [items.length]);

  /** Wrap-around uses a 1-frame transition suppression so the visual "snap" isn't a long animated rewind. */
  const transitionToPage = useCallback((nextPageValue: number, isWrap: boolean) => {
    if (isWrap) {
      setSuppressTransition(true);
      setCurrentPage(nextPageValue);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setSuppressTransition(false));
      });
      return;
    }
    setCurrentPage(nextPageValue);
  }, []);

  const goPrev = useCallback(() => {
    if (!hasMultiplePages) return;
    const willWrap = safeCurrent === 0;
    transitionToPage(willWrap ? totalPages - 1 : safeCurrent - 1, willWrap);
  }, [hasMultiplePages, safeCurrent, totalPages, transitionToPage]);

  const goNext = useCallback(() => {
    if (!hasMultiplePages) return;
    const willWrap = safeCurrent >= totalPages - 1;
    transitionToPage(willWrap ? 0 : safeCurrent + 1, willWrap);
  }, [hasMultiplePages, safeCurrent, totalPages, transitionToPage]);

  if (error) {
    return (
      <section className="flex flex-col gap-8">
        <HomeSectionTitle title={t('home.homepage.trending.title')} centered={false} />
        <div className="flex items-center justify-center gap-4 py-8">
          <p className="text-[#414141]">
            {error === 'load_error' ? t('home.homepage.trending.loadError') : error}
          </p>
          <button
            type="button"
            onClick={fetchFeatured}
            className="rounded-lg border-2 border-[#122a26] px-4 py-2 text-sm font-medium text-[#122a26] hover:bg-[#122a26]/5"
          >
            {t('home.homepage.common.retry')}
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="flex flex-col gap-8 overflow-x-hidden">
        <div className="flex items-center justify-between gap-6">
          <HomeSectionTitle title={t('home.homepage.trending.title')} centered={false} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-80 w-full animate-pulse rounded-3xl bg-white/60" />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="flex flex-col gap-8">
        <div className="flex items-center justify-between gap-6">
          <HomeSectionTitle title={t('home.homepage.trending.title')} centered={false} />
          <HomeActionButton
            href="/products"
            label={t('home.homepage.trending.buyCta')}
            variant="outline"
            className="hidden sm:inline-flex"
          />
        </div>
        <p className="py-6 text-center text-[#9d9d9d]">{t('home.homepage.trending.noFeatured')}</p>
      </section>
    );
  }

  const mobileItems = pages[safeCurrent]?.items ?? [];

  return (
    <section className="relative isolate flex min-w-0 flex-col gap-8 overflow-x-clip overflow-y-visible pb-6 xl:left-1/2 xl:w-screen xl:max-w-none xl:-translate-x-1/2">
      <div className="flex min-h-[4rem] min-w-0 items-center justify-between gap-3 xl:relative xl:z-20 xl:-translate-y-4 xl:justify-center">
        <HomeSectionTitle
          title={t('home.homepage.trending.title')}
          centered={false}
          className="gap-0 xl:items-center xl:text-center"
          titleClassName="xl:whitespace-nowrap"
        />
        <HomeActionButton
          href="/products"
          label={t('home.homepage.trending.shopCta')}
          variant="outline"
          className="!w-fit !min-h-8 !-translate-y-3 !rounded-[0.5rem] !border-[2.5px] !border-[#dcc090] !px-2.5 !py-2 !text-[0.75rem] !font-black !uppercase !leading-tight !tracking-[0.07em] sm:!w-auto sm:!min-h-9 sm:!-translate-y-4 sm:!rounded-[0.5rem] sm:!border-[2.5px] sm:!border-[#dcc090] sm:!px-5 sm:!py-0 sm:!text-[0.75rem] sm:!font-black sm:!leading-tight sm:!tracking-[0.14em] xl:absolute xl:right-[7.5rem] xl:z-30 xl:!-translate-y-2"
        />
      </div>

      <div className="grid w-full min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start justify-items-center gap-x-4 gap-y-3 sm:gap-x-5 sm:gap-y-4 xl:hidden">
        {mobileItems.map((product, index) => {
          const isMiddleOfThree = mobileItems.length === 3 && index === 1;
          const isSideCard = index !== 1;
          const section = getSectionLabel(product);
          const mobileCellZ =
            index === 1 ? 'relative z-[3]' : index === 0 ? 'relative z-[2]' : 'relative z-[1]';
          return (
            <div
              key={`trending-mobile-${product.id}-${index}`}
              className={`${mobileCellZ} ${
                index === 1 ? 'pt-[14rem]' : index === 2 ? '-mt-[10rem] pt-4' : 'pt-4'
              }`}
            >
              <ProductsCatalogCard
                product={product}
                sectionLabel={section}
                sizeLabel={getSizeLabel(product)}
                categoryLabel={getCategoryLabel(product, section)}
                className={isSideCard ? '!h-auto w-full max-w-[10.25rem]' : '!h-auto w-full max-w-[11rem]'}
                tightenDetailsUnderImage
                imageScaleBoost={0.15}
                imageNudgeDown={isMiddleOfThree}
                compactLayout
                suppressShadow
                eagerProductImage
                imageFrameClassName="max-sm:origin-bottom max-sm:scale-[0.9] max-sm:-translate-y-2"
              />
            </div>
          );
        })}
      </div>

      <DesktopCoverflowTrack
        pages={pages}
        currentIndex={safeCurrent}
        suppressTransition={suppressTransition}
      />

      <TrendingPageSlider
        prevLabel={prevLabel}
        currentLabel={currentLabel}
        nextLabel={nextLabel}
        onPrev={goPrev}
        onNext={goNext}
        disabled={!hasMultiplePages}
        prevAria={t('home.homepage.trending.previousAria')}
        nextAria={t('home.homepage.trending.nextAria')}
      />
    </section>
  );
}

interface DesktopCoverflowTrackProps {
  pages: TrendingPage[];
  currentIndex: number;
  suppressTransition: boolean;
}

/** Single horizontal track containing all category clusters; only neighbours of the focal cluster fade in. */
function DesktopCoverflowTrack({ pages, currentIndex, suppressTransition }: DesktopCoverflowTrackProps) {
  const totalPages = pages.length;
  if (totalPages === 0) return null;

  const trackTransition = suppressTransition
    ? 'none'
    : `transform ${TRACK_TRANSITION_MS}ms ${TRACK_EASING}`;
  const slotTransition = suppressTransition
    ? 'none'
    : `opacity ${TRACK_TRANSITION_MS}ms ${TRACK_EASING}, transform ${TRACK_TRANSITION_MS}ms ${TRACK_EASING}`;

  return (
    <div className="relative z-0 mt-2 hidden min-w-0 overflow-x-hidden xl:block xl:w-full">
      <div
        className="flex items-end will-change-transform"
        style={{
          width: `${totalPages * PAGE_FRAME_REM}rem`,
          // marginLeft: 50% pins track's left edge to parent's horizontal center;
          // translateX then shifts so the focal cluster's center sits at parent center.
          marginLeft: '50%',
          transform: `translateX(-${(currentIndex + 0.5) * PAGE_FRAME_REM}rem)`,
          transition: trackTransition,
        }}
      >
        {pages.map((page, idx) => {
          const rawDistance = Math.abs(idx - currentIndex);
          const distance = totalPages > 0
            ? Math.min(rawDistance, totalPages - rawDistance)
            : 0;
          const isFocal = distance === 0;
          const isAdjacent = distance === 1;
          const opacity = isFocal ? 1 : isAdjacent ? 0.5 : 0;
          const scale = isFocal ? 1 : 0.84;

          return (
            <div
              key={page.key}
              aria-hidden={!isFocal}
              className="shrink-0"
              style={{
                width: `${PAGE_FRAME_REM}rem`,
                opacity,
                transform: `scale(${scale})`,
                transformOrigin: 'center bottom',
                transition: slotTransition,
                pointerEvents: isFocal ? 'auto' : 'none',
              }}
            >
              <DesktopPageCluster
                items={page.items}
                eager={isFocal || isAdjacent}
                label={page.categoryLabel}
                isFocal={isFocal}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DesktopPageClusterProps {
  items: CatalogProduct[];
  eager: boolean;
  label: string;
  isFocal: boolean;
}

function DesktopPageCluster({ items, eager, label, isFocal }: DesktopPageClusterProps) {
  const displayLabel = label && label !== 'Featured' ? label : '—';
  return (
    <div
      className={`mx-auto flex flex-col items-center transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isFocal ? 'translate-y-8' : 'translate-y-0'
      }`}
      style={{ width: `${CLUSTER_INNER_REM}rem` }}
    >
      <div className="flex w-full items-end justify-center gap-3">
        {items.map((product, index) => {
          const isMiddle = index === 1;
          const section = getSectionLabel(product);
          return (
            <div
              key={`${product.id}-${index}`}
              className={`w-[13rem] shrink-0 ${isMiddle ? 'pt-28' : 'pt-20'}`}
            >
              <ProductsCatalogCard
                product={product}
                sectionLabel={section}
                sizeLabel={getSizeLabel(product)}
                categoryLabel={getCategoryLabel(product, section)}
                className="w-[13rem]"
                imageNudgeDown={isMiddle}
                compactLayout
                suppressShadow
                eagerProductImage={eager}
              />
            </div>
          );
        })}
      </div>
      <span
        className={`mt-6 max-w-full truncate leading-none text-[#122a26] ${
          isFocal ? 'text-[2rem] font-black' : 'text-[1.5rem] font-extrabold'
        }`}
      >
        {displayLabel}
      </span>
    </div>
  );
}

interface TrendingPageSliderProps {
  prevLabel: string;
  currentLabel: string;
  nextLabel: string;
  onPrev: () => void;
  onNext: () => void;
  disabled: boolean;
  prevAria: string;
  nextAria: string;
}

/** Bottom slider tab: prev | current (large) | next, flanked by chevron arrows. Mirrors Figma. */
function TrendingPageSlider({
  prevLabel,
  currentLabel,
  nextLabel,
  onPrev,
  onNext,
  disabled,
  prevAria,
  nextAria,
}: TrendingPageSliderProps) {
  const sideLabelBase =
    'truncate text-base font-extrabold leading-none text-[#122a26]/50 sm:text-xl xl:text-[1.5rem]';

  return (
    <div className="relative z-20 mx-auto grid w-full max-w-[34rem] grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 sm:max-w-[44rem] sm:gap-5 xl:flex xl:max-w-none xl:justify-center xl:gap-72">
      <button
        type="button"
        onClick={onPrev}
        disabled={disabled}
        className="col-start-1 row-start-1 flex h-10 w-10 items-center justify-center justify-self-start text-[#122a26] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 xl:-translate-y-6"
        aria-label={prevAria}
      >
        <ChevronLeft className="h-8 w-8" strokeWidth={2.5} />
      </button>
      {/* Mobile-only label strip: on xl labels live under each cluster inside the coverflow. */}
      <div className="col-start-2 row-start-1 flex w-full items-end justify-around gap-3 sm:gap-6 xl:hidden">
        <span className={sideLabelBase}>{prevLabel}</span>
        <span
          key={currentLabel}
          className="trending-current-label truncate text-2xl font-black leading-none text-[#122a26] sm:text-[1.75rem]"
          style={{
            animation: `trending-label-pop ${TRACK_TRANSITION_MS}ms ${TRACK_EASING}`,
          }}
        >
          {currentLabel && currentLabel !== 'Featured' ? currentLabel : '—'}
        </span>
        <span className={sideLabelBase}>{nextLabel}</span>
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="col-start-3 row-start-1 flex h-10 w-10 items-center justify-center justify-self-end text-[#122a26] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40 xl:-translate-y-6"
        aria-label={nextAria}
      >
        <ChevronRight className="h-8 w-8" strokeWidth={2.5} />
      </button>
    </div>
  );
}
