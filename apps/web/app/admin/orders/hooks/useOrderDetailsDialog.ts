'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { apiClient } from '../../../../lib/api-client';
import { useTranslation } from '../../../../lib/i18n-client';
import { formatAdminOrderAmount } from '../../../../lib/currency';
import type { Order, OrderDetails } from '../useOrders';
import {
  getAdminOrderDetailsCache,
  setAdminOrderDetailsCache,
} from './adminOrderDetailsCache';

const PREFETCH_POINTER_DELAY_MS = 120;

export function useOrderDetailsDialog(options: {
  applyOrderListPatch: (orderId: string, patch: Partial<Order>) => void;
}) {
  const { applyOrderListPatch } = options;
  const { t } = useTranslation();
  const [detailsOrderId, setDetailsOrderId] = useState<string | null>(null);
  const [detailHeaderHint, setDetailHeaderHint] = useState<string | null>(null);
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPaymentStatus, setUpdatingPaymentStatus] = useState(false);

  const prefetchTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const prefetchInFlightRef = useRef<Set<string>>(new Set());

  const closeDetails = useCallback(() => {
    setDetailsOrderId(null);
    setDetailHeaderHint(null);
    setOrderDetails(null);
    setError(null);
    setLoading(false);
  }, []);

  const openDetails = useCallback((orderId: string, listOrderNumber?: string) => {
    setDetailsOrderId(orderId);
    setDetailHeaderHint(listOrderNumber ?? null);
    setError(null);
    const hit = getAdminOrderDetailsCache(orderId);
    if (hit) {
      setOrderDetails(hit);
      setLoading(false);
    } else {
      setOrderDetails(null);
      setLoading(true);
    }
  }, []);

  const prefetchOrderDetails = useCallback((orderId: string) => {
    if (getAdminOrderDetailsCache(orderId)) {
      return;
    }
    if (prefetchInFlightRef.current.has(orderId)) {
      return;
    }
    const existingTimer = prefetchTimersRef.current.get(orderId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    const timer = setTimeout(() => {
      prefetchTimersRef.current.delete(orderId);
      if (prefetchInFlightRef.current.has(orderId) || getAdminOrderDetailsCache(orderId)) {
        return;
      }
      prefetchInFlightRef.current.add(orderId);
      void apiClient
        .get<OrderDetails>(`/api/v1/admin/orders/${orderId}`)
        .then((response) => {
          setAdminOrderDetailsCache(orderId, response);
        })
        .catch(() => {
          /* prefetch is best-effort */
        })
        .finally(() => {
          prefetchInFlightRef.current.delete(orderId);
        });
    }, PREFETCH_POINTER_DELAY_MS);
    prefetchTimersRef.current.set(orderId, timer);
  }, []);

  useEffect(() => {
    return () => {
      for (const timer of prefetchTimersRef.current.values()) {
        clearTimeout(timer);
      }
      prefetchTimersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (!detailsOrderId) {
      return;
    }
    let cancelled = false;
    const id = detailsOrderId;
    const cached = getAdminOrderDetailsCache(id);

    if (cached) {
      setOrderDetails(cached);
      setLoading(false);
    } else {
      setOrderDetails(null);
      setLoading(true);
    }
    setError(null);

    const run = async () => {
      try {
        const response = await apiClient.get<OrderDetails>(`/api/v1/admin/orders/${id}`);
        if (cancelled) {
          return;
        }
        setOrderDetails(response);
        setAdminOrderDetailsCache(id, response);
      } catch (fetchError: unknown) {
        if (cancelled) {
          return;
        }
        const apiError = fetchError as { message?: string };
        if (!cached) {
          setOrderDetails(null);
          setError(apiError.message || t('admin.orders.orderDetails.failedToLoad'));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [detailsOrderId, t]);

  const formatCurrency = useCallback(
    (amount: number, _orderCurrency?: string, storedAs?: string): string =>
      formatAdminOrderAmount(amount, storedAs),
    []
  );

  const handleDetailsStatusChange = useCallback(
    async (newStatus: string) => {
      if (!detailsOrderId || !orderDetails || updatingStatus || orderDetails.status === newStatus) {
        return;
      }
      try {
        setUpdatingStatus(true);
        await apiClient.put(`/api/v1/admin/orders/${detailsOrderId}`, { status: newStatus });
        const next = { ...orderDetails, status: newStatus };
        setOrderDetails(next);
        setAdminOrderDetailsCache(detailsOrderId, next);
        applyOrderListPatch(detailsOrderId, { status: newStatus });
      } catch (updateError: unknown) {
        const apiError = updateError as { message?: string };
        alert(apiError.message || t('admin.orders.failedToUpdateStatus'));
      } finally {
        setUpdatingStatus(false);
      }
    },
    [detailsOrderId, orderDetails, updatingStatus, applyOrderListPatch, t]
  );

  const handleDetailsPaymentStatusChange = useCallback(
    async (newPaymentStatus: string) => {
      if (
        !detailsOrderId ||
        !orderDetails ||
        updatingPaymentStatus ||
        orderDetails.paymentStatus === newPaymentStatus
      ) {
        return;
      }
      try {
        setUpdatingPaymentStatus(true);
        await apiClient.put(`/api/v1/admin/orders/${detailsOrderId}`, {
          paymentStatus: newPaymentStatus,
        });
        const next = { ...orderDetails, paymentStatus: newPaymentStatus };
        setOrderDetails(next);
        setAdminOrderDetailsCache(detailsOrderId, next);
        applyOrderListPatch(detailsOrderId, { paymentStatus: newPaymentStatus });
      } catch (updateError: unknown) {
        const apiError = updateError as { message?: string };
        alert(apiError.message || t('admin.orders.failedToUpdatePaymentStatus'));
      } finally {
        setUpdatingPaymentStatus(false);
      }
    },
    [detailsOrderId, orderDetails, updatingPaymentStatus, applyOrderListPatch, t]
  );

  return {
    detailsOpen: detailsOrderId !== null,
    detailHeaderHint,
    orderDetails,
    detailsLoading: loading,
    detailsError: error,
    openDetails,
    closeDetails,
    prefetchOrderDetails,
    formatCurrency,
    updatingStatus,
    updatingPaymentStatus,
    handleDetailsStatusChange,
    handleDetailsPaymentStatusChange,
  };
}
