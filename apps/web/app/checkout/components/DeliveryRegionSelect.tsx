'use client';

import { UseFormRegister } from 'react-hook-form';
import { useTranslation } from '../../../lib/i18n-client';
import type { CheckoutFormData } from '../types';
import type { DeliveryLocationOption } from '../hooks/useDeliveryLocations';

interface DeliveryRegionSelectProps {
  register: UseFormRegister<CheckoutFormData>;
  error?: string;
  disabled: boolean;
  locations: DeliveryLocationOption[];
  loading: boolean;
  onAfterChange?: () => void;
}

export function DeliveryRegionSelect({
  register,
  error,
  disabled,
  locations,
  loading,
  onAfterChange,
}: DeliveryRegionSelectProps) {
  const { t } = useTranslation();
  const reg = register('shippingRegion');

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="checkout-shipping-region">
        {t('checkout.form.region')}
      </label>
      <select
        id="checkout-shipping-region"
        name={reg.name}
        ref={reg.ref}
        onBlur={reg.onBlur}
        onChange={(e) => {
          reg.onChange(e);
          onAfterChange?.();
        }}
        disabled={disabled || loading}
        className={`w-full px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">
          {loading ? t('checkout.shipping.loading') : t('checkout.placeholders.selectRegion')}
        </option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.country ? `${loc.city} (${loc.country})` : loc.city}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
