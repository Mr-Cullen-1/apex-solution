import "server-only";
import { resources } from "./articles";
import { getResourceCategory, resourceCategories, resourceCategoryPath } from "./categories";
import { completedServicePaths, primaryServices, allServices } from "@/content/services";
import { completedPublicPaths } from "@/content/routes";
import { siteUrl } from "@/content/site-url";
import { isApprovedResourceSource } from "./sources";
import type { PublishedResource, Resource, ResourceInline, ResourceListBlock } from "@/types/resource";

export function resourcePath(slug: string) { return `/blog/${slug}`; }

function validDate(value: string | null): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}

export function validateResources(entries: readonly Resource[]) {
  const ids = new Set<string>();
  const slugs = new Set<string>();
  for (const article of entries) {
    if (ids.has(article.id) || slugs.has(article.slug)) throw new Error(`Duplicate resource: ${article.slug}`);
    ids.add(article.id); slugs.add(article.slug);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.slug) || !getResourceCategory(article.category)) throw new Error(`Invalid resource slug/category: ${article.id}`);
    if (article.canonicalUrl !== new URL(resourcePath(article.slug), siteUrl).toString()) throw new Error(`Invalid resource canonical: ${article.slug}`);
    if (article.relatedServices.some((href) => !completedServicePaths.some((path) => path === href))) throw new Error(`Unknown related service: ${article.slug}`);
    if (article.relatedArticles.some((slug) => !entries.some((entry) => entry.slug === slug))) {
      // Draft references may point to planned articles outside a focused validation fixture.
      if (article.status === "published") throw new Error(`Unknown related article: ${article.slug}`);
    }
    if (article.status === "draft") continue;
    if (article.editorialNote || !article.author?.name.trim() || !article.featuredImage || !article.featuredImageAlt.trim() || !article.readingTime || article.readingTime < 1 || !article.content.some((block) => block.type === "paragraph" && block.children.some((part) => part.text.trim()))) throw new Error(`Cannot publish without reviewed content, author, reading time and image: ${article.slug}`);
    if (!validDate(article.publishedAt) || (article.updatedAt !== null && (!validDate(article.updatedAt) || article.updatedAt < article.publishedAt || Date.parse(article.updatedAt) > Date.now()))) throw new Error(`Invalid publication/update date: ${article.slug}`);
    for (const value of [article.title, article.excerpt, article.seoTitle, article.metaDescription, article.primaryKeyword]) if (!value.trim()) throw new Error(`Missing publication copy: ${article.slug}`);
    const headings = new Set<string>();
    let hasH2 = false;
    const checkInline = (parts: readonly ResourceInline[]) => {
      for (const part of parts) if (part.type === "link") {
        if (isApprovedResourceSource(part.href) || part.href === "tel:+15165860826") continue;
        const base = part.href.split("#")[0];
        if (part.href.startsWith("#")) {
          const target = part.href.slice(1);
          const exists = article.content.some((block) => block.type === "heading" && block.id === target) || (target === "resource-faq" && article.faqs.length > 0);
          if (!exists) throw new Error(`Unknown resource link anchor: ${part.href}`);
          continue;
        }
        const allowed = ["/", "/book", "/blog", ...resourceCategories.map((category) => resourceCategoryPath(category.id)), ...completedPublicPaths, ...completedServicePaths];
        const linkedArticle = entries.find((entry) => resourcePath(entry.slug) === base);
        if (!allowed.includes(base) && !(linkedArticle && isPublishedResource(linkedArticle))) throw new Error(`Invalid internal resource link: ${part.href}`);
      }
    };
    const checkImage = (image: NonNullable<Resource["featuredImage"]>, alt: string) => {
      if (!/^\/(resources|brand)\/[a-zA-Z0-9/_-]+\.(webp|png|jpg|jpeg|avif)$/.test(image.src) || image.width <= 0 || image.height <= 0 || !alt.trim()) throw new Error(`Invalid resource image: ${article.slug}`);
    };
    const checkList = (block: ResourceListBlock) => {
      block.items.forEach(checkInline);
      Object.values(block.nested || {}).forEach((lists) => lists.forEach(checkList));
    };
    checkImage(article.featuredImage, article.featuredImageAlt);
    for (const block of article.content) {
      if (block.type === "heading") {
        if (!/^[a-z][a-z0-9-]*$/.test(block.id) || headings.has(block.id) || ["main-content", "resource-faq", "resource-related"].includes(block.id)) throw new Error(`Invalid/duplicate heading: ${block.id}`);
        if (block.level === 3 && !hasH2) throw new Error(`H3 requires a preceding H2: ${article.slug}`);
        if (block.level === 2) hasH2 = true;
        headings.add(block.id);
      }
      if (block.type === "paragraph" || block.type === "callout" || block.type === "quote") checkInline(block.children);
      if (block.type === "list") checkList(block);
      if (block.type === "table") block.rows.forEach((row) => row.cells.forEach((cell) => checkInline(cell.children)));
      if (block.type === "image") checkImage(block.image, block.alt);
    }
    article.faqs.forEach((faq) => checkInline(faq.answer));
  }
}

export function isPublishedResource(article: Resource, now = Date.now()): article is PublishedResource {
  return article.status === "published" && validDate(article.publishedAt) && Date.parse(article.publishedAt) <= now;
}

// Invalid published records fail the build rather than silently serving a thin page.
validateResources(resources);

export function getPublishedResources(entries: readonly Resource[] = resources): PublishedResource[] {
  return entries.filter((article): article is PublishedResource => isPublishedResource(article)).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug));
}

export function getPublishedResource(slug: string) {
  return getPublishedResources().find((article) => article.slug === slug);
}

export function getRelatedResources(article: Resource, entries: readonly Resource[] = resources) {
  return getPublishedResources(entries).filter((entry) => entry.slug !== article.slug && article.relatedArticles.includes(entry.slug));
}

export function getRelatedServices(article: Resource) {
  return [...primaryServices, ...allServices].filter((service) => article.relatedServices.includes(service.href));
}
