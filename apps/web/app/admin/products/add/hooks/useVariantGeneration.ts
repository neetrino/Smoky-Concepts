'use client';

import type { GeneratedVariant } from '../types';

interface UseVariantGenerationProps {
  generatedVariants: GeneratedVariant[];
  setGeneratedVariants: (updater: (prev: GeneratedVariant[]) => GeneratedVariant[]) => void;
}

export function useVariantGeneration({
  setGeneratedVariants,
}: UseVariantGenerationProps) {
  const applyToAllVariants = (field: 'price' | 'compareAtPrice' | 'stock' | 'sku', value: string) => {
    setGeneratedVariants((prev) =>
      prev.map((variant) => ({
        ...variant,
        [field]: value,
      }))
    );
  };

  return {
    applyToAllVariants,
  };
}
