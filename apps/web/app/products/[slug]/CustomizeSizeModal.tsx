'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import Image from 'next/image';
import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import {
  CUSTOMIZE_MODAL_ASSETS,
  CUSTOMIZE_MODAL_DEFAULT_SELECTION,
  type CustomizeModalOptionId,
  type CustomizeStripOptionId,
} from './customize-size-modal.constants';

const STRIP_SLOT_COUNT = 9;

interface CustomizeSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  /** Shown in the top search bar; falls back to i18n default when empty. */
  searchDisplayText: string;
}

function SizeOptionCard({
  imageSrc,
  brand,
  variant,
  selected,
  onSelect,
}: {
  imageSrc: string;
  brand: string;
  variant: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex h-[129px] w-[126px] shrink-0 flex-col items-center rounded-[14px] bg-white pt-2 transition-shadow ${
        selected
          ? 'border-[3px] border-solid border-[#dcc090] shadow-none'
          : 'border border-transparent shadow-[0px_2px_8px_rgba(0,0,0,0.06)]'
      }`}
    >
      <div className="relative h-[73px] w-[52px] shrink-0 overflow-hidden">
        <Image src={imageSrc} alt="" fill className="object-contain" sizes="52px" />
      </div>
      <p className="mt-2 text-center font-montserrat text-[14px] font-medium leading-tight text-[#414141]">{brand}</p>
      <p className="text-center font-montserrat text-[14px] font-medium leading-tight text-[#414141]">{variant}</p>
    </button>
  );
}

function StripPackCard({
  imageSrc,
  selected,
  onSelect,
}: {
  imageSrc: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative h-[129px] w-[82px] shrink-0 overflow-hidden rounded-[6px] ${
        selected ? 'ring-[3px] ring-[#dcc090] ring-offset-0' : 'ring-0'
      }`}
    >
      <Image src={imageSrc} alt="" fill className="object-cover" sizes="82px" />
    </button>
  );
}

