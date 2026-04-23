import { useMemo } from 'react';
import { adminInputAmdToUsd, amountToUsd } from '../../../lib/currency';
import type { Cart } from '../types';

interface UseOrderSummaryProps {
  cart: Cart | null;
  shippingMethod: 'pickup' | 'delivery';
  deliveryPrice: number | null;
}

export function useOrderSummary({
  cart,
  shippingMethod,
  deliveryPrice,
}: UseOrderSummaryProps) {
  const orderSummary = useMemo(() => {
    if (!cart || cart.items.length === 0) {
      return {
        subtotalUsd: 0,
        taxUsd: 0,
        shippingUsd: 0,
        collectionPriceUsd: 0,
        totalUsd: 0,
        subtotalDisplay: 0,
        taxDisplay: 0,
        shippingDisplay: 0,
        collectionPriceDisplay: 0,
        totalDisplay: 0,
      };
    }

    const cartMoneyCurrency = cart.totals.currency?.trim() || 'USD';
    const subtotalUsd = amountToUsd(cart.totals.subtotal, cartMoneyCurrency);
    const discountUsd = amountToUsd(cart.totals.discount, cartMoneyCurrency);
    const taxUsd = amountToUsd(cart.totals.tax, cartMoneyCurrency);
    const shippingUsd =
      shippingMethod === 'delivery' && deliveryPrice !== null ? adminInputAmdToUsd(deliveryPrice) : 0;
    const collectionPriceUsd = cart.items.reduce((sum, item) => {
      const priceAmd = item.variant.sizeCatalogCategoryPriceAmd;
      if (typeof priceAmd !== 'number' || priceAmd <= 0) {
        return sum;
      }
      return sum + adminInputAmdToUsd(priceAmd) * item.quantity;
    }, 0);
    const totalUsd = subtotalUsd - discountUsd + taxUsd + shippingUsd + collectionPriceUsd;

    return {
      subtotalUsd,
      taxUsd,
      shippingUsd,
      collectionPriceUsd,
      totalUsd,
      subtotalDisplay: subtotalUsd,
      taxDisplay: taxUsd,
      shippingDisplay: shippingUsd,
      collectionPriceDisplay: collectionPriceUsd,
      totalDisplay: totalUsd,
    };
  }, [cart, shippingMethod, deliveryPrice]);

  return { orderSummary };
}
