export type ResourceCategoryId = "hvac-heating" | "water-heaters" | "appliance-repair" | "home-maintenance" | "energy-efficiency" | "heating" | "refrigerators" | "washers-dryers" | "dishwashers" | "ovens" | "ice-makers" | "commercial-refrigeration" | "walk-in-coolers-freezers" | "commercial-ice-machines" | "commercial-ovens" | "commercial-freezers" | "preventive-maintenance";

export type ResourceImage = { src: `/resources/${string}` | `/brand/${string}`; width: number; height: number };
export type ResourceAuthor = { name: string; type: "Person" | "Organization"; id?: string };
export type ResourceInline = ({ type: "text"; text: string } | { type: "link"; text: string; href: string }) & { bold?: boolean; italic?: boolean; underline?: boolean };
export type ResourceListBlock = { type: "list"; ordered: boolean; start?: number; items: readonly (readonly ResourceInline[])[]; nested?: Readonly<Record<number, readonly ResourceListBlock[]>> };
export type ResourceBlock =
  | { type: "heading"; level: 2 | 3; id: string; text: string }
  | { type: "paragraph"; children: readonly ResourceInline[] }
  | ResourceListBlock
  | { type: "table"; rows: readonly { cells: readonly { children: readonly ResourceInline[]; colSpan?: number }[] }[] }
  | { type: "quote"; children: readonly ResourceInline[] }
  | { type: "image"; image: ResourceImage; alt: string; caption?: string }
  | { type: "callout"; tone: "info" | "tip" | "warning"; title: string; children: readonly ResourceInline[] }
  | { type: "cta"; title: string; description: string };

export type Resource = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: ResourceCategoryId;
  /** Editorial classification from the brief; navigation uses category. */
  categoryLabel: string;
  tags: readonly string[];
  featuredImage: ResourceImage | null;
  featuredImageAlt: string;
  /** Optional visible provenance or context for the featured image. */
  featuredImageCaption?: string;
  primaryKeyword: string;
  secondaryKeywords: readonly string[];
  seoTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  author: ResourceAuthor | null;
  publishedAt: string | null;
  updatedAt: string | null;
  /** Editorial estimate in minutes; assigned only when the body is written. */
  readingTime: number | null;
  status: "draft" | "published";
  editorialNote: string | null;
  /** Client-supplied article provenance; not a substitute for publication status. */
  sourceDocument?: { sha256: string; articleNumber: number };
  content: readonly ResourceBlock[];
  faqs: readonly { question: string; answer: readonly ResourceInline[] }[];
  relatedArticles: readonly string[];
  relatedServices: readonly string[];
};

export type PublishedResource = Resource & {
  status: "published";
  author: NonNullable<Resource["author"]>;
  publishedAt: string;
  featuredImage: ResourceImage;
  readingTime: number;
};
