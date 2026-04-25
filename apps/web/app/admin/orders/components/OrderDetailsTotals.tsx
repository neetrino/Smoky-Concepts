'use client';

import { useTranslation } from '../../../../lib/i18n-client';
import { Card } from '@shop/ui';
import {
  ADMIN_PRICE_CURRENCY,
  amountToUsd,
  convertPrice,
  formatPriceInCurrency,
  formatStoredMoney,
} from '../../../../lib/currency';
import type { OrderDetails } from '../useOrders';

const LEGACY_COLLECTION_AMD_PER_USD = 400;

interface OrderDetailsTotalsProps {
  orderDetails: OrderDetails;
  currency: string;
  formatCurrency: (amount: number, orderCurrency?: string, storedCurrency?: string) => string;
}

export function OrderDetailsTotals({
  orderDetails,
  currency: _currency,
  formatCurrency,
}: OrderDetailsTotalsProps) {
  const { t } = useTranslation();

  if (!orderDetails.totals) {
    return null;
  }

  const storedTotalsCurrency = orderDetails.totals.currency || 'USD';
  const collectionUsd = amountToUsd(
    orderDetails.totals.collectionPriceAmount ?? orderDetails.collectionPriceAmount ?? 0,
    'USD',
  );
  const subtotalWithoutCollection = Math.max(
    0,
    amountToUsd(orderDetails.totals.subtotal, storedTotalsCurrency) - collectionUsd,
  );
  const collectionDisplay = collectionUsd * LEGACY_COLLECTION_AMD_PER_USD;

  return (
    <Card className="p-4 md:p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">{t('orders.orderSummary.title')}</h3>
      <div className="space-y-3">
        <div className="flex justify-between text-sm text-gray-700">
          <span>{t('orders.orderSummary.subtotal')}</span>
          <span>{formatPriceInCurrency(convertPrice(subtotalWithoutCollection, 'USD', ADMIN_PRICE_CURRENCY), ADMIN_PRICE_CURRENCY)}</span>
        </div>
        {orderDetails.totals.discount > 0 && (
          <div className="flex justify-between text-sm text-gray-700">
            <span>{t('orders.orderSummary.discount')}</span>
            <span>-{formatCurrency(orderDetails.totals.discount, ADMIN_PRICE_CURRENCY, storedTotalsCurrency)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-gray-700">
          <span>{t('orders.orderSummary.shipping')}</span>
          <span>
            {orderDetails.shippingMethod === 'pickup'
              ? t('checkout.shipping.freePickup')
              : formatStoredMoney(orderDetails.totals.shipping, storedTotalsCurrency, ADMIN_PRICE_CURRENCY) +
                (orderDetails.shippingAddress?.city || orderDetails.shippingAddress?.state
                  ? ` (${orderDetails.shippingAddress.city || orderDetails.shippingAddress.state})`
                  : '')}
          </span>
        </div>
        <div className="flex justify-between text-sm text-gray-700">
          <span>{t('orders.orderSummary.tax')}</span>
          <span>{formatCurrency(orderDetails.totals.tax, ADMIN_PRICE_CURRENCY, storedTotalsCurrency)}</span>
        </div>
        {collectionUsd > 0 && (
          <div className="flex justify-between text-sm text-gray-700">
            <span>{t('orders.orderSummary.collectionPrice')}</span>
            <span>{formatPriceInCurrency(collectionDisplay, ADMIN_PRICE_CURRENCY)}</span>
          </div>
        )}
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>{t('orders.orderSummary.total')}</span>
            <span>
              {(() => {
                const discountUsd = amountToUsd(orderDetails.totals.discount, storedTotalsCurrency);
                const shippingUsd = amountToUsd(orderDetails.totals.shipping, storedTotalsCurrency);
                const taxUsd = amountToUsd(orderDetails.totals.tax, storedTotalsCurrency);
                const baseTotalDisplay = convertPrice(
                  subtotalWithoutCollection - discountUsd + shippingUsd + taxUsd,
                  'USD',
                  ADMIN_PRICE_CURRENCY,
                );
                const totalDisplay = baseTotalDisplay + collectionDisplay;
                return formatPriceInCurrency(totalDisplay, ADMIN_PRICE_CURRENCY);
              })()}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
