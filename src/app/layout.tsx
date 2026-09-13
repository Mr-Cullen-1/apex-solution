import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { company, homeMeta } from "@/content/company";
import { siteUrl } from "@/content/site-url";
import "./globals.css";

// True root layout: html/body + fonts + site-wide default metadata only.
// The public marketing shell (SiteHeader/Footer/MobileActionBar/
// BookNowProvider) lives one level down in src/app/(marketing)/layout.tsx,
// so /admin/** — a sibling of that group — never inherits it (instruction
// #17). Per-route metadata (including every /admin page) still overrides
// these defaults normally; only the shared fallback lives here.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: homeMeta.title,
    template: `%s | ${company.name}`,
  },
  description: homeMeta.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: company.name,
    title: homeMeta.title,
    description: homeMeta.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: homeMeta.title,
    description: homeMeta.description,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a className="skip-link" href="#main-content">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
