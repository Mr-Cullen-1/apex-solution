import "server-only";
import source from "./client-articles-source.json";
import { resourceAuthor } from "./author";
import { siteUrl } from "@/content/site-url";
import { getResourceCategory } from "./categories";
import type { Resource, ResourceBlock, ResourceCategoryId, ResourceInline, ResourceListBlock } from "@/types/resource";

type Run = { text: string; bold?: boolean; italic?: boolean; underline?: boolean; href?: string };
type Paragraph = { type: "paragraph" | "heading" | "list-item" | "quote"; text: string; runs: Run[]; level?: number; list?: { numId: string; level: number; format: string; start: number } };
type SourceBlock = Paragraph | { type: "table"; rows: { cells: { text: string; blocks: Paragraph[]; colSpan: number }[] }[] };
type SourceArticle = { number: number; slug: string; title: string; seoTitle: string; metaDescription: string; keywords: string[]; blocks: SourceBlock[] };

// Existing service URLs only. Commercial specialist pages do not exist yet.
const heating = ["/services/heating/furnace-repair", "/services/heating/boiler-repair"];
const appliances = ["/services/appliance-repair"];
const details: Record<string, { category: ResourceCategoryId; image: string; alt: string; ai?: boolean; related: string[]; services: string[] }> = {
  "furnace-not-heating": { category: "heating", image: "furnace", alt: "AI-generated illustration of a closed residential gas furnace and connected ductwork.", ai: true, related: ["dryer-not-heating", "oven-not-heating"], services: heating },
  "refrigerator-not-cooling": { category: "refrigerators", image: "refrigerator", alt: "Technician inspecting an open refrigerator in a home kitchen.", related: ["ice-maker-not-working", "commercial-refrigerator-not-cooling"], services: appliances },
  "commercial-refrigerator-not-cooling": { category: "commercial-refrigeration", image: "commercial-refrigeration", alt: "AI-generated illustration of stainless steel commercial refrigerator and freezer cabinets.", ai: true, related: ["walk-in-cooler-not-cooling", "commercial-freezer-not-freezing", "ice-machine-not-making-ice"], services: [] },
  "washer-not-draining": { category: "washers-dryers", image: "laundry", alt: "AI-generated illustration of a front-loading washer and dryer in a laundry room.", ai: true, related: ["dryer-not-heating", "dishwasher-not-draining"], services: appliances },
  "dryer-not-heating": { category: "washers-dryers", image: "laundry", alt: "AI-generated illustration of a dryer beside a washing machine in a home laundry room.", ai: true, related: ["washer-not-draining", "furnace-not-heating"], services: appliances },
  "dishwasher-not-draining": { category: "dishwashers", image: "dishwasher", alt: "AI-generated illustration of an open built-in dishwasher with empty racks.", ai: true, related: ["washer-not-draining", "oven-not-heating"], services: appliances },
  "oven-not-heating": { category: "ovens", image: "oven", alt: "Technician inspecting a household range oven with a diagnostic instrument.", related: ["commercial-oven-not-heating", "dishwasher-not-draining"], services: appliances },
  "ice-maker-not-working": { category: "ice-makers", image: "ice-maker", alt: "Refrigerator ice maker after replacement.", related: ["refrigerator-not-cooling", "ice-machine-not-making-ice"], services: appliances },
  "walk-in-cooler-not-cooling": { category: "walk-in-coolers-freezers", image: "walk-in", alt: "AI-generated illustration of shelving and enclosed cooling equipment inside a walk-in cold room.", ai: true, related: ["commercial-refrigerator-not-cooling", "commercial-freezer-not-freezing"], services: [] },
  "commercial-ice-machine-cleaning": { category: "preventive-maintenance", image: "commercial-ice", alt: "AI-generated illustration of a fully assembled commercial ice machine and storage bin.", ai: true, related: ["ice-machine-not-making-ice", "commercial-refrigerator-not-cooling"], services: [] },
  "commercial-oven-not-heating": { category: "commercial-ovens", image: "commercial-oven", alt: "AI-generated illustration of a closed commercial convection oven in a restaurant kitchen.", ai: true, related: ["oven-not-heating", "commercial-refrigerator-not-cooling"], services: [] },
  "commercial-freezer-not-freezing": { category: "commercial-freezers", image: "commercial-refrigeration", alt: "AI-generated illustration of commercial refrigerator and freezer cabinets in a restaurant kitchen.", ai: true, related: ["walk-in-cooler-not-cooling", "commercial-refrigerator-not-cooling"], services: [] },
  "ice-machine-not-making-ice": { category: "commercial-ice-machines", image: "commercial-ice", alt: "AI-generated illustration of a commercial ice machine with its storage bin closed.", ai: true, related: ["commercial-ice-machine-cleaning", "ice-maker-not-working"], services: [] },
};

