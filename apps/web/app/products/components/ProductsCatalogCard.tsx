'use client';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAddToCart } from '../../../components/hooks/useAddToCart';
import { useCurrency } from '../../../components/hooks/useCurrency';
import { formatCatalogPrice } from '../../../lib/currency';

const BAG_ICON_PATH = '/assets/home/icons/bag.svg';
const CATALOG_BAG_ICON_PATH = '/assets/home/icons/bag-catalog.svg';
const IMAGE_SIZES = '(max-width: 768px) 200px, 240px';
const MAX_IMAGE_DOT_COUNT = 8;

const SECTION_BADGE_CLASS_NAMES: Record<string, string> = {
  Classic: 'bg-[#122a26] text-white',
  Special: 'bg-[#dcc090] text-white',
  Atelier: 'bg-[#731818] text-white',
  Premium: 'bg-[#414141] text-white',
};

export interface CatalogProductCardItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  images?: string[];
  inStock: boolean;
  originalPrice?: number | null;
  /** From list API — required for local-only cart lines */
  defaultVariantId?: string | null;
  defaultVariantStock?: number;
  defaultSku?: string;
}

interface ProductsCatalogCardProps {
  product: CatalogProductCardItem;
  sectionLabel: string;
  sizeLabel: string;
  categoryLabel: string;
  className?: string;
  tightenDetailsUnderImage?: boolean;
  imageScaleBoost?: number;
  imageNudgeDown?: boolean;
  compactLayout?: boolean;
  /** Slightly wider compact card (e.g. PDP related strip) without affecting home/catalog compact rows. */
  widerCompactCard?: boolean;
  /**
   * Home-only: keep the legacy outline bag asset.
   * Everywhere else uses the filled catalog cart icon (`bag-catalog.svg`).
   */
  legacyHomeCartIcon?: boolean;
  /** When true (e.g. carousel drag), product links do not navigate. */
  shouldBlockProductNavigation?: () => boolean;
  /** Omit default card drop shadow (e.g. trending carousel center hero card). */
  suppressShadow?: boolean;
  /** Optional CTA label override for section-specific wording (e.g. Upcoming => Order). */
  buyButtonLabel?: string;
}

/**
 * Canonical Figma-styled product card (catalog, home, related products, legacy grids).
 */
