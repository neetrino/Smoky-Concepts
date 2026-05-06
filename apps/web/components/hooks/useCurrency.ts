'use client';

import { useEffect, useState } from 'react';

import type { CurrencyCode } from '../../lib/currency';
import {
  enableClientCurrencyStorageReads,
  getStoredCurrency,
  STORE_PRICE_CURRENCY,
} from '../../lib/currency';

/**
 * Storefront display currency synced with localStorage.
 */
export function useCurrency(): CurrencyCode {
  const [currency, setCurrency] = useState<CurrencyCode>(STORE_PRICE_CURRENCY);

  useEffect(() => {
    enableClientCurrencyStorageReads();
    const syncCurrency = () => setCurrency(getStoredCurrency());
    syncCurrency();
    window.addEventListener('currency-updated', syncCurrency);
    window.addEventListener('currency-rates-updated', syncCurrency);
    return () => {
      window.removeEventListener('currency-updated', syncCurrency);
      window.removeEventListener('currency-rates-updated', syncCurrency);
    };
  }, []);

  return currency;
}
