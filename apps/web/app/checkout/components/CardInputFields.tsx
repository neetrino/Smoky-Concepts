'use client';

import { Input } from '@shop/ui';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { useTranslation } from '../../../lib/i18n-client';
import { formatCardNumber, formatCardExpiry, formatCardCvv } from '../utils/card-formatters';
import { CheckoutFormData } from '../types';

interface CardInputFieldsProps {
  register: UseFormRegister<CheckoutFormData>;
  setValue: UseFormSetValue<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  isSubmitting: boolean;
}

function getCursorPositionForCardNumber(formattedValue: string, digitsBeforeCursor: number): number {
  if (digitsBeforeCursor <= 0) {
    return 0;
  }

  let digitsSeen = 0;
  for (let index = 0; index < formattedValue.length; index += 1) {
    if (/\d/.test(formattedValue[index])) {
      digitsSeen += 1;
    }
    if (digitsSeen === digitsBeforeCursor) {
      return index + 1;
    }
  }

  return formattedValue.length;
}

function getCursorPositionForCardExpiry(formattedValue: string, digitsBeforeCursor: number): number {
  if (digitsBeforeCursor <= 0) {
    return 0;
  }
  if (digitsBeforeCursor <= 2) {
    return digitsBeforeCursor;
  }
  return Math.min(formattedValue.length, digitsBeforeCursor + 1);
}

export function CardInputFields({
  register,
  setValue,
  errors,
  isSubmitting,
}: CardInputFieldsProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <div>
        <Input
          label={t('checkout.form.cardNumber')}
          type="text"
          placeholder={t('checkout.placeholders.cardNumber')}
          maxLength={19}
          {...register('cardNumber')}
          error={errors.cardNumber?.message}
          disabled={isSubmitting}
          onChange={(e) => {
            const rawValue = e.target.value;
            const cursorPosition = e.target.selectionStart ?? rawValue.length;
            const digitsBeforeCursor = rawValue.slice(0, cursorPosition).replace(/\D/g, '').length;
            const formatted = formatCardNumber(rawValue);

            setValue('cardNumber', formatted, { shouldDirty: true, shouldTouch: true });

            const nextCursorPosition = getCursorPositionForCardNumber(formatted, digitsBeforeCursor);
            requestAnimationFrame(() => {
              e.target.setSelectionRange(nextCursorPosition, nextCursorPosition);
            });
          }}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label={t('checkout.form.expiryDate')}
            type="text"
            placeholder={t('checkout.placeholders.expiryDate')}
            maxLength={5}
            {...register('cardExpiry')}
            error={errors.cardExpiry?.message}
            disabled={isSubmitting}
            onChange={(e) => {
              const rawValue = e.target.value;
              const cursorPosition = e.target.selectionStart ?? rawValue.length;
              const digitsBeforeCursor = rawValue.slice(0, cursorPosition).replace(/\D/g, '').length;
              const formatted = formatCardExpiry(rawValue);

              setValue('cardExpiry', formatted, { shouldDirty: true, shouldTouch: true });

              const nextCursorPosition = getCursorPositionForCardExpiry(formatted, digitsBeforeCursor);
              requestAnimationFrame(() => {
                e.target.setSelectionRange(nextCursorPosition, nextCursorPosition);
              });
            }}
          />
        </div>
        <div>
          <Input
            label={t('checkout.form.cvv')}
            type="text"
            placeholder={t('checkout.placeholders.cvv')}
            maxLength={4}
            {...register('cardCvv')}
            error={errors.cardCvv?.message}
            disabled={isSubmitting}
            onChange={(e) => {
              const formatted = formatCardCvv(e.target.value);
              setValue('cardCvv', formatted, { shouldDirty: true, shouldTouch: true });
            }}
          />
        </div>
      </div>
      <div>
        <Input
          label={t('checkout.form.cardHolderName')}
          type="text"
          placeholder={t('checkout.placeholders.cardHolderName')}
          {...register('cardHolderName')}
          error={errors.cardHolderName?.message}
          disabled={isSubmitting}
        />
      </div>
    </div>
  );
}

