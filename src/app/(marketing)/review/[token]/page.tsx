import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { company } from "@/content/company";
import { buttonStyles } from "@/components/ui/button-link";
import { resolveReviewInvitation } from "@/features/reviews/repository";
import { ReviewForm } from "@/features/reviews/review-form";

export const metadata: Metadata = {
  title: `Leave a Review | ${company.name}`,
  description: `Share your experience with ${company.name}. Submitted reviews are reviewed before they appear publicly.`,
  robots: { index: false, follow: false },
};

// Same "not a landing page" posture as /review/page.tsx — this route only
// ever does one of two things: render the same shared <ReviewForm>
// (pre-filled + tied to the invitation token), or a plain, honest "this
// link isn't valid" message. Never a partial/broken render, and never any
// private request/customer data beyond the customer's own name and the
// service they were invited about — resolveReviewInvitation() is the one
// place that boundary is enforced (server-only, hashes the token before
// ever touching the database).
export default async function ReviewInvitationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await resolveReviewInvitation(token);

  return (
    <main id="main-content" className="flex-1 bg-page-bg">
      <section className="pt-2 pb-24 sm:pt-4 md:pb-4">
        <Container>
          {result.ok ? (
            <ReviewForm invitationToken={token} initialFullName={result.invitation.fullName} />
          ) : (
            <div className="rounded-hero border border-steel bg-surface p-6 text-center shadow-soft sm:p-8">
              <p className="eyebrow">Review link</p>
              <h1 className="mt-2 text-xl font-semibold tracking-[-0.02em] text-navy sm:text-2xl">This link isn&apos;t valid or has expired.</h1>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate sm:text-base">
                It may have already been used, or it&apos;s no longer active. If you&apos;d still like to share your experience, you can leave a general review below.
              </p>
              <Link href="/review" className={`${buttonStyles.primary} mt-6 inline-flex`}>
                Leave a review
              </Link>
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}
