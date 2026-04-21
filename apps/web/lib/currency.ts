// Storefront catalog and admin UI use USD for pricing (see ADMIN_PRICE_CURRENCY).
// Legacy rows with currency = AMD are converted with a fixed dram-per-USD rate.

export const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  AMD: { code: 'AMD', symbol: '֏', name: 'Armenian Dram', rate: 400 },
  RUB: { code: 'RUB', symbol: '₽', name: 'Russian Ruble', rate: 1 },
} as const;

/** Admin dashboard and product forms: display and label currency. */
export const ADMIN_PRICE_CURRENCY = 'USD' as const;

export type CurrencyCode = keyof typeof CURRENCIES;

const LEGACY_ORDER_DRAM_CODE = 'AMD';
/** Armenian dram units per 1 USD — only for persisted orders with totals in AMD. */
const LEGACY_AMD_PER_USD = 400;

const CURRENCY_STORAGE_KEY = 'shop_currency';

export function getStoredCurrency(): CurrencyCode {
  if (typeof window === 'undefined') return 'USD';
  try {
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY)?.toUpperCase();
    if (stored && stored in CURRENCIES) {
      return stored as CurrencyCode;
    }
    localStorage.setItem(CURRENCY_STORAGE_KEY, 'USD');
  } catch {
    // ignore
  }
  return 'USD';
}

export function setStoredCurrency(currency: CurrencyCode): void {
  if (typeof window === 'undefined') return;
  try {
    const normalized = currency.toUpperCase() as CurrencyCode;
    const next = normalized in CURRENCIES ? normalized : 'USD';
    localStorage.setItem(CURRENCY_STORAGE_KEY, next);
    window.dispatchEvent(new Event('currency-updated'));
  } catch (error) {
    console.error('Failed to save currency:', error);
  }
}

/**
 * Format a price in USD (base unit for the storefront is USD).
 */
export function formatPrice(price: number, _currency: CurrencyCode = 'USD'): string {
  return formatPriceInCurrency(price, 'USD');
}

/**
 * No-op for compatibility (admin settings). Rates are not fetched.
 */
export function clearCurrencyRatesCache(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('currency-rates-updated'));
  }
}

/**
 * No-op; storefront is USD-only and does not load FX rates.
 */
export async function initializeCurrencyRates(_forceReload: boolean = false): Promise<void> {
  return Promise.resolve();
}

export function convertPrice(price: number, _fromCurrency: CurrencyCode, _toCurrency: CurrencyCode): number {
  return price;
}

function legacyDramToUsd(amount: number): number {
  return amount / LEGACY_AMD_PER_USD;
}

function usdToDisplayAmount(amount: number, currency: CurrencyCode): number {
  if (currency === 'AMD') {
    return amount * LEGACY_AMD_PER_USD;
  }
  return amount;
}

/**
 * Catalog, cart snapshots, and delivery API amounts are USD.
 */
export function catalogPriceToUsd(amount: number): number {
  return amount;
}

/**
 * Storefront catalog / PDP: USD without redundant “.00” (e.g. $45 not $45.00).
 * Keeps up to 2 decimals when needed (e.g. $45.99).
 */
export function formatCatalogPrice(amount: number, displayCurrency?: CurrencyCode): string {
  const currency = displayCurrency ?? (typeof window === 'undefined' ? 'USD' : getStoredCurrency());
  const locale = currency === 'RUB' ? 'ru-RU' : currency === 'AMD' ? 'hy-AM' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(usdToDisplayAmount(amount, currency));
}

/**
 * Convert a persisted order/cart total field to USD (legacy AMD rows only).
 */
export function amountToUsd(amount: number, storedCurrency: string | undefined): number {
  const c = (storedCurrency ?? 'USD').trim().toUpperCase();
  if (c === LEGACY_ORDER_DRAM_CODE) {
    return legacyDramToUsd(amount);
  }
  return amount;
}

/** Format a raw order line amount for admin (normalizes legacy AMD, displays in {@link ADMIN_PRICE_CURRENCY}). */
export function formatAdminOrderAmount(amount: number, storedCurrency?: string): string {
  return formatPriceInCurrency(amountToUsd(amount, storedCurrency), ADMIN_PRICE_CURRENCY);
}

export function formatStoredMoney(
  amount: number,
  storedCurrency: string | undefined,
  displayCurrency: string = 'USD',
): string {
  return formatPriceInCurrency(amountToUsd(amount, storedCurrency), displayCurrency);
}

export const STORE_PRICE_CURRENCY: CurrencyCode = 'USD';

export function formatStorePriceForDisplay(amount: number, _displayCurrency: CurrencyCode = 'USD'): string {
  const currency = typeof window === 'undefined' ? 'USD' : getStoredCurrency();
  return formatPriceInCurrency(usdToDisplayAmount(amount, currency), currency);
}

export function formatPriceInCurrency(price: number, currency: string = 'USD'): string {
  const code = currency.trim().toUpperCase();
  const locale = code === 'RUB' ? 'ru-RU' : 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }
}
