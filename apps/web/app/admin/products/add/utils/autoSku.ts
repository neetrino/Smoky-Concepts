/**
 * Builds a stable SKU prefix from a product slug (admin product form).
 * Matches submit-time fallbacks: uppercase slug or PROD when empty.
 */
export function buildAutoSkuBaseFromSlug(slug: string): string {
  const raw = (slug || '').trim();
  if (raw === '') {
    return 'PROD';
  }
  return raw.toUpperCase();
}

/**
 * Default-pricing / selectable variant row when API sends no SKU (edit load).
 */
export function buildAutoSkuForVariantIndex(slug: string, index: number): string {
  const base = buildAutoSkuBaseFromSlug(slug);
  return `${base}-V${index + 1}`;
}
