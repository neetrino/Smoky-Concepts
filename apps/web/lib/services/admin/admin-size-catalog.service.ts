import { db } from "@white-shop/db";

import { type SizeCatalogCategoryDto, type SizeCatalogItemDto } from "@/lib/types/size-catalog";

function normalizeSizeItemVersion(value: string | undefined, fallback = ""): string {
  const normalized = value?.trim();
  if (normalized && normalized.length <= 32) {
    return normalized;
  }
  return fallback;
}

function mapItem(row: {
  id: string;
  title: string;
  imageUrl: string;
  version?: string | null;
  position: number;
  published?: boolean | null;
}): SizeCatalogItemDto {
  return {
    id: row.id,
    title: row.title,
    imageUrl: row.imageUrl,
    version: normalizeSizeItemVersion(row.version ?? undefined),
    position: row.position,
    published: row.published ?? true,
  };
}

type SizeCategoryRow = {
  id: string;
  title: string;
  position: number;
  items: Array<{
    id: string;
    title: string;
    imageUrl: string;
    version?: string | null;
    position: number;
    published?: boolean | null;
  }>;
};

/** Storefront: hide drafts (published === false). Missing field = legacy row, treat as published. */
function isStorefrontSizeItem(item: { published?: boolean | null }): boolean {
  return item.published !== false;
}

function mapCategory(row: SizeCategoryRow): SizeCatalogCategoryDto {
  return {
    id: row.id,
    title: row.title,
    position: row.position,
    items: row.items.map(mapItem),
  };
}

class AdminSizeCatalogService {
  /** Storefront + public API: only published size items. */
  async getStorefrontCatalog(): Promise<{ data: SizeCatalogCategoryDto[] }> {
    const rows = await db.sizeCatalogCategory.findMany({
      orderBy: { position: "asc" },
      include: {
        items: {
          orderBy: { position: "asc" },
        },
      },
    });

    const forStorefront: SizeCategoryRow[] = (rows as SizeCategoryRow[]).map((cat) => ({
      ...cat,
      items: cat.items.filter(isStorefrontSizeItem),
    }));

    return {
      data: forStorefront.map(mapCategory),
    };
  }

  /** Admin list: all items including drafts. */
  async getAdminCatalog(): Promise<{ data: SizeCatalogCategoryDto[] }> {
    const rows = await db.sizeCatalogCategory.findMany({
      orderBy: { position: "asc" },
      include: {
        items: {
          orderBy: { position: "asc" },
        },
      },
    });

    return {
      data: (rows as SizeCategoryRow[]).map(mapCategory),
    };
  }

  async createCategory(data: { title: string }): Promise<{ data: SizeCatalogCategoryDto }> {
    const title = data.title.trim();
    if (!title) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation Error",
        detail: "Title is required",
      };
    }

    const last = await db.sizeCatalogCategory.findFirst({
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const created = await db.sizeCatalogCategory.create({
      data: {
        title,
        position: (last?.position ?? -1) + 1,
      },
      include: { items: true },
    });

    return { data: mapCategory(created) };
  }

  async updateCategory(
    categoryId: string,
    data: { title?: string }
  ): Promise<{ data: SizeCatalogCategoryDto }> {
    const existing = await db.sizeCatalogCategory.findUnique({
      where: { id: categoryId },
      include: { items: { orderBy: { position: "asc" } } },
    });

    if (!existing) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Not Found",
        detail: "Size category not found",
      };
    }

    const title = data.title !== undefined ? data.title.trim() : existing.title;
    if (!title) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation Error",
        detail: "Title is required",
      };
    }

    const updated = await db.sizeCatalogCategory.update({
      where: { id: categoryId },
      data: { title },
      include: { items: { orderBy: { position: "asc" } } },
    });

    return { data: mapCategory(updated) };
  }

  async deleteCategory(categoryId: string): Promise<void> {
    const existing = await db.sizeCatalogCategory.findUnique({
      where: { id: categoryId },
    });

    if (!existing) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Not Found",
        detail: "Size category not found",
      };
    }

    await db.sizeCatalogCategory.delete({
      where: { id: categoryId },
    });
  }

  async createItem(
    categoryId: string,
    data: { title: string; imageUrl: string; version?: string | null; published?: boolean }
  ): Promise<{ data: SizeCatalogItemDto }> {
    const category = await db.sizeCatalogCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Not Found",
        detail: "Size category not found",
      };
    }

    const title = data.title.trim();
    const imageUrl = data.imageUrl.trim();
    const version = normalizeSizeItemVersion(data.version ?? undefined);

    if (!title || !imageUrl) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation Error",
        detail: "Title and image URL are required",
      };
    }

    const last = await db.sizeCatalogItem.findFirst({
      where: { categoryId },
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const published = data.published ?? true;

    const created = await db.sizeCatalogItem.create({
      data: {
        categoryId,
        title,
        imageUrl,
        version: version || "",
        published,
        position: (last?.position ?? -1) + 1,
      },
    });

    return { data: mapItem(created) };
  }

  async updateItem(
    itemId: string,
    data: { title?: string; imageUrl?: string; version?: string | null; published?: boolean }
  ): Promise<{ data: SizeCatalogItemDto }> {
    const existing = await db.sizeCatalogItem.findUnique({
      where: { id: itemId },
    });

    if (!existing) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Not Found",
        detail: "Size item not found",
      };
    }

    const hasVersion = Object.prototype.hasOwnProperty.call(data, "version");
    const title = data.title !== undefined ? data.title.trim() : existing.title;
    const imageUrl = data.imageUrl !== undefined ? data.imageUrl.trim() : existing.imageUrl;
    const existingVersion = normalizeSizeItemVersion(existing.version ?? undefined);
    const version = hasVersion ? normalizeSizeItemVersion(data.version ?? undefined) : existingVersion;
    const published = data.published !== undefined ? data.published : existing.published;

    if (!title || !imageUrl) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation Error",
        detail: "Title and image URL are required",
      };
    }

    const updated = await db.sizeCatalogItem.update({
      where: { id: itemId },
      data: { title, imageUrl, version: hasVersion ? version : undefined, published },
    });

    return { data: mapItem(updated) };
  }

  async deleteItem(itemId: string): Promise<void> {
    const existing = await db.sizeCatalogItem.findUnique({
      where: { id: itemId },
    });

    if (!existing) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Not Found",
        detail: "Size item not found",
      };
    }

    await db.sizeCatalogItem.delete({
      where: { id: itemId },
    });
  }
}

export const adminSizeCatalogService = new AdminSizeCatalogService();
