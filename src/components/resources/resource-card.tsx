import Link from "next/link";
import { ResourceImage } from "./resource-image";
import { getResourceCategory, resourceCategoryPath } from "@/content/resources/categories";
import { resourcePath } from "@/content/resources/index";
import type { PublishedResource } from "@/types/resource";

export function ResourceDate({ value }: { value: string }) {
  return <time dateTime={value}>{new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(value))}</time>;
}

export function ResourceCard({ article, featured = false }: { article: PublishedResource; featured?: boolean }) {
  const category = getResourceCategory(article.category)!;
  return <article className={featured ? "grid items-center gap-6 rounded-panel border border-steel bg-surface p-5 md:grid-cols-2 md:gap-10 md:p-8" : "min-w-0 border-b border-steel pb-8"}>
    <ResourceImage image={article.featuredImage} alt={article.featuredImageAlt} priority={featured} sizes={featured ? "(max-width: 767px) 100vw, 50vw" : undefined} />
    <div className={featured ? "py-2" : "pt-5"}><Link href={resourceCategoryPath(category.id)} className="eyebrow inline-block py-2">{category.name}</Link><h3 className={`mt-2 font-semibold tracking-tight ${featured ? "text-2xl lg:text-3xl" : "text-xl"}`}><Link href={resourcePath(article.slug)} className="hover:underline underline-offset-4">{article.title}</Link></h3><p className="mt-4 leading-7 text-slate">{article.excerpt}</p><p className="mt-4 text-sm text-slate"><ResourceDate value={article.publishedAt} /><span aria-hidden="true"> · </span>{article.readingTime} min read</p><Link href={resourcePath(article.slug)} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4" aria-label={`${featured ? "Read article" : "Read more"}: ${article.title}`}>{featured ? "Read article" : "Read more"}<span aria-hidden="true" className="ml-2">→</span></Link></div>
  </article>;
}
