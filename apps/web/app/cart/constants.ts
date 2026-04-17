/**
 * LocalStorage key for guest cart
 */
export const CART_KEY = 'shop_cart_guest';

/** Dispatched to open the site-wide cart drawer (see `CartDrawer`). */
export const CART_DRAWER_OPEN_EVENT = 'cart-drawer-open';

export function dispatchCartDrawerOpen(productId?: string): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(CART_DRAWER_OPEN_EVENT, {
      detail: productId !== undefined ? { productId } : {},
    })
  );
}