// Add links without changing a single word of the client's text.
const textLinks = [
  { text: "(516) 586-0826", href: "tel:+15165860826" },
  { text: "Book online", href: "/book" },
  { text: "boiler repair page", href: "/services/heating/boiler-repair" },
  { text: "heating maintenance page", href: "/services/heating/heating-maintenance" },
  { text: "guide on how often to clean a commercial ice machine", href: "/blog/commercial-ice-machine-cleaning" },
];
function inlines(runs: readonly Run[]): ResourceInline[] {
  return runs.flatMap((run): ResourceInline[] => {
    const marks = { bold: run.bold, italic: run.italic, underline: run.underline };
    if (run.href) return [{ type: "link", text: run.text, href: run.href, ...marks }];
    const parts: ResourceInline[] = [];
    let rest = run.text;
    while (rest) {
      const match = textLinks.map((link) => ({ ...link, index: rest.indexOf(link.text) })).filter((link) => link.index >= 0).sort((a, b) => a.index - b.index)[0];
      if (!match) { parts.push({ type: "text", text: rest, ...marks }); break; }
      if (match.index) parts.push({ type: "text", text: rest.slice(0, match.index), ...marks });
      parts.push({ type: "link", text: match.text, href: match.href, ...marks });
      rest = rest.slice(match.index + match.text.length);
    }
    return parts;
  });
}

function content(blocks: readonly SourceBlock[]): ResourceBlock[] {
  const result: ResourceBlock[] = [];
  const usedIds = new Set<string>();
  let index = 0;
  function list(depth: number): ResourceListBlock {
    const first = blocks[index] as Paragraph;
    const items: ResourceInline[][] = [];
    const nested: Record<number, ResourceListBlock[]> = {};
    while (index < blocks.length) {
      const block = blocks[index];
      if (block.type !== "list-item" || !block.list || block.list.level < depth) break;
      if (block.list.level > depth) {
        if (!items.length) throw new Error("Source list is missing its parent item");
        (nested[items.length - 1] ||= []).push(list(block.list.level));
        continue;
      }
      if (block.list.numId !== first.list!.numId) break;
      items.push(inlines(block.runs)); index++;
    }
    return { type: "list", ordered: first.list!.format !== "bullet", start: first.list!.start, items, ...(Object.keys(nested).length ? { nested } : {}) };
  }
  while (index < blocks.length) {
    const block = blocks[index];
    if (block.type === "list-item") { result.push(list(block.list!.level)); continue; }
    index++;
    if (block.type === "table") {
      result.push({ type: "table", rows: block.rows.map((row) => ({ cells: row.cells.map((cell) => ({ colSpan: cell.colSpan, children: cell.blocks.flatMap((paragraph, i) => [...(i ? [{ type: "text" as const, text: "\n" }] : []), ...inlines(paragraph.runs)]) })) })) });
    } else if (block.type === "heading") {
      const base = `section-${block.text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-$/, "")}`;
      let id = base; let suffix = 2;
      while (usedIds.has(id)) id = `${base}-${suffix++}`;
      usedIds.add(id);
      result.push({ type: "heading", level: block.level === 3 ? 3 : 2, text: block.text, id });
    } else result.push({ type: block.type === "quote" ? "quote" : "paragraph", children: inlines(block.runs) });
  }
  return result;
}

export const clientArticles: readonly Resource[] = (source.articles as SourceArticle[]).map((article) => {
  const config = details[article.slug];
  if (!config) throw new Error(`Unmapped source article: ${article.slug}`);
  const bodyText = article.blocks.map((block) => block.type === "table" ? block.rows.flatMap((row) => row.cells.map((cell) => cell.text)).join(" ") : block.text).join(" ");
  return {
    id: article.slug, slug: article.slug, title: article.title,
    excerpt: article.metaDescription, seoTitle: article.seoTitle, metaDescription: article.metaDescription,
    category: config.category, categoryLabel: getResourceCategory(config.category)!.name,
    tags: article.keywords, primaryKeyword: article.keywords[0], secondaryKeywords: article.keywords.slice(1),
    canonicalUrl: new URL(`/blog/${article.slug}`, siteUrl).toString(),
    author: resourceAuthor, status: "published", publishedAt: "2026-11-28", updatedAt: null,
    editorialNote: null, sourceDocument: { sha256: source.provenance.sha256, articleNumber: article.number },
    readingTime: Math.max(1, Math.ceil(bodyText.trim().split(/\s+/).length / 200)),
    featuredImage: { src: `/resources/client-articles/${config.image}.webp`, width: 1600, height: 900 },
    featuredImageAlt: config.alt,
    ...(config.ai ? { featuredImageCaption: "AI-generated editorial illustration; not a photograph of an Apex service visit." } : {}),
    content: content(article.blocks),
    // Source FAQs remain in their original order and wording in the body.
    faqs: [], relatedArticles: config.related, relatedServices: config.services,
  };
});
