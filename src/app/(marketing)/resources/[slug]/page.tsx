import { notFound, permanentRedirect } from "next/navigation";
import { getPublishedResource, resourcePath } from "@/content/resources/index";
export default async function LegacyResourcePage({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = await params;
 if (slug === "furnace-not-heating-common-problems") permanentRedirect("/blog/furnace-not-heating");
 const article = getPublishedResource(slug);
 if (!article) notFound();
 permanentRedirect(resourcePath(article.slug));
}
