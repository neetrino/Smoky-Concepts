'use client';

import Link from 'next/link';
import { Card, Button } from '@shop/ui';
import { useCurrency } from '../../../../components/hooks/useCurrency';
import { dispatchCartDrawerOpen } from '../../../cart/constants';
import { useTranslation } from '../../../../lib/i18n-client';
import { adminInputAmdToUsd, amountToUsd, convertPrice, formatPriceInCurrency } from '../../../../lib/currency';
import type { Order } from '../types';

interface OrderSummaryProps {
  order: Order;
  calculatedShipping: number | null;
  loadingShipping: boolean;
}

export function OrderSummary({
  order,
  calculatedShipping,
  loadingShipping,
}: OrderSummaryProps) {
  const { t } = useTranslation();
  const displayCurrency = useCurrency();
  const formatOrderMoneyUsd = (amountUsd: number) =>
    formatPriceInCurrency(convertPrice(amountUsd, 'USD', displayCurrency), displayCurrency);

  const storedCurrency = order.totals.currency;

  const subtotalUsd = amountToUsd(order.totals.subtotal, storedCurrency);
  const collectionPriceUsd = amountToUsd(
    order.totals.collectionPriceAmount ?? order.collectionPriceAmount ?? 0,
    'USD',
  );
  const subtotalWithoutCollectionUsd = Math.max(0, subtotalUsd - collectionPriceUsd);

  const discountUsd =
    order.totals.discount > 0 ? amountToUsd(order.totals.discount, storedCurrency) : 0;

  const shippingUsd =
    order.shippingMethod === 'pickup'
      ? 0
      : calculatedShipping !== null
        ? adminInputAmdToUsd(calculatedShipping)
        : amountToUsd(order.totals.shipping, storedCurrency);

  const taxUsd = amountToUsd(order.totals.tax, storedCurrency);

  const totalUsd =
    subtotalWithoutCollectionUsd - discountUsd + shippingUsd + taxUsd + collectionPriceUsd;

  const shippingDisplay =
    order.shippingMethod === 'pickup'
      ? t('checkout.shipping.freePickup')
      : loadingShipping
        ? t('checkout.shipping.loading')
        : formatOrderMoneyUsd(shippingUsd) +
          (order.shippingAddress?.city || order.shippingAddress?.state
            ? ` (${order.shippingAddress.city || order.shippingAddress.state})`
            : '');

  return (
    <Card className="p-6 sticky top-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('orders.orderSummary.title')}</h2>
      <div className="space-y-4 mb-6">
        {order.totals ? (
          <>
            <div className="flex justify-between text-gray-600">
              <span>{t('orders.orderSummary.subtotal')}</span>
              <span>{formatOrderMoneyUsd(subtotalWithoutCollectionUsd)}</span>
            </div>
            {order.totals.discount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>{t('orders.orderSummary.discount')}</span>
                <span>-{formatOrderMoneyUsd(discountUsd)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>{t('orders.orderSummary.shipping')}</span>
              <span>{shippingDisplay}</span>
            </div>
            {collectionPriceUsd > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>{t('orders.orderSummary.collectionPrice')}</span>
                <span>{formatOrderMoneyUsd(collectionPriceUsd)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-lg font-bold text-gray-900">
                <span>{t('orders.orderSummary.total')}</span>
                <span>{formatOrderMoneyUsd(totalUsd)}</span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-gray-600">{t('orders.orderSummary.loadingTotals')}</div>
        )}
      </div>

      <div className="space-y-3">
        <Link href="/products">
          <Button variant="gold" className="w-full">
            {t('orders.buttons.continueShopping')}
          </Button>
        </Link>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={() => dispatchCartDrawerOpen()}
        >
          {t('orders.buttons.viewCart')}
        </Button>
      </div>
    </Card>
  );
}
