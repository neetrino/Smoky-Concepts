'use client';

import { useEffect, useMemo, useState } from 'react';

import { Button } from '@shop/ui';

import {
  COUPON_DISCOUNT_FIXED_USD,
  COUPON_DISCOUNT_PERCENT,
} from '@/lib/services/coupon.service';

import { isoToDatetimeLocalValue } from '../isoToDatetimeLocalValue';
import type { AdminCouponDetail, CouponFormSubmitPayload } from '../types';
import { CouponFormFields } from './CouponFormFields';
import {
  SelectCouponUsersSection,
  type SelectCouponUsersLabels,
} from './SelectCouponUsersSection';

export type CouponFormModalMode = 'create' | 'edit';

export type { CouponFormSubmitPayload } from '../types';

interface CreateCouponModalProps {
  isOpen: boolean;
  mode: CouponFormModalMode;
  couponId: string | null;
  initialValues: AdminCouponDetail | null;
  saving: boolean;
  labels: {
    titleCreate: string;
    titleEdit: string;
    name: string;
    code: string;
    discountType: string;
    typePercent: string;
    typeFixedUsd: string;
    discountValue: string;
    quantity: string;
    expiresAt: string;
    cancel: string;
    create: string;
    creating: string;
    update: string;
    updating: string;
    pickUsers: SelectCouponUsersLabels;
  };
  onClose: () => void;
  onSubmitCreate: (payload: CouponFormSubmitPayload) => Promise<void>;
  onSubmitEdit: (couponId: string, payload: CouponFormSubmitPayload) => Promise<void>;
}

export function CreateCouponModal({
  isOpen,
  mode,
  couponId,
  initialValues,
  saving,
  labels,
  onClose,
  onSubmitCreate,
  onSubmitEdit,
}: CreateCouponModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<string>(COUPON_DISCOUNT_PERCENT);
  const [discountValue, setDiscountValue] = useState('10');
  const [quantity, setQuantity] = useState('1');
  const [expiresAt, setExpiresAt] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    if (mode === 'edit') {
      if (!initialValues) {
        return;
      }
      setName('');
      setCode(initialValues.code);
      setDiscountType(
        initialValues.discountType === COUPON_DISCOUNT_FIXED_USD
          ? COUPON_DISCOUNT_FIXED_USD
          : COUPON_DISCOUNT_PERCENT,
      );
      setDiscountValue(String(initialValues.discountValue));
      setQuantity(
        initialValues.quantity === null || initialValues.quantity === undefined
          ? ''
          : String(initialValues.quantity),
      );
      setExpiresAt(isoToDatetimeLocalValue(initialValues.expiresAt));
      setSelectedUserIds(new Set(initialValues.allowedUserIds));
      return;
    }
    if (mode === 'create') {
      setName('');
      setCode('');
      setDiscountType(COUPON_DISCOUNT_PERCENT);
      setDiscountValue('10');
      setQuantity('1');
      setExpiresAt('');
      setSelectedUserIds(new Set());
    }
  }, [isOpen, mode, initialValues]);

  const isSubmitDisabled = useMemo(() => {
    if (!code.trim()) {
      return true;
    }

    const value = Number.parseFloat(discountValue);
    if (!Number.isFinite(value)) {
      return true;
    }

    const quantityValue = quantity.trim();
    if (quantityValue === '') {
      return false;
    }

    const parsedQuantity = Number.parseInt(quantityValue, 10);
    return !Number.isInteger(parsedQuantity) || parsedQuantity <= 0;
  }, [code, discountValue, quantity]);

  if (!isOpen) {
    return null;
  }

  const resetForm = () => {
    setName('');
    setCode('');
    setDiscountType(COUPON_DISCOUNT_PERCENT);
    setDiscountValue('10');
    setQuantity('1');
    setExpiresAt('');
    setSelectedUserIds(new Set());
  };

  const handleClose = () => {
    if (saving) {
      return;
    }
    if (mode === 'create') {
      resetForm();
    }
    onClose();
  };

  const buildPayload = (): CouponFormSubmitPayload | null => {
    const value = Number.parseFloat(discountValue);
    if (!Number.isFinite(value)) {
      return null;
    }
    const quantityValue = quantity.trim();
    let quantityOut: number | null = null;
    if (quantityValue !== '') {
      const parsed = Number.parseInt(quantityValue, 10);
      if (!Number.isInteger(parsed) || parsed <= 0) {
        return null;
      }
      quantityOut = parsed;
    }

    return {
      code: code.trim(),
      discountType,
      discountValue: value,
      quantity: quantityOut,
      allowedUserIds: Array.from(selectedUserIds),
      expiresAt: expiresAt.trim() ? expiresAt : null,
    };
  };

  const handleSubmit = async () => {
    const payload = buildPayload();
    if (!payload) {
      return;
    }

    if (mode === 'edit') {
      if (!couponId) {
        return;
      }
      await onSubmitEdit(couponId, payload);
      return;
    }

    await onSubmitCreate(payload);
    resetForm();
  };

  const title = mode === 'edit' ? labels.titleEdit : labels.titleCreate;
  const primaryLabel =
    mode === 'edit'
      ? saving
        ? labels.updating
        : labels.update
      : saving
        ? labels.creating
        : labels.create;

  const fieldLabels = {
    name: labels.name,
    code: labels.code,
    discountType: labels.discountType,
    typePercent: labels.typePercent,
    typeFixedUsd: labels.typeFixedUsd,
    discountValue: labels.discountValue,
    quantity: labels.quantity,
    expiresAt: labels.expiresAt,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#dcc090]/30 bg-white p-6 shadow-[0_20px_60px_rgba(18,42,38,0.24)]">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-[#122a26]">{title}</h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-md p-1 text-[#414141]/70 transition hover:bg-[#efefef] hover:text-[#122a26]"
            aria-label={labels.cancel}
          >
            <span className="text-2xl leading-none">&times;</span>
          </button>
        </div>

        <CouponFormFields
          saving={saving}
          labels={fieldLabels}
          name={name}
          code={code}
          discountType={discountType}
          discountValue={discountValue}
          quantity={quantity}
          expiresAt={expiresAt}
          percentTypeValue={COUPON_DISCOUNT_PERCENT}
          fixedTypeValue={COUPON_DISCOUNT_FIXED_USD}
          onNameChange={setName}
          onCodeChange={setCode}
          onDiscountTypeChange={setDiscountType}
          onDiscountValueChange={setDiscountValue}
          onQuantityChange={setQuantity}
          onExpiresAtChange={setExpiresAt}
        />

        <SelectCouponUsersSection
          disabled={saving}
          labels={labels.pickUsers}
          selectedUserIds={selectedUserIds}
          onSelectedChange={setSelectedUserIds}
        />

        <div className="mt-6 flex gap-3">
          <Button
            variant="primary"
            onClick={() => void handleSubmit()}
            disabled={saving || isSubmitDisabled}
            className="min-w-36"
          >
            {primaryLabel}
          </Button>
          <Button type="button" variant="ghost" onClick={handleClose} disabled={saving}>
            {labels.cancel}
          </Button>
        </div>
      </div>
    </div>
  );
}
