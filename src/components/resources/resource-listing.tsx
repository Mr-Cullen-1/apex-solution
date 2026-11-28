import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ResourceBreadcrumbs } from "./resource-navigation";
import { ResourceCTA } from "./resource-cta";
import { ResourceCard } from "./resource-card";
import { ResourceSearch } from "./resource-search";
import { resourceCategories, resourceCategoryPath } from "@/content/resources/categories";
import type { PublishedResource, ResourceCategoryId } from "@/types/resource";

type Category = { id: ResourceCategoryId; name: string; description: string };
export function ResourceListing({ articles, category }: { articles: readonly PublishedResource[]; category?: Category }) {
  const featured = articles.find((article) => article.slug === "furnace-not-heating") || articles[0];
  const categories = resourceCategories.filter((item) => articles.some((article) => article.category === item.id));
  return <main id="main-content"><Container>
    <header className="section-y-tight"><ResourceBreadcrumbs items={[{ name: "Home", href: "/" }, { name: "Blog", href: "/blog" }, ...(category ? [{ name: category.name, href: resourceCategoryPath(category.id) }] : [])]} /><p className="eyebrow">The Apex resource library</p><h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-6xl">{category?.name || "Practical advice for your home & business."}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-slate">{category?.description || "Explore the Apex Home Services blog for appliance troubleshooting, heating advice, and commercial equipment care. Know what to check, when to stop, and how to get professional help."}</p></header>
    <ResourceSearch items={articles.map((article) => ({ slug: article.slug, title: article.title, keywords: article.tags, category: article.category, card: <ResourceCard article={article} /> }))} categories={categories} featuredSlug={featured?.slug} featured={featured ? <ResourceCard article={featured} featured /> : undefined} />
    <nav aria-label="Browse blog categories" className="border-t border-steel py-8"><h2 className="text-2xl font-semibold">Browse by topic</h2><ul className="mt-5 flex flex-wrap gap-x-6 gap-y-2"><li><Link href="/blog" className="inline-block py-2 font-medium text-brand-primary underline underline-offset-4">All articles</Link></li>{categories.map((item) => <li key={item.id}><Link href={resourceCategoryPath(item.id)} className="inline-block py-2 text-brand-primary underline underline-offset-4">{item.name}</Link></li>)}</ul></nav>
    <section className="section-y-bottom"><ResourceCTA /></section>
  </Container></main>;
}
