import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (functionality
// unchanged) — see node_modules/next/dist/docs/01-app/api-reference/
// file-conventions/proxy.md. This performs only an OPTIMISTIC check ("is
// there a Supabase Auth session at all?") to short-circuit the obvious
// case with a redirect before a page even renders. It deliberately does
// NOT query public.admin_users (that would be a database round trip on
// every request, including prefetches) and it is NOT the security
// boundary: every protected Admin page/layout and every moderation Server
// Action independently calls requireAdmin(), which re-verifies the session
// AND authorization from scratch. See src/features/admin/auth/require-admin.ts.

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

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
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginRoute = pathname === "/admin/login";
  const isProtectedAdminRoute = pathname.startsWith("/admin") && !isLoginRoute;

  if (isProtectedAdminRoute && !user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (isLoginRoute && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
