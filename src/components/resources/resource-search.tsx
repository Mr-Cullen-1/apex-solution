"use client";

import { useState, type ReactNode } from "react";

type Item = { slug: string; title: string; keywords: readonly string[]; category: string; card: ReactNode };
type Category = { id: string; name: string; group: string };

export function ResourceSearch({ items, categories, featuredSlug, featured }: { items: readonly Item[]; categories: readonly Category[]; featuredSlug?: string; featured?: ReactNode }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const filtering = terms.length > 0 || category !== "";
  const matching = items.filter((item) => (!category || item.category === category) && terms.every((term) => `${item.title} ${item.keywords.join(" ")}`.toLowerCase().includes(term)));
  const visible = filtering ? matching : matching.filter((item) => item.slug !== featuredSlug);
  return <div>
    <form role="search" aria-label="Search blog articles" onSubmit={(event) => event.preventDefault()} className="grid gap-4 border-y border-steel py-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-end">
      <div><label htmlFor="blog-search" className="block text-sm font-semibold">Search articles</label><input id="blog-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try refrigerator, heating, or ice machine" className="mt-2 min-h-12 w-full rounded-control border border-steel bg-page-bg px-4 text-base" /></div>
      <div><label htmlFor="blog-category" className="block text-sm font-semibold">Filter by category</label><select id="blog-category" value={category} onChange={(event) => setCategory(event.target.value)} className="mt-2 min-h-12 w-full rounded-control border border-steel bg-page-bg px-3 text-base"><option value="">All categories</option>{[...new Set(categories.map((item) => item.group))].map((group) => <optgroup key={group} label={group}>{categories.filter((item) => item.group === group).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</optgroup>)}</select></div>
      <button type="button" onClick={() => { setQuery(""); setCategory(""); }} className="min-h-12 rounded-control border border-steel px-5 text-sm font-semibold hover:bg-surface">Clear filters</button>
    </form>
    <p role="status" aria-live="polite" className="mt-4 text-sm text-slate">{matching.length} {matching.length === 1 ? "article" : "articles"}{filtering ? " found" : " to explore"}</p>
    {!filtering && featured && <section aria-labelledby="resource-featured" className="mt-8"><h2 id="resource-featured" className="mb-6 text-2xl font-semibold">Featured article</h2>{featured}</section>}
    {(filtering || visible.length > 0) && <section aria-labelledby="resource-latest" className="section-y-tight"><h2 id="resource-latest" className="mb-7 text-2xl font-semibold">{filtering ? "Search results" : "More guides"}</h2>
      {visible.length ? <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">{visible.map((item) => <div key={item.slug} data-blog-card={item.slug} className="min-w-0">{item.card}</div>)}</div> : <div className="rounded-panel border border-steel bg-surface p-8"><h3 className="text-xl font-semibold">No articles found</h3><p className="mt-3 leading-7 text-slate">Try another appliance name or clear your filters to browse all guides.</p></div>}
    </section>}
  </div>;
}
