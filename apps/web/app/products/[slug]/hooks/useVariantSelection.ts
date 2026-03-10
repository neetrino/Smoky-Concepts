import { useState, useEffect } from 'react';
import type { Product, ProductVariant } from '../types';

interface UseVariantSelectionProps {
  product: Product | null;
}

/**
 * Single variant selection: always uses first variant (no color/size/attribute selectors).
 */
export function useVariantSelection({ product }: UseVariantSelectionProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  useEffect(() => {
    if (product?.variants?.length) {
      setSelectedVariant(product.variants![0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product?.id, product?.variants]);

  const currentVariant = selectedVariant || product?.variants?.[0] || null;

  return {
    selectedVariant,
    setSelectedVariant,
    currentVariant,
  };
}
