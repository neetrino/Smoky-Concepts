'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { t } from '@/lib/i18n';
import type { LanguageCode } from '@/lib/language';
import type { SizeCatalogItemDto } from '@/lib/types/size-catalog';
import type { Product, ProductVariant } from './types';
import {
  buildGuestCartLineSnapshot,
  canAddVariantToGuestCart,
  upsertGuestCartLineSnapshot,
} from './product-cart-snapshot';

interface UseProductCartActionsParams {
  product: Product | null;
  currentVariant: ProductVariant | null;
  quantity: number;
  price: number;
  originalPrice: number | null;
  language: LanguageCode;
  canAddToCart: boolean;
  productDisplayTitle: string;
  /** When user picked a row from the global size catalog modal */
  selectedCatalogSize: SizeCatalogItemDto | null;
  /** Last applied PDP customize (Apply) — attached to guest cart lines */
  customizeApplied: { plain: string; html: string | null } | null;
  setIsAddingToCart: (value: boolean) => void;
  setShowMessage: (value: string | null) => void;
}

export function useProductCartActions({
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
}: UseProductCartActionsParams) {
  const router = useRouter();

  const runAddFlow = useCallback(
    (afterLocalAdd?: () => void) => {
      if (!canAddToCart || !product || !currentVariant) {
        return;
      }
      if (!canAddVariantToGuestCart(currentVariant, quantity)) {
        setShowMessage(t(language, 'product.errorAddingToCart'));
        setTimeout(() => setShowMessage(null), 2000);
        return;
      }

      setIsAddingToCart(true);
      try {
        const sizeCatalog =
          selectedCatalogSize != null
            ? { title: selectedCatalogSize.title, imageUrl: selectedCatalogSize.imageUrl }
            : null;
        const customizeForLine =
          customizeApplied != null &&
          (customizeApplied.plain.trim() !== '' ||
            (customizeApplied.html != null && customizeApplied.html.trim() !== ''))
            ? {
                plain: customizeApplied.plain.trim(),
                html: customizeApplied.html?.trim() ? customizeApplied.html.trim() : null,
              }
            : null;
        const snapshot = buildGuestCartLineSnapshot(
          product,
          currentVariant,
          quantity,
          price,
          originalPrice,
          productDisplayTitle,
          sizeCatalog,
          customizeForLine
        );
        upsertGuestCartLineSnapshot(snapshot);

        afterLocalAdd?.();
      } catch {
        setShowMessage(t(language, 'product.errorAddingToCart'));
        setTimeout(() => setShowMessage(null), 2000);
      } finally {
        setIsAddingToCart(false);
      }
    },
    [
      canAddToCart,
      product,
      currentVariant,
      quantity,
      price,
      originalPrice,
      productDisplayTitle,
      selectedCatalogSize,
      customizeApplied,
      language,
      setIsAddingToCart,
      setShowMessage,
    ]
  );

  const handleAddToCart = useCallback(async () => {
    runAddFlow(() => {
      setShowMessage(`${t(language, 'product.addedToCart')} ${quantity} ${t(language, 'product.pcs')}`);
      setTimeout(() => setShowMessage(null), 2000);
    });
  }, [runAddFlow, language, quantity, setShowMessage]);

  const handleBuyNow = useCallback(async () => {
    runAddFlow(() => {
      router.push('/checkout');
    });
  }, [runAddFlow, router]);

  return { handleAddToCart, handleBuyNow };
}
