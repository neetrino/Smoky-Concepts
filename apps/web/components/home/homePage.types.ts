export type HomeBadgeTone = 'dark' | 'gold' | 'wine' | 'charcoal';

export interface HomeSimpleCardItem {
  title: string;
  imageSrc: string;
}

export interface HomeCoverCollectionItem {
  title: string;
  slug: string;
  imageSrc?: string;
}

export interface HomePackFitItem {
  title: string;
  subtitle?: string;
  heightClassName: string;
  widthClassName: string;
  useCompactImage?: boolean;
}

export interface HomeProductItem {
  name: string;
  size: string;
  price: string;
  imageSrc: string;
  badge: string;
  badgeTone: HomeBadgeTone;
  actionLabel: string;
  compact?: boolean;
  faded?: boolean;
  /** When set, card and action link to product page */
  slug?: string;
}

/** JSON-safe storefront row for home trending / upcoming sections */
export interface HomeStorefrontProductListItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  image: string | null;
  images: string[];
  inStock: boolean;
  categories: { id: string; slug: string; title: string }[];
  skus: string[];
  brand: string | null;
  originalPrice: number | null;
  defaultVariantId: string | null;
  defaultVariantStock: number;
  defaultSku: string;
  sizeLabel?: string;
  sizeLabels?: string[];
  sizeCatalogCategoryIds?: string[];
  sizeCatalogCategoryTitles?: string[];
}

export interface HomeRitualStep {
  step: string;
  title: string;
  description: string;
}
