import { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api-client';

/**
 * Uses the delivery API `city` + `country` query params (admin delivery location).
 */
export function useDeliveryPrice(
  shippingMethod: 'pickup' | 'delivery',
  city: string | undefined,
  country: string | undefined,
) {
  const [deliveryPrice, setDeliveryPrice] = useState<number | null>(null);
  const [loadingDeliveryPrice, setLoadingDeliveryPrice] = useState(false);

  useEffect(() => {
    const fetchDeliveryPrice = async () => {
      const countryNorm = (country && country.trim().length > 0 ? country.trim() : 'Armenia');
      if (shippingMethod === 'delivery' && city && city.trim().length > 0) {
        setLoadingDeliveryPrice(true);
        try {
          const response = await apiClient.get<{ price: number }>('/api/v1/delivery/price', {
            params: {
              city: city.trim(),
              country: countryNorm,
            },
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
  }, [city, country, shippingMethod]);

  return { deliveryPrice, loadingDeliveryPrice };
}




