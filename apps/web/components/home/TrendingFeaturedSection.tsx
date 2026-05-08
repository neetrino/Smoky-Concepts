'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import {
  buildTrendingPageStartIndices,
  TRENDING_ITEMS_PER_PAGE,
  TRENDING_PAGE_SHIFT_REM,
  TRENDING_VIEWPORT_WIDTH_REM,
} from './trendingFeaturedCarousel';
import { useTrendingTripletSlide } from './useTrendingTripletSlide';

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

const TRENDING_FEATURED_PAGE_SIZE = 100;
const PLACEHOLDER_IMAGE = HOME_ASSET_PATHS.packMark;

function getTrendingTripletForPage(
  pageIndex: number,
  catalogItems: CatalogProduct[],
  pageStartIndices: number[]
): CatalogProduct[] {
  const n = catalogItems.length;
  if (n <= TRENDING_ITEMS_PER_PAGE) return catalogItems;
  const start = pageStartIndices[pageIndex] ?? 0;
  return [
    catalogItems[start],
    catalogItems[(start + 1) % n],
    catalogItems[(start + 2) % n],
  ].filter(Boolean);
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

/** Group items by category label so same-category items are side-by-side. */
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

/**
 * Trending section that displays featured (favorite) products from API with the same card as the products catalog.
 */
export function TrendingFeaturedSection() {
  const { t } = useTranslation();
  const leftPreviewRef = useRef<HTMLDivElement | null>(null);
  const rightPreviewRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const pageStartIndices = buildTrendingPageStartIndices(items.length, TRENDING_ITEMS_PER_PAGE);
  const maxPage = Math.max(0, pageStartIndices.length - 1);
  const startIndex = pageStartIndices[currentPage] ?? 0;
  const n = items.length;
  const visibleItems =
    n <= TRENDING_ITEMS_PER_PAGE
      ? items
      : [items[startIndex], items[(startIndex + 1) % n], items[(startIndex + 2) % n]].filter(Boolean);
  const hasMultiplePages = maxPage > 0;
  const visibleIndices = new Set(
    n > 0 ? [startIndex, (startIndex + 1) % n, (startIndex + 2) % n] : []
  );
  const prevIndices =
    n === 0
      ? []
      : [(startIndex - 3 + n) % n, (startIndex - 2 + n) % n, (startIndex - 1 + n) % n]
          .filter((i, index, all) => !visibleIndices.has(i) && all.indexOf(i) === index);
  const nextIndices =
    n === 0
      ? []
      : [
          (startIndex + TRENDING_ITEMS_PER_PAGE) % n,
          (startIndex + TRENDING_ITEMS_PER_PAGE + 1) % n,
          (startIndex + TRENDING_ITEMS_PER_PAGE + 2) % n,
        ].filter((i, index, all) => !visibleIndices.has(i) && all.indexOf(i) === index);
  const previousPreviewItems = prevIndices.map((i) => items[i]).filter(Boolean);
  const nextPreviewItems = nextIndices.map((i) => items[i]).filter(Boolean);

  /**
   * Spin / orbit animation for the side preview groups.
   * Focal (high-opacity) cards in the central viewport stay pristine — only the
   * faded preview clusters on either side rotate around the carousel's center,
   * which produces the perceived "spin" without disturbing the main row.
   */
  const playCircularTransition = useCallback((direction: 'prev' | 'next') => {
    const left = leftPreviewRef.current;
    const right = rightPreviewRef.current;
    const supportsAnimate = (el: HTMLDivElement | null): el is HTMLDivElement =>
      Boolean(el && typeof el.animate === 'function');

    if (!supportsAnimate(left) && !supportsAnimate(right)) return;

    const sign = direction === 'next' ? 1 : -1;
    const easing = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const duration = 560;

    if (supportsAnimate(left)) {
      left.animate(
        [
          { transform: 'translate3d(0, 0, 0) rotateY(0deg) scale(1)', opacity: 1, offset: 0 },
          {
            transform: `translate3d(${sign * 36}px, -8px, 0) rotateY(${sign * -14}deg) scale(0.94)`,
            opacity: 0.25,
            offset: 0.45,
          },
          { transform: 'translate3d(0, 0, 0) rotateY(0deg) scale(1)', opacity: 1, offset: 1 },
        ],
        { duration, easing, fill: 'none' }
      );
    }

    if (supportsAnimate(right)) {
      right.animate(
        [
          { transform: 'translate3d(0, 0, 0) rotateY(0deg) scale(1)', opacity: 1, offset: 0 },
          {
            transform: `translate3d(${sign * 36}px, -8px, 0) rotateY(${sign * -14}deg) scale(0.94)`,
            opacity: 0.25,
            offset: 0.45,
          },
          { transform: 'translate3d(0, 0, 0) rotateY(0deg) scale(1)', opacity: 1, offset: 1 },
        ],
        { duration, easing, fill: 'none' }
      );
    }
  }, []);

  const {
    slideAnim,
    desktopSlideTrackRef,
    mobileSlideTrackRef,
    startSlide,
    onSlideTransitionEnd,
    resetSlideState,
  } = useTrendingTripletSlide(currentPage, setCurrentPage, maxPage, hasMultiplePages, playCircularTransition);

  const fetchFeatured = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const aggregatedItems: ApiProduct[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const response = await apiClient.get<ProductsResponse>('/api/v1/products', {
          params: {
            filter: 'featured',
            limit: String(TRENDING_FEATURED_PAGE_SIZE),
            page: String(currentPage),
          },
        });

        const pageItems = Array.isArray(response?.data) ? response.data : [];
        aggregatedItems.push(...pageItems);
        totalPages = Math.max(1, response?.meta?.totalPages ?? 1);
        currentPage += 1;
      } while (currentPage <= totalPages);

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
    resetSlideState();
  }, [items.length, resetSlideState]);

  const firstVisible = visibleItems[0];
  const firstSection = firstVisible ? getSectionLabel(firstVisible) : '';
  const footerCategoryLabel = firstVisible ? getCategoryLabel(firstVisible, firstSection) : '';
  const leftPreviewAnchor = previousPreviewItems[1] ?? previousPreviewItems[0];
  const leftPreviewSection = leftPreviewAnchor ? getSectionLabel(leftPreviewAnchor) : '';
  const leftPreviewCategoryLabel = leftPreviewAnchor
    ? getCategoryLabel(leftPreviewAnchor, leftPreviewSection)
    : '';
  const rightPreviewAnchor = nextPreviewItems[1] ?? nextPreviewItems[0];
  const rightPreviewSection = rightPreviewAnchor ? getSectionLabel(rightPreviewAnchor) : '';
  const rightPreviewCategoryLabel = rightPreviewAnchor
    ? getCategoryLabel(rightPreviewAnchor, rightPreviewSection)
    : '';

  if (error) {
    return (
      <section className="flex flex-col gap-8">
        <HomeSectionTitle title={t('home.homepage.trending.title')} centered={false} />
        <div className="flex items-center justify-center gap-4 py-8">
          <p className="text-[#414141]">{error === 'load_error' ? t('home.homepage.trending.loadError') : error}</p>
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
            <div
              key={i}
              className="h-80 w-full animate-pulse rounded-3xl bg-white/60"
            />
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
          <HomeActionButton href="/products" label={t('home.homepage.trending.buyCta')} variant="outline" className="hidden sm:inline-flex" />
        </div>
        <p className="py-6 text-center text-[#9d9d9d]">{t('home.homepage.trending.noFeatured')}</p>
      </section>
    );
  }

  const isSlideRunning = slideAnim.phase === 'running';
  const slideKeySalt =
    slideAnim.phase === 'running' ? `${slideAnim.fromPage}-${slideAnim.toPage}` : `${currentPage}`;
  const desktopSlideProducts: CatalogProduct[] =
    slideAnim.phase === 'running'
      ? slideAnim.dir === 'next'
        ? [
            ...getTrendingTripletForPage(slideAnim.fromPage, items, pageStartIndices),
            ...getTrendingTripletForPage(slideAnim.toPage, items, pageStartIndices),
          ]
        : [
            ...getTrendingTripletForPage(slideAnim.toPage, items, pageStartIndices),
            ...getTrendingTripletForPage(slideAnim.fromPage, items, pageStartIndices),
          ]
      : visibleItems;

  const navDisabled = !hasMultiplePages || isSlideRunning;

  return (
    <section className="relative isolate z-10 flex min-w-0 flex-col gap-8 overflow-x-clip overflow-y-visible pb-6 xl:left-1/2 xl:w-screen xl:max-w-none xl:-translate-x-1/2">
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

      <div className="relative z-50 w-full min-w-0 overflow-x-clip xl:hidden">
        <div
          ref={mobileSlideTrackRef}
          onTransitionEnd={onSlideTransitionEnd}
          className={
            isSlideRunning
              ? 'flex w-[200%] touch-pan-y items-end will-change-transform'
              : 'flex w-full touch-pan-y items-end justify-center gap-3 will-change-transform'
          }
        >
          {slideAnim.phase === 'running' ? (
            <>
              <div className="flex w-1/2 items-end justify-center gap-2 sm:gap-3">
                {(slideAnim.dir === 'next'
                  ? getTrendingTripletForPage(slideAnim.fromPage, items, pageStartIndices)
                  : getTrendingTripletForPage(slideAnim.toPage, items, pageStartIndices)
                ).map((product, slotIndex) => {
                  const isMiddle = slotIndex === 1;
                  const section = getSectionLabel(product);
                  return (
                    <div
                      key={`trending-mob-a-${product.id}-${slotIndex}-${slideKeySalt}`}
                      className={`relative z-10 shrink-0 ${isMiddle ? 'z-20 pt-6' : 'z-10 pt-4'}`}
                    >
                      <ProductsCatalogCard
                        product={product}
                        sectionLabel={section}
                        sizeLabel={getSizeLabel(product)}
                        categoryLabel={getCategoryLabel(product, section)}
                        className={isMiddle ? '!h-auto w-[11rem] max-w-[11rem]' : '!h-auto w-[10.25rem] max-w-[10.25rem]'}
                        tightenDetailsUnderImage
                        imageScaleBoost={0.15}
                        imageNudgeDown={isMiddle}
                        compactLayout
                        suppressShadow
                        eagerProductImage
                        imageFrameClassName="max-sm:origin-bottom max-sm:scale-[0.9] max-sm:-translate-y-2"
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex w-1/2 items-end justify-center gap-2 sm:gap-3">
                {(slideAnim.dir === 'next'
                  ? getTrendingTripletForPage(slideAnim.toPage, items, pageStartIndices)
                  : getTrendingTripletForPage(slideAnim.fromPage, items, pageStartIndices)
                ).map((product, slotIndex) => {
                  const isMiddle = slotIndex === 1;
                  const section = getSectionLabel(product);
                  return (
                    <div
                      key={`trending-mob-b-${product.id}-${slotIndex}-${slideKeySalt}`}
                      className={`relative z-10 shrink-0 ${isMiddle ? 'z-20 pt-6' : 'z-10 pt-4'}`}
                    >
                      <ProductsCatalogCard
                        product={product}
                        sectionLabel={section}
                        sizeLabel={getSizeLabel(product)}
                        categoryLabel={getCategoryLabel(product, section)}
                        className={isMiddle ? '!h-auto w-[11rem] max-w-[11rem]' : '!h-auto w-[10.25rem] max-w-[10.25rem]'}
                        tightenDetailsUnderImage
                        imageScaleBoost={0.15}
                        imageNudgeDown={isMiddle}
                        compactLayout
                        suppressShadow
                        eagerProductImage
                        imageFrameClassName="max-sm:origin-bottom max-sm:scale-[0.9] max-sm:-translate-y-2"
                      />
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            visibleItems.map((product, slotIndex) => {
              const isMiddle = visibleItems.length === 3 && slotIndex === 1;
              const isSideCard = !isMiddle;
              const section = getSectionLabel(product);
              return (
                <div
                  key={`trending-mobile-idle-${product.id}-${slotIndex}-${slideKeySalt}`}
                  className={`relative shrink-0 ${isMiddle ? 'z-20 pt-6' : 'z-10 pt-4'}`}
                >
                  <ProductsCatalogCard
                    product={product}
                    sectionLabel={section}
                    sizeLabel={getSizeLabel(product)}
                    categoryLabel={getCategoryLabel(product, section)}
                    className={isSideCard ? '!h-auto w-[10.25rem] max-w-[10.25rem]' : '!h-auto w-[11rem] max-w-[11rem]'}
                    tightenDetailsUnderImage
                    imageScaleBoost={0.15}
                    imageNudgeDown={isMiddle}
                    compactLayout
                    suppressShadow
                    eagerProductImage
                    imageFrameClassName="max-sm:origin-bottom max-sm:scale-[0.9] max-sm:-translate-y-2"
                  />
                </div>
              );
            })
          )}
        </div>
      </div>

      <div
        className="relative z-40 mt-2 hidden min-w-0 xl:block xl:w-full"
        style={{ perspective: '1800px', transformStyle: 'preserve-3d' }}
      >
        <div className="pointer-events-none absolute left-1/2 top-0 z-30 -translate-x-[calc(150%+11.75rem)]">
          <div
            ref={leftPreviewRef}
            className="will-change-transform"
            style={{ transformOrigin: '100% 50%', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
          >
            <div className="flex items-end gap-3">
              {previousPreviewItems.map((product, index) => {
                const section = getSectionLabel(product);
                return (
                  <div key={`trending-prev-${product.id}-${index}`} className="pointer-events-auto w-[11.25rem] opacity-50 -mt-6">
                    <ProductsCatalogCard
                      product={product}
                      sectionLabel={section}
                      sizeLabel={getSizeLabel(product)}
                      categoryLabel={getCategoryLabel(product, section)}
                      className="w-[11.25rem]"
                      imageScaleBoost={index === 1 ? -0.07 : 0.02}
                      compactLayout
                      suppressShadow
                      eagerProductImage
                    />
                  </div>
                );
              })}
            </div>
            <p className="mt-5 whitespace-nowrap text-center text-[1.5rem] font-extrabold leading-none text-[#122a26]/60">
              {leftPreviewCategoryLabel && leftPreviewCategoryLabel !== 'Featured'
                ? leftPreviewCategoryLabel
                : '—'}
            </p>
          </div>
        </div>

        <div
          className="relative z-50 -mt-24 mx-auto shrink-0 overflow-x-clip"
          style={{ width: `${TRENDING_VIEWPORT_WIDTH_REM}rem` }}
        >
          <div
            ref={desktopSlideTrackRef}
            onTransitionEnd={onSlideTransitionEnd}
            className="flex touch-pan-y items-end justify-start gap-3 will-change-transform"
            style={isSlideRunning ? { width: `${TRENDING_PAGE_SHIFT_REM * 2}rem` } : undefined}
          >
            {desktopSlideProducts.map((product, slotIndex) => {
              const isMiddle = slotIndex % 3 === 1;
              const section = getSectionLabel(product);
              return (
                <div
                  key={`trending-dsk-${product.id}-${slotIndex}-${slideKeySalt}`}
                  className={`relative z-10 w-[13rem] shrink-0 ${isMiddle ? 'z-20 pt-28' : 'z-10 pt-20'}`}
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
                    eagerProductImage
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="pointer-events-none absolute right-1/2 top-0 z-30 translate-x-[calc(150%+11.75rem)]">
          <div
            ref={rightPreviewRef}
            className="will-change-transform"
            style={{ transformOrigin: '0% 50%', transformStyle: 'preserve-3d', backfaceVisibility: 'hidden' }}
          >
            <div className="flex items-end gap-3">
              {nextPreviewItems.map((product, index) => {
                const section = getSectionLabel(product);
                return (
                  <div key={`trending-next-${product.id}-${index}`} className="pointer-events-auto w-[11.25rem] opacity-50 -mt-6">
                    <ProductsCatalogCard
                      product={product}
                      sectionLabel={section}
                      sizeLabel={getSizeLabel(product)}
                      categoryLabel={getCategoryLabel(product, section)}
                      className="w-[11.25rem]"
                      imageScaleBoost={index === 1 ? -0.07 : 0.02}
                      compactLayout
                      suppressShadow
                      eagerProductImage
                    />
                  </div>
                );
              })}
            </div>
            <p className="mt-5 whitespace-nowrap text-center text-[1.5rem] font-extrabold leading-none text-[#122a26]/60">
              {rightPreviewCategoryLabel && rightPreviewCategoryLabel !== 'Featured'
                ? rightPreviewCategoryLabel
                : '—'}
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-[60] mx-auto grid w-full max-w-[28rem] grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center gap-3 sm:max-w-[34rem] sm:gap-5">
        <button
          type="button"
          onClick={() => startSlide('prev')}
          disabled={navDisabled}
          className="col-start-1 row-start-1 flex h-10 w-10 items-center justify-center justify-self-start text-[#122a26] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t('home.homepage.trending.previousAria')}
        >
          <ChevronLeft className="h-8 w-8" strokeWidth={2.5} />
        </button>
        <p className="col-start-2 row-start-1 w-full truncate px-2 text-center text-xl font-black leading-tight text-[#122a26] sm:text-[1.5rem] sm:font-extrabold">
          {footerCategoryLabel && footerCategoryLabel !== 'Featured'
            ? footerCategoryLabel
            : '—'}
        </p>
        <button
          type="button"
          onClick={() => startSlide('next')}
          disabled={navDisabled}
          className="col-start-3 row-start-1 flex h-10 w-10 items-center justify-center justify-self-end text-[#122a26] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={t('home.homepage.trending.nextAria')}
        >
          <ChevronRight className="h-8 w-8" strokeWidth={2.5} />
        </button>
      </div>
    </section>  
  );
}
