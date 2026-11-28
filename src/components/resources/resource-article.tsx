import Link from "next/link";
import { Container } from "@/components/ui/container";
import { OrganizationStructuredData } from "@/components/public/organization-structured-data";
import { ResourceBreadcrumbs } from "./resource-navigation";
import { ResourceCTA } from "./resource-cta";
import { ResourceCard, ResourceDate } from "./resource-card";
import { ResourceAuthor } from "./resource-author";
import { ResourceImage } from "./resource-image";
import { ResourceContent, ResourceText } from "./resource-content";
import { getResourceCategory, resourceCategoryPath } from "@/content/resources/categories";
import { getRelatedResources, getRelatedServices, resourcePath } from "@/content/resources/index";
import { resourceStructuredData } from "@/lib/resource-seo";
import type { PublishedResource } from "@/types/resource";

export function ResourceArticle({ article }: { article: PublishedResource }) {
  const category = getResourceCategory(article.category)!;
  const related = getRelatedResources(article);
  const services = getRelatedServices(article);
  const headings = article.content.filter((block) => block.type === "heading");
  const schema = resourceStructuredData(article);
  return <main id="main-content"><Container className="section-y-tight">
    <ResourceBreadcrumbs items={[{ name: "Home", href: "/" }, { name: "Blog", href: "/blog" }, { name: category.name, href: resourceCategoryPath(category.id) }, { name: article.title, href: resourcePath(article.slug) }]} />
    <article><header className="mx-auto max-w-4xl"><Link className="eyebrow inline-block py-2" href={resourceCategoryPath(category.id)}>{category.name}</Link><h1 className="mt-3 text-3xl font-semibold leading-[1.12] tracking-[-0.035em] sm:text-5xl">{article.title}</h1><p className="mt-6 text-lg leading-8 text-slate">{article.excerpt}</p><div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate"><ResourceAuthor author={article.author} /><span>Published <ResourceDate value={article.publishedAt} /></span>{article.updatedAt && <span>Updated <ResourceDate value={article.updatedAt} /></span>}<span>{article.readingTime} min read</span></div><figure className="my-8"><ResourceImage image={article.featuredImage} alt={article.featuredImageAlt} priority sizes="(max-width: 1023px) 100vw, 896px" />{article.featuredImageCaption && <figcaption className="mt-3 text-sm leading-6 text-slate">{article.featuredImageCaption}</figcaption>}</figure></header>
    <div className="mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[15rem_minmax(0,1fr)]">
      {headings.length > 0 && <nav aria-label="Table of contents" className="rounded-card border border-steel bg-surface p-5 lg:sticky lg:top-28"><h2 className="text-sm font-semibold">In this guide</h2><ul className="mt-3 space-y-1">{headings.map((heading) => <li key={heading.id} className={heading.level === 3 ? "pl-4" : ""}><a href={`#${heading.id}`} className="block py-2 text-sm leading-6 text-slate hover:text-navy hover:underline">{heading.text}</a></li>)}{article.faqs.length > 0 && <li><a href="#resource-faq" className="block py-2 text-sm text-slate hover:underline">Frequently asked questions</a></li>}</ul></nav>}
      <div className={`min-w-0 ${headings.length ? "" : "lg:col-span-2 lg:mx-auto lg:w-full lg:max-w-3xl"}`}><ResourceContent blocks={article.content} />
      {article.faqs.length > 0 && <section id="resource-faq" className="mt-12"><h2 className="mb-5 text-2xl font-semibold">Frequently asked questions</h2>{article.faqs.map((faq) => <details key={faq.question} className="border-b border-steel py-4"><summary className="cursor-pointer py-2 pr-4 font-semibold">{faq.question}</summary><p className="py-3 leading-7 text-slate"><ResourceText parts={faq.answer} /></p></details>)}</section>}
      {services.length > 0 && <nav aria-label="Related Apex services" className="mt-12 border-t border-steel pt-6"><h2 className="text-2xl font-semibold">Explore related services</h2><ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">{services.map((service) => <li key={service.href}><Link href={service.href} className="inline-block py-2 text-brand-primary underline underline-offset-4">{service.name}</Link></li>)}</ul></nav>}
      </div></div></article>
    {related.length > 0 && <section id="resource-related" className="section-y-tight"><h2 className="mb-7 text-2xl font-semibold">Related articles</h2><div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{related.map((entry) => <ResourceCard key={entry.id} article={entry} />)}</div></section>}
    <div className="mt-12"><ResourceCTA /></div>
    <Link href="/blog" className="mt-8 inline-flex min-h-11 items-center text-sm font-semibold underline underline-offset-4">Back to Blog</Link>
    <OrganizationStructuredData />{schema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />}
  </Container></main>;
}
