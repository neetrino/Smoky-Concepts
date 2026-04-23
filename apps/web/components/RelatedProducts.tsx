'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { getStoredLanguage, type LanguageCode } from '../lib/language';
import { t } from '../lib/i18n';
import { useRelatedProducts } from './hooks/useRelatedProducts';
import { ProductsCatalogCard } from '../app/products/components/ProductsCatalogCard';
import {
  CATALOG_SECTION_PAGE_SIZE,
  getCategoryLabel,
  getSectionLabel,
  getSizeLabel,
  shouldNudgeCatalogProductImage,
  toCatalogProduct,
} from '../app/products/components/catalogProductLabels';

interface RelatedProductsProps {
  categorySlug?: string;
  currentProductId: string;
}

/** Same strip as products catalog (non-filtered): horizontal scroll row. */
const CATALOG_ROW_SCROLL_CLASS = 'scrollbar-hide mt-4 overflow-x-auto pt-10 pb-4';
const CATALOG_ROW_FLEX_CLASS = 'flex min-w-max gap-6';

/**
 * Related products on the PDP — same card row spacing as the products catalog page.
 */
export function RelatedProducts({ categorySlug, currentProductId }: RelatedProductsProps) {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [currentPage, setCurrentPage] = useState(0);
  const sectionScrollRef = useRef<HTMLDivElement | null>(null);
  const { products, loading } = useRelatedProducts({ categorySlug, currentProductId, language });

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(products.length / CATALOG_SECTION_PAGE_SIZE)),
    [products.length]
  );

  useEffect(() => {
    setLanguage(getStoredLanguage());

    const handleLanguageUpdate = () => {
      setLanguage(getStoredLanguage());
    };

    window.addEventListener('language-updated', handleLanguageUpdate);
    return () => {
      window.removeEventListener('language-updated', handleLanguageUpdate);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(0);
  }, [products.length, categorySlug, currentProductId]);

  const handleSectionPageChange = (pageIndex: number) => {
    const container = sectionScrollRef.current;
    if (!container) {
      return;
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const targetScrollLeft =
      pageIndex <= 0 || maxScrollLeft <= 0 || totalPages <= 1
        ? 0
        : (maxScrollLeft * pageIndex) / (totalPages - 1);

    container.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth',
    });
    setCurrentPage(pageIndex);
  };

  const handleSectionScroll = () => {
    const container = sectionScrollRef.current;
    if (!container || totalPages <= 1) {
      return;
    }
    const maxScrollLeft = container.scrollWidth - container.clientWidth;
    const nextPage =
      maxScrollLeft <= 0 ? 0 : Math.round((container.scrollLeft / maxScrollLeft) * (totalPages - 1));
    setCurrentPage(nextPage);
  };

  return (
    <section className="mt-20 w-full border-t border-[#e8e8e8] py-12 sm:py-16">
      <h2 className="font-montserrat text-[2.25rem] font-extrabold leading-none text-[#414141] sm:text-[2.5rem]">
        {t(language, 'product.related_products_title')}
      </h2>

      {loading ? (
        <div className={CATALOG_ROW_SCROLL_CLASS}>
          <div className={CATALOG_ROW_FLEX_CLASS}>
            {Array.from({ length: CATALOG_SECTION_PAGE_SIZE }).map((_, i) => (
              <div
                key={i}
                className="h-[23rem] w-[12rem] shrink-0 animate-pulse rounded-[1.125rem] bg-white/80 shadow-[0_4px_22.5px_rgba(0,0,0,0.08)]"
              />
            ))}
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-lg text-[#9d9d9d]">{t(language, 'product.noRelatedProducts')}</p>
        </div>
      ) : (
        <div ref={sectionScrollRef} onScroll={handleSectionScroll} className={CATALOG_ROW_SCROLL_CLASS}>
          <div className={CATALOG_ROW_FLEX_CLASS}>
            {products.map((product, index) => {
              const catalogProduct = toCatalogProduct({
                id: product.id,
                slug: product.slug,
                title: product.title,
                price: product.price,
                image: product.image,
                images: product.images,
                inStock: product.inStock,
                originalPrice: product.originalPrice ?? null,
                defaultVariantId: product.defaultVariantId ?? null,
                defaultVariantStock: product.defaultVariantStock ?? 0,
                defaultSku: product.defaultSku ?? '',
                categories: product.categories ?? [],
                skus: product.skus,
              });
              const section = getSectionLabel(catalogProduct);
              return (
                <ProductsCatalogCard
                  key={product.id}
                  product={catalogProduct}
                  sectionLabel={section}
                  sizeLabel={getSizeLabel(catalogProduct)}
                  categoryLabel={getCategoryLabel(catalogProduct, section)}
                  imageNudgeDown={shouldNudgeCatalogProductImage(index)}
                  compactLayout
                  widerCompactCard
                />
              );
            })}
          </div>
        </div>
      )}

      {!loading && products.length > 0 && totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-4">
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <button
              key={`related-page-${pageIndex}`}
              type="button"
              onClick={() => handleSectionPageChange(pageIndex)}
              className={`h-2 w-[6.25rem] rounded-full transition-colors ${
                currentPage === pageIndex ? 'bg-[#122a26]' : 'bg-[#d9d9d9]'
              }`}
              aria-label={`Open related products page ${pageIndex + 1}`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
