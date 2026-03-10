import { db } from "@white-shop/db";
import { Prisma } from "@prisma/client";
import { adminService } from "./admin.service";

class ProductsFiltersService {
  /**
   * Get price range
   */
  async getPriceRange(filters: { category?: string; lang?: string }) {
    const where: Prisma.ProductWhereInput = {
      published: true,
      deletedAt: null,
    };

    if (filters.category) {
      const categoryDoc = await db.category.findFirst({
        where: {
          translations: {
            some: {
              slug: filters.category,
              locale: filters.lang || "en",
            },
          },
        },
      });

      if (categoryDoc) {
        where.OR = [
          { primaryCategoryId: categoryDoc.id },
          { categoryIds: { has: categoryDoc.id } },
        ];
      }
    }

    const products = await db.product.findMany({
      where,
      include: {
        variants: {
          where: {
            published: true,
          },
        },
      },
    });

    let minPrice = Infinity;
    let maxPrice = 0;

    products.forEach((product: { variants: Array<{ price: number }> }) => {
      if (product.variants.length > 0) {
        const prices = product.variants.map((v: { price: number }) => v.price);
        const productMin = Math.min(...prices);
        const productMax = Math.max(...prices);
        if (productMin < minPrice) minPrice = productMin;
        if (productMax > maxPrice) maxPrice = productMax;
      }
    });

    minPrice = minPrice === Infinity ? 0 : Math.floor(minPrice / 1000) * 1000;
    maxPrice = maxPrice === 0 ? 100000 : Math.ceil(maxPrice / 1000) * 1000;

    // Load price filter settings to provide optional step sizes per currency
    let stepSize: number | null = null;
    let stepSizePerCurrency: {
      USD?: number;
      AMD?: number;
      RUB?: number;
      GEL?: number;
    } | null = null;

    try {
      const settings = await adminService.getPriceFilterSettings();
      stepSize = settings.stepSize ?? null;

      if (settings.stepSizePerCurrency) {
        // stepSizePerCurrency in settings is stored in display currency units.
        // Here we pass them through to the frontend as-is; the slider logic
        // will choose the appropriate value for the active currency.
        stepSizePerCurrency = {
          USD: settings.stepSizePerCurrency.USD ?? undefined,
          AMD: settings.stepSizePerCurrency.AMD ?? undefined,
          RUB: settings.stepSizePerCurrency.RUB ?? undefined,
          GEL: settings.stepSizePerCurrency.GEL ?? undefined,
        };
      }
    } catch (error) {
      console.error('❌ [PRODUCTS FILTERS SERVICE] Error loading price filter settings for price range:', error);
    }

    return {
      min: minPrice,
      max: maxPrice,
      stepSize,
      stepSizePerCurrency,
    };
  }
}

export const productsFiltersService = new ProductsFiltersService();






