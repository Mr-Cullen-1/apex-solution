import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAdminHost } from "@/lib/admin-host";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (functionality
// unchanged) — see node_modules/next/dist/docs/01-app/api-reference/
// file-conventions/proxy.md.
//
// This file now does two independent jobs:
//
// 1. Hostname-based rewrite (new): a request that arrives on the dedicated
//    admin subdomain (admin.apexhomesupport.com) is internally rewritten so
//    every bare path ("/", "/login", "/requests/123", …) is served from the
//    existing "/admin"-prefixed route tree — an INTERNAL rewrite, never a
//    redirect, so the browser's address bar never changes. A path that
//    already starts with "/admin" (an internal <Link href="/admin/…">, or
//    one of the redirect() targets below) is left untouched instead of
//    being prefixed a second time — that's what makes this rewrite
//    idempotent/loop-proof, and it's also why the old apexhomesupport.com
//    /admin path keeps working unchanged (instruction: don't remove/
//    redirect it yet). The public site (any other host, not already under
//    /admin) returns immediately, before touching cookies or Supabase —
//    behaviorally identical to proxy not running at all, exactly as today.
//
// 2. Auth redirect (unchanged in spirit): only an OPTIMISTIC check ("is
//    there a Supabase Auth session at all?") to short-circuit the obvious
//    case with a redirect before a page even renders. It deliberately does
//    NOT query public.admin_users (that would be a database round trip on
//    every request, including prefetches) and it is NOT the security
//    boundary: every protected Admin page/layout and every moderation
//    Server Action independently calls requireAdmin(), which re-verifies
//    the session AND authorization from scratch. See
//    src/features/admin/auth/require-admin.ts. This now runs against the
//    *effective* (post-rewrite) path, and its own redirects are
//    host-aware too — see the loginPath/homePath comments below.

const ADMIN_PATH_PREFIX = "/admin";

// Arbitrary public/ assets (logos, etc.) have no stable prefix to enumerate
// in the matcher below, so this is the real exclusion for them: any path
// whose last segment has a file extension is never rewritten or
// auth-checked, on either host. Combined with the matcher's negative
// lookahead (which keeps proxy from even running for /api, /_next/static,
// /_next/image, and the well-known metadata routes), this covers
// "framework internals, static assets, images, favicon, API endpoints" in
// full without hardcoding every filename in public/.
const STATIC_FILE_PATTERN = /\.[^/]+$/;
const NEVER_REWRITE_PREFIXES = ["/api", "/_next"];

function isFrameworkOrStaticPath(pathname: string): boolean {
  if (NEVER_REWRITE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) return true;
  return STATIC_FILE_PATTERN.test(pathname);
}

export async function proxy(request: NextRequest) {
  // The raw Host header, not `request.nextUrl.hostname` — in `next dev`
  // (and behind some proxy configurations) `nextUrl` is not reliably
  // re-derived from a request's actual Host header, while the header
  // itself always reflects exactly what the client/edge sent.
  const onAdminHost = isAdminHost(request.headers.get("host"));
  const { pathname } = request.nextUrl;

  // Public site, unchanged fast path: no cookies read, no Supabase client
  // created — identical to proxy never having run for this request.
  if (!onAdminHost && !pathname.startsWith(ADMIN_PATH_PREFIX)) {
    return NextResponse.next();
  }

  if (isFrameworkOrStaticPath(pathname)) {
    return NextResponse.next();
  }

  const needsRewrite = onAdminHost && !pathname.startsWith(ADMIN_PATH_PREFIX);
  const effectivePathname = needsRewrite ? `${ADMIN_PATH_PREFIX}${pathname === "/" ? "" : pathname}` : pathname;

  function buildResponse(): NextResponse {
    if (!needsRewrite) return NextResponse.next({ request });
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = effectivePathname; // .search (query params) carried over by clone()
    return NextResponse.rewrite(rewriteUrl, { request });
  }

  let response = buildResponse();

  const supabaseUrl = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  // Not configured yet: fail open here (requireAdmin() still independently
  // denies every protected page/action in this case — see instruction #70,
  // this is an external bootstrap step, not a security bypass).
  if (!supabaseUrl || !publishableKey) return response;

  const supabase = createServerClient(supabaseUrl, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = buildResponse();
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // /admin/forgot-password and /admin/reset-password must be reachable by a
  // signed-out visitor by definition (Phase 4 self-service password
  // recovery) — same "not the real security boundary, just an optimistic
  // fast path" posture as the /admin/login exclusion below.
  const PUBLIC_ADMIN_AUTH_ROUTES = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];
  const isLoginRoute = effectivePathname === "/admin/login";
  const isPublicAdminAuthRoute = PUBLIC_ADMIN_AUTH_ROUTES.includes(effectivePathname);
  const isProtectedAdminRoute = effectivePathname.startsWith("/admin") && !isPublicAdminAuthRoute;

  // Host-aware targets: on the admin subdomain these redirects must land
  // on the clean, unprefixed path too, or a login/logout would visibly
  // bounce the browser to "admin.apexhomesupport.com/admin" instead of
  // staying at "admin.apexhomesupport.com/" — see also the same pattern in
  // require-admin.ts and auth/actions.ts, src/app/admin/login/page.tsx, and
  // src/app/admin/change-password/page.tsx.
  const loginPath = onAdminHost ? "/login" : "/admin/login";
  const homePath = onAdminHost ? "/" : "/admin";

  if (isProtectedAdminRoute && !user) {
    return NextResponse.redirect(new URL(loginPath, request.url));
  }
  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL(homePath, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Everything except API routes, Next.js build/image internals, and the
    // well-known file-convention metadata routes (favicon, robots,
    // sitemap, manifest, the OG/Twitter/app-icon image routes) — those are
    // excluded here for efficiency (proxy never even runs for them); the
    // isFrameworkOrStaticPath() check above is the defense-in-depth
    // backstop for arbitrary public/ assets that can't be enumerated here.
    "/((?!api|_next/static|_next/image|favicon\\.ico|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|opengraph-image|twitter-image|icon\\.png|apple-icon\\.png).*)",
  ],
};
