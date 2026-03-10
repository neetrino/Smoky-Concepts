import type { Product, ProductVariant } from '../types';

interface UseProductCalculationsProps {
  product: Product | null;
  currentVariant: ProductVariant | null;
}

/**
 * Price and stock from current variant only (no color/size/attribute logic).
 */
export function useProductCalculations({
  product,
  currentVariant,
}: UseProductCalculationsProps) {
  const price = currentVariant?.price ?? 0;
  const originalPrice = currentVariant?.originalPrice ?? null;
  const compareAtPrice = currentVariant?.compareAtPrice ?? null;
  const discountPercent = currentVariant?.productDiscount ?? product?.productDiscount ?? null;
  const isOutOfStock = !currentVariant || (currentVariant.stock ?? 0) <= 0;
  const canAddToCart = !!currentVariant && !isOutOfStock;

  return {
    price,
    originalPrice,
    compareAtPrice,
    discountPercent,
    isOutOfStock,
    isVariationRequired: false,
    unavailableAttributes: new Map<string, boolean>(),
    hasUnavailableAttributes: false,
    canAddToCart,
  };
}
