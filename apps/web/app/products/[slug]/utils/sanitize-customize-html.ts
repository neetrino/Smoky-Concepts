const ALLOWED_TAGS = new Set(['B', 'STRONG', 'I', 'EM', 'U', 'BR', 'SPAN']);

function isSafeFontStack(value: string): boolean {
  return /^['"\w\s,.-]+$/.test(value) && value.length <= 180;
}

function unwrapElement(el: HTMLElement): void {
  const parent = el.parentNode;
  if (!parent) {
    return;
  }
  while (el.firstChild) {
    parent.insertBefore(el.firstChild, el);
  }
  parent.removeChild(el);
}

function sanitizeElement(el: HTMLElement): void {
  const nodes = Array.from(el.childNodes);
  for (const child of nodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) {
      child.parentNode?.removeChild(child);
      continue;
    }
    const childEl = child as HTMLElement;
    const tag = childEl.tagName.toUpperCase();
    if (!ALLOWED_TAGS.has(tag)) {
      unwrapElement(childEl);
      sanitizeElement(el);
      return;
    }
    if (tag === 'SPAN') {
      const style = childEl.getAttribute('style');
      let keep = false;
      if (style) {
        const match = /font-family\s*:\s*([^;]+)/i.exec(style);
        if (match && isSafeFontStack(match[1].trim())) {
          childEl.setAttribute('style', `font-family: ${match[1].trim()}`);
          keep = true;
        }
      }
      if (!keep) {
        unwrapElement(childEl);
        sanitizeElement(el);
        return;
      }
    }
    sanitizeElement(childEl);
  }
}

/**
 * Restricts customize markup to inline emphasis + font-family spans for safe rendering.
 * Call only in the browser (uses DOM).
 */
export function sanitizeCustomizeHtml(raw: string): string {
  if (typeof document === 'undefined') {
    return '';
  }
  const wrapper = document.createElement('div');
  wrapper.innerHTML = raw;
  sanitizeElement(wrapper);
  return wrapper.innerHTML;
}

export function getPlainTextLengthFromHtml(html: string): number {
  if (typeof document === 'undefined') {
    return 0;
  }
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.innerText.replace(/\r?\n/g, '').length;
}

export function escapePlainTextForHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function getPlainTextFromHtml(html: string): string {
  if (typeof document === 'undefined') {
    return '';
  }
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.innerText.replace(/\r?\n/g, '');
}
