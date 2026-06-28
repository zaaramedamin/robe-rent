// Inline SVG placeholder shown when a remote dress image fails to load.
// Kept as a data URI so it never triggers another network request.
export const FALLBACK_IMG =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100"><rect width="100%" height="100%" fill="#f6e3da"/><text x="50%" y="50%" font-family="Playfair Display, serif" font-size="40" fill="#c47a5a" text-anchor="middle" dominant-baseline="middle">RobeRent</text></svg>`
  );

// Reusable onError handler: swap the broken image for the placeholder.
export function onImgError(e) {
  if (e.currentTarget.src !== FALLBACK_IMG) e.currentTarget.src = FALLBACK_IMG;
}
