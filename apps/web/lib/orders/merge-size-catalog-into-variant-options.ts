/**
 * Enriches variant "size" option with catalog title/thumbnail saved on the order line.
 */

export type OrderVariantOptionRow = {
  attributeKey?: string;
  value?: string;
  label?: string;
  imageUrl?: string;
  colors?: unknown;
};

export function mergeSizeCatalogIntoVariantOptions(
  variantOptions: OrderVariantOptionRow[],
  sizeCatalogTitle: string | null | undefined,
  sizeCatalogImageUrl: string | null | undefined
): OrderVariantOptionRow[] {
  const title = sizeCatalogTitle?.trim();
  if (!title) {
    return variantOptions;
  }

  const imgRaw = sizeCatalogImageUrl?.trim();
  const img = imgRaw && imgRaw.length > 0 ? imgRaw : undefined;

  const next = [...variantOptions];
  const idx = next.findIndex((o) => o.attributeKey?.toLowerCase().trim() === 'size');

  if (idx >= 0) {
    const prev = next[idx];
    next[idx] = {
      ...prev,
      label: title,
      imageUrl: img ?? prev.imageUrl,
      value: prev.value && prev.value.trim() !== '' ? prev.value : title,
    };
  } else {
    next.push({
      attributeKey: 'size',
      value: title,
      label: title,
      imageUrl: img,
    });
  }
  return next;
}

/** Accept only http(s) URLs for persisted catalog thumbnails */
export function sanitizeCheckoutImageUrl(raw: unknown): string | undefined {
  if (typeof raw !== 'string') {
    return undefined;
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    return undefined;
  }
  try {
    const u = new URL(trimmed);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') {
      return undefined;
    }
    return trimmed;
  } catch {
    return undefined;
  }
}
