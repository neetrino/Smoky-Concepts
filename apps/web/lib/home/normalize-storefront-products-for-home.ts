import type { HomeStorefrontProductListItem } from '@/components/home/homePage.types';

function normalizeImageUrl(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('data:image/') ||
    trimmed.startsWith('/')
  ) {
    return trimmed;
  }
  return `/${trimmed}`;
}

function splitImageValue(value: string): string[] {
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }
  if (trimmed.includes('data:image/')) {
    return [trimmed];
  }
  return trimmed
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function extractImageCandidate(entry: unknown): string | null {
  if (typeof entry === 'string') {
    return entry;
  }
  if (entry && typeof entry === 'object') {
    const source = entry as { url?: unknown; src?: unknown; value?: unknown };
    if (typeof source.url === 'string') {
      return source.url;
    }
    if (typeof source.src === 'string') {
      return source.src;
    }
    if (typeof source.value === 'string') {
      return source.value;
    }
  }
  return null;
}

function toFiniteNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  if (
    value !== null &&
    typeof value === 'object' &&
    'toNumber' in value &&
    typeof (value as { toNumber: () => number }).toNumber === 'function'
  ) {
    const parsed = (value as { toNumber: () => number }).toNumber();
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function toOptionalFiniteNumber(value: unknown): number | null {
  if (value == null) {
    return null;
  }
  const n = toFiniteNumber(value, Number.NaN);
  return Number.isFinite(n) ? n : null;
}

function coerceImageStrings(imagesUnknown: unknown): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  const imageEntries = Array.isArray(imagesUnknown) ? imagesUnknown : [imagesUnknown];
  for (const entry of imageEntries) {
    const candidate = extractImageCandidate(entry);
    if (!candidate) {
      continue;
    }
    const splitCandidates = splitImageValue(candidate);
    for (const item of splitCandidates) {
      const normalized = normalizeImageUrl(item);
      if (!normalized || seen.has(normalized)) {
        continue;
      }
      seen.add(normalized);
      out.push(normalized);
    }
  }
  return out;
}

/**
 * Plain JSON-safe list rows for client components (trending / upcoming).
 * Coerces Prisma Decimal-like values, fills `image` from `images` when needed, drops non-string gallery entries.
 */
export function normalizeStorefrontProductsForHome(rows: unknown[]): HomeStorefrontProductListItem[] {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.map((row): HomeStorefrontProductListItem => {
    const r = row as Record<string, unknown>;
    const images = coerceImageStrings(r.images);
    const primaryRaw = extractImageCandidate(r.image);
    const primaryFromField = primaryRaw ? normalizeImageUrl(splitImageValue(primaryRaw)[0] ?? '') : null;
    const image = primaryFromField || images[0] || null;
    const gallery = images.length > 0 ? images : image ? [image] : [];

    const categories = Array.isArray(r.categories)
      ? r.categories
          .filter((c): c is { id: string; slug: string; title: string } => {
            if (!c || typeof c !== 'object') {
              return false;
            }
            const o = c as Record<string, unknown>;
            return typeof o.id === 'string' && typeof o.slug === 'string' && typeof o.title === 'string';
          })
          .map((c) => {
            const o = c as Record<string, unknown>;
            return { id: o.id as string, slug: o.slug as string, title: o.title as string };
          })
      : [];

    const skus = Array.isArray(r.skus)
      ? r.skus.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      : [];

    const sizeLabels = Array.isArray(r.sizeLabels)
      ? r.sizeLabels.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      : undefined;

    const sizeCatalogCategoryIds = Array.isArray(r.sizeCatalogCategoryIds)
      ? r.sizeCatalogCategoryIds.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      : undefined;

    const sizeCatalogCategoryTitles = Array.isArray(r.sizeCatalogCategoryTitles)
      ? r.sizeCatalogCategoryTitles.filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
      : undefined;

    const sizeLabel = typeof r.sizeLabel === 'string' && r.sizeLabel.trim() ? r.sizeLabel.trim() : undefined;

    return {
      id: String(r.id ?? ''),
      slug: String(r.slug ?? ''),
      title: String(r.title ?? ''),
      price: toFiniteNumber(r.price, 0),
      image,
      images: gallery,
      inStock: r.inStock !== false,
      categories,
      skus,
      brand: null,
      originalPrice: toOptionalFiniteNumber(r.originalPrice),
      defaultVariantId: typeof r.defaultVariantId === 'string' ? r.defaultVariantId : null,
      defaultVariantStock: toFiniteNumber(r.defaultVariantStock, 0),
      defaultSku: typeof r.defaultSku === 'string' ? r.defaultSku.trim() : '',
      sizeLabel,
      sizeLabels,
      sizeCatalogCategoryIds,
      sizeCatalogCategoryTitles,
    };
  });
}
