// Lightweight client-side validators for instant form feedback. They return
// a translation *key* (or '' when valid) so the form can localise the message.
// The server (Zod + libphonenumber) remains the source of truth.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(value) {
  if (!value || value.trim().length < 2) return 'validation.nameRequired';
  return '';
}

export function validateEmail(value) {
  if (!value || !value.trim()) return 'validation.emailRequired';
  if (!EMAIL_RE.test(value.trim())) return 'validation.emailInvalid';
  return '';
}

export function validatePhone(value) {
  if (!value || !value.trim()) return 'validation.phoneRequired';
  // Count digits only; accept an optional leading "+" and separators.
  const digits = value.replace(/\D/g, '');
  if (digits.length < 8 || digits.length > 15) return 'validation.phoneInvalid';
  return '';
}
