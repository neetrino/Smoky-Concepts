/**
 * Deep link from home “Check Availability” (pack fit): `/products?selectSize=1`
 * opens the size catalog modal once; the catalog strips this param after handling.
 */
export const CATALOG_SELECT_SIZE_AUTOOPEN_QUERY = 'selectSize';
export const CATALOG_SELECT_SIZE_AUTOOPEN_VALUE = '1';

export function getProductsPathWithSelectSizeAutopen(): string {
  const params = new URLSearchParams();
  params.set(CATALOG_SELECT_SIZE_AUTOOPEN_QUERY, CATALOG_SELECT_SIZE_AUTOOPEN_VALUE);
  return `/products?${params.toString()}`;
}
