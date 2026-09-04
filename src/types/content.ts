export type NavigationItem = {
  label: string;
  href: `/${string}` | "/";
  description?: string;
  children?: NavigationItem[];
};

export type ContactDetails = {
  phone: string | null;
  email: string | null;
  address: string | null;
  hours: string | null;
};

export type Service = {
  id: string;
  name: string;
  slug: string;
  href: `/services/${string}`;
  shortDescription: string;
  children?: Service[];
};

export type ServiceArea = { name: string; slug: string; region: "Arizona" };
export type Review = { id: string; quote: string; author: string; location: string | null; rating: number; source: string; verified: boolean };
export type FAQ = { id: string; question: string; answer: string };
export type Project = { id: string; title: string; service: string; location: string | null; summary: string; mediaId: string; status: "concept" | "verified" };
export type ResourceArticle = { slug: string; title: string; excerpt: string; category: string; publishedAt: string | null; status: "planned" | "published"; mediaId: string };

export type MediaAsset = {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  focalPoint: string;
  temporary: boolean;
};
