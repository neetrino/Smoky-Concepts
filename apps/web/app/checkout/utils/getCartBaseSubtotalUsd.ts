import { adminInputAmdToUsd, amountToUsd } from '../../../lib/currency';
import type { Cart } from '../types';

/** Full cart merchandise subtotal in USD (matches server checkout `subtotal`). */
export function getCartMerchandiseSubtotalUsd(cart: Cart | null): number | null {
  if (!cart || cart.items.length === 0) {
    return null;
  }
  const cartMoneyCurrency = cart.totals.currency?.trim() || 'USD';
  return amountToUsd(cart.totals.subtotal, cartMoneyCurrency);
}

/**
 * Cart line subtotal in USD excluding size-catalog surcharges (matches checkout order summary base).
 */
export function getCartBaseSubtotalUsd(cart: Cart | null): number | null {
  if (!cart || cart.items.length === 0) {
    return null;
  }

  const cartMoneyCurrency = cart.totals.currency?.trim() || 'USD';
  const subtotalUsd = amountToUsd(cart.totals.subtotal, cartMoneyCurrency);
  const collectionPriceUsd = cart.items.reduce((sum, item) => {
    const priceAmd = item.variant.sizeCatalogCategoryPriceAmd;
    if (typeof priceAmd !== 'number' || priceAmd <= 0) {
      return sum;
    }
    return sum + adminInputAmdToUsd(priceAmd) * item.quantity;
  }, 0);

  return Math.max(0, subtotalUsd - collectionPriceUsd);
}
