/**
 * Hook for product form callbacks and event handlers
 */

import type { ChangeEvent } from 'react';
import type { Category, GeneratedVariant } from '../types';
import { generateSlug } from '../utils/productUtils';

interface UseProductFormCallbacksProps {
  formData: {
    title: string;
    slug: string;
    primaryCategoryId: string;
  };
  categories: Category[];
  generatedVariants: GeneratedVariant[];
  setFormData: (updater: (prev: unknown) => unknown) => void;
  setGeneratedVariants: (value: GeneratedVariant[] | ((prev: GeneratedVariant[]) => GeneratedVariant[])) => void;
  setSimpleProductData: (value: unknown | ((prev: unknown) => unknown)) => void;
  checkIsClothingCategory: (categoryId: string, categories: Category[]) => boolean;
}

export function useProductFormCallbacks({
  formData,
  categories,
  setFormData,
  setGeneratedVariants,
  setSimpleProductData,
  checkIsClothingCategory,
}: UseProductFormCallbacksProps) {
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev: unknown) => {
      const prevObj = typeof prev === 'object' && prev !== null ? (prev as Record<string, unknown>) : {};
      return {
        ...prevObj,
        title,
        slug: (prevObj.slug as string | undefined) || generateSlug(title),
      };
    });
  };

  const isClothingCategory = () => checkIsClothingCategory(formData.primaryCategoryId, categories);

  const handleVariantDelete = (variantId: string) => {
    setGeneratedVariants((prev) => prev.filter((v) => v.id !== variantId));
  };

  const handleVariantAdd = () => {
    const newVariant: GeneratedVariant = {
      id: `variant-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      selectedValueIds: [],
      price: '',
      compareAtPrice: '',
      stock: '0',
      sku: '',
      image: null,
    };
    setGeneratedVariants((prev) => [...prev, newVariant]);
  };

  return {
    handleTitleChange,
    isClothingCategory,
    handleVariantDelete,
    handleVariantAdd,
  };
}

