import "server-only";
import { createHash, randomBytes } from "node:crypto";

// The raw token is the credential -- it must never be logged, stored, or
// returned from any endpoint after the moment it's generated (mirrors the
// "shown once, never persisted raw" posture already used for admin
// temporary passwords, src/features/admin/admins/password.ts). Only its
// SHA-256 hash is ever written to public.review_invitations.token_hash, so a
// database read alone can never be replayed as a working link.
const TOKEN_BYTES = 32; // 256 bits -- unpredictable, not brute-forceable.

export function generateInvitationToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashInvitationToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
