'use client';

interface CouponFormFieldsLabels {
  name: string;
  code: string;
  discountType: string;
  typePercent: string;
  typeFixedUsd: string;
  discountValue: string;
  quantity: string;
  expiresAt: string;
}

interface CouponFormFieldsProps {
  saving: boolean;
  labels: CouponFormFieldsLabels;
  name: string;
  code: string;
  discountType: string;
  discountValue: string;
  quantity: string;
  expiresAt: string;
  percentTypeValue: string;
  fixedTypeValue: string;
  onNameChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onDiscountTypeChange: (value: string) => void;
  onDiscountValueChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
  onExpiresAtChange: (value: string) => void;
}

export function CouponFormFields({
  saving,
  labels,
  name,
  code,
  discountType,
  discountValue,
  quantity,
  expiresAt,
  percentTypeValue,
  fixedTypeValue,
  onNameChange,
  onCodeChange,
  onDiscountTypeChange,
  onDiscountValueChange,
  onQuantityChange,
  onExpiresAtChange,
}: CouponFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <label className="flex flex-col gap-1.5 text-sm text-[#414141]/80">
        {labels.name}
        <input
          className="rounded-md border border-[#dcc090]/40 px-3 py-2 text-[#122a26]"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          disabled={saving}
          placeholder={labels.name}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-[#414141]/80">
        {labels.code}
        <input
          className="rounded-md border border-[#dcc090]/40 px-3 py-2 text-[#122a26]"
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          disabled={saving}
          placeholder={labels.code}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-[#414141]/80">
        {labels.discountType}
        <select
          className="rounded-md border border-[#dcc090]/40 px-3 py-2 text-[#122a26]"
          value={discountType}
          onChange={(event) => onDiscountTypeChange(event.target.value)}
          disabled={saving}
        >
          <option value={percentTypeValue}>{labels.typePercent}</option>
          <option value={fixedTypeValue}>{labels.typeFixedUsd}</option>
        </select>
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-[#414141]/80">
        {labels.discountValue}
        <input
          type="number"
          min={0}
          step={0.01}
          className="rounded-md border border-[#dcc090]/40 px-3 py-2 text-[#122a26]"
          value={discountValue}
          onChange={(event) => onDiscountValueChange(event.target.value)}
          disabled={saving}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-[#414141]/80">
        {labels.quantity}
        <input
          type="number"
          min={1}
          step={1}
          className="rounded-md border border-[#dcc090]/40 px-3 py-2 text-[#122a26]"
          value={quantity}
          onChange={(event) => onQuantityChange(event.target.value)}
          disabled={saving}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm text-[#414141]/80 md:col-span-2">
        {labels.expiresAt}
        <input
          type="datetime-local"
          className="rounded-md border border-[#dcc090]/40 px-3 py-2 text-[#122a26]"
          value={expiresAt}
          onChange={(event) => onExpiresAtChange(event.target.value)}
          disabled={saving}
        />
      </label>
    </div>
  );
}
