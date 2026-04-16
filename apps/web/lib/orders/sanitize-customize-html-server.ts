/**
 * Server-side sanitizer for PDP customize HTML (mirrors client allowlist).
 * No DOM — safe for API routes and orders service.
 */

const MAX_HTML_LENGTH = 4096;
const MAX_PLAIN_LENGTH = 18;
const FONT_STACK_MAX = 180;

function isSafeFontStack(value: string): boolean {
  return value.length <= FONT_STACK_MAX && /^['"\w\s,.-]+$/.test(value);
}

/**
 * Normalizes opening/closing tags to tag names only (drops attributes except span font-family).
 */
export function sanitizeCustomizeHtmlServer(raw: string): string {
  if (typeof raw !== 'string' || raw.length === 0) {
    return '';
  }
  let s = raw.slice(0, MAX_HTML_LENGTH);
  s = s.replace(/<\s*\/\s*(script|style)[^>]*>/gi, '');
  s = s.replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*(script|style)[^>]*>/gi, '');
  s = s.replace(/\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

  return s.replace(/<[^>]+>/g, (tag) => {
    const t = tag.trim();
    const lower = t.toLowerCase();
    if (/^<b(\s[^>]*)?>$/i.test(t)) {
      return '<b>';
    }
    if (/^<\/b>$/i.test(t)) {
      return '</b>';
    }
    if (/^<strong(\s[^>]*)?>$/i.test(t)) {
      return '<strong>';
    }
    if (/^<\/strong>$/i.test(t)) {
      return '</strong>';
    }
    if (/^<i(\s[^>]*)?>$/i.test(t)) {
      return '<i>';
    }
    if (/^<\/i>$/i.test(t)) {
      return '</i>';
    }
    if (/^<em(\s[^>]*)?>$/i.test(t)) {
      return '<em>';
    }
    if (/^<\/em>$/i.test(t)) {
      return '</em>';
    }
    if (/^<u(\s[^>]*)?>$/i.test(t)) {
      return '<u>';
    }
    if (/^<\/u>$/i.test(t)) {
      return '</u>';
    }
    if (/^<br\s*\/?>$/i.test(t)) {
      return '<br>';
    }
    const spanOpen = /^<span\s+style\s*=\s*"font-family:\s*([^"]+)"\s*>$/i.exec(t);
    if (spanOpen) {
      const font = spanOpen[1].trim();
      if (isSafeFontStack(font)) {
        return `<span style="font-family: ${font}">`;
      }
    }
    if (/^<\/span\s*>$/i.test(t)) {
      return '</span>';
    }
    return '';
  });
}

function decodeBasicEntities(text: string): string {
  return text
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function getPlainTextFromHtmlServer(html: string): string {
  const stripped = html
    .replace(/<br\s*\/?>/gi, '')
    .replace(/<[^>]+>/g, '');
  return decodeBasicEntities(stripped).replace(/\r?\n/g, '');
}

export function validateCustomizePlainLength(plain: string): boolean {
  return plain.length <= MAX_PLAIN_LENGTH;
}

export const CUSTOMIZE_PLAIN_MAX_LENGTH = MAX_PLAIN_LENGTH;
