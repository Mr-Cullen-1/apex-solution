import type { Metadata } from "next";
import { LegalDraft } from "@/components/public/legal-draft";
export const metadata: Metadata = {
  title: "Privacy Policy — awaiting approval",
  description: "Privacy Policy draft structure awaiting business-owner verification and approval.",
  alternates: { canonical: "/privacy-policy" },
  robots: { index: false, follow: true },
};
export default function PrivacyPolicyPage() { return <LegalDraft kind="privacy" />; }
