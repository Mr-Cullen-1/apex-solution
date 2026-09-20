import { NextResponse, type NextRequest } from "next/server";
import { resolveActiveCampaignLink } from "@/features/admin/campaign-links/repository";

// Public campaign-link resolver — pasted into Instagram/Facebook ads as
// "<production-domain>/l/<token>". Resolves the token server-side, then
// redirects into the EXISTING Book Now query-string contract
// (?book=1&category=&service=&campaign=<token>) that BookNowUrlSync
// (src/features/booking/book-now-context.tsx) already parses on load — the
// visitor lands on the ordinary homepage with the same Book Now modal every
// other entry point uses, never a second/duplicate booking form. An
// invalid, inactive, or unrecognized token falls back to the plain
// homepage — never an error page, never information about which case it
// was.
export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const link = await resolveActiveCampaignLink(token);

  const destination = request.nextUrl.clone();
  destination.pathname = "/";
  destination.search = "";

  if (!link) return NextResponse.redirect(destination);

  destination.searchParams.set("book", "1");
  destination.searchParams.set("campaign", token);
  if (link.category_id) destination.searchParams.set("category", link.category_id);
  if (link.service_id) destination.searchParams.set("service", link.service_id);

  return NextResponse.redirect(destination);
}
