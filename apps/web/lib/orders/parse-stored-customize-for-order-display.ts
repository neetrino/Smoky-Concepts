/**
 * Derives structured display fields from persisted PDP customize HTML (see buildCustomizePreviewHtml).
 */

export type ParsedCustomizeForOrderDisplay = {
  text: string;
  fontStack: string | null;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  /** True when markup looks like PDP overlay output (span + font-family). */
  isStructured: boolean;
};

const ENTITY_MAP: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  '#39': "'",
};

function decodeBasicEntities(input: string): string {
  let s = input.replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
    String.fromCodePoint(parseInt(hex, 16))
  );
  s = s.replace(/&#(\d+);/g, (_, n: string) =>
    String.fromCodePoint(Number(n))
  );
  return s.replace(/&(#?[\w]+);/g, (_, code: string) => ENTITY_MAP[code] ?? '');
}

function stripTags(html: string): string {
  const withoutTags = html.replace(/<[^>]+>/g, '');
  return decodeBasicEntities(withoutTags).replace(/\u00a0/g, ' ').trim();
}

function extractFontStack(html: string): string | null {
  const m = html.match(/font-family\s*:\s*([^"]+)/i);
  return m ? m[1].trim().replace(/;\s*$/, '') : null;
}

function detectBold(html: string): boolean {
  return (
    /<\s*strong\b/i.test(html) ||
    /<\s*b\b(?![a-z])/i.test(html) ||
    /font-weight\s*:\s*(?:[6-9]\d{2}|800|700)\b/i.test(html)
  );
}

function detectItalic(html: string): boolean {
  return /<\s*em\b/i.test(html) || /<\s*i(\s|\/?>)/i.test(html);
}

function detectUnderline(html: string): boolean {
  return /<\s*u(\s|\/?>)/i.test(html);
}

export function parseStoredCustomizeForOrderDisplay(html: string): ParsedCustomizeForOrderDisplay {
  const trimmed = html.trim();
  if (!trimmed) {
    return {
      text: '',
      fontStack: null,
      bold: false,
      italic: false,
      underline: false,
      isStructured: false,
    };
  }

  const fontStack = extractFontStack(trimmed);
  const isStructured = /<\s*span\b[^>]*style="[^"]*font-family/i.test(trimmed);

  return {
    text: stripTags(trimmed),
    fontStack,
    bold: detectBold(trimmed),
    italic: detectItalic(trimmed),
    underline: detectUnderline(trimmed),
    isStructured,
  };
}
