'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { t, getProductText } from '../../../lib/i18n';
import type { SizeCatalogItemDto } from '@/lib/types/size-catalog';
import { RelatedProducts } from '../../../components/RelatedProducts';
import { CustomizeFormatToolbar } from './CustomizeFormatToolbar';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductInfoAndActions } from './ProductInfoAndActions';
import {
  buildCustomizePreviewHtml,
  getDefaultCustomizeFormat,
  type CustomizeFormatState,
} from './utils/build-customize-preview-html';
import { sanitizeCustomizeHtml } from './utils/sanitize-customize-html';
import { useProductPage } from './useProductPage';
import { useProductCartActions } from './useProductCartActions';
import { useCustomizeGoogleFontLinks } from './useCustomizeGoogleFontLinks';
import type { ProductPageProps } from './types';

const CUSTOMIZE_TEXT_MAX_LENGTH = 18;

export default function ProductPage({ params }: ProductPageProps) {
  const {
    product,
    loading,
    images,
    currentImageIndex,
    setCurrentImageIndex,
    thumbnailStartIndex,
    setThumbnailStartIndex,
    language,
    isAddingToCart,
    setIsAddingToCart,
    showMessage,
    setShowMessage,
    selectedColor,
    selectedSize,
    colorOptions,
    sizeOptions,
    quantity,
    currentVariant,
    price,
    originalPrice,
    compareAtPrice,
    discountPercent,
    isOutOfStock,
    canAddToCart,
    handleColorSelect,
    handleSizeSelect,
  } = useProductPage(params);

  const [selectedCatalogSize, setSelectedCatalogSize] = useState<SizeCatalogItemDto | null>(null);
  const [customizeApplied, setCustomizeApplied] = useState<{
    plain: string;
    html: string | null;
  } | null>(null);
  const [customizeDraftText, setCustomizeDraftText] = useState('');
  const [customizeFormat, setCustomizeFormat] = useState<CustomizeFormatState>(() => getDefaultCustomizeFormat());

  useEffect(() => {
    setSelectedCatalogSize(null);
    setCustomizeApplied(null);
    setCustomizeDraftText('');
    setCustomizeFormat(getDefaultCustomizeFormat());
  }, [product?.id]);

  const onCustomizeApplied = useCallback((value: { plain: string; html: string | null } | null) => {
    setCustomizeApplied(value);
    setCustomizeDraftText(value?.plain ?? '');
  }, []);

  const liveOverlayHtml = useMemo(() => {
    if (!customizeDraftText.trim()) {
      return null;
    }
    return buildCustomizePreviewHtml(customizeDraftText, customizeFormat);
  }, [customizeDraftText, customizeFormat]);

  const onCustomizeDraftTextChange = useCallback((value: string) => {
    setCustomizeDraftText(value);
  }, []);

  useCustomizeGoogleFontLinks(true);

  const getCustomizeSanitizedHtml = useCallback(() => {
    if (typeof document === 'undefined') {
      return '';
    }
    const raw = buildCustomizePreviewHtml(customizeDraftText, customizeFormat);
    return sanitizeCustomizeHtml(raw);
  }, [customizeDraftText, customizeFormat]);

  const productDisplayTitle = product
    ? getProductText(language, product.id, 'title') || product.title
    : '';

  const { handleAddToCart, handleBuyNow } = useProductCartActions({
    product,
    currentVariant,
    quantity,
    price,
    originalPrice,
    language,
    canAddToCart,
    productDisplayTitle,
    selectedCatalogSize,
    customizeApplied,
    setIsAddingToCart,
    setShowMessage,
  });

  if (loading || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        {t(language, 'common.messages.loading')}
      </div>
    );
  }

  return (
    <div className="overflow-visible bg-[#efefef]">
      <div className="mx-auto max-w-[1920px] overflow-visible px-4 pb-16 pt-6 sm:px-6 lg:px-[120px] lg:pb-24 lg:pt-16">
        <div className="grid items-start gap-10 overflow-visible xl:grid-cols-[minmax(0,640px)_minmax(0,1fr)] xl:gap-[52px]">
          <div className="flex min-w-0 flex-col gap-6 overflow-visible sm:gap-8">
            <ProductImageGallery
              images={images}
              product={product}
              language={language}
              currentImageIndex={currentImageIndex}
              onImageIndexChange={setCurrentImageIndex}
              thumbnailStartIndex={thumbnailStartIndex}
              onThumbnailStartIndexChange={setThumbnailStartIndex}
              customizeOverlayHtml={liveOverlayHtml}
            />
            <CustomizeFormatToolbar
              key={product.id}
              language={language}
              plainText={customizeDraftText}
              maxPlainLength={CUSTOMIZE_TEXT_MAX_LENGTH}
              format={customizeFormat}
              onFormatChange={setCustomizeFormat}
            />
          </div>

          <ProductInfoAndActions
            product={product}
            appliedCustomize={customizeApplied}
            onCustomizeApplied={onCustomizeApplied}
            getCustomizeSanitizedHtml={getCustomizeSanitizedHtml}
            customizeDraftText={customizeDraftText}
            onCustomizeDraftTextChange={onCustomizeDraftTextChange}
            customizeTextMaxLength={CUSTOMIZE_TEXT_MAX_LENGTH}
            price={price}
            originalPrice={originalPrice}
            compareAtPrice={compareAtPrice}
            discountPercent={discountPercent}
            language={language}
            isOutOfStock={isOutOfStock}
            canAddToCart={canAddToCart}
            isAddingToCart={isAddingToCart}
            showMessage={showMessage}
            currentVariant={currentVariant}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
            colorOptions={colorOptions}
            sizeOptions={sizeOptions}
            onColorSelect={handleColorSelect}
            onSizeSelect={handleSizeSelect}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onSelectedCatalogSizeChange={setSelectedCatalogSize}
          />
        </div>

        <div className="mt-16 lg:mt-[128px]">
          <RelatedProducts categorySlug={product.categories?.[0]?.slug} currentProductId={product.id} />
        </div>
      </div>
    </div>
  );
}
