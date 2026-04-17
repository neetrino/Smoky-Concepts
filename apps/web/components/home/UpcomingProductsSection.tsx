'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../../lib/api-client';
import { HomeSectionTitle } from './HomeSectionTitle';
import { HomeActionButton } from './HomeActionButton';
import { ProductsCatalogCard } from '../../app/products/components/ProductsCatalogCard';
import {
  getCategoryLabel,
  getSectionLabel,
  getSizeLabel,
  shouldNudgeCatalogProductImage,
  toCatalogProduct,
} from '../../app/products/components/catalogProductLabels';
import { useTranslation } from '@/lib/i18n-client';

interface ApiProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  images?: string[];
  inStock?: boolean;
  skus?: string[];
  categories?: Array<{ id: string; slug: string; title: string }>;
  brand?: { id: string; name: string } | null;
  originalPrice?: number | null;
  defaultVariantId?: string | null;
  defaultVariantStock?: number;
  defaultSku?: string;
}

interface ProductsResponse {
  data: ApiProduct[];
  meta?: { total: number; page: number; limit: number; totalPages: number };
}

const UPCOMING_LIMIT = 12;
const CARDS_PER_PAGE = 6;

/** Matches `TrendingFeaturedSection` shop CTA sizing and xl placement. */
const UPCOMING_SHOP_BUTTON_CLASS_NAME =
  '!w-fit !min-h-8 !-translate-y-1 !rounded-[0.5rem] !border-[2.5px] !border-[#dcc090] !px-2.5 !py-2 !text-[0.75rem] !font-black !uppercase !leading-none !tracking-[0.07em] sm:!w-auto sm:!min-h-9 sm:!-translate-y-2 sm:!rounded-[0.5rem] sm:!border-[2.5px] sm:!border-[#dcc090] sm:!px-5 sm:!py-0 sm:!text-[0.75rem] sm:!font-black sm:!leading-none sm:!tracking-[0.14em] xl:absolute xl:right-[7.5rem] xl:!-translate-y-3';

function UpcomingSectionHeader() {
  const { t } = useTranslation();
  return (
    <div className="relative flex min-h-[4rem] w-full items-center justify-between gap-3 sm:justify-end">
      <div className="min-w-0 flex-1 sm:absolute sm:left-1/2 sm:top-1/2 sm:w-max sm:max-w-[min(100%,calc(100%-7rem))] sm:-translate-x-1/2 sm:-translate-y-1/2">
        <HomeSectionTitle
          title={t('home.homepage.upcoming.title')}
          centered={false}
          className="items-start text-left sm:items-center sm:text-center [&_h2]:text-left sm:[&_h2]:text-center"
        />
      </div>
      <HomeActionButton
        href="/products"
        label={t('home.homepage.upcoming.shopCta')}
        variant="outline"
        className={UPCOMING_SHOP_BUTTON_CLASS_NAME}
      />
    </div>
  );
}

/**
 * Home page "Upcoming" section: shows products marked as upcoming from the API.
 */
export function UpcomingProductsSection() {
  const { t } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchUpcoming = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<ProductsResponse>('/api/v1/products', {
        params: {
          filter: 'upcoming',
          limit: String(UPCOMING_LIMIT),
          page: '1',
        },
      });
      const list = Array.isArray(response?.data) ? response.data : [];
      setItems(list);
      setCurrentPage(1);
    } catch (err) {
      console.error('UpcomingProductsSection: failed to load upcoming products', err);
      setError('load_error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcoming();
  }, [fetchUpcoming]);

  if (error) {
    return (
      <section className="flex flex-col gap-8">
        <UpcomingSectionHeader />
        <div className="flex items-center justify-center gap-4 py-8">
          <p className="text-[#414141]">{error === 'load_error' ? t('home.homepage.upcoming.loadError') : error}</p>
          <button
            type="button"
            onClick={fetchUpcoming}
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
      <section className="flex flex-col gap-8">
        <UpcomingSectionHeader />
        <div className="grid grid-cols-2 gap-4 pb-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-3xl bg-white/60" />
          ))}
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="flex flex-col gap-8">
        <UpcomingSectionHeader />
        <p className="py-6 text-center text-[#9d9d9d]">{t('home.homepage.upcoming.noUpcoming')}</p>
      </section>
    );
  }

  const totalPages = Math.max(1, Math.ceil(items.length / CARDS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const start = (safePage - 1) * CARDS_PER_PAGE;

  const handlePageChange = (page: number) => {
    const container = scrollContainerRef.current;
    if (!container) {
      setCurrentPage(page);
      return;
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const targetScrollLeft =
      page <= 1 || maxScrollLeft <= 0
        ? 0
        : (maxScrollLeft * (page - 1)) / Math.max(1, totalPages - 1);

    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth',
    });
    setCurrentPage(page);
  };

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || totalPages <= 1) {
      return;
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const nextPage =
      maxScrollLeft <= 0
        ? 1
        : Math.round((container.scrollLeft / maxScrollLeft) * (totalPages - 1)) + 1;

    setCurrentPage((current) => (current === nextPage ? current : nextPage));
  };

  return (
    <section className="relative isolate flex flex-col gap-4 overflow-hidden sm:gap-5 xl:left-1/2 xl:w-screen xl:max-w-none xl:-translate-x-1/2 xl:overflow-x-clip xl:pl-[7.5rem]">
      <UpcomingSectionHeader />
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="scrollbar-hide mt-8 overflow-x-auto pt-[7.5rem] pb-4 sm:mt-12"
      >
        <div className="flex min-w-max items-start gap-6">
          {items.map((item, index) => {
            const catalogProduct = toCatalogProduct({
              id: item.id,
              slug: item.slug,
              title: item.title,
              price: item.price,
              image: item.image,
              images: item.images,
              inStock: item.inStock,
              originalPrice: item.originalPrice ?? null,
              defaultVariantId: item.defaultVariantId ?? null,
              defaultVariantStock: item.defaultVariantStock ?? 0,
              defaultSku: item.defaultSku ?? '',
              categories: item.categories,
              skus: item.skus,
            });
            const section = getSectionLabel(catalogProduct);
            return (
              <ProductsCatalogCard
                key={`upcoming-${index}-${item.id}`}
                product={catalogProduct}
                sectionLabel={section}
                sizeLabel={getSizeLabel(catalogProduct)}
                categoryLabel={getCategoryLabel(catalogProduct, section)}
                imageNudgeDown={shouldNudgeCatalogProductImage(index)}
                imageScaleBoost={0.04}
                className="lg:w-[12.75rem] xl:w-[13rem]"
                compactLayout
              />
            );
          })}
      </div>
      </div>
      {totalPages > 1 && (
        <div
          className="mt-2 flex items-center justify-center gap-4 sm:mt-3"
          role="tablist"
          aria-label={t('home.homepage.upcoming.paginationAria')}
        >
          {Array.from({ length: totalPages }, (_, i) => {
            const page = i + 1;
            const isActive = page === safePage;
            return (
              <button
                key={page}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`${t('home.homepage.upcoming.pageAriaPrefix')} ${page}`}
                onClick={() => handlePageChange(page)}
                className={`h-1.5 w-[100px] rounded-[12px] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#122a26] focus-visible:ring-offset-2 sm:h-2 ${
                  isActive ? 'bg-[#122a26]' : 'bg-[#d9d9d9] hover:bg-[#c9c9c9]'
                }`}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
