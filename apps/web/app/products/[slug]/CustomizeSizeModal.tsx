'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';

import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';
import { SizeCatalogPickerContent } from './SizeCatalogPickerContent';

function filterSizeCatalogByTitle(
  categories: SizeCatalogCategoryDto[],
  query: string
): SizeCatalogCategoryDto[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return categories;
  }
  return categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => item.title.toLowerCase().includes(q)),
    }))
    .filter((cat) => cat.items.length > 0);
}

interface CustomizeSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  sizeCategories: SizeCatalogCategoryDto[];
  selectedSizeItemId: string | null;
  onSelectSizeCatalogItem: (item: SizeCatalogItemDto) => void;
}

export function CustomizeSizeModal({
  isOpen,
  onClose,
  language,
  sizeCategories,
  selectedSizeItemId,
  onSelectSizeCatalogItem,
}: CustomizeSizeModalProps) {
  const titleId = useId();
  const searchInputId = useId();
  const [sizeSearchQuery, setSizeSearchQuery] = useState('');

  const filteredSizeCategories = useMemo(
    () => filterSizeCatalogByTitle(sizeCategories, sizeSearchQuery),
    [sizeCategories, sizeSearchQuery]
  );

  const hasAnyCatalogItems = useMemo(
    () => sizeCategories.some((c) => c.items.length > 0),
    [sizeCategories]
  );

  const hasFilteredItems = useMemo(
    () => filteredSizeCategories.some((c) => c.items.length > 0),
    [filteredSizeCategories]
  );

  useEffect(() => {
    if (!isOpen) {
      setSizeSearchQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const onEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [isOpen, onEscape]);

  if (!isOpen) {
    return null;
  }

  const handlePickSizeItem = (item: SizeCatalogItemDto) => {
    onSelectSizeCatalogItem(item);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 z-0 bg-[rgba(0,0,0,0.6)]"
        aria-label={t(language, 'product.customize_modal_close_aria')}
        onClick={onClose}
      />
      <div
        className="absolute inset-y-0 right-0 z-10 flex h-full max-h-dvh w-full flex-col overflow-hidden bg-[#efefef] shadow-[-8px_0_32px_rgba(0,0,0,0.12)] md:w-[min(1078px,56.15vw)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="relative min-h-0 flex-1 overflow-y-auto px-[24px] pb-16 pt-[50px] sm:px-[50px]">
          <div className="flex items-start justify-between gap-4">
            <h2 id={titleId} className="font-montserrat text-[28px] font-extrabold leading-none text-[#414141] sm:text-[36px]">
              {t(language, 'product.choose_size')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="mt-1 flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-sm text-[#414141] transition-opacity hover:opacity-70"
              aria-label={t(language, 'product.customize_modal_close_aria')}
            >
              <img
                src="/assets/product/customize/icon-close.svg"
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 shrink-0"
              />
            </button>
          </div>

          {hasAnyCatalogItems ? (
            <div className="mt-6 w-full">
              <label htmlFor={searchInputId} className="sr-only">
                {t(language, 'product.size_catalog_search_placeholder')}
              </label>
              <input
                id={searchInputId}
                type="search"
                value={sizeSearchQuery}
                onChange={(e) => setSizeSearchQuery(e.target.value)}
                placeholder={t(language, 'product.size_catalog_search_placeholder')}
                autoComplete="off"
                className="w-full rounded-lg border-0 bg-white px-4 py-3 font-montserrat text-[16px] font-medium text-[#414141] shadow-[0px_2px_8px_rgba(0,0,0,0.08)] outline-none placeholder:text-[#898989] focus-visible:ring-2 focus-visible:ring-[#dcc090]/40"
              />
            </div>
          ) : null}

          <div className="mt-8">
            {hasAnyCatalogItems && !hasFilteredItems && sizeSearchQuery.trim().length > 0 ? (
              <p className="font-montserrat text-[16px] font-medium text-[#414141]">
                {t(language, 'product.size_catalog_search_no_results')}
              </p>
            ) : (
              <SizeCatalogPickerContent
                categories={filteredSizeCategories}
                selectedItemId={selectedSizeItemId}
                language={language}
                onSelectItem={handlePickSizeItem}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
