import { notFound } from "next/navigation";
import { resourceCategories, getResourceCategory, resourceCategoryPath } from "@/content/resources/categories";
import { getPublishedResources } from "@/content/resources/index";
import { ResourceListing } from "@/components/resources/resource-listing";
import { resourceListingMetadata } from "@/lib/resource-seo";

type Props = { params: Promise<{ category: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return resourceCategories.filter((category) => getPublishedResources().some((article) => article.category === category.id)).map(({ id }) => ({ category: id })); }
export async function generateMetadata({ params }: Props) {
  const category = getResourceCategory((await params).category);
  if (!category) notFound();
  return resourceListingMetadata(`${category.name} Guides & Advice`, category.description, resourceCategoryPath(category.id), getPublishedResources().some((article) => article.category === category.id));
}
export default async function BlogCategoryPage({ params }: Props) {
  const category = getResourceCategory((await params).category);
  if (!category) notFound();
  const articles = getPublishedResources().filter((article) => article.category === category.id);
  if (!articles.length) notFound();
  return <ResourceListing articles={articles} category={category} />;
}
