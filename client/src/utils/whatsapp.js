// Build a WhatsApp "click to chat" URL. This is free: it just opens WhatsApp
// (web or app) with the recipient and a prefilled message — the owner reviews
// and sends it manually. No API or paid plan involved.

const DEFAULT_COUNTRY_CODE = '216'; // Tunisia

// Normalise a phone number to the digits-only, country-coded form wa.me wants
// (no "+", spaces, or leading zeros).
export function normalizePhone(phone, countryCode = DEFAULT_COUNTRY_CODE) {
  if (!phone) return '';
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2); // strip 00 intl prefix
  // A bare local number (≤ 8 digits for TN) → prepend the default country code.
  if (digits.length <= 8) digits = countryCode + digits.replace(/^0+/, '');
  return digits;
}

export function whatsappUrl(phone, message = '') {
  const num = normalizePhone(phone);
  if (!num) return '';
  const base = `https://wa.me/${num}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
