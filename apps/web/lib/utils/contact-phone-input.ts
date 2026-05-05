/** Allowed in contact form phone: digits, leading-friendly +, spaces, dashes, parentheses. */
const CONTACT_PHONE_DISALLOWED_CHARS = /[^\d+()\s\-]/g;

const CONTACT_PHONE_ALLOWED_SHAPE = /^[\d+()\s\-]+$/;

/**
 * Strips letters and other non-phone characters from controlled input (paste-safe).
 */
export function sanitizeContactPhoneInput(value: string): string {
  return value.replace(CONTACT_PHONE_DISALLOWED_CHARS, '');
}

/**
 * True if the string contains only allowed phone symbols (after client trim / server trim).
 */
export function isContactPhoneAllowedCharacterSet(phone: string): boolean {
  if (phone.length === 0) {
    return false;
  }
  return CONTACT_PHONE_ALLOWED_SHAPE.test(phone);
}
