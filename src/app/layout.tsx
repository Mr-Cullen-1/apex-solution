import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Footer } from "@/components/layout/footer";
import { MobileActionBar } from "@/components/layout/mobile-action-bar";
import { SiteHeader } from "@/components/navigation/site-header";
import { company } from "@/content/company";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: `${company.name} | Premium Home Comfort`,
    template: `%s | ${company.name}`,
  },
  description: company.description,
  openGraph: {
    type: "website",
    siteName: company.name,
    title: `${company.name} | Premium Home Comfort`,
    description: company.description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${GeistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        {children}
        <Footer />
        <MobileActionBar />
      </body>
    </html>
  );
}
