'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { formatCatalogPrice } from '../../../lib/currency';
import { t, getProductText } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import { apiClient } from '../../../lib/api-client';
import type { SizeCatalogCategoryDto, SizeCatalogItemDto } from '@/lib/types/size-catalog';
import { Button } from '../../../components/ui/buttons';
import type { AttributeGroupValue, Product, ProductVariant } from './types';
import { normalizeHexPalette, parseHexFromText } from './utils/swatch-color-utils';
import { CustomizeSizeModal } from './CustomizeSizeModal';
import {
  getPlainTextFromHtml,
  sanitizeCustomizeHtml,
} from './utils/sanitize-customize-html';

const CATALOG_BAG_ICON_PATH = '/assets/home/icons/bag-catalog.svg';

/** How long the “applied text” confirmation stays visible under Apply (ms). */
const CUSTOMIZE_APPLIED_PREVIEW_MS = 1000;

type ProductTabKey = 'description' | 'details' | 'shipping' | 'customize';

interface ProductOptionValue extends AttributeGroupValue {
  colors?: string[] | string | null;
}

/**
 * PDP actions — add/buy handlers are wired to `useProductCartActions` on the parent page
 * (fast snapshot + optional POST, no extra GET before add).
 */
interface ProductInfoAndActionsProps {
  product: Product;
  /** Last applied customize (hero overlay + cart). */
  appliedCustomize: { plain: string; html: string | null } | null;
  onCustomizeApplied: (value: { plain: string; html: string | null } | null) => void;
  /** Rich editor lives under the hero image; Apply reads its HTML from the parent ref. */
  getCustomizeSanitizedHtml: () => string;
  /** Plain line next to Apply — drives editor seed when it does not match applied rich HTML. */
  customizeDraftText: string;
  onCustomizeDraftTextChange: (value: string) => void;
  customizeTextMaxLength: number;
  price: number;
  originalPrice: number | null;
  compareAtPrice: number | null;
  discountPercent: number | null;
  language: LanguageCode;
  isOutOfStock: boolean;
  canAddToCart: boolean;
  isAddingToCart: boolean;
  showMessage: string | null;
  currentVariant: ProductVariant | null;
  selectedColor: string | null;
  selectedSize: string | null;
  colorOptions: ProductOptionValue[];
  sizeOptions: ProductOptionValue[];
  onColorSelect: (color: string) => void;
  onSizeSelect: (size: string) => void;
  /** Quick add (e.g. bag icon) — stay on page. */
  onAddToCart: () => Promise<void>;
  /** Primary CTA — add line then continue to checkout. */
  onBuyNow: () => Promise<void>;
  /** Sync size-catalog selection to parent for cart / checkout snapshot */
  onSelectedCatalogSizeChange?: (item: SizeCatalogItemDto | null) => void;
  /** Fires when the Customize tab is selected — parent loads fonts / toolbar only then. */
  onCustomizeTabActiveChange?: (active: boolean) => void;
}

const COLOR_SWATCH_FALLBACKS: Record<string, string[]> = {
  black: ['#1d1d1f'],
  green: ['#516349'],
  'forest green': ['#516349'],
  red: ['#7a2c34'],
  'deep red': ['#7a2c34'],
  gold: ['#b3ae78'],
  brown: ['#703d02'],
  white: ['#ffffff'],
  beige: ['#dcc090'],
};

function getSwatchColors(option: ProductOptionValue): string[] {
  const fromApi = normalizeHexPalette(option.colors);
  if (fromApi.length > 0) {
    return fromApi;
  }

  const fromValue = parseHexFromText(option.value);
  if (fromValue) {
    return [fromValue];
  }

  const fromLabel = parseHexFromText(option.label);
  if (fromLabel) {
    return [fromLabel];
  }

  return (
    COLOR_SWATCH_FALLBACKS[option.label.toLowerCase()] ??
    COLOR_SWATCH_FALLBACKS[option.value.toLowerCase()] ??
    ['#dcc090']
  );
}

function getShippingCopy(language: LanguageCode): string {
  switch (language) {
    case 'hy':
      return 'Առաքման արժեքն ու վերջնական ժամկետները հաշվարկվում են պատվերի ձևակերպման ժամանակ` ըստ հասցեի և ընտրված եղանակի։';
    case 'ru':
      return 'Стоимость и сроки доставки рассчитываются на этапе оформления заказа в зависимости от адреса и выбранного способа.';
    default:
      return 'Shipping cost and delivery timing are calculated at checkout based on destination and the selected method.';
  }
}

