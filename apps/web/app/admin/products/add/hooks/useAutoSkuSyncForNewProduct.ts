import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react';
import { buildAutoSkuBaseFromSlug } from '../utils/autoSku';

type SimpleProductSkuState = {
  price: string;
  compareAtPrice: string;
  sku: string;
  quantity: string;
};

interface UseAutoSkuSyncForNewProductProps {
  isEditMode: boolean;
  loadingProduct: boolean;
  slug: string;
  simpleProductSku: string;
  setSimpleProductData: Dispatch<SetStateAction<SimpleProductSkuState>>;
}

/**
 * Add product only: keeps simple-product SKU in sync with slug until the admin edits SKU away from the last auto value.
 * Edit mode: never runs — loaded SKU (including one-time auto from API) stays until the admin changes it.
 */
export function useAutoSkuSyncForNewProduct({
  isEditMode,
  loadingProduct,
  slug,
  simpleProductSku,
  setSimpleProductData,
}: UseAutoSkuSyncForNewProductProps): void {
  const lastAutoSkuRef = useRef('');

  useEffect(() => {
    if (isEditMode || loadingProduct) {
      return;
    }
    const base = buildAutoSkuBaseFromSlug(slug);
    const current = simpleProductSku.trim();
    const shouldSync = current === '' || current === lastAutoSkuRef.current;
    if (!shouldSync) {
      return;
    }
    if (base === current) {
      lastAutoSkuRef.current = base;
      return;
    }
    lastAutoSkuRef.current = base;
    setSimpleProductData((prev) => ({ ...prev, sku: base }));
  }, [isEditMode, loadingProduct, slug, simpleProductSku, setSimpleProductData]);
}
