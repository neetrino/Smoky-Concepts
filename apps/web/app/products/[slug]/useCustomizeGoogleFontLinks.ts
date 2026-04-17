'use client';

import { useEffect } from 'react';

import { getCustomizeGoogleFontStylesheetHrefs } from './constants/customize-google-fonts';

const LINK_ID_PREFIX = 'customize-google-fonts-batch-';

function removeCustomizeGoogleFontLinks(): void {
  if (typeof document === 'undefined') {
    return;
  }
  const count = getCustomizeGoogleFontStylesheetHrefs().length;
  for (let index = 0; index < count; index += 1) {
    document.getElementById(`${LINK_ID_PREFIX}${index}`)?.remove();
  }
}

/**
 * Injects Google Fonts stylesheets for customize rich text (hero overlay + toolbar) while enabled;
 * removes them when disabled to avoid loading fonts for the whole PDP session.
 */
export function useCustomizeGoogleFontLinks(enabled: boolean): void {
  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }
    if (!enabled) {
      removeCustomizeGoogleFontLinks();
      return;
    }
    const hrefs = getCustomizeGoogleFontStylesheetHrefs();
    hrefs.forEach((href, index) => {
      const id = `${LINK_ID_PREFIX}${index}`;
      if (document.getElementById(id)) {
        return;
      }
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    });
    return () => {
      removeCustomizeGoogleFontLinks();
    };
  }, [enabled]);
}
