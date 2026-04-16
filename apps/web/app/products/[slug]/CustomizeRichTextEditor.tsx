'use client';

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';

import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import { CUSTOMIZE_GOOGLE_FONT_OPTIONS } from './constants/customize-google-fonts';
import { sanitizeCustomizeHtml } from './utils/sanitize-customize-html';

export type CustomizeRichTextEditorHandle = {
  getSanitizedHtml: () => string;
};

type CustomizeRichTextEditorProps = {
  language: LanguageCode;
  maxPlainLength: number;
  seedHtml: string;
  isActive: boolean;
  onHtmlChange?: (rawInnerHtml: string) => void;
};

/** Keeps editor selection when using Bold/Italic; must not run on `select` or the dropdown will not open. */
function preventToolbarFocusLoss(e: React.MouseEvent): void {
  const target = e.target as HTMLElement;
  if (target.closest('select') || target.closest('option') || target.closest('[data-customize-font]')) {
    return;
  }
  e.preventDefault();
}

export const CustomizeRichTextEditor = forwardRef<
  CustomizeRichTextEditorHandle,
  CustomizeRichTextEditorProps
>(function CustomizeRichTextEditor(
  { language, maxPlainLength, seedHtml, isActive, onHtmlChange },
  ref
) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastValidHtmlRef = useRef<string>('');
  const onHtmlChangeRef = useRef(onHtmlChange);
  onHtmlChangeRef.current = onHtmlChange;

  const [plainCharCount, setPlainCharCount] = useState(0);

  useImperativeHandle(
    ref,
    () => ({
      getSanitizedHtml: () => sanitizeCustomizeHtml(editorRef.current?.innerHTML ?? ''),
    }),
    []
  );

  useEffect(() => {
    if (!isActive || !editorRef.current) {
      return;
    }
    editorRef.current.innerHTML = seedHtml;
    lastValidHtmlRef.current = seedHtml;
    const len = editorRef.current.innerText.replace(/\r?\n/g, '').length;
    setPlainCharCount(len);
    onHtmlChangeRef.current?.(seedHtml);
  }, [isActive, seedHtml]);

  const enforceLength = useCallback(() => {
    const el = editorRef.current;
    if (!el) {
      return;
    }
    const plainLen = el.innerText.replace(/\r?\n/g, '').length;
    if (plainLen > maxPlainLength) {
      el.innerHTML = lastValidHtmlRef.current;
      setPlainCharCount(el.innerText.replace(/\r?\n/g, '').length);
      onHtmlChangeRef.current?.(el.innerHTML);
      return;
    }
    lastValidHtmlRef.current = el.innerHTML;
    setPlainCharCount(plainLen);
    onHtmlChangeRef.current?.(el.innerHTML);
  }, [maxPlainLength]);

  const runCommand = useCallback(
    (command: 'bold' | 'italic' | 'underline') => {
      document.execCommand(command, false);
      enforceLength();
    },
    [enforceLength]
  );

  const applyFontStack = useCallback(
    (stack: string) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
        return;
      }
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.setAttribute('style', `font-family: ${stack}`);
      try {
        range.surroundContents(span);
      } catch {
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
      }
      selection.removeAllRanges();
      enforceLength();
    },
    [enforceLength]
  );

  return (
    <div className="flex flex-col gap-2.5 px-3 pb-3 pt-2 sm:px-4">
      <div
        className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3"
        onMouseDown={preventToolbarFocusLoss}
      >
        <button
          type="button"
          className="rounded-md bg-white/10 px-3 py-1.5 font-montserrat text-xs font-bold uppercase tracking-wide text-white hover:bg-white/15"
          onClick={() => runCommand('bold')}
        >
          {t(language, 'product.customize_format_bold')}
        </button>
        <button
          type="button"
          className="rounded-md bg-white/10 px-3 py-1.5 font-montserrat text-xs font-bold uppercase tracking-wide italic text-white hover:bg-white/15"
          onClick={() => runCommand('italic')}
        >
          {t(language, 'product.customize_format_italic')}
        </button>
        <button
          type="button"
          className="rounded-md bg-white/10 px-3 py-1.5 font-montserrat text-xs font-bold uppercase tracking-wide underline text-white hover:bg-white/15"
          onClick={() => runCommand('underline')}
        >
          {t(language, 'product.customize_format_underline')}
        </button>
        <label
          className="flex items-center gap-2 font-montserrat text-xs text-white/80"
          data-customize-font
          htmlFor="customize-font-select"
        >
          <span className="shrink-0">{t(language, 'product.customize_font_label')}</span>
          <select
            id="customize-font-select"
            className="relative z-20 max-w-[220px] rounded-md border border-white/20 bg-[#2a2a2a] px-2 py-1.5 font-montserrat text-xs text-white outline-none focus:border-[#dcc090]"
            defaultValue={CUSTOMIZE_GOOGLE_FONT_OPTIONS[0]?.id ?? ''}
            onChange={(e) => {
              const option = CUSTOMIZE_GOOGLE_FONT_OPTIONS.find((o) => o.id === e.target.value);
              if (option) {
                applyFontStack(option.stack);
              }
            }}
          >
            {CUSTOMIZE_GOOGLE_FONT_OPTIONS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        className="min-h-[72px] max-w-full rounded-lg border border-white/15 bg-[#2a2a2a] px-3 py-2 font-montserrat text-base leading-relaxed text-white outline-none ring-offset-2 ring-offset-[#1a1a1a] focus-visible:ring-2 focus-visible:ring-[#dcc090]"
        onInput={enforceLength}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
          }
        }}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
          enforceLength();
        }}
      />
      <p className="text-right font-montserrat text-[10px] font-medium text-white/45">
        <span>{t(language, 'product.customize_rich_hint')}</span>{' '}
        <span className="tabular-nums text-white/55">
          {plainCharCount}/{maxPlainLength}
        </span>
      </p>
    </div>
  );
});
