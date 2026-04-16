'use client';

import { useEffect } from 'react';

import { getCustomizeGoogleFontStylesheetHrefs } from './constants/customize-google-fonts';

const LINK_ID_PREFIX = 'customize-google-fonts-batch-';

/**
 * Injects Google Fonts stylesheets once for customize rich text (hero overlay + editor).
 */
export function useCustomizeGoogleFontLinks(enabled: boolean): void {
  useEffect(() => {
    if (!enabled || typeof document === 'undefined') {
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
  }, [enabled]);
}
