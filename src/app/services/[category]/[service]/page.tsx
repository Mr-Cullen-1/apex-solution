import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailPage } from "@/components/services/service-detail-page";
import { getService, getServiceCategory, primaryServices } from "@/content/services";

export const dynamicParams = false;
type ServicePageProps = { params: Promise<{ category: string; service: string }> };

export function generateStaticParams() {
  return primaryServices.flatMap((category) => category.children.map((service) => ({ category: category.slug, service: service.slug })));
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { category: categorySlug, service: serviceSlug } = await params;
  const service = getService(categorySlug, serviceSlug);
  if (!service) return {};
  return { title: service.seo.title, description: service.seo.description, alternates: { canonical: service.href }, openGraph: { title: service.seo.title, description: service.seo.description, url: service.href }, robots: { index: true, follow: true } };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { category: categorySlug, service: serviceSlug } = await params;
  const category = getServiceCategory(categorySlug);
  const service = getService(categorySlug, serviceSlug);
  if (!category || !service) notFound();
  return <ServiceDetailPage category={category} service={service} />;
}
