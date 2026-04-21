'use client';

import { useEffect, useState } from 'react';

import type { CurrencyCode } from '../../lib/currency';
import { getStoredCurrency } from '../../lib/currency';

/**
 * Storefront display currency synced with localStorage.
 */
export function useCurrency(): CurrencyCode {
  const [currency, setCurrency] = useState<CurrencyCode>('USD');

  useEffect(() => {
    const syncCurrency = () => setCurrency(getStoredCurrency());
    syncCurrency();
    window.addEventListener('currency-updated', syncCurrency);
    return () => window.removeEventListener('currency-updated', syncCurrency);
  }, []);

  return currency;
}
