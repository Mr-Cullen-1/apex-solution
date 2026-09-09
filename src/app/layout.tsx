import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Footer } from "@/components/layout/footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { SiteHeader } from "@/components/navigation/site-header";
import { company, homeMeta } from "@/content/company";
import { siteUrl } from "@/content/site-url";
import { BookNowProvider } from "@/features/booking/book-now-context";
import "./globals.css";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${GeistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <BookNowProvider>
          <SiteHeader />
          {children}
          <Footer />
          <MobileActionBar />
        </BookNowProvider>
      </body>
    </html>
  );
}
