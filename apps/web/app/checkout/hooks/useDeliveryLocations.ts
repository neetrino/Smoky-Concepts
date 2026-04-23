import { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api-client';

export type DeliveryLocationOption = {
  id: string;
  city: string;
  country: string;
};

export function useDeliveryLocations() {
  const [locations, setLocations] = useState<DeliveryLocationOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get<{ locations: DeliveryLocationOption[] }>(
          '/api/v1/delivery/locations',
        );
        if (cancelled) {
          return;
        }
        const list = [...(res.locations || [])].sort((a, b) =>
          a.city.localeCompare(b.city, undefined, { sensitivity: 'base' }),
        );
        setLocations(list);
      } catch {
        if (!cancelled) {
          setLocations([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { deliveryLocations: locations, loadingDeliveryLocations: loading };
}
