'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api-client';
import { type LanguageCode } from '../../lib/language';

const RELATED_PRODUCTS_MAX = 12;

interface RelatedProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  originalPrice?: number | null;
  compareAtPrice: number | null;
  discountPercent?: number | null;
  image: string | null;
  images?: string[];
  inStock: boolean;
  brand?: {
    id: string;
    name: string;
  } | null;
  categories?: Array<{
    id: string;
    slug: string;
    title: string;
  }>;
  skus?: string[];
  defaultVariantId?: string | null;
  defaultVariantStock?: number;
  defaultSku?: string;
  variants?: Array<{
    options?: Array<{
      key: string;
      value: string;
    }>;
  }>;
}

interface UseRelatedProductsProps {
  categorySlug?: string;
  currentProductId: string;
  language: LanguageCode;
}

/**
 * Fetches related products for the PDP — cap list to 12 items.
 */
export function useRelatedProducts({ categorySlug, currentProductId, language }: UseRelatedProductsProps) {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);

        const params: Record<string, string> = {
          limit: String(RELATED_PRODUCTS_MAX + 8),
          lang: language,
        };

        if (categorySlug) {
          params.category = categorySlug;
        }

        const response = await apiClient.get<{
          data: RelatedProduct[];
          meta: {
            total: number;
          };
        }>('/api/v1/products', {
          params,
        });

        const filtered = response.data.filter((p) => p.id !== currentProductId);
        setProducts(filtered.slice(0, RELATED_PRODUCTS_MAX));
      } catch (error) {
        console.error('[RelatedProducts] Error fetching related products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [categorySlug, currentProductId, language]);

  return { products, loading };
}