export function CustomizeSizeModal({ isOpen, onClose, language, searchDisplayText }: CustomizeSizeModalProps) {
  const titleId = useId();
  const [selectedId, setSelectedId] = useState<CustomizeModalOptionId>(CUSTOMIZE_MODAL_DEFAULT_SELECTION);

  useEffect(() => {
    if (isOpen) {
      setSelectedId(CUSTOMIZE_MODAL_DEFAULT_SELECTION);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  const onEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [isOpen, onEscape]);

  if (!isOpen) {
    return null;
  }

  const searchLabel =
    searchDisplayText.trim().length > 0 ? searchDisplayText.trim() : t(language, 'product.customize_search_default');

  const brand = t(language, 'product.customize_brand_marlboro');

  return (
    <div className="fixed inset-0 z-[100]" role="presentation">
      <button
        type="button"
        className="absolute inset-0 z-0 bg-[rgba(0,0,0,0.6)]"
        aria-label={t(language, 'product.customize_modal_close_aria')}
        onClick={onClose}
      />
      <div
        className="absolute inset-y-0 right-0 z-10 flex h-full max-h-dvh w-full flex-col overflow-hidden bg-[#efefef] shadow-[-8px_0_32px_rgba(0,0,0,0.12)] md:w-[min(1078px,56.15vw)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
      <div className="relative min-h-0 flex-1 overflow-y-auto px-[24px] pb-16 pt-[50px] sm:px-[50px]">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-montserrat text-[28px] font-extrabold leading-none text-[#414141] sm:text-[36px]">
            {t(language, 'product.customize_modal_title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="mt-1 flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-sm text-[#414141] transition-opacity hover:opacity-70"
            aria-label={t(language, 'product.customize_modal_close_aria')}
          >
            <img
              src="/assets/product/customize/icon-close.svg"
              alt=""
              width={20}
              height={20}
              className="h-5 w-5 shrink-0"
            />
          </button>
        </div>

        <div className="relative mt-[29px] flex h-12 w-full max-w-[978px] items-center rounded-[6px] bg-white shadow-[0px_4px_22.5px_rgba(0,0,0,0.1)]">
          <div className="pointer-events-none absolute left-[101px] top-1/2 h-[18px] w-px -translate-y-1/2 bg-[#414141]" />
          <p className="pl-[119px] font-montserrat text-[18px] font-medium leading-[30px] text-[#414141]">{searchLabel}</p>
        </div>

        <section className="mt-[50px]">
          <h3 className="font-montserrat text-[22px] font-extrabold leading-none text-[#414141] sm:text-[24px]">
            {t(language, 'product.customize_section_ultra_slims')}
          </h3>
          <div className="mt-[57px] flex flex-wrap gap-x-4 gap-y-6">
            <SizeOptionCard
              imageSrc={CUSTOMIZE_MODAL_ASSETS.ultraRed}
              brand={brand}
              variant={t(language, 'product.customize_variant_red')}
              selected={selectedId === 'ultra-red'}
              onSelect={() => setSelectedId('ultra-red')}
            />
            <SizeOptionCard
              imageSrc={CUSTOMIZE_MODAL_ASSETS.ultraGold}
              brand={brand}
              variant={t(language, 'product.customize_variant_gold')}
              selected={selectedId === 'ultra-gold'}
              onSelect={() => setSelectedId('ultra-gold')}
            />
            <SizeOptionCard
              imageSrc={CUSTOMIZE_MODAL_ASSETS.ultraSilver}
              brand={brand}
              variant={t(language, 'product.customize_variant_silver')}
              selected={selectedId === 'ultra-silver'}
              onSelect={() => setSelectedId('ultra-silver')}
            />
          </div>
        </section>

        <section className="mt-[70px]">
          <h3 className="font-montserrat text-[22px] font-extrabold leading-none text-[#414141] sm:text-[24px]">
            {t(language, 'product.customize_section_compact')}
          </h3>
          <div className="mt-[57px] flex flex-wrap gap-x-4 gap-y-6">
            <SizeOptionCard
              imageSrc={CUSTOMIZE_MODAL_ASSETS.compactRed}
              brand={brand}
              variant={t(language, 'product.customize_variant_red')}
              selected={selectedId === 'compact-red'}
              onSelect={() => setSelectedId('compact-red')}
            />
            <SizeOptionCard
              imageSrc={CUSTOMIZE_MODAL_ASSETS.compactFusion}
              brand={brand}
              variant={t(language, 'product.customize_variant_double_fusion')}
              selected={selectedId === 'compact-fusion'}
              onSelect={() => setSelectedId('compact-fusion')}
            />
          </div>
        </section>

        <section className="mt-[70px]">
          <h3 className="font-montserrat text-[22px] font-extrabold leading-none text-[#414141] sm:text-[24px]">
            {t(language, 'product.customize_section_super_slims')}
          </h3>
          <div className="mt-[57px] flex flex-wrap gap-x-4 gap-y-6">
            <SizeOptionCard
              imageSrc={CUSTOMIZE_MODAL_ASSETS.superSilver}
              brand={brand}
              variant={t(language, 'product.customize_variant_silver')}
              selected={selectedId === 'super-silver'}
              onSelect={() => setSelectedId('super-silver')}
            />
          </div>
        </section>

        <section className="mt-[247px] sm:mt-[200px]">
          <h3 className="font-montserrat text-[22px] font-extrabold leading-none text-[#414141] sm:text-[24px]">
            {t(language, 'product.customize_section_super_slims')}
          </h3>
          <div className="mt-[57px] flex flex-wrap gap-[28px]">
            {Array.from({ length: STRIP_SLOT_COUNT }, (_, index) => {
              const id = `strip-${index}` as CustomizeStripOptionId;
              return (
                <StripPackCard
                  key={id}
                  imageSrc={CUSTOMIZE_MODAL_ASSETS.stripPack}
                  selected={selectedId === id}
                  onSelect={() => setSelectedId(id)}
                />
              );
            })}
          </div>
        </section>
      </div>
      </div>
    </div>
  );
}
