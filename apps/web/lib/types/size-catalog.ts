export interface SizeCatalogItemDto {
  id: string;
  categoryId: string;
  categoryTitle: string;
  categoryPriceAmd: number;
  title: string;
  imageUrl: string;
  version: string;
  position: number;
  published: boolean;
}

export interface SizeCatalogCategoryDto {
  id: string;
  title: string;
  priceAmd: number;
  position: number;
  items: SizeCatalogItemDto[];
}
