/** The dedicated admin subdomain (Vercel + DNS already point it at this
 * same production project). `proxy.ts` internally rewrites every path on
 * this host to its "/admin"-prefixed equivalent, so a visitor here never
 * sees "/admin" in the URL for the ordinary case — see proxy.ts.
 *
 * Runtime-agnostic on purpose: this constant/predicate has no dependency on
 * `next/server` or `next/headers`, so it's safe to import from both
 * proxy.ts (reads the raw request) and Server Components/Actions (read via
 * `next/headers`'s `headers()`) without pulling either's APIs into the
 * other's context. */
export const ADMIN_HOSTNAME = "admin.apexhomesupport.com";

export function isAdminHost(host: string | null | undefined): boolean {
  if (!host) return false;
  return host === ADMIN_HOSTNAME || host.startsWith(`${ADMIN_HOSTNAME}:`);
}
