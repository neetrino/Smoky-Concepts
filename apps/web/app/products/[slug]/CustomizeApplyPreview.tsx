'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import { getCustomizeGoogleFontStylesheetHrefs } from './constants/customize-google-fonts';
import { CustomizeRichTextEditor, type CustomizeRichTextEditorHandle } from './CustomizeRichTextEditor';
import {
  escapePlainTextForHtml,
  getPlainTextFromHtml,
  sanitizeCustomizeHtml,
} from './utils/sanitize-customize-html';

/** Above sticky UI; native select needs ancestors without overflow clipping. */
const PREVIEW_STACK_Z = 'z-[120]';

/** Max width for text drawn on the product image (narrow band, centered). */
const PREVIEW_TEXT_ON_IMAGE_MAX_WIDTH_CLASS = 'max-w-[min(92%,220px)] sm:max-w-[280px]';

/**
 * Positions the glass label on the bitmap (offset from bottom; lower % = closer to the bottom edge).
 */
const PREVIEW_OVERLAY_IMAGE_ANCHOR_CLASS =
  'pointer-events-none absolute inset-x-0 bottom-[16%] z-10 flex justify-center px-2 sm:bottom-[20%]';

/**
 * Gray “glass” text via layered highlights/shadows only (no bg panel, no backdrop on a box).
 */
const PREVIEW_ON_IMAGE_GLASS_TEXT_SHADOW_CLASS =
  '[text-shadow:0_1px_0_rgba(255,255,255,0.32),0_-1px_1px_rgba(0,0,0,0.2),0_2px_14px_rgba(0,0,0,0.38),0_0_1px_rgba(255,255,255,0.12)]';

const PREVIEW_ON_IMAGE_TEXT_CLASS = [
  PREVIEW_TEXT_ON_IMAGE_MAX_WIDTH_CLASS,
  'px-3 py-2 text-center text-sm font-semibold leading-snug tracking-[0.04em] text-gray-500',
  PREVIEW_ON_IMAGE_GLASS_TEXT_SHADOW_CLASS,
  '[&_*]:text-inherit',
  'sm:px-4 sm:py-2.5 sm:text-base',
  '[&_b]:font-bold [&_em]:italic [&_i]:italic [&_strong]:font-bold [&_u]:underline',
].join(' ');

const CUSTOMIZE_GOOGLE_FONTS_LINK_ID_PREFIX = 'customize-google-fonts-batch-';

interface CustomizeApplyPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called when the dialog closes with the latest editor content (backdrop, X, or Escape). */
  onApplyResult: (html: string, plain: string) => void;
  language: LanguageCode;
  imageUrl: string | null;
  /** Snapshot when the user opened the modal (plain field + optional rich HTML). */
  previewSeed: { plain: string; rich: string | null };
  maxPlainLength: number;
}

export function CustomizeApplyPreview({
  isOpen,
  onClose,
  onApplyResult,
  language,
  imageUrl,
  previewSeed,
  maxPlainLength,
}: CustomizeApplyPreviewProps) {
  const editorRef = useRef<CustomizeRichTextEditorHandle>(null);
  const [liveOverlayHtml, setLiveOverlayHtml] = useState('');

  const handleEditorHtmlChange = useCallback((rawInnerHtml: string) => {
    setLiveOverlayHtml(sanitizeCustomizeHtml(rawInnerHtml));
  }, []);

  useLayoutEffect(() => {
    if (!isOpen) {
      return;
    }
    const initial = previewSeed.rich?.trim()
      ? sanitizeCustomizeHtml(previewSeed.rich)
      : escapePlainTextForHtml(previewSeed.plain.trim());
    setLiveOverlayHtml(initial);
  }, [isOpen, previewSeed.plain, previewSeed.rich]);

  const flushAndClose = useCallback(() => {
    const rawHtml = editorRef.current?.getSanitizedHtml() ?? '';
    const sanitized = sanitizeCustomizeHtml(rawHtml);
    const plain = getPlainTextFromHtml(sanitized);
    onApplyResult(sanitized, plain);
    onClose();
  }, [onApplyResult, onClose]);

  const onEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        flushAndClose();
      }
    },
    [flushAndClose]
  );

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    const hrefs = getCustomizeGoogleFontStylesheetHrefs();
    hrefs.forEach((href, index) => {
      const id = `${CUSTOMIZE_GOOGLE_FONTS_LINK_ID_PREFIX}${index}`;
      if (document.getElementById(id)) {
        return;
      }
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });
  }, []);

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

  const seedHtml = previewSeed.rich?.trim()
    ? previewSeed.rich
    : escapePlainTextForHtml(previewSeed.plain);

  const safeOverlayDisplay = sanitizeCustomizeHtml(liveOverlayHtml);
  const showOverlay = getPlainTextFromHtml(safeOverlayDisplay).length > 0;

  return (
    <div
      className={`fixed inset-0 ${PREVIEW_STACK_Z}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="customize-apply-preview-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/55"
        aria-label={t(language, 'product.customize_modal_close_aria')}
        onClick={flushAndClose}
      />
      {/* Scroll the shell (avoid overflow:hidden on the card so native select menus are not clipped) */}
      <div className="pointer-events-none absolute inset-0 overflow-y-auto overflow-x-hidden py-3 sm:py-6">
        <div className="pointer-events-auto mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-2 sm:px-4">
          <div className="relative w-full overflow-visible rounded-lg bg-[#1a1a1a] shadow-[0_16px_48px_rgba(0,0,0,0.32)]">
            <div className="flex items-start justify-between gap-2 border-b border-white/10 px-3 py-2.5 sm:px-4">
              <h2
                id="customize-apply-preview-title"
                className="font-montserrat text-base font-extrabold text-white sm:text-lg"
              >
                {t(language, 'product.customize_title')}
              </h2>
              <button
                type="button"
                onClick={flushAndClose}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/10"
                aria-label={t(language, 'product.customize_modal_close_aria')}
              >
                <img
                  src="/assets/product/customize/icon-close.svg"
                  alt=""
                  width={18}
                  height={18}
                  className="h-4 w-4 invert"
                />
              </button>
            </div>

            {/* Preview: wrapper hugs the image so text sits on the bitmap, not full card width */}
            <div className="flex w-full justify-center bg-[#2a2a2a]">
              {imageUrl ? (
                <div className="relative inline-block max-w-full">
                  <img
                    src={imageUrl}
                    alt=""
                    className="block max-h-[min(52vh,520px)] w-auto max-w-full object-contain sm:max-h-[min(58vh,600px)]"
                  />
                  {showOverlay ? (
                    <div className={PREVIEW_OVERLAY_IMAGE_ANCHOR_CLASS}>
                      <div
                        className={PREVIEW_ON_IMAGE_TEXT_CLASS}
                        dangerouslySetInnerHTML={{ __html: safeOverlayDisplay }}
                      />
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="flex min-h-[140px] w-full items-center justify-center px-4 py-8 text-center font-montserrat text-sm text-white/45">
                  {t(language, 'common.messages.noImage')}
                </div>
              )}
            </div>

            <CustomizeRichTextEditor
              ref={editorRef}
              language={language}
              maxPlainLength={maxPlainLength}
              seedHtml={seedHtml}
              isActive={isOpen}
              onHtmlChange={handleEditorHtmlChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
