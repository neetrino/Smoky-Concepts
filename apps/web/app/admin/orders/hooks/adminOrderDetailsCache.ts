import type { OrderDetails } from '../useOrders';

/** How long cached admin order payloads stay usable (stale-while-revalidate still refreshes). */
const ADMIN_ORDER_DETAILS_CACHE_TTL_MS = 90_000;

type CachedEntry = { data: OrderDetails; storedAtMs: number };

const cacheByOrderId = new Map<string, CachedEntry>();

export function getAdminOrderDetailsCache(orderId: string): OrderDetails | null {
  const entry = cacheByOrderId.get(orderId);
  if (!entry) {
    return null;
  }
  if (Date.now() - entry.storedAtMs > ADMIN_ORDER_DETAILS_CACHE_TTL_MS) {
    cacheByOrderId.delete(orderId);
    return null;
  }
  return entry.data;
}

export function setAdminOrderDetailsCache(orderId: string, data: OrderDetails): void {
  cacheByOrderId.set(orderId, { data, storedAtMs: Date.now() });
}

/** Keeps cache aligned when the list row updates status / payment without opening the modal. */
export function patchAdminOrderDetailsCache(
  orderId: string,
  patch: { status?: string; paymentStatus?: string }
): void {
  const entry = cacheByOrderId.get(orderId);
  if (!entry) {
    return;
  }
  cacheByOrderId.set(orderId, {
    storedAtMs: entry.storedAtMs,
    data: { ...entry.data, ...patch },
  });
}
