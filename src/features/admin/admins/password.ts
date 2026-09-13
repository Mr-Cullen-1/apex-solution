import "server-only";
import { randomInt } from "node:crypto";

// Character sets deliberately exclude visually-ambiguous characters
// (0/O, 1/l/I) — a copy/paste or read-aloud aid, not a security weakening;
// the remaining charset (56 chars) at length 20 is still enormously larger
// than the 16-char minimum this is built to exceed.
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%^&*-_=+";
const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

const PASSWORD_LENGTH = 20;

function randomChar(charset: string): string {
  return charset[randomInt(charset.length)];
}

/** Cryptographically-random temporary password (node:crypto `randomInt`,
 * never `Math.random`) for SUPER_ADMIN-issued admin provisioning/reset —
 * never derived from the target's email, name, or any timestamp. Exceeds
 * the 16-character minimum, and guarantees at least one character from each
 * of upper/lower/digit/symbol before a Fisher-Yates shuffle (also
 * crypto-random) mixes them in, so the guaranteed characters aren't
 * predictably positioned. This function's return value must never be
 * persisted anywhere by its caller — see docs/ADMIN_ARCHITECTURE.md. */
export function generateTemporaryPassword(): string {
  const required = [randomChar(UPPER), randomChar(LOWER), randomChar(DIGITS), randomChar(SYMBOLS)];
  const rest = Array.from({ length: PASSWORD_LENGTH - required.length }, () => randomChar(ALL));
  const chars = [...required, ...rest];

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join("");
}
