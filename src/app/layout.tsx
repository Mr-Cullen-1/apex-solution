import type { Metadata } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { company, homeMeta } from "@/content/company";
import { siteUrl } from "@/content/site-url";
import "./globals.css";

// True root layout: html/body, fonts, GTM, and site-wide default metadata.
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
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const configuredGtmId = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  const gtmId = configuredGtmId && /^GTM-[A-Z0-9]+$/.test(configuredGtmId)
    ? configuredGtmId
    : undefined;

  return (
    <html lang="en" className={`${GeistSans.variable} h-full antialiased`}>
      <head>
        {gtmId && (
          // beforeInteractive keeps the bootstrap in head and runs once per
          // document. Google's snippet fetches the container asynchronously.
          <Script id="apex-gtm" strategy="beforeInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}
      </head>
      <body className="flex min-h-full flex-col">
        {gtmId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        )}
        <a className="skip-link" href="#main-content">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
