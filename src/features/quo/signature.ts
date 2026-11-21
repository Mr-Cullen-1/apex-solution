import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

export function validSigningKey(key: string): boolean {
  if (!/^whsec_[A-Za-z0-9+/]+={0,2}$/.test(key)) return false;
  const bytes = Buffer.from(key.slice(6), "base64");
  return bytes.length >= 16 && bytes.toString("base64") === key.slice(6);
}

export function verifySignature(raw: Buffer, headers: Headers, key: string, now = Date.now()): boolean {
  const id = headers.get("webhook-id"), time = headers.get("webhook-timestamp"), signatures = headers.get("webhook-signature");
  if (!id || !/^[A-Za-z0-9_-]{1,200}$/.test(id) || !time || !/^\d{1,12}$/.test(time) || !signatures || signatures.length > 2048) return false;
  if (Math.abs(now / 1000 - Number(time)) > 300 || !validSigningKey(key)) return false;
  const decoded = Buffer.from(key.slice(6), "base64");
  if (decoded.length < 16) return false;
  const expected = createHmac("sha256", decoded).update(`${id}.${time}.`).update(raw).digest();
  return signatures.split(/\s+/).some(entry => {
    if (!/^v1,[A-Za-z0-9+/]+={0,2}$/.test(entry)) return false;
    const actual = Buffer.from(entry.slice(3), "base64");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  });
}
