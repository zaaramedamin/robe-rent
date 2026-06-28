// JWT helpers used purely on the client for UX (auto-logout on expiry).
// The server still verifies every token — this never grants access.

/** Decode a JWT payload without verifying its signature. */
export function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** True when the token has an `exp` claim that is in the past. */
export function isTokenExpired(token) {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return false;
  return payload.exp * 1000 <= Date.now();
}
