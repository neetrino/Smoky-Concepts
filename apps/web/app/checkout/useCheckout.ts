import { useState, useEffect, useMemo } from 'react';
import { getCartMerchandiseSubtotalUsd } from './utils/getCartBaseSubtotalUsd';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { getStoredLanguage } from '../../lib/language';
import { useAuth } from '../../lib/auth/AuthContext';
import { useTranslation } from '../../lib/i18n-client';
import { usePaymentMethods } from './utils/payment-methods';
import { useCheckoutSchema } from './utils/validation-schema';
import { useDeliveryPrice } from './hooks/useDeliveryPrice';
import { useDeliveryLocations } from './hooks/useDeliveryLocations';
import { useCart } from './hooks/useCart';
import { useUserProfile } from './hooks/useUserProfile';
import { useOrderSubmission } from './hooks/useOrderSubmission';
import { useOrderSummary } from './hooks/useOrderSummary';
import type { CheckoutFormData } from './types';

export function useCheckout() {
  const { isLoggedIn, isLoading } = useAuth();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState(getStoredLanguage());
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});
  const [showShippingModal, setShowShippingModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);

  const paymentMethods = usePaymentMethods();
  const checkoutSchema = useCheckoutSchema();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      shippingMethod: 'delivery',
      paymentMethod: 'cash_on_delivery',
      shippingAddress: '',
      shippingRegion: '',
      cardNumber: '',
      cardExpiry: '',
      cardCvv: '',
      cardHolderName: '',
    },
  });

  const paymentMethod = watch('paymentMethod');
  const shippingMethod = watch('shippingMethod');
  const shippingRegion = watch('shippingRegion');

  const { deliveryLocations, loadingDeliveryLocations } = useDeliveryLocations();

  const activeDeliveryLocation = useMemo(
    () => deliveryLocations.find((l) => l.id === shippingRegion),
    [deliveryLocations, shippingRegion],
  );

  const shippingRegionSummary = activeDeliveryLocation?.city ?? shippingRegion ?? '';

  const { cart, loading, fetchCart } = useCart();

  const merchandiseSubtotalUsd = useMemo(() => getCartMerchandiseSubtotalUsd(cart), [cart]);

  const { deliveryPrice, loadingDeliveryPrice } = useDeliveryPrice(
    shippingMethod,
    activeDeliveryLocation?.city,
    activeDeliveryLocation?.country,
    merchandiseSubtotalUsd,
  );
  useUserProfile(isLoggedIn, isLoading, setValue, deliveryLocations);

  const { submitOrder } = useOrderSubmission({
    cart,
    deliveryPrice,
    setError,
    deliveryLocations,
  });

  const { orderSummary } = useOrderSummary({
    cart,
    shippingMethod,
    deliveryPrice,
  });

  useEffect(() => {
    if (isLoading) {
      return;
    }

    fetchCart();

    const handleLanguageUpdate = () => {
      setLanguage(getStoredLanguage());
    };

    window.addEventListener('language-updated', handleLanguageUpdate);

    return () => {
      window.removeEventListener('language-updated', handleLanguageUpdate);
    };
  }, [isLoggedIn, isLoading, fetchCart]);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = watch();
    const hasShippingAddress = formData.shippingAddress && formData.shippingAddress.trim().length > 0;
    const hasShippingRegion = formData.shippingRegion && formData.shippingRegion.trim().length > 0;

    if (!hasShippingAddress || !hasShippingRegion) {
      setError(t('checkout.errors.fillShippingAddress'));
      const shippingSection = document.querySelector('[data-shipping-section]');
      if (shippingSection) {
        shippingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    if (paymentMethod === 'arca' || paymentMethod === 'idram') {
      setShowCardModal(true);
      return;
    }
    
    handleSubmit(submitOrder)(e);
  };

  const onSubmit = (data: CheckoutFormData) => {
    submitOrder(data);
  };

  return {
    // State
    cart,
    loading,
    error,
    setError,
    logoErrors,
    setLogoErrors,
    showShippingModal,
    setShowShippingModal,
    showCardModal,
    setShowCardModal,
    deliveryPrice,
    loadingDeliveryPrice,
    deliveryLocations,
    loadingDeliveryLocations,
    // Form
    register,
    handleSubmit,
    errors,
    isSubmitting,
    setValue,
    watch,
    // Computed
    paymentMethod,
    shippingMethod,
    shippingRegion,
    shippingRegionSummary,
    paymentMethods,
    orderSummary,
    // Actions
    handlePlaceOrder,
    onSubmit,
  };
}
