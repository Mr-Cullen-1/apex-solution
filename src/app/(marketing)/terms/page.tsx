import type { Metadata } from "next";
import { LegalDraft } from "@/components/public/legal-draft";
export const metadata: Metadata = {
  title: "Terms of Service — awaiting approval",
  description: "Terms of Service draft structure awaiting business-owner verification and approval.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: true },
};
export default function TermsPage() { return <LegalDraft kind="terms" />; }