export function ProductsCatalogCard({
  product,
  sectionLabel,
  sizeLabel,
  categoryLabel,
  className,
  tightenDetailsUnderImage = false,
  imageScaleBoost = 0,
  imageNudgeDown = false,
  compactLayout = false,
  widerCompactCard = false,
  legacyHomeCartIcon = false,
  shouldBlockProductNavigation,
  suppressShadow = false,
  buyButtonLabel = 'Buy',
}: ProductsCatalogCardProps) {
  const displayCurrency = useCurrency();
  const isAmdCurrency = displayCurrency === 'AMD';
  const router = useRouter();
  const { isAddingToCart, addToCart } = useAddToCart({
    productId: product.id,
    productSlug: product.slug,
    title: product.title,
    price: product.price ?? 0,
    image: product.image,
    originalPrice: product.originalPrice ?? null,
    inStock: product.inStock,
    defaultVariantId: product.defaultVariantId ?? null,
    defaultVariantStock: product.defaultVariantStock ?? 0,
    defaultSku: product.defaultSku ?? '',
    sizeLabel,
    categoryLabel,
  });
  const productImages = useMemo(() => {
    const rawImages = product.images && product.images.length > 0 ? product.images : [product.image];
    return rawImages.filter(
      (image, index, images): image is string => Boolean(image) && images.indexOf(image) === index
    );
  }, [product.image, product.images]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const visibleDotCount = Math.min(productImages.length, MAX_IMAGE_DOT_COUNT);

  useEffect(() => {
    setActiveImageIndex(0);
  }, [product.id]);

  useEffect(() => {
    setActiveImageIndex((previous) => {
      if (productImages.length === 0) return 0;
      return previous >= productImages.length ? 0 : previous;
    });
  }, [product.id, productImages.length]);

  useEffect(() => {
    setImageError(false);
  }, [activeImageIndex, product.id]);

  const activeImage = productImages[activeImageIndex] ?? product.image;
  const badgeClassName =
    SECTION_BADGE_CLASS_NAMES[sectionLabel] ?? SECTION_BADGE_CLASS_NAMES.Classic;
  const isCompactSize = sizeLabel === 'Compact';
  const compactArticleWidth = widerCompactCard ? 'w-[12rem]' : 'w-[11rem]';
  const cardShadowClass = suppressShadow
    ? 'shadow-none'
    : 'shadow-[0_4px_22.5px_rgba(0,0,0,0.08)]';
  const articleClassName = compactLayout
    ? `relative ${compactArticleWidth} shrink-0 overflow-visible rounded-[1.125rem] bg-white px-3 pb-3 pt-2.5 ${cardShadowClass}`.trim()
    : `relative w-[14.25rem] shrink-0 overflow-visible rounded-[1.375rem] bg-white px-3.5 pb-3.5 pt-3 ${cardShadowClass}`.trim();
  const imageWrapperClassName = compactLayout
    ? widerCompactCard
      ? 'h-[18.5rem]'
      : 'h-[17.75rem]'
    : isCompactSize
      ? 'h-60'
      : 'h-72';
  const baseImagePullUpClassName = compactLayout
    ? '-mt-[6.25rem]'
    : (isCompactSize ? '-mt-16' : '-mt-24');
  const imagePullUpClassName = baseImagePullUpClassName;
  const compactInnerImageHeight = widerCompactCard ? 'h-[17.25rem]' : 'h-[16.5rem]';
  const imageInnerClassName = compactLayout
    ? `${compactInnerImageHeight} w-full`
    : 'h-full w-full';
  const compactBaseScale = imageNudgeDown ? 1.05 : 1.12;
  const compactImageScale = compactBaseScale + imageScaleBoost;
  const imageClassName = compactLayout ? 'object-contain origin-bottom' : 'object-contain';
  const titleClassName = compactLayout ? 'text-[1.0625rem]' : 'text-[1.25rem]';
  const metaTextClassName = compactLayout ? 'text-[0.625rem]' : 'text-[0.75rem]';
  const badgeClassNames = compactLayout
    ? `rounded-[0.375rem] px-[0.375rem] py-[0.125rem] text-[0.625rem] font-medium leading-tight ${badgeClassName}`
    : `rounded-[0.375rem] px-[0.4375rem] py-[0.1875rem] text-[0.75rem] font-medium leading-tight ${badgeClassName}`;
  const priceClassName = compactLayout
    ? 'text-[0.8125rem] sm:text-[0.98rem]'
    : 'text-[0.95rem] sm:text-[1.05rem]';
  const buyButtonClassName = compactLayout
    ? 'inline-flex h-6 min-w-[3.25rem] items-center justify-center rounded-[0.5rem] border-2 border-[#dcc090] px-2 text-[0.75rem] font-extrabold leading-tight text-[#dcc090] transition-colors hover:bg-[#dcc090]/10'
    : 'inline-flex h-[1.625rem] min-w-[3.75rem] items-center justify-center rounded-[0.5rem] border-2 border-[#dcc090] px-3 text-[0.875rem] font-extrabold leading-tight text-[#dcc090] transition-colors hover:bg-[#dcc090]/10';
  const iconClassName = compactLayout ? 'h-4 w-4 object-contain' : 'h-5 w-5 object-contain';
  const catalogBagIconClassName = compactLayout
    ? 'h-6 w-[28px] object-contain'
    : 'h-7 w-9 object-contain';
  const detailsOffsetClassName = compactLayout
    ? tightenDetailsUnderImage
      ? '-mt-[5rem]'
      : '-mt-[3.25rem]'
    : '-mt-4';
  const dotsGapClassName = compactLayout ? 'gap-1' : 'gap-[0.3125rem]';
  const dotsMarginClassName = compactLayout ? 'mb-1' : 'mb-3';

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    addToCart();
  };

  const handleBuyNow = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    await addToCart({ openDrawer: false });
    router.push('/checkout');
  };

  const handleProductLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (shouldBlockProductNavigation?.()) {
      event.preventDefault();
    }
  };

  const formattedPrice = formatCatalogPrice(product.price ?? 0, displayCurrency);
  const amountText = isAmdCurrency ? formattedPrice.replace(/\s?֏$/, '') : formattedPrice;

  return (
    <article className={`${articleClassName} ${className ?? ''}`.trim()}>
      <div
        className={`relative z-10 mb-2 flex items-end justify-center ${imagePullUpClassName} ${imageWrapperClassName} overflow-visible`.trim()}
      >
        <div
          className={`relative ${imageInnerClassName} transition-transform duration-300 ease-out md:group-hover:-translate-y-1.5 md:group-hover:scale-[1.045]`}
        >
          {activeImage && !imageError ? (
            <Link
              href={`/products/${product.slug}`}
              className="block h-full w-full"
              onClick={handleProductLinkClick}
            >
              <Image
                key={`${product.id}-${activeImageIndex}-${activeImage}`}
                src={activeImage}
                alt={product.title}
                fill
                className={imageClassName}
                style={compactLayout ? { transform: `scale(${compactImageScale})` } : undefined}
                sizes={IMAGE_SIZES}
                unoptimized
                onError={() => setImageError(true)}
              />
            </Link>
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-[1rem] bg-[#f1f1ef] text-sm font-medium text-[#9d9d9d]">
              No Image
            </div>
          )}
        </div>
      </div>

      <div className={`relative z-20 ${detailsOffsetClassName}`}>
        {productImages.length > 1 ? (
          <div
            className={`flex ${dotsGapClassName} ${dotsMarginClassName}`}
            role="tablist"
            aria-label="Product images"
          >
            {Array.from({ length: visibleDotCount }).map((_, index) => {
              const isActive = index === activeImageIndex;

              return (
                <button
                  key={`${product.id}-dot-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setActiveImageIndex(index);
                  }}
                  className="relative flex h-3 w-[1.625rem] cursor-pointer items-center"
                  aria-label={`Select product image ${index + 1}`}
                >
                  <span
                    className={`block h-[0.25rem] w-full rounded-[0.15625rem] transition-colors ${
                      isActive ? 'bg-[#122a26]' : 'bg-[#d9d9d9]'
                    }`}
                  />
                </button>
              );
            })}
          </div>
        ) : (
          <div className={dotsMarginClassName} aria-hidden />
        )}

        <Link href={`/products/${product.slug}`} className="block" onClick={handleProductLinkClick}>
          <h3 className={`line-clamp-1 font-extrabold leading-tight text-[#414141] ${titleClassName}`}>
            {product.title}
          </h3>
        </Link>

        <div className={compactLayout ? 'mt-0.5 flex items-center gap-1.5' : 'mt-2 flex items-center gap-2'}>
          <span className={`font-medium leading-tight text-[#9d9d9d] ${metaTextClassName}`}>{sizeLabel}</span>
          <span className={badgeClassNames}>
            {categoryLabel}
          </span>
        </div>

        <div className={compactLayout ? 'mt-2 flex items-center justify-between gap-2' : 'mt-5 flex items-center justify-between gap-3'}>
          <span className={`font-extrabold leading-tight text-black ${priceClassName}`}>
            {amountText}
            {isAmdCurrency ? <span className="ml-1 text-[0.78em]">֏</span> : null}
          </span>

          <div className="flex items-center gap-0.5">
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!product.inStock || isAddingToCart}
              className={buyButtonClassName}
            >
              {buyButtonLabel}
            </button>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock || isAddingToCart}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={product.inStock ? 'Add to cart' : 'Out of stock'}
              title={product.inStock ? 'Add to cart' : 'Out of stock'}
            >
              {isAddingToCart ? (
                <svg className="h-6 w-6 animate-spin text-[#dcc090]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <Image
                  src={legacyHomeCartIcon ? BAG_ICON_PATH : CATALOG_BAG_ICON_PATH}
                  alt=""
                  width={legacyHomeCartIcon ? 20 : 32}
                  height={legacyHomeCartIcon ? 20 : 32}
                  aria-hidden
                  className={legacyHomeCartIcon ? iconClassName : catalogBagIconClassName}
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
