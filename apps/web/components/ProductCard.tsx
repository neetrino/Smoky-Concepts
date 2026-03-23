'use client';

import { useState } from 'react';
import type { MouseEvent } from 'react';
import { useAddToCart } from './hooks/useAddToCart';
import { useCurrency } from './hooks/useCurrency';
import { ProductCardList } from './ProductCard/ProductCardList';
import { ProductCardGrid } from './ProductCard/ProductCardGrid';

interface Product {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  inStock: boolean;
  categories: Array<{
    id: string;
    slug: string;
    title: string;
  }>;
  brand?: {
    id: string;
    name: string;
  } | null;
  labels?: import('./ProductLabels').ProductLabel[];
  compareAtPrice?: number | null;
  originalPrice?: number | null;
  globalDiscount?: number | null;
  discountPercent?: number | null;
}

type ViewMode = 'list' | 'grid-2' | 'grid-3';

interface ProductCardProps {
  product: Product;
  viewMode?: ViewMode;
}

/**
 * Product card component that renders product details and cart actions.
 */
export function ProductCard({ product, viewMode = 'grid-3' }: ProductCardProps) {
  const isCompact = viewMode === 'grid-3';
  const currency = useCurrency();
  const { isAddingToCart, addToCart } = useAddToCart({
    productId: product.id,
    productSlug: product.slug,
    inStock: product.inStock,
  });
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart();
  };

  // List view layout
  if (viewMode === 'list') {
    return (
      <ProductCardList
        product={product}
        currency={currency}
        isAddingToCart={isAddingToCart}
        imageError={imageError}
        onImageError={() => setImageError(true)}
        onAddToCart={handleAddToCart}
      />
    );
  }

  // Grid view layout
  return (
    <ProductCardGrid
      product={product}
      currency={currency}
      isAddingToCart={isAddingToCart}
      imageError={imageError}
      isCompact={isCompact}
      onImageError={() => setImageError(true)}
      onAddToCart={handleAddToCart}
    />
  );
}

