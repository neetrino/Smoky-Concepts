'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';

import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';
import { SizeCatalogPickerContent } from './SizeCatalogPickerContent';
import {
  CustomizeSizeOrderFallback,
  EMPTY_CUSTOM_ORDER_DRAFT,
  type CustomOrderDraft,
} from './CustomizeSizeOrderFallback';

function normalizeSearchQuery(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function filterSizeCatalogByTitle(
  categories: SizeCatalogCategoryDto[],
  query: string
): SizeCatalogCategoryDto[] {
  const q = normalizeSearchQuery(query);
  if (!q) {
    return categories;
  }
  return categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter((item) => {
        const normalizedTitle = normalizeSearchQuery(item.title);
        const normalizedCategory = normalizeSearchQuery(cat.title);
        return normalizedTitle.includes(q) || normalizedCategory.includes(q);
      }),
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
  onSelectCustomSizeRequest: (draft: CustomOrderDraft) => void;
}

export function CustomizeSizeModal({
  isOpen,
  onClose,
  language,
  sizeCategories,
  selectedSizeItemId,
  onSelectSizeCatalogItem,
  onSelectCustomSizeRequest,
}: CustomizeSizeModalProps) {
  const titleId = useId();
  const searchInputId = useId();
  const [sizeSearchQuery, setSizeSearchQuery] = useState('');
  const [customOrderDraft, setCustomOrderDraft] = useState<CustomOrderDraft>(EMPTY_CUSTOM_ORDER_DRAFT);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [customOrderSubmitError, setCustomOrderSubmitError] = useState<string | null>(null);

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
      setCustomOrderDraft(EMPTY_CUSTOM_ORDER_DRAFT);
      setIsUploadingImage(false);
      setCustomOrderSubmitError(null);
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

  const handleCustomOrderDraftChange = useCallback(
    (field: keyof CustomOrderDraft, value: string) => {
      setCustomOrderDraft((previous) => ({
        ...previous,
        [field]: value,
      }));
    },
    []
  );

  const handleCustomOrderImageUpload = useCallback(async (file: File) => {
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
    if (!allowedTypes.has(file.type)) {
      setCustomOrderSubmitError(t(language, 'product.size_catalog_custom_order_upload_invalid_type'));
      return;
    }

    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setCustomOrderSubmitError(t(language, 'product.size_catalog_custom_order_upload_too_large'));
      return;
    }

    setCustomOrderSubmitError(null);
    setIsUploadingImage(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
            return;
          }
          reject(new Error('Failed to read image'));
        };
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(file);
      });

      setCustomOrderDraft((previous) => ({
        ...previous,
        imageDataUrl: dataUrl,
        imageFileName: file.name,
      }));
    } catch {
      setCustomOrderSubmitError(t(language, 'product.size_catalog_custom_order_upload_failed'));
    } finally {
      setIsUploadingImage(false);
    }
  }, [language]);

  const handleCustomOrderSubmit = useCallback((draft: CustomOrderDraft) => {
    const canSubmit =
      draft.name.trim() &&
      draft.phone.trim() &&
      draft.email.trim() &&
      draft.description.trim() &&
      draft.imageDataUrl.trim();

    if (!canSubmit) {
      setCustomOrderSubmitError(t(language, 'product.size_catalog_custom_order_required_fields'));
      return;
    }
    setCustomOrderSubmitError(null);
    onSelectCustomSizeRequest({
      ...draft,
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      description: draft.description.trim(),
      imageDataUrl: draft.imageDataUrl.trim(),
      imageFileName: draft.imageFileName.trim(),
    });
    onClose();
  }, [language, onClose, onSelectCustomSizeRequest]);

  if (!isOpen) {
    return null;
  }

  const canSubmitCustomOrder =
    customOrderDraft.name.trim().length > 0 &&
    customOrderDraft.phone.trim().length > 0 &&
    customOrderDraft.email.trim().length > 0 &&
    customOrderDraft.description.trim().length > 0 &&
    customOrderDraft.imageDataUrl.trim().length > 0;

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
            <div className="mt-6 w-full max-w-[978px]">
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
                className="h-12 w-full rounded-[6px] border-0 bg-white px-[18px] font-montserrat text-[18px] font-medium text-[#414141] shadow-[0px_4px_22.5px_rgba(0,0,0,0.1)] outline-none placeholder:text-[#9d9d9d] focus-visible:ring-2 focus-visible:ring-[#dcc090]/40"
              />
            </div>
          ) : null}

          <div className="mt-10">
            {hasAnyCatalogItems && !hasFilteredItems && sizeSearchQuery.trim().length > 0 ? (
              <CustomizeSizeOrderFallback
                language={language}
                draft={customOrderDraft}
                onDraftChange={handleCustomOrderDraftChange}
                onUploadImage={handleCustomOrderImageUpload}
                onSubmit={handleCustomOrderSubmit}
                isUploadingImage={isUploadingImage}
                isSubmitting={false}
                submitError={customOrderSubmitError}
                canSubmit={canSubmitCustomOrder}
              />
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
