import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceCategoryPage } from "@/components/services/service-category-page";
import { getServiceCategory, primaryServices } from "@/content/services";

export const dynamicParams = false;
type CategoryPageProps = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return primaryServices.map((category) => ({ category: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getServiceCategory(slug);
  if (!category) return {};
  return { title: category.seo.title, description: category.seo.description, alternates: { canonical: category.href }, openGraph: { title: category.seo.title, description: category.seo.description, url: category.href }, robots: { index: true, follow: true } };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;
  const category = getServiceCategory(slug);
  if (!category) notFound();
  return <ServiceCategoryPage category={category} />;
}
