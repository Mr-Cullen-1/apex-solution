import Link from "next/link";
import { BreadcrumbStructuredData, type BreadcrumbItem } from "@/components/public/breadcrumb-structured-data";
import { resourceCategories, resourceCategoryPath } from "@/content/resources/categories";
import type { ResourceCategoryId } from "@/types/resource";

export function ResourceBreadcrumbs({ items }: { items: readonly BreadcrumbItem[] }) {
  return <><nav aria-label="Breadcrumb" className="mb-8 text-sm text-slate"><ol className="flex flex-wrap items-center gap-x-3 gap-y-2">{items.map((item, index) => <li key={item.href} className="inline-flex items-center gap-3">{index > 0 && <span aria-hidden="true">/</span>}{index === items.length - 1 ? <span aria-current="page">{item.name}</span> : <Link href={item.href} className="underline underline-offset-4 hover:text-navy">{item.name}</Link>}</li>)}</ol></nav><BreadcrumbStructuredData items={items} /></>;
}

export function ResourceCategories({ current }: { current?: ResourceCategoryId }) {
  return <nav aria-label="Resource categories" className="border-y border-steel py-4"><ul className="flex flex-wrap gap-2"><li><Link href="/blog" aria-current={!current ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-control px-4 text-sm font-medium ${!current ? "bg-navy text-white" : "text-slate hover:bg-surface"}`}>All topics</Link></li>{resourceCategories.map((category) => <li key={category.id}><Link href={resourceCategoryPath(category.id)} aria-current={current === category.id ? "page" : undefined} className={`inline-flex min-h-11 items-center rounded-control px-4 text-sm font-medium ${current === category.id ? "bg-navy text-white" : "text-slate hover:bg-surface"}`}>{category.name}</Link></li>)}</ul></nav>;
}