function matchVariantSizeFromCatalogTitle(title: string, options: ProductOptionValue[]): string | null {
  const normalized = title.trim().toLowerCase();
  const byLabel = options.find((o) => o.label.toLowerCase() === normalized);
  if (byLabel) {
    return byLabel.value;
  }
  const byValue = options.find((o) => o.value.toLowerCase() === normalized);
  return byValue?.value ?? null;
}

function getCustomizeCopy(language: LanguageCode): string {
  switch (language) {
    case 'hy':
      return 'Ընտրեք գույնը և չափը այս էջում՝ պատվերը անհատականացնելու համար։ Հատուկ ցանկությունների դեպքում կարող եք կապվել մեզ հետ պատվերը ձևակերպելուց հետո։';
    case 'ru':
      return 'Выберите цвет и размер на этой странице, чтобы персонализировать заказ. Для особых пожеланий свяжитесь с нами после оформления.';
    default:
      return 'Pick color and size on this page to personalize your order. For special requests, contact us after checkout.';
  }
}

export function ProductInfoAndActions({
  product,
  appliedCustomize,
  onCustomizeApplied,
  price,
  originalPrice,
  compareAtPrice,
  discountPercent,
  language,
  isOutOfStock,
  canAddToCart,
  isAddingToCart,
  showMessage,
  currentVariant,
  selectedColor,
  selectedSize,
  colorOptions,
  sizeOptions,
  onColorSelect,
  onSizeSelect,
  onAddToCart,
  onBuyNow,
  onSelectedCatalogSizeChange,
  onCustomizeTabActiveChange,
  getCustomizeSanitizedHtml,
  customizeDraftText,
  onCustomizeDraftTextChange,
  customizeTextMaxLength,
}: ProductInfoAndActionsProps) {
  const [activeTab, setActiveTab] = useState<ProductTabKey>('description');
  const [isCustomizeSizeModalOpen, setIsCustomizeSizeModalOpen] = useState(false);
  const [sizeCatalogCategories, setSizeCatalogCategories] = useState<SizeCatalogCategoryDto[]>([]);
  const [selectedCatalogSize, setSelectedCatalogSize] = useState<SizeCatalogItemDto | null>(null);
  const [appliedPreviewPlain, setAppliedPreviewPlain] = useState<string | null>(null);
  const appliedPreviewTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAppliedPreviewTimer = useCallback(() => {
    if (appliedPreviewTimeoutRef.current !== null) {
      clearTimeout(appliedPreviewTimeoutRef.current);
      appliedPreviewTimeoutRef.current = null;
    }
  }, []);

  const productTitle = getProductText(language, product.id, 'title') || product.title;
  const productDescription =
    getProductText(language, product.id, 'longDescription') || product.description || '';
  const activeColorOption = useMemo(
    () =>
      colorOptions.find(
        (option) => option.value === selectedColor || option.label.toLowerCase() === selectedColor
      ) ?? null,
    [colorOptions, selectedColor]
  );
  const activeSizeOption = useMemo(
    () =>
      sizeOptions.find(
        (option) => option.value === selectedSize || option.label.toLowerCase() === selectedSize
      ) ?? null,
    [selectedSize, sizeOptions]
  );

  const hasSizeCatalogItems = useMemo(
    () => sizeCatalogCategories.some((c) => c.items.length > 0),
    [sizeCatalogCategories]
  );

  const showSizeSection = sizeOptions.length > 0 || hasSizeCatalogItems;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await apiClient.get<{ data: SizeCatalogCategoryDto[] }>('/api/v1/size-catalog');
        if (!cancelled) {
          setSizeCatalogCategories(res.data ?? []);
        }
      } catch {
        if (!cancelled) {
          setSizeCatalogCategories([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSelectedCatalogSize(null);
    setActiveTab('description');
    clearAppliedPreviewTimer();
    setAppliedPreviewPlain(null);
  }, [product.id, clearAppliedPreviewTimer]);

  useEffect(() => {
    return () => {
      clearAppliedPreviewTimer();
    };
  }, [clearAppliedPreviewTimer]);

  useEffect(() => {
    onSelectedCatalogSizeChange?.(selectedCatalogSize);
  }, [selectedCatalogSize, onSelectedCatalogSizeChange]);

  useEffect(() => {
    onCustomizeTabActiveChange?.(activeTab === 'customize');
  }, [activeTab, onCustomizeTabActiveChange]);

  const sizeButtonLabel =
    selectedCatalogSize?.title ?? activeSizeOption?.label ?? t(language, 'product.choose_size');

  const handleSelectCatalogSizeItem = (item: SizeCatalogItemDto) => {
    setSelectedCatalogSize(item);
    if (sizeOptions.length > 0) {
      const matched = matchVariantSizeFromCatalogTitle(item.title, sizeOptions);
      if (matched) {
        onSizeSelect(matched);
      }
    }
  };

  const openSizeCatalogModal = () => {
    setIsCustomizeSizeModalOpen(true);
  };

  const handleCustomizeApplyClick = useCallback(() => {
    const rawHtml = getCustomizeSanitizedHtml();
    const sanitized = sanitizeCustomizeHtml(rawHtml);
    const plain = getPlainTextFromHtml(sanitized).trim();
    clearAppliedPreviewTimer();
    if (!plain) {
      onCustomizeApplied(null);
      setAppliedPreviewPlain(null);
      return;
    }
    onCustomizeApplied({
      plain,
      html: sanitized.trim().length > 0 ? sanitized : null,
    });
    setAppliedPreviewPlain(plain);
    appliedPreviewTimeoutRef.current = setTimeout(() => {
      setAppliedPreviewPlain(null);
      appliedPreviewTimeoutRef.current = null;
    }, CUSTOMIZE_APPLIED_PREVIEW_MS);
  }, [clearAppliedPreviewTimer, getCustomizeSanitizedHtml, onCustomizeApplied]);

  const handleCustomizeClearApplied = useCallback(() => {
    clearAppliedPreviewTimer();
    setAppliedPreviewPlain(null);
    onCustomizeApplied(null);
  }, [clearAppliedPreviewTimer, onCustomizeApplied]);

  const productBadge = product.labels?.[0]?.value || product.categories?.[0]?.title || null;
  const productDetails = [
    product.brand?.name ?? null,
    activeColorOption ? `${t(language, 'product.color')}: ${activeColorOption.label}` : null,
    activeSizeOption
      ? `${t(language, 'product.size')}: ${activeSizeOption.label}`
      : selectedCatalogSize
        ? `${t(language, 'product.size')}: ${selectedCatalogSize.title}`
        : null,
    currentVariant?.sku ? `SKU: ${currentVariant.sku}` : null,
  ].filter(Boolean) as string[];

  const renderedTabContent = useMemo(() => {
    if (activeTab === 'description') {
      if (!productDescription) {
        return (
          <p className="text-[15px] leading-[24px] text-[#414141] sm:text-[16px] sm:leading-[26px]">
            {t(language, 'product.description_empty')}
          </p>
        );
      }

      return (
        <div
          className="prose max-w-none text-[15px] leading-[24px] text-[#414141] prose-p:my-0 prose-p:text-[15px] prose-p:leading-[24px] sm:text-[16px] sm:leading-[26px] sm:prose-p:text-[16px] sm:prose-p:leading-[26px]"
          dangerouslySetInnerHTML={{ __html: productDescription }}
        />
      );
    }

    if (activeTab === 'shipping') {
      return (
        <p className="text-[15px] leading-[24px] text-[#414141] sm:text-[16px] sm:leading-[26px]">
          {getShippingCopy(language)}
        </p>
      );
    }

    if (activeTab === 'customize') {
      return (
        <div className="flex max-w-[763px] flex-col gap-[13px]">
          <p className="font-montserrat text-[18px] font-medium leading-[30px] text-[#414141]">
            {getCustomizeCopy(language)}
          </p>
          <div className="flex max-w-[763px] flex-col gap-4 sm:flex-row sm:items-end sm:gap-20 sm:pb-5">
            <input
              type="text"
              value={customizeDraftText}
              maxLength={customizeTextMaxLength}
              onChange={(e) => {
                onCustomizeDraftTextChange(e.target.value);
              }}
              className="w-full max-w-[291px] border-0 border-b border-[#dcc090] bg-transparent pb-0.5 font-montserrat text-[18px] font-medium leading-[30px] text-[#414141] outline-none focus:border-[#dcc090] focus-visible:border-[#dcc090] active:border-[#dcc090]"
              aria-label={t(language, 'product.customize_title')}
              autoComplete="off"
            />
            <button
              type="button"
              onClick={handleCustomizeApplyClick}
              className="h-10 w-full max-w-[168px] shrink-0 cursor-pointer rounded-md border-2 border-solid border-[#dcc090] bg-transparent font-montserrat text-[18px] font-extrabold uppercase tracking-[1.5px] text-[#dcc090] transition-colors duration-200 hover:bg-[#dcc090]/12 hover:text-[#3a3428] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcc090] active:bg-[#dcc090]/20 sm:translate-y-5 sm:w-[168px]"
            >
              {t(language, 'product.customize_apply')}
            </button>
          </div>
          {appliedCustomize?.plain ? (
            <button
              type="button"
              onClick={handleCustomizeClearApplied}
              className="w-fit font-montserrat text-[13px] font-medium text-[#898989] underline decoration-[#898989] underline-offset-2 transition-colors hover:text-[#414141] hover:decoration-[#414141] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#dcc090]"
            >
              {t(language, 'product.customize_clear_applied')}
            </button>
          ) : null}
          {appliedPreviewPlain ? (
            <div
              className="max-w-[763px] rounded-md border border-[#dcc090]/60 bg-[#faf8f4] px-3 py-2.5 sm:px-4"
              aria-live="polite"
            >
              <p className="font-montserrat text-[11px] font-semibold uppercase tracking-[0.08em] text-[#898989]">
                {t(language, 'product.customize_applied_text_label')}
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words font-montserrat text-[15px] font-medium leading-relaxed text-[#414141] sm:text-[16px]">
                {appliedPreviewPlain}
              </p>
            </div>
          ) : null}
          <p className="max-w-[763px] font-montserrat text-[12px] font-medium leading-snug text-[#898989] sm:text-[13px]">
            {t(language, 'product.customize_apply_cart_hint')}
          </p>
          <p className="max-w-[291px] text-right font-montserrat text-[10px] font-medium leading-[30px] text-[#898989]">
            {customizeDraftText.length}/ {customizeTextMaxLength}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {productDetails.map((item) => (
          <p key={item} className="text-[15px] leading-[24px] text-[#414141] sm:text-[16px] sm:leading-[26px]">
            {item}
          </p>
        ))}
      </div>
    );
  }, [
    activeTab,
    language,
    productDescription,
    productDetails,
    selectedCatalogSize,
    appliedCustomize,
    appliedPreviewPlain,
    customizeDraftText,
    customizeTextMaxLength,
    onCustomizeDraftTextChange,
    handleCustomizeApplyClick,
    handleCustomizeClearApplied,
  ]);

  return (
    <>
    <div className="max-w-[763px] pt-1 xl:pt-36 2xl:pt-40">
      <h1 className="font-montserrat text-[26px] font-black leading-tight text-[#414141] sm:text-[30px]">
        {productTitle}
      </h1>

      {productBadge && (
        <div className="mt-3 inline-flex h-[18px] items-center rounded-[6px] bg-[#122a26] px-[7px] text-[12px] font-medium leading-none text-white">
          {productBadge}
        </div>
      )}

      {colorOptions.length > 0 && (
        <div className="mt-8">
          <p className="font-montserrat text-[18px] font-extrabold leading-none text-[#414141]">
            {t(language, 'product.color')}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {colorOptions.map((option) => {
              const isActive =
                option.value === selectedColor || option.label.toLowerCase() === selectedColor;
              const swatches = getSwatchColors(option);

              return (
                <button
                  key={option.valueId || option.value}
                  type="button"
                  onClick={() => onColorSelect(option.value)}
                  className={`relative rounded-[6px] transition-transform hover:scale-[1.02] ${
                    isActive
                      ? 'flex h-[34px] w-[34px] items-center justify-center bg-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]'
                      : 'h-[22px] w-[22px]'
                  }`}
                  aria-label={option.label}
                >
                  <span
                    className={`block rounded-[5px] ${isActive ? 'h-[28px] w-[28px]' : 'h-[22px] w-[22px]'}`}
                    style={{
                      background:
                        swatches.length > 1
                          ? `linear-gradient(135deg, ${swatches.join(', ')})`
                          : swatches[0],
                    }}
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {showSizeSection && (
        <div className="relative mt-6">
          <p className="font-montserrat text-[18px] font-extrabold leading-none text-[#414141]">
            {t(language, 'product.size')}
          </p>
          <button
            type="button"
            onClick={openSizeCatalogModal}
            className="mt-3 inline-flex min-h-9 min-w-[140px] max-w-full items-center justify-center gap-2 rounded-[6px] bg-[#dcc090] px-3 py-2 text-center text-[16px] font-medium uppercase tracking-[0.08em] text-[#122a26] sm:min-w-[160px]"
          >
            <span className="truncate">{sizeButtonLabel}</span>
          </button>
        </div>
      )}

      <div className="mt-12">
        <div className="flex flex-wrap items-end gap-6 sm:gap-8">
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            className={`relative pb-3 font-montserrat text-[17px] font-extrabold leading-none sm:text-[19px] ${
              activeTab === 'description' ? 'text-[#414141]' : 'text-[#414141]/70'
            }`}
          >
            {t(language, 'product.description_title')}
            {activeTab === 'description' && (
              <span className="absolute bottom-0 left-0 h-0.5 w-[72px] rounded-[2px] bg-[#122a26] sm:w-[80px]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`relative pb-3 font-montserrat text-[17px] font-extrabold leading-none sm:text-[19px] ${
              activeTab === 'details' ? 'text-[#414141]' : 'text-[#414141]/70'
            }`}
          >
            {t(language, 'product.details_title')}
            {activeTab === 'details' && (
              <span className="absolute bottom-0 left-0 h-0.5 w-[72px] rounded-[2px] bg-[#122a26] sm:w-[80px]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('shipping')}
            className={`relative pb-3 font-montserrat text-[17px] font-extrabold leading-none sm:text-[19px] ${
              activeTab === 'shipping' ? 'text-[#414141]' : 'text-[#414141]/70'
            }`}
          >
            {t(language, 'product.shipping_title')}
            {activeTab === 'shipping' && (
              <span className="absolute bottom-0 left-0 h-0.5 w-[72px] rounded-[2px] bg-[#122a26] sm:w-[80px]" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('customize')}
            className={`relative pb-3 font-montserrat text-[17px] font-extrabold leading-none sm:text-[19px] ${
              activeTab === 'customize' ? 'text-[#414141]' : 'text-[#414141]/70'
            }`}
          >
            {t(language, 'product.customize_title')}
            {activeTab === 'customize' && (
              <span className="absolute bottom-0 left-0 h-1 w-[87px] rounded-[2px] bg-[#122a26]" />
            )}
          </button>
        </div>

        <div className="pt-6 sm:pt-7">{renderedTabContent}</div>
      </div>

      <div className="mt-[48px] flex flex-wrap items-center gap-4">
        <div className="flex items-end gap-3">
          <p className="font-montserrat text-[30px] font-extrabold leading-none text-black sm:text-[32px]">
            {formatCatalogPrice(price)}
          </p>
          {(originalPrice || (compareAtPrice && compareAtPrice > price)) && (
            <p className="pb-0.5 text-[15px] leading-none text-[#9d9d9d] line-through sm:text-[16px]">
              {formatCatalogPrice(originalPrice || compareAtPrice || 0)}
            </p>
          )}
          {discountPercent && discountPercent > 0 && (
            <span className="rounded-[6px] bg-[#122a26] px-2 py-1 text-[12px] font-medium text-white">
              -{discountPercent}%
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          <Button
            type="button"
            disabled={!canAddToCart || isAddingToCart}
            onClick={() => {
              void onBuyNow();
            }}
            className="h-10 rounded-[8px] !bg-[#dcc090] px-4 text-[56px] font-bold capitalize tracking-normal !text-[#122a26] hover:!bg-[#d3b67f] sm:px-5 sm:text-[20px]"
          >
            {isAddingToCart
              ? t(language, 'product.adding')
              : isOutOfStock
                ? t(language, 'product.outOfStock')
                : t(language, 'product.buy_now')}
          </Button>

          <button
            type="button"
            onClick={() => {
              void onAddToCart();
            }}
            disabled={!canAddToCart || isAddingToCart}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] text-[#dcc090] transition-colors hover:bg-[#dcc090]/10 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t(language, 'product.addToCart')}
          >
            {isAddingToCart ? (
              <svg
                className="h-7 w-7 animate-spin text-[#dcc090]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <Image
                src={CATALOG_BAG_ICON_PATH}
                alt=""
                width={40}
                height={40}
                className="h-8 w-[40px] object-contain"
                aria-hidden
              />
            )}
          </button>
        </div>
      </div>

      {showMessage && (
        <div className="mt-6 rounded-[12px] bg-[#122a26] px-4 py-3 text-sm font-medium text-white shadow-[0_10px_30px_rgba(18,42,38,0.12)]">
          {showMessage}
        </div>
      )}
    </div>
    <CustomizeSizeModal
      isOpen={isCustomizeSizeModalOpen}
      onClose={() => setIsCustomizeSizeModalOpen(false)}
      language={language}
      sizeCategories={sizeCatalogCategories}
      selectedSizeItemId={selectedCatalogSize?.id ?? null}
      onSelectSizeCatalogItem={handleSelectCatalogSizeItem}
    />
    </>
  );
}



