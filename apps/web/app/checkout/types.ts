export type { Cart, CartItem } from '../cart/types';

export type CheckoutFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  shippingMethod: 'pickup' | 'delivery';
  paymentMethod: 'idram' | 'arca' | 'cash_on_delivery';
  shippingAddress?: string;
  /** Admin delivery location id (order stores region label in shippingAddress.state) */
  shippingRegion?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardHolderName?: string;
};
