'use client';

import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';

export interface CustomOrderDraft {
  name: string;
  phone: string;
  email: string;
  description: string;
}

export const EMPTY_CUSTOM_ORDER_DRAFT: CustomOrderDraft = {
  name: '',
  phone: '',
  email: '',
  description: '',
};

function CustomOrderInputField({
  label,
  type,
  value,
  autoComplete,
  onChange,
}: {
  label: string;
  type: 'text' | 'tel' | 'email';
  value: string;
  autoComplete: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="font-montserrat text-[18px] font-medium leading-[30px] text-[#414141]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="block h-5 w-full border-0 border-b border-[#dcc090] bg-transparent font-montserrat text-[18px] font-medium text-[#414141] outline-none"
        autoComplete={autoComplete}
      />
    </label>
  );
}

function CustomOrderUploadHint({ language }: { language: LanguageCode }) {
  return (
    <div className="mt-12 flex items-start gap-4">
      <span className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#dcc090] font-montserrat text-[34px] leading-none text-[#122a26]">
        +
      </span>
      <div>
        <p className="font-montserrat text-[18px] font-medium leading-[30px] text-[#414141]">
          {t(language, 'product.size_catalog_custom_order_upload')}
        </p>
        <p className="mt-0.5 font-montserrat text-[12px] font-medium leading-none text-[#9d9d9d]">
          {t(language, 'product.size_catalog_custom_order_upload_formats')}
        </p>
      </div>
    </div>
  );
}

export function CustomizeSizeOrderFallback({
  language,
  draft,
  onDraftChange,
}: {
  language: LanguageCode;
  draft: CustomOrderDraft;
  onDraftChange: (field: keyof CustomOrderDraft, value: string) => void;
}) {
  return (
    <div className="max-w-[978px]">
      <p className="font-montserrat text-[18px] font-medium leading-[30px] text-[#414141]">
        {t(language, 'product.size_catalog_custom_order_message')}
      </p>

      <div className="mt-12 flex max-w-[454px] flex-col gap-8">
        <CustomOrderInputField
          label={t(language, 'product.size_catalog_custom_order_name')}
          type="text"
          value={draft.name}
          autoComplete="name"
          onChange={(value) => onDraftChange('name', value)}
        />
        <CustomOrderInputField
          label={t(language, 'product.size_catalog_custom_order_phone')}
          type="tel"
          value={draft.phone}
          autoComplete="tel"
          onChange={(value) => onDraftChange('phone', value)}
        />
        <CustomOrderInputField
          label={t(language, 'product.size_catalog_custom_order_email')}
          type="email"
          value={draft.email}
          autoComplete="email"
          onChange={(value) => onDraftChange('email', value)}
        />
        <CustomOrderInputField
          label={t(language, 'product.size_catalog_custom_order_description')}
          type="text"
          value={draft.description}
          autoComplete="off"
          onChange={(value) => onDraftChange('description', value)}
        />
      </div>

      <CustomOrderUploadHint language={language} />

      <button
        type="button"
        disabled
        className="mt-8 h-12 min-w-[166px] rounded-[8px] bg-[#d2d2d2] px-6 font-montserrat text-[24px] font-medium uppercase tracking-[0.1em] text-[#9d9d9d]"
        aria-label={t(language, 'product.size_catalog_custom_order_cta_aria')}
      >
        {t(language, 'product.size_catalog_custom_order_cta')}
      </button>
    </div>
  );
}
