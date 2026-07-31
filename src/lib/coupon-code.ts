// Client-side suggestion only — the backend (UNIQUE(event_id, code)) is the
// actual source of truth on uniqueness. Excludes visually-ambiguous
// characters (0/O, 1/I) since organizers may read these off a screen aloud.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateCouponCode(length = 8): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}
