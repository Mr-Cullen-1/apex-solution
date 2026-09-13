import "server-only";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { REVIEW_MEDIA_BUCKET } from "./media";

// Shared by both the public reviews repository (features/reviews/repository.ts
// — approved + consented rows only) and the admin reviews repository
// (features/admin/reviews/repository.ts — any status, since a moderator
// must be able to preview a pending review's photo). This module itself
// does not check review status/consent; each caller is responsible for
// only invoking it on a review path it's actually allowed to show.

// A public page can be cached (see the `revalidate` export on the homepage
// and /reviews route segments) for up to a couple of minutes, so a signed
// URL embedded in that cached HTML must still be valid the whole time it
// could be served. 10 minutes comfortably covers a ~2 minute page cache
// with room to spare, without minting a URL that stays valid indefinitely.
// The admin moderation UI reuses the same expiry — it's never cached at
// all (no-store), so this is simply a generous, single shared constant
// rather than two near-identical ones.
const MEDIA_SIGNED_URL_EXPIRY_SECONDS = 600;

/** Short-lived signed URL into the private `review-media` bucket. Fails
 * safe: any error (including a genuinely missing/deleted object) is logged
 * server-side and resolves to `null`, never thrown — callers render the
 * review without its photo rather than breaking the whole page. */
export async function createReviewMediaSignedUrl(mediaPath: string): Promise<string | null> {
  try {
    const supabase = getSupabaseServerClient();
    const { data, error } = await supabase.storage.from(REVIEW_MEDIA_BUCKET).createSignedUrl(mediaPath, MEDIA_SIGNED_URL_EXPIRY_SECONDS);
    if (error || !data?.signedUrl) {
      console.error("[reviews_media_signed_url_failed]", mediaPath, error?.message);
      return null;
    }
    return data.signedUrl;
  } catch (err) {
    console.error("[reviews_media_signed_url_failed]", mediaPath, err instanceof Error ? err.message : err);
    return null;
  }
}
