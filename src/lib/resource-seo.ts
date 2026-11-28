import "server-only";
import type { Metadata, MetadataRoute } from "next";
import { company } from "@/content/company";
import { organizationIdentity } from "@/content/organization";
import { siteUrl } from "@/content/site-url";
import { sharedOpenGraph } from "@/content/social-meta";
import { getPublishedResources, isPublishedResource } from "@/content/resources/index";
import { resourceCategories, resourceCategoryPath } from "@/content/resources/categories";
import type { Resource } from "@/types/resource";

export function resourceListingMetadata(title: string, description: string, path: string, index: boolean): Metadata {
  const url = new URL(path, siteUrl).toString();
  return { title, description, alternates: { canonical: url }, robots: { index, follow: true }, openGraph: { ...sharedOpenGraph, title: `${title} | ${company.name}`, description, url }, twitter: { card: "summary_large_image", title: `${title} | ${company.name}`, description, images: sharedOpenGraph.images } };
}

export function resourceMetadata(article: Resource): Metadata {
  if (!isPublishedResource(article)) return { title: "Resource not found", robots: { index: false, follow: false } };
  const title = article.sourceDocument ? article.seoTitle : `${article.seoTitle} | ${company.name}`;
  const images = [{ url: new URL(article.featuredImage.src, siteUrl).toString(), width: article.featuredImage.width, height: article.featuredImage.height, alt: article.featuredImageAlt }];
  return {
    title: article.sourceDocument ? { absolute: article.seoTitle } : article.seoTitle, description: article.metaDescription,
    alternates: { canonical: article.canonicalUrl }, robots: { index: true, follow: true },
    openGraph: { siteName: company.name, locale: company.locale, type: "article", title, description: article.metaDescription, url: article.canonicalUrl, images, publishedTime: article.publishedAt, ...(article.updatedAt ? { modifiedTime: article.updatedAt } : {}), authors: [article.author.name], section: article.categoryLabel, tags: [...article.tags] },
    twitter: { card: "summary_large_image", title, description: article.metaDescription, images },
  };
}

export function resourceStructuredData(article: Resource) {
  if (!isPublishedResource(article)) return null;
  return {
    "@context": "https://schema.org", "@type": "BlogPosting", "@id": `${article.canonicalUrl}#article`,
    headline: article.title, description: article.excerpt, mainEntityOfPage: article.canonicalUrl, url: article.canonicalUrl,
    image: new URL(article.featuredImage.src, siteUrl).toString(), datePublished: article.publishedAt,
    ...(article.updatedAt ? { dateModified: article.updatedAt } : {}),
    author: { "@type": article.author.type, ...(article.author.id ? { "@id": article.author.id } : {}), name: article.author.name },
    publisher: { "@id": organizationIdentity["@id"] },
    articleSection: article.categoryLabel, inLanguage: "en-US",
  };
}

export function resourceSitemapEntries(entries?: readonly Resource[]): MetadataRoute.Sitemap {
  const published = getPublishedResources(entries);
  if (!published.length) return [];
  return [
    { url: new URL("/blog", siteUrl).toString(), changeFrequency: "weekly", priority: 0.7 },
    ...resourceCategories.filter((category) => published.some((article) => article.category === category.id)).map((category) => ({ url: new URL(resourceCategoryPath(category.id), siteUrl).toString(), changeFrequency: "weekly" as const, priority: 0.6 })),
    ...published.map((article) => ({ url: article.canonicalUrl, lastModified: article.updatedAt || article.publishedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
