'use client';

import { Button } from '@shop/ui';
import { useCurrency } from '../../components/hooks/useCurrency';
import { useTranslation } from '../../lib/i18n-client';
import { convertPrice, formatPriceInCurrency } from '../../lib/currency';

interface Cart {
  id: string;
  items: any[];
  totals: {
    subtotal: number;
    discount: number;
    shipping: number;
    tax: number;
    total: number;
    currency: string;
  };
  itemsCount: number;
}

interface OrderSummaryProps {
  cart: Cart | null;
  orderSummary: {
    subtotalDisplay: number;
    taxDisplay: number;
    shippingDisplay: number;
    collectionPriceDisplay: number;
    totalDisplay: number;
  };
  shippingMethod: 'pickup' | 'delivery';
  shippingRegion: string | undefined;
  loadingDeliveryPrice: boolean;
  deliveryPrice: number | null;
  error: string | null;
  isSubmitting: boolean;
  onPlaceOrder: (e?: React.FormEvent) => void;
}

export function OrderSummary({
  cart,
  orderSummary,
  shippingMethod,
  shippingRegion,
  loadingDeliveryPrice,
  deliveryPrice,
  error,
  isSubmitting,
  onPlaceOrder,
}: OrderSummaryProps) {
  const { t } = useTranslation();
  const displayCurrency = useCurrency();
  const formatCheckoutUsd = (amountUsd: number) =>
    formatPriceInCurrency(convertPrice(amountUsd, 'USD', displayCurrency), displayCurrency);

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:sticky lg:top-24">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('checkout.orderSummary')}</h2>
        <div className="space-y-4 mb-6">
          <div className="flex justify-between text-gray-600">
            <span>{t('checkout.summary.subtotal')}</span>
            <span>{formatCheckoutUsd(orderSummary.subtotalDisplay)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>{t('checkout.summary.shipping')}</span>
            <span>
              {shippingMethod === 'pickup' 
                ? t('checkout.shipping.freePickup')
                : loadingDeliveryPrice
                  ? t('checkout.shipping.loading')
                  : deliveryPrice !== null
                    ? formatCheckoutUsd(orderSummary.shippingDisplay) + (shippingRegion ? ` (${shippingRegion})` : ` (${t('checkout.shipping.delivery')})`)
                    : t('checkout.shipping.enterRegion')}
            </span>
          </div>
          {orderSummary.collectionPriceDisplay > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>{t('checkout.summary.collectionPrice')}</span>
              <span>{formatCheckoutUsd(orderSummary.collectionPriceDisplay)}</span>
            </div>
          )}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>{t('checkout.summary.total')}</span>
              <span>
                {formatCheckoutUsd(orderSummary.totalDisplay)}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="gold"
          className="w-full"
          size="lg"
          disabled={isSubmitting}
          onClick={onPlaceOrder}
        >
          {isSubmitting ? t('checkout.buttons.processing') : t('checkout.buttons.placeOrder')}
        </Button>
      </div>
    </div>
  );
}

