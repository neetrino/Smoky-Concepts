'use client';

import { useCallback, useEffect } from 'react';

import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';

/** Below size catalog modal (`z-[100]`) so picker stays on top if both could stack. */
const PREVIEW_STACK_Z = 'z-[90]';

interface CustomizeApplyPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  imageUrl: string | null;
  text: string;
}

export function CustomizeApplyPreview({
  isOpen,
  onClose,
  language,
  imageUrl,
  text,
}: CustomizeApplyPreviewProps) {
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
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onEscape);
    };
  }, [isOpen, onEscape]);

  if (!isOpen) {
    return null;
  }

  const displayText = text.trim();

  return (
    <div className={`fixed inset-0 ${PREVIEW_STACK_Z}`} role="dialog" aria-modal="true" aria-labelledby="customize-apply-preview-title">
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label={t(language, 'product.customize_modal_close_aria')}
        onClick={onClose}
      />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="pointer-events-auto relative w-full max-w-4xl overflow-hidden rounded-xl bg-[#1a1a1a] shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
            <h2 id="customize-apply-preview-title" className="font-montserrat text-lg font-extrabold text-white sm:text-xl">
              {t(language, 'product.customize_title')}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/10"
              aria-label={t(language, 'product.customize_modal_close_aria')}
            >
              <img
                src="/assets/product/customize/icon-close.svg"
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 invert"
              />
            </button>
          </div>
          <div className="relative aspect-[4/5] w-full max-h-[min(78vh,820px)] bg-[#2a2a2a] sm:aspect-[16/10] sm:max-h-[min(82vh,900px)]">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-6 text-center font-montserrat text-sm text-white/45">
                {t(language, 'common.messages.noImage')}
              </div>
            )}
            {displayText.length > 0 ? (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 pb-10 pt-20 sm:px-10">
                <p className="text-center font-montserrat text-xl font-semibold uppercase tracking-[0.12em] text-white sm:text-2xl">
                  {displayText}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
