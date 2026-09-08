import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button-link";
import { BookingLink } from "@/components/ui/booking-link";
import { Container } from "@/components/ui/container";
import { getPlannedRoute, plannedRoutes } from "@/content/routes";

export const dynamicParams = false;

type PlannedPageProps = {
  params: Promise<{ slug: string[] }>;
};

export function generateStaticParams() {
  return plannedRoutes.map((route) => ({ slug: route.path.slice(1).split("/") }));
}

export async function generateMetadata({ params }: PlannedPageProps): Promise<Metadata> {
  const { slug } = await params;
  const route = getPlannedRoute(slug);
  if (!route) return {};

  return {
    title: route.title,
    description: `${route.title} is planned in the Apex Home Services product roadmap.`,
    robots: { index: false, follow: false },
  };
}

export default async function PlannedPage({ params }: PlannedPageProps) {
  const { slug } = await params;
  const route = getPlannedRoute(slug);
  if (!route) notFound();

  return (
    <main id="main-content" className="flex-1 bg-page-bg section-y">
      <Container>
        <div className="rounded-hero border border-steel bg-surface p-8 shadow-soft sm:p-12">
          <p className="eyebrow">{route.group} · Phase foundation</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-navy sm:text-6xl">{route.title}</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-slate">
            This route is active in the site architecture. Its production content and interactions are scheduled for a later delivery phase.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/">Return home</ButtonLink>
            <BookingLink variant="secondary">Request service</BookingLink>
          </div>
          <p className="mt-12 border-t border-steel pt-5 text-sm text-slate">
            <Link className="text-link" href="/">Apex Home Services</Link> / {route.title}
          </p>
        </div>
      </Container>
    </main>
  );
}
