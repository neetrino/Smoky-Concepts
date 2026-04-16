/**
 * Checkout types for orders service
 */

export interface CheckoutData {
  items?: Array<{
    variantId: string;
    productId: string;
    quantity: number;
    /** Size catalog pick from PDP (optional) */
    sizeCatalogTitle?: string;
    sizeCatalogImageUrl?: string;
    /** PDP text customize (optional; sanitized server-side) */
    customizePlain?: string;
    customizeHtml?: string;
  }>;
  email: string;
  phone: string;
  shippingMethod?: string;
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryCode?: string;
    phone?: string;
  };
  shippingAmount?: number;
  paymentMethod?: string;
  billingAddress?: {
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    countryCode?: string;
    phone?: string;
  };
}




