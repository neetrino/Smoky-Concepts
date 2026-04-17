export interface SizeCatalogItemDto {
  id: string;
  title: string;
  imageUrl: string;
  position: number;
  published: boolean;
}

export interface SizeCatalogCategoryDto {
  id: string;
  title: string;
  position: number;
  items: SizeCatalogItemDto[];
}
