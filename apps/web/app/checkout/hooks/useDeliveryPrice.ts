import { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api-client';

/**
 * Uses the delivery API `city` + `country` query params (admin delivery location).
 */
export function useDeliveryPrice(
  shippingMethod: 'pickup' | 'delivery',
  city: string | undefined,
  country: string | undefined,
  /** Cart merchandise subtotal in USD (for free-delivery threshold); omit when unknown. */
  merchandiseSubtotalUsd: number | null,
) {
  const [deliveryPrice, setDeliveryPrice] = useState<number | null>(null);
  const [loadingDeliveryPrice, setLoadingDeliveryPrice] = useState(false);

  useEffect(() => {
    const fetchDeliveryPrice = async () => {
      const countryNorm = (country && country.trim().length > 0 ? country.trim() : 'Armenia');
      if (shippingMethod === 'delivery' && city && city.trim().length > 0) {
        setLoadingDeliveryPrice(true);
        try {
          const params: Record<string, string> = {
            city: city.trim(),
            country: countryNorm,
          };
          if (merchandiseSubtotalUsd !== null && Number.isFinite(merchandiseSubtotalUsd) && merchandiseSubtotalUsd >= 0) {
            params.subtotalUsd = String(merchandiseSubtotalUsd);
          }
          const response = await apiClient.get<{ price: number }>('/api/v1/delivery/price', {
            params,
          });
          setDeliveryPrice(response.price);
        } catch {
          setDeliveryPrice(0);
        } finally {
          setLoadingDeliveryPrice(false);
        }
      } else {
        setDeliveryPrice(null);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchDeliveryPrice();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [city, country, shippingMethod, merchandiseSubtotalUsd]);

  return { deliveryPrice, loadingDeliveryPrice };
}




