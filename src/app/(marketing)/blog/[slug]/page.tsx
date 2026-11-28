import { notFound } from "next/navigation";
import { getPublishedResource, getPublishedResources } from "@/content/resources/index";
import { ResourceArticle } from "@/components/resources/resource-article";
import { resourceMetadata } from "@/lib/resource-seo";

type Props = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return getPublishedResources().map((article) => ({ slug: article.slug })); }
export async function generateMetadata({ params }: Props) {
  const article = getPublishedResource((await params).slug);
  if (!article) notFound();
  return resourceMetadata(article);
}
export default async function BlogArticlePage({ params }: Props) {
  const article = getPublishedResource((await params).slug);
  if (!article) notFound();
  return <ResourceArticle article={article} />;
}
